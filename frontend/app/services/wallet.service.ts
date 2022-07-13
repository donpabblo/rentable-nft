import { Injectable } from '@angular/core';
import { Contract, ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { MessageService } from './message.service';
import RentableNFT from '../../../artifacts/contracts/RentableNFT.sol/RentableNFT.json'
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  signer: ethers.providers.JsonRpcSigner;
  provider: ethers.providers.Web3Provider;
  web3Modal: Web3Modal;
  contract: Contract;

  constructor(
    private messageService: MessageService,
    private http: HttpClient
  ) {
    this.provider = null;
    this.signer = null;
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "fefa93e0f02c4e2cac7031708582ff7b"
        }
      },
    };

    this.web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: false, // optional
      disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
      providerOptions // required
    });

  }

  async connect() {
    let instance = await this.web3Modal.connect();
    this.provider = new ethers.providers.Web3Provider(instance, "any");
    this.signer = this.provider.getSigner();

    let contractAddress = await lastValueFrom(this.http.get<any>('conf/contract'));
    this.contract = new ethers.Contract(contractAddress.contract, RentableNFT.abi, this.provider);

    window.ethereum.on("accountsChanged", (accounts) => {
      this.fetchAccountData();
    });
    window.ethereum.on("chainChanged", (chainId) => {
      this.fetchAccountData();
    });
    window.ethereum.on("disconnect", (error: { code: number; message: string }) => {
      this.messageService.clearMessages();
      this.provider = null;
      this.signer = null;
      this.contract = null;
    });
    this.provider.on("disconnect", (error: { code: number; message: string }) => {
      this.messageService.clearMessages();
      this.provider = null;
      this.signer = null;
      this.contract = null;
    });
    this.fetchAccountData();
  }

  async disconnect() {
    await this.web3Modal.clearCachedProvider();
    this.messageService.clearMessages();
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  private async fetchAccountData() {
    let network = await this.provider.getNetwork();
    let accounts = await this.provider.listAccounts();
    let balance = await this.provider.getBalance(accounts[0]);
    this.messageService.sendMessage({
      chainId: network.chainId,
      chainName: network.chainId == 31337 ? 'localhost' : network.chainId == 1 ? 'mainnet' : network.name,
      account: accounts[0],
      balance: ethers.utils.formatEther(balance)
    });
  }

  async getNftByCategory(category: string) {
    const cfg = {
      car: [1, 10],
      locker: [11, 20],
      house: [21, 30]
    }
    let result = [];
    for (var i = cfg[category][0]; i <= cfg[category][1]; i++) {
      let current = await this.getNftMetadata(i);
      if (current) {
        result.push(current);
      }
    }
    return result;
  }

  async getNftMetadata(id: number) {
    if (!this.provider) {
      await this.connect();
    }

    try {
      let metadataUrl = await this.contract.tokenURI(id);

      let metadata = await lastValueFrom(this.http.get<any>(metadataUrl));
      let userOf = await this.contract.userOf(id);
      let expires = await this.contract.userExpires(id);
      var date = new Date(expires * 1000);
      return {
        metadata: metadata,
        user: userOf,
        id: id,
        expires: expires == 0 ? "0" : date.toLocaleTimeString()
      };
    } catch (err) {
      console.log(err);
    }
  }

  async sign(command: any) {
    if (!this.provider) {
      await this.connect();
    }
    let signature = await this.signer.signMessage(JSON.stringify(command));
    return signature;
  }

  async rent(id: number) {
    if (!this.provider) {
      await this.connect();
    }
    let contractWithSigner = this.contract.connect(this.signer);
    let tx = await contractWithSigner.rent(id, 10, {
      value: ethers.utils.parseEther("0.01"),
      gasLimit: 500_000,
    });
    await tx.wait();
  }

  async loggedUser() {
    if (!this.provider) {
      await this.connect();
    }
    return await this.signer.getAddress();
  }

  async log(type: string) {
    try {
      await lastValueFrom(this.http.post<any>('counter/' + type, {}));
    } catch (err) {
      console.log(err);
    }
  }
}