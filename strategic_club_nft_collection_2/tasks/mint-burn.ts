import { BigNumber, Contract, ContractFactory, ContractTransaction } from "ethers";
import { task } from "hardhat/config";
import { paramParseBigNumberList } from "./utils";

task("mint", "Mint a token to an address")
  .addParam("contract", "Contract address")
  .addParam("to", "Target address")
  .addParam("amount", "Amount of tokens")
  .setAction(async (taskArgs, hre) => {
    const amount: BigNumber = BigNumber.from(taskArgs.amount);

    console.log(`Minting ${amount} token(s) to ${taskArgs.to}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection2");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.mintTo(taskArgs.to, amount);

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("mint-by-id", "Mint a token ID to an address")
  .addParam("contract", "Contract address")
  .addParam("to", "Target address")
  .addParam("id", "Token ID")
  .addParam("amount", "Amount of tokens")
  .setAction(async (taskArgs, hre) => {
    const amount: BigNumber = BigNumber.from(taskArgs.amount);
    const id: BigNumber = BigNumber.from(taskArgs.id);

    console.log(`Minting ${amount} token(s) ID ${id} to ${taskArgs.to}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection2");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.mintToById(taskArgs.to, id, amount);

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("mint-batch", "Mint tokens to an address")
  .addParam("contract", "Contract address")
  .addParam("to", "Target address")
  .addParam("amounts", "Amounts of tokens")
  .setAction(async (taskArgs, hre) => {
    const amounts: BigNumber[] = paramParseBigNumberList(taskArgs.amounts);

    console.log(`Minting ${amounts} token(s) to ${taskArgs.to}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection2");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.mintBatchTo(taskArgs.to, amounts);

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("burn", "Burn a token")
  .addParam("contract", "Contract address")
  .addParam("from", "Target address")
  .addParam("id", "Token ID")
  .addParam("amount", "Amount of tokens")
  .setAction(async (taskArgs, hre) => {
    const amount: BigNumber = BigNumber.from(taskArgs.amount);
    const id: BigNumber = BigNumber.from(taskArgs.id);

    console.log(`Burning ${amount} token ID ${id} from ${taskArgs.from}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection2");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.burn(taskArgs.from, id, amount);

    console.log(`Transaction hash: ${tx.hash}`);
  });

task("burn-batch", "Burn tokens")
  .addParam("contract", "Contract address")
  .addParam("from", "Target address")
  .addParam("ids", "Token IDs, comma separated")
  .addParam("amounts", "Amounts of tokens, comma separated")
  .setAction(async (taskArgs, hre) => {
    const amounts: BigNumber[] = paramParseBigNumberList(taskArgs.amounts);
    const ids: BigNumber[] = paramParseBigNumberList(taskArgs.ids);

    console.log(`Burning ${amounts} of token IDs ${ids} from ${taskArgs.from}...`);

    const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection2");
    const instance: Contract = await contract_factory.attach(taskArgs.contract);
    const tx: ContractTransaction = await instance.burnBatch(taskArgs.from, ids, amounts);

    console.log(`Transaction hash: ${tx.hash}`);
  });
