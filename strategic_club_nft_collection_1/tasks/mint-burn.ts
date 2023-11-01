import { BigNumber, Contract, ContractFactory, ContractTransaction } from "ethers";
import { task } from "hardhat/config";
import { splitString } from "./utils";

task("mint", "Mint a token to an address")
  .addParam("contract", "Contract address")
  .addParam("to", "Target address")
  .setAction(async (taskArgs, hre) => {
    console.log(`Minting a token to ${taskArgs.to}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.mintTo(taskArgs.to);

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("mint-batch", "Mint tokens to an address")
  .addParam("contract", "Contract address")
  .addParam("to", "Target address")
  .addParam("amount", "Amount of tokens")
  .setAction(async (taskArgs, hre) => {
    const amount: BigNumber = BigNumber.from(taskArgs.amount);

    console.log(`Minting ${amount} token(s) to ${taskArgs.to}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.mintBatchTo(taskArgs.to, amount);

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("airdrop", "Airdrop tokens to multiple addresses")
  .addParam("contract", "Contract address")
  .addParam("tos", "Target addresses, comma separated")
  .setAction(async (taskArgs, hre) => {
    const addresses: string[] = splitString(taskArgs.tos);

    console.log(`Airdropping tokens to ${addresses}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.airdrop(addresses);

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("burn", "Burn a token")
  .addParam("contract", "Contract address")
  .addParam("id", "Token ID")
  .setAction(async (taskArgs, hre) => {
    const id: BigNumber = BigNumber.from(taskArgs.id);

    console.log(`Burning token ID ${id}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.burn(id);

    console.log(`Transaction hash: ${tx.hash}`);
  });
