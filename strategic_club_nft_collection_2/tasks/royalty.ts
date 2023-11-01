import { BigNumber, Contract, ContractFactory, ContractTransaction } from "ethers";
import { task } from "hardhat/config";

task("royalty-default-set", "Set the royalty information that all ids in this contract will default to")
  .addParam("contract", "Contract address")
  .addParam("account", "Target address")
  .addParam("value", "Fee fraction")
  .setAction(async (taskArgs, hre) => {
    const value: BigNumber = BigNumber.from(taskArgs.value);

    console.log(`Setting royalty information of account ${taskArgs.account} to ${value}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection2");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.setDefaultRoyalty(taskArgs.account, value);

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("royalty-default-delete", "Delete default royalty information")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    console.log("Deleting default royalty information...");

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection2");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.deleteDefaultRoyalty();

    console.log(`Transaction hash: ${tx.hash}`);
  });
