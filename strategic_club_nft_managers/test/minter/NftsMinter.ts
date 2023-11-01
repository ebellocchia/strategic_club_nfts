import { BigNumber, Contract, ContractFactory } from "ethers";
import hre from "hardhat";
// Project
import * as constants from "../common/Constants";
import {
  TestContext,
  initTestContext, initTokens, deployProxyContract
} from "../common/UtilsCommon";


//
// Interfaces
//

export interface Mint {
  nftAmount: BigNumber;
  erc20Contract: string;
  erc20Amount: BigNumber;
  isActive: boolean;
}

export interface MinterTestContext extends TestContext {
  minter: Contract;
}

//
// Exported functions
//

export async function initMinterTestContext() : Promise<MinterTestContext> {
  const test_ctx: TestContext = await initTestContext();
  const minter: Contract = await deployMinterProxyContract(test_ctx.payment_erc20_address);

  return {
    accounts: test_ctx.accounts,
    mock_erc20: test_ctx.mock_erc20,
    mock_erc721: test_ctx.mock_erc721,
    mock_erc1155: test_ctx.mock_erc1155,
    payment_erc20_address: test_ctx.payment_erc20_address,
    minter: minter,
    user_1_account: test_ctx.user_1_account,
    user_1_address: test_ctx.user_1_address,
    user_2_account: test_ctx.user_2_account,
    user_2_address: test_ctx.user_2_address,
    user_3_account: test_ctx.user_3_account,
    user_3_address: test_ctx.user_3_address
  };
}

export async function initMinterTestContextAndToken() : Promise<MinterTestContext> {
  const test_ctx: MinterTestContext = await initMinterTestContext();
  await initTokens(
    test_ctx.accounts,
    test_ctx.minter.address,
    test_ctx.mock_erc20,
    test_ctx.mock_erc721,
    test_ctx.mock_erc1155,
    test_ctx.user_1_account,
    test_ctx.user_2_account,
    test_ctx.user_3_account
  );

  return test_ctx;
}

export async function initMinterTestContextAndCreate() : Promise<MinterTestContext> {
  const test_ctx: MinterTestContext = await initMinterTestContextAndToken();
  const erc20_amount: number = constants.ERC20_TOKEN_SUPPLY / 10;
  const nft_id: number = 0;

  await test_ctx.minter.createERC721Mint(
    test_ctx.mock_erc721.address,
    nft_id,
    test_ctx.mock_erc20.address,
    erc20_amount
  );
  await test_ctx.minter.createERC1155Mint(
    test_ctx.mock_erc1155.address,
    nft_id,
    constants.ERC1155_TOKEN_AMOUNT,
    test_ctx.mock_erc20.address,
    erc20_amount
  );

  return test_ctx;
}

export async function deployMinterContract() : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftsMinter");
  const instance: Contract = await contract_factory.deploy();
  await instance.deployed();

  return instance;
}

export async function deployMinterUpgradedContract() : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftsMinterUpgraded");
  const instance: Contract = await contract_factory.deploy();
  await instance.deployed();

  return instance;
}

export async function getMinterUpgradedContractAt(
  address: string
) : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftsMinterUpgraded");
  return contract_factory.attach(address);
}

//
// Not exported functions
//

async function getMinterContractAt(
  address: string
) : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftsMinter");
  return contract_factory.attach(address);
}

async function deployMinterProxyContract(
  paymentERC20Address: string
) : Promise<Contract> {
  const minter_logic_instance: Contract = await deployMinterContract();
  const proxy_instance: Contract = await deployProxyContract(minter_logic_instance, paymentERC20Address);

  return getMinterContractAt(proxy_instance.address);
}
