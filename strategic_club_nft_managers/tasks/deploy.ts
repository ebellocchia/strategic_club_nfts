import { BigNumber, Contract, ContractFactory } from "ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function deployAuction(
  hre: HardhatRuntimeEnvironment
) : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftsAuction");
  const instance: Contract = await contract_factory.deploy();
  await instance.deployed();

  return instance;
}

async function deployRedeemer(
  hre: HardhatRuntimeEnvironment
) : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftsRedeemer");
  const instance: Contract = await contract_factory.deploy();
  await instance.deployed();

  return instance;
}

async function deployMinter(
  hre: HardhatRuntimeEnvironment
) : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftsMinter");
  const instance: Contract = await contract_factory.deploy();
  await instance.deployed();

  return instance;
}

async function deployProxy(
  hre: HardhatRuntimeEnvironment,
  logic: Contract,
  walletAddr: string
) : Promise<Contract> {
  const contract_factory: ContractFactory = await hre.ethers.getContractFactory("ERC1967Proxy");
  const instance: Contract = await contract_factory.deploy(
    logic.address,
    logic.interface.encodeFunctionData("init", [walletAddr])
  );
  await instance.deployed();

  return instance;
}

task("deploy-test-tokens", "Deploy mock tokens (ERC20, ERC721, ERC1155)")
  .addParam("erc20Supply", "Supply of the mock ERC20 token")
  .setAction(async (taskArgs, hre) => {
    const erc20_supply: BigNumber = BigNumber.from(taskArgs.erc20Supply);

    console.log("Deploying test tokens...");

    const erc20_contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubERC20Token");
    const erc20_instance: Contract = await erc20_contract_factory.deploy(erc20_supply);
    await erc20_instance.deployed();

    const erc721_contract_factory: ContractFactory = await hre.ethers.getContractFactory("MockERC721Token");
    const erc721_instance: Contract = await erc721_contract_factory.deploy();
    await erc721_instance.deployed();

    const erc1155_contract_factory: ContractFactory = await hre.ethers.getContractFactory("MockERC1155Token");
    const erc1155_instance: Contract = await erc1155_contract_factory.deploy();
    await erc1155_instance.deployed();

    console.log(`StrategicClubERC20Token deployed to ${erc20_instance.address} with supply ${erc20_supply}`);
    console.log(`MockERC721Token deployed to ${erc721_instance.address}`);
    console.log(`MockERC1155Token deployed to ${erc1155_instance.address}`);
  });

task("deploy-all", "Deploy contract")
  .addParam("walletAddr", "Wallet address")
  .setAction(async (taskArgs, hre) => {
    console.log("Deploying logic contracts...");

    const auction_logic: Contract = await deployAuction(hre);
    const redeemer_logic: Contract = await deployRedeemer(hre);
    const minter_logic: Contract = await deployMinter(hre);

    console.log("Deploying proxy contracts...");

    const auction_proxy: Contract = await deployProxy(hre, auction_logic, taskArgs.walletAddr);
    const redeemer_proxy: Contract = await deployProxy(hre, redeemer_logic, taskArgs.walletAddr);
    const minter_proxy: Contract = await deployProxy(hre, minter_logic, taskArgs.walletAddr);

    console.log(`Payment ERC20 wallet: ${taskArgs.walletAddr}`);
    console.log(`StrategicClubNftsAuction logic deployed to ${auction_logic.address}`);
    console.log(`StrategicClubNftsAuction proxy deployed to ${auction_proxy.address}`);
    console.log(`StrategicClubNftsRedeemer logic deployed to ${redeemer_logic.address}`);
    console.log(`StrategicClubNftsRedeemer proxy deployed to ${redeemer_proxy.address}`);
    console.log(`StrategicClubNftsMinter logic deployed to ${minter_logic.address}`);
    console.log(`StrategicClubNftsMinter proxy deployed to ${minter_proxy.address}`);
  });

