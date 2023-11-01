import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import hre from "hardhat";
// Project
import * as constants from "./Constants";
import * as utils from "./Utils";


describe("StrategicClubNftCollection1.MaxSupply", () => {
  let test_ctx: utils.TestContext;

  beforeEach(async () => {
    test_ctx = await utils.initTestContext();
  });

  it("should increase maximum supply if not freezed", async () => {
    const new_max_supply: number = constants.TOKEN_INITIAL_MAX_SUPPLY + 1;

    await expect(await test_ctx.nft.increaseMaxSupply(new_max_supply))
      .to.emit(test_ctx.nft, "MaxSupplyIncreased")
      .withArgs(constants.TOKEN_INITIAL_MAX_SUPPLY, new_max_supply);

    expect(await test_ctx.nft.maxSupply()).to.equal(new_max_supply);
    expect(await test_ctx.nft.maxSupplyFreezed()).to.equal(false);
  });

  it("should freeze maximum supply", async () => {
    await expect(await test_ctx.nft.freezeMaxSupply())
      .to.emit(test_ctx.nft, "MaxSupplyFreezed")
      .withArgs(constants.TOKEN_INITIAL_MAX_SUPPLY);

    expect(await test_ctx.nft.maxSupply()).to.equal(constants.TOKEN_INITIAL_MAX_SUPPLY);
    expect(await test_ctx.nft.maxSupplyFreezed()).to.equal(true);
  });

  it("should revert if initializing with zero maximum supply", async () => {
    const nft_logic_instance: Contract = await utils.deployNftContract(test_ctx.accounts);
    const proxy_contract_factory: ContractFactory = await hre.ethers.getContractFactory("ERC1967Proxy");
    await expect(proxy_contract_factory
      .deploy(
        nft_logic_instance.address,
        nft_logic_instance.interface.encodeFunctionData(
          "init",
          [constants.TOKEN_INITIAL_BASE_URI, 0]
        )
      )
    )
      .to.be.revertedWithCustomError(test_ctx.nft, "MaxSupplyInvalidValueError")
      .withArgs(0);
  });

  it("should revert if minting more tokens than the maximum supply", async () => {
    const owner_address: string = await test_ctx.accounts.owner.getAddress();

    await expect(test_ctx.nft.mintBatchTo(owner_address, constants.TOKEN_INITIAL_MAX_SUPPLY + 1))
      .to.be.revertedWithCustomError(test_ctx.nft, "MaxSupplyReachedError")
      .withArgs(constants.TOKEN_INITIAL_MAX_SUPPLY);
  });

  it("should revert if increasing maximum supply with a lower value", async () => {
    const new_max_supply: number = constants.TOKEN_INITIAL_MAX_SUPPLY - 1;

    await expect(test_ctx.nft.increaseMaxSupply(new_max_supply))
      .to.be.revertedWithCustomError(test_ctx.nft, "MaxSupplyInvalidValueError")
      .withArgs(new_max_supply);
  });

  it("should revert if freezing maximum supply when freezed", async () => {
    await test_ctx.nft.freezeMaxSupply();
    await expect(test_ctx.nft.freezeMaxSupply())
      .to.be.revertedWithCustomError(test_ctx.nft, "MaxSupplyFreezedError");
  });

  it("should revert if increasing maximum supply when freezed", async () => {
    await test_ctx.nft.freezeMaxSupply();
    await expect(test_ctx.nft.increaseMaxSupply(constants.TOKEN_INITIAL_MAX_SUPPLY + 1))
      .to.be.revertedWithCustomError(test_ctx.nft, "MaxSupplyFreezedError");
  });
});
