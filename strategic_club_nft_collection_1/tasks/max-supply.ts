import { BigNumber, Contract, ContractFactory, ContractTransaction } from "ethers";
import { task } from "hardhat/config";

task("max-supply-freeze", "Freeze maximum supply")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    console.log("Freezing maximum supply...");

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.freezeMaxSupply();

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("max-supply-increase", "Increase maximum supply")
  .addParam("contract", "Contract address")
  .addParam("value", "New maximum supply value")
  .setAction(async (taskArgs, hre) => {
    const value: BigNumber = BigNumber.from(taskArgs.value);

    console.log(`Increasing maximum supply to ${value}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.increaseMaxSupply(value);

    console.log(`Transaction hash: ${tx.hash}`);
  });
