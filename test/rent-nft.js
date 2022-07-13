const { expect } = require("chai");

var contractAddress = "";
var numToken = 10;

describe("Setup", function () {
    it("Deployment", async function () {
        const contract = await ethers.getContractFactory("RentableNFT");
        hardhatContract = await contract.deploy("Rentable NFT - Don Pabblo", "REN");
        contractAddress = hardhatContract.address;
        expect(await hardhatContract.symbol()).to.equal("REN");
    });
    it("Minting", async function () {
        const contract = await hre.ethers.getContractAt("RentableNFT", contractAddress);
        for (let i = 0; i < numToken; i++) {
            const txResponse = await contract.mint({
                gasLimit: 2_500_000,
                gasPrice: 39000000000,
            });
            const txReceipt = await txResponse.wait();
            const [transferEvent] = txReceipt.events;
            const { tokenId } = transferEvent.args;
        }
        const [owner] = await ethers.getSigners();
        const balance = await contract.balanceOf(owner.address);
        expect(BigInt(balance)).to.equal(BigInt(numToken));
    });
    it("Set User", async function () {
        const [owner, userWallet] = await ethers.getSigners();

        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        const timestampBefore = blockBefore.timestamp;
        const expiresInput = timestampBefore + 1000;

        const contract = await hre.ethers.getContractAt("RentableNFT", contractAddress);
        const txResponse = await contract.setUser(1, userWallet.address, expiresInput, {
            gasLimit: 500_000,
        });
        const txReceipt = await txResponse.wait();
        const [transferEvent] = txReceipt.events;
        const { user, expires, tokenId } = transferEvent.args;
        expect(user).to.equal(userWallet.address);
        expect(BigInt(tokenId)).to.equal(BigInt(1));
        expect(BigInt(expires)).to.equal(BigInt(expiresInput));

        const checkUser = await contract.userOf(1);
        expect(checkUser).to.equal(userWallet.address);

    });
    it("Makes NFT 2 rentable", async function () {
        const contract = await hre.ethers.getContractAt("RentableNFT", contractAddress);
        const txResponse = await contract.setRentable(2, true, {
            gasLimit: 500_000,
        });
        const txReceipt = await txResponse.wait();

        const rentable = await contract.rentables(2);
        expect(rentable.rentable).to.be.true;
    });
});

describe("Renting", function () {
    it("Fails because already rented", async function () {
        const [owner, userWallet] = await ethers.getSigners();

        const contract = await hre.ethers.getContractAt("RentableNFT", contractAddress);
        await contract.connect(userWallet).rent(1, 1, {
            value: ethers.utils.parseEther("0.001"),
            gasLimit: 500_000,
        }).catch(err => {
            expect(err.message).to.contain("Already rented");
        });
    });
    it("Fails because not rentable", async function () {
        const [owner, userWallet] = await ethers.getSigners();

        const contract = await hre.ethers.getContractAt("RentableNFT", contractAddress);
        await contract.connect(userWallet).rent(3, 1, {
            value: ethers.utils.parseEther("0.001"),
            gasLimit: 500_000,
        }).catch(err => {
            expect(err.message).to.contain("Renting disabled for the NFT");
        });
    });
    it("Fails because not enough ethers", async function () {
        const [owner, userWallet] = await ethers.getSigners();

        const contract = await hre.ethers.getContractAt("RentableNFT", contractAddress);
        await contract.connect(userWallet).rent(2, 1, {
            value: ethers.utils.parseEther("0.0001"),
            gasLimit: 500_000,
        }).catch(err => {
            expect(err.message).to.contain("Uncorrect amount");
        });
    });
    it("Fails because too much ethers", async function () {
        const [owner, userWallet] = await ethers.getSigners();

        const contract = await hre.ethers.getContractAt("RentableNFT", contractAddress);
        await contract.connect(userWallet).rent(2, 1, {
            value: ethers.utils.parseEther("1"),
            gasLimit: 500_000,
        }).catch(err => {
            expect(err.message).to.contain("Uncorrect amount");
        });
    });
    it("Rent ok", async function () {
        const [owner, userWallet] = await ethers.getSigners();

        const ownerBalanceStart = await hre.ethers.provider.getBalance(owner.address);
        const userWalletBalanceStart = await hre.ethers.provider.getBalance(userWallet.address);

        const contract = await hre.ethers.getContractAt("RentableNFT", contractAddress);
        const txResponse = await contract.connect(userWallet).rent(2, 1, {
            value: ethers.utils.parseEther("0.001"),
            gasLimit: 500_000,
        });

        const txReceipt = await txResponse.wait();
        const [transferEvent] = txReceipt.events;
        const { user, expires, tokenId } = transferEvent.args;
        expect(user).to.equal(userWallet.address);
        expect(BigInt(tokenId)).to.equal(BigInt(2));
        expect(BigInt(expires)).to.equal(BigInt(1));

        const checkUser = await contract.userOf(2);
        expect(checkUser).to.equal(userWallet.address);

        const ownerBalanceEnd = await hre.ethers.provider.getBalance(owner.address);
        const userWalletBalanceEnd = await hre.ethers.provider.getBalance(userWallet.address);
        const gasUsed = BigInt(txReceipt.cumulativeGasUsed) * BigInt(txReceipt.effectiveGasPrice);
        const rentableItem = await contract.rentables(2);
        expect(BigInt(ownerBalanceEnd)).to.equal(BigInt(ownerBalanceStart) + BigInt(rentableItem.amountPerMinute));
        expect(BigInt(userWalletBalanceEnd)).to.equal(BigInt(userWalletBalanceStart) - BigInt(rentableItem.amountPerMinute) - gasUsed);
    });

});

describe("Command check", function () {
    var message;
    var signature;

    it("Send command", async function () {
        //User side
        const [owner, userWallet] = await ethers.getSigners();

        message = {
            command: 'unlock',
            token: '1234567890987654321',
            network: 'localhost',
            chainid: 33137,
            contract: contractAddress,
            nft: 2
        };
        signature = await userWallet.signMessage(JSON.stringify(message));
        expect(signature).to.be.not.empty;
    });
    it("Verify message", async function () {
        //Asset side
        const verify = await ethers.utils.verifyMessage(JSON.stringify(message), signature);
        const contract = await hre.ethers.getContractAt("RentableNFT", contractAddress);
        const checkUser = await contract.userOf(message.nft);
        expect(checkUser).to.equal(verify);//verify address is the user of NFT
    });
    it("Verify message after X seconds", async function () {
        this.timeout(120000);
        const contract = await hre.ethers.getContractAt("RentableNFT", contractAddress);
        await new Promise(resolve => setTimeout(resolve, 70000));//wait X seconds
        //Useless transaction to increase block timestamp
        await contract.setUser(3, '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 1, {
            gasLimit: 500_000,
        });
        const verify = await ethers.utils.verifyMessage(JSON.stringify(message), signature);
        const checkUser = await contract.userOf(message.nft);
        expect(checkUser).to.not.equal(verify);
    });
});