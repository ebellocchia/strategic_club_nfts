import { Contract, ContractFactory } from "ethers";
import { task } from "hardhat/config";

task("deploy", "Deploy contract")
  .addParam("uri", "URI")
  .setAction(async (taskArgs, hre) => {
    console.log("Deploying contract logic...");

    const nft_contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection2");
    const nft_logic_instance: Contract = await nft_contract_factory
      .deploy();
    await nft_logic_instance.deployed();

    console.log("Deploying contract proxy...");

    const proxy_contract_factory: ContractFactory = await hre.ethers.getContractFactory("ERC1967Proxy");
    const proxy_instance: Contract = await proxy_contract_factory
      .deploy(
        nft_logic_instance.address,
        nft_logic_instance.interface.encodeFunctionData("init", [taskArgs.uri])
      );
    await proxy_instance.deployed();

    console.log(`URI: ${taskArgs.uri}`);
    console.log(`StrategicClubNftCollection2 logic deployed to ${nft_logic_instance.address}`);
    console.log(`StrategicClubNftCollection2 proxy deployed to ${proxy_instance.address}`);
  });

task("upgrade-to", "Upgrade contract")
  .addParam("proxyAddr", "Proxy address")
  .setAction(async (taskArgs, hre) => {
    console.log("Deploying new contract logic...");

    const nft_contract_factory: ContractFactory = await hre.ethers.getContractFactory("StrategicClubNftCollection2");
    const nft_logic_instance: Contract = await nft_contract_factory
      .deploy();
    await nft_logic_instance.deployed();

    console.log("Upgrading contract...");

    const proxy_instance: Contract = await nft_contract_factory.attach(taskArgs.proxyAddr);
    proxy_instance.upgradeTo(nft_logic_instance.address);

    console.log(`StrategicClubNftCollection2 updated logic deployed to ${nft_logic_instance.address}`);
  });
