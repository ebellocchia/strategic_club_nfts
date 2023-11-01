import { Contract, ContractFactory, Signer } from "ethers";
import hre from "hardhat";
// Project
import * as constants from "./Constants";

//
// Interfaces
//

export interface Accounts {
  signers: Signer[];
  owner: Signer;
}

export interface TestContext {
  accounts: Accounts;
  nft: Contract;
}

//
// Exported functions
//

export async function initTestContext() : Promise<TestContext> {
  const accounts: Accounts = await initAccounts();
  const nft: Contract = await deployNftProxyContract(
    constants.TOKEN_INITIAL_BASE_URI,
    constants.TOKEN_INITIAL_MAX_SUPPLY
  );

  return {
    accounts,
    nft,
  };
}

export async function initTestContextAndMint() : Promise<TestContext> {
  const text_ctx: TestContext = await initTestContext();
  await text_ctx.nft.mintBatchTo(await text_ctx.accounts.owner.getAddress(), constants.TOKEN_INITIAL_MAX_SUPPLY);

  return text_ctx;
}

export async function deployNftContract() : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
  const instance: Contract = await contract_factory.deploy();
  await instance.deployed();

  return instance;
}

export async function deployNftUpgradedContract() : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1Upgraded");
  const instance: Contract = await contract_factory.deploy();
  await instance.deployed();

  return instance;
}

export async function getNftUpgradedContractAt(
  address: string
) : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1Upgraded");
  return contract_factory.attach(address);
}

//
// Not exported functions
//

async function initAccounts() : Promise<Accounts> {
  const all_signers: Signer[] = await hre.ethers.getSigners();

  const owner: Signer = all_signers[0];
  const signers: Signer[] = [];
  for (let i = 1; i < all_signers.length; i++) {
    signers.push(all_signers[i])
  }

  return {
    owner,
    signers,
  };
}

async function getNftContractAt(
  address: string
) : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection1");
  return contract_factory.attach(address);
}

async function deployProxyContract(
  logicInstance: Contract,
  baseURI: string,
  maxSupply: number
) : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("ERC1967Proxy");
  const instance: Contract = await contract_factory
    .deploy(
      logicInstance.address,
      logicInstance.interface.encodeFunctionData(
        "init",
        [baseURI, maxSupply]
      )
    );
  await instance.deployed();

  return instance;
}

async function deployNftProxyContract(
  baseURI: string,
  maxSupply: number
) : Promise<Contract> {
  const nft_logic_instance: Contract = await deployNftContract();
  const proxy_instance: Contract = await deployProxyContract(
    nft_logic_instance,
    baseURI,
    maxSupply
  );

  return getNftContractAt(proxy_instance.address);
}