task("deploy-auction", "Deploy auction contract")
  .addParam("walletAddr", "Wallet address")
  .setAction(async (taskArgs, hre) => {
    console.log("Deploying logic contract...");

    const auction_logic: Contract = await deployAuction(hre);

    console.log("Deploying proxy contract...");

    const auction_proxy: Contract = await deployProxy(hre, auction_logic, taskArgs.walletAddr);

    console.log(`Payment ERC20 wallet: ${taskArgs.walletAddr}`);
    console.log(`StrategicClubNftsAuction logic deployed to ${auction_logic.address}`);
    console.log(`StrategicClubNftsAuction proxy deployed to ${auction_proxy.address}`);
  });

task("deploy-redeemer", "Deploy redeemer contract")
  .addParam("walletAddr", "Wallet address")
  .setAction(async (taskArgs, hre) => {
    console.log("Deploying logic contract...");

    const redeemer_logic: Contract = await deployRedeemer(hre);

    console.log("Deploying proxy contract...");

    const redeemer_proxy: Contract = await deployProxy(hre, redeemer_logic, taskArgs.walletAddr);

    console.log(`Payment ERC20 wallet: ${taskArgs.walletAddr}`);
    console.log(`StrategicClubNftsRedeemer logic deployed to ${redeemer_logic.address}`);
    console.log(`StrategicClubNftsRedeemer proxy deployed to ${redeemer_proxy.address}`);
  });

task("deploy-minter", "Deploy minter contract")
  .addParam("walletAddr", "Wallet address")
  .setAction(async (taskArgs, hre) => {
    console.log("Deploying logic contract...");

    const minter_logic: Contract = await deployMinter(hre);

    console.log("Deploying proxy contract...");

    const minter_proxy: Contract = await deployProxy(hre, minter_logic, taskArgs.walletAddr);

    console.log(`Payment ERC20 wallet: ${taskArgs.walletAddr}`);
    console.log(`StrategicClubNftsMinter logic deployed to ${minter_logic.address}`);
    console.log(`StrategicClubNftsMinter proxy deployed to ${minter_proxy.address}`);
  });

task("upgrade-auction-to", "Upgrade auction contract")
  .addParam("proxyAddr", "Proxy address")
  .setAction(async (taskArgs, hre) => {
    console.log("Deploying new contract logic...");

    const auction_logic: Contract = await deployAuction(hre);

    console.log("Upgrading contract...");

    const proxy_instance: Contract = await (await hre.ethers.getContractFactory("StrategicClubNftsAuction"))
      .attach(taskArgs.proxyAddr);
    proxy_instance.upgradeTo(auction_logic.address);

    console.log(`StrategicClubNftsAuction updated logic deployed to ${auction_logic.address}`);
  });

task("upgrade-redeemer-to", "Upgrade redeemer contract")
  .addParam("proxyAddr", "Proxy address")
  .setAction(async (taskArgs, hre) => {
    console.log("Deploying new contract logic...");

    const redeemer_logic: Contract = await deployRedeemer(hre);

    console.log("Upgrading contract...");

    const proxy_instance: Contract = await (await hre.ethers.getContractFactory("StrategicClubNftsRedeemer"))
      .attach(taskArgs.proxyAddr);
    proxy_instance.upgradeTo(redeemer_logic.address);

    console.log(`StrategicClubNftsRedeemer updated logic deployed to ${redeemer_logic.address}`);
  });

task("upgrade-minter-to", "Upgrade minter contract")
  .addParam("proxyAddr", "Proxy address")
  .setAction(async (taskArgs, hre) => {
    console.log("Deploying new contract logic...");

    const minter_logic: Contract = await deployMinter(hre);

    console.log("Upgrading contract...");

    const proxy_instance: Contract = await (await hre.ethers.getContractFactory("StrategicClubNftsMinter"))
      .attach(taskArgs.proxyAddr);
    proxy_instance.upgradeTo(minter_logic.address);

    console.log(`StrategicClubNftsMinter updated logic deployed to ${minter_logic.address}`);
  });
