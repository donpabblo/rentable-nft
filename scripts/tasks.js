const { task } = require("hardhat/config");
const { getContractAt } = require("@nomiclabs/hardhat-ethers/internal/helpers");
require('dotenv').config();
const { CONTRACT } = process.env;

task("set-base-token-uri", "Sets the base token URI for the deployed smart contract")
    .addParam("baseurl", "The base of the tokenURI endpoint to set")
    .setAction(async function (taskArguments, hre) {
        const contract = await getContractAt(hre, "RentableNFT", CONTRACT);
        const response = await contract.setBaseTokenURI(taskArguments.baseurl, {
            gasLimit: 500_000,
        });
        console.log(`Transaction Hash: ${response.hash}`);
    });

task("get-base-token-uri", "Gets the base token URI for the deployed smart contract")
    .setAction(async function (taskArguments, hre) {
        const contract = await getContractAt(hre, "RentableNFT", CONTRACT);
        const response = await contract.baseTokenURI();
        console.log(`Response: ${response}`);
    });

task("token-uri", "Gets the token URI metadata")
    .addParam("token", "The token id")
    .setAction(async function (taskArguments, hre) {
        const contract = await getContractAt(hre, "RentableNFT", CONTRACT);
        const response = await contract.tokenURI(taskArguments.token);
        console.log(`Response: ${response}`);
    });

task("mint", "Mints from the Rental NFT contract")
    .addParam("num", "The number of NFT to mint")
    .setAction(async function (taskArguments, hre) {
        const contract = await getContractAt(hre, "RentableNFT", CONTRACT);
        for (let i = 0; i < taskArguments.num; i++) {
            const txResponse = await contract.mint({
                gasLimit: 2_500_000,
                gasPrice: 39000000000,
            });
            const txReceipt = await txResponse.wait();
            const [transferEvent] = txReceipt.events;
            const { tokenId } = transferEvent.args;
            console.log(`Created Token: ${tokenId.toString()}`);
        }
    });

task("balance", "Gets NFT Owner balance")
    .setAction(async function (taskArguments, hre) {
        const [owner] = await ethers.getSigners();
        const contract = await getContractAt(hre, "RentableNFT", CONTRACT);
        const response = await contract.balanceOf(owner.address);
        console.log(`Owner balance: ${response}`);
    });

task("set-user", "")
    .addParam("tokenid", "")
    .addParam("user", "")
    .addParam("expires", "")
    .setAction(async function (taskArguments, hre) {
        const contract = await getContractAt(hre, "RentableNFT", CONTRACT);
        const txResponse = await contract.setUser(BigInt(taskArguments.tokenid), taskArguments.user, BigInt(taskArguments.expires), {
            gasLimit: 500_000,
        });
        const txReceipt = await txResponse.wait();
        const [transferEvent] = txReceipt.events;
        const { user, expires, tokenId } = transferEvent.args;
        console.log(`User: ${user} - Token ID: ${tokenId} - Expires: ${expires}`);
    });

task("user-of", "")
    .addParam("tokenid", "")
    .setAction(async function (taskArguments, hre) {
        const contract = await getContractAt(hre, "RentableNFT", CONTRACT);
        const response = await contract.userOf(taskArguments.tokenid);
        console.log(`User of token ${taskArguments.tokenid} is: ${response}`);
    });

task("make-rentable", "")
    .addParam("num", "")
    .setAction(async function (taskArguments, hre) {
        for (let i = 1; i <= taskArguments.num; i++) {
            const contract = await getContractAt(hre, "RentableNFT", CONTRACT);
            const txResponse = await contract.setRentable(i, true, {
                gasLimit: 2_500_000,
                gasPrice: 39000000000,
            });
            const txReceipt = await txResponse.wait();
            console.log(`Token: ${i} is rentable`);
        }
    });

task("change-rent-fee", "")
    .addParam("num", "")
    .addParam("fee", "")
    .setAction(async function (taskArguments, hre) {
        for (let i = 1; i <= taskArguments.num; i++) {
            const contract = await getContractAt(hre, "RentableNFT", CONTRACT);
            const txResponse = await contract.setRentFee(i, taskArguments.fee, {
                gasLimit: 2_500_000,
                gasPrice: 39000000000,
            });
            const txReceipt = await txResponse.wait();
            console.log(`Token: ${i} - Rent fee: ${taskArguments.fee}`);
        }
    });