const { task } = require("hardhat/config");
const { writeConfig } = require("./helpers");

task("deploy", "Deploys contracts")
    .setAction(async function (taskArguments, hre) {
        const contract = await hre.ethers.getContractFactory("RentableNFT");
        const RentableNFT = await contract.deploy("Rentable NFT - Don Pabblo", "REN");
        const address = RentableNFT.address;
        console.log(`Rentable NFT contract deployed to address: ${address}`);

        writeConfig(address);

    });