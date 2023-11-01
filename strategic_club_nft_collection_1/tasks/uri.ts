import { BigNumber, Contract, ContractFactory, ContractTransaction } from "ethers";
import { task } from "hardhat/config";

task("uri-reveal-enable", "Enable URIs revealing")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    console.log("Enable URIs revealing...");

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.enableURIsRevealing();

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("uri-reveal-single", "Reveal single URI")
  .addParam("contract", "Contract address")
  .addParam("id", "Token ID")
  .setAction(async (taskArgs, hre) => {
    const id: BigNumber = BigNumber.from(taskArgs.id);

    console.log(`Revealing URI of token ID ${id}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.revealSingleURI(id);

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("uri-reveal-all", "Reveal all URIs")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    console.log("Revealing all URIs...");

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.revealAllURIs();

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("uri-freeze", "Freeze URI")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    console.log("Freezing URI...");

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.freezeURI();

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("uri-set-unrevealed", "Set unrevealed URI")
  .addParam("contract", "Contract address")
  .addParam("uri", "URI")
  .setAction(async (taskArgs, hre) => {
    console.log(`Setting unrevealed URI to ${taskArgs.uri}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.setUnrevealedURI(taskArgs.uri);

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("uri-set-base", "Set base URI")
  .addParam("contract", "Contract address")
  .addParam("uri", "URI")
  .setAction(async (taskArgs, hre) => {
    console.log(`Setting base URI to ${taskArgs.uri}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.setBaseURI(taskArgs.uri);

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("uri-set-contract", "Set contract URI")
  .addParam("contract", "Contract address")
  .addParam("uri", "URI")
  .setAction(async (taskArgs, hre) => {
    console.log(`Setting contract URI to ${taskArgs.uri}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.setContractURI(taskArgs.uri);

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("uri-set-token", "Set token URI")
  .addParam("contract", "Contract address")
  .addParam("id", "Token ID")
  .addParam("uri", "URI")
  .setAction(async (taskArgs, hre) => {
    const id: BigNumber = BigNumber.from(taskArgs.id);

    console.log(`Setting URI of token ID ${id} to ${taskArgs.uri}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.setTokenURI(id, taskArgs.uri);

    console.log(`Transaction hash: ${tx.hash}`);
  });
