import { expect } from "chai";
import { Contract } from "ethers";
// Project
import * as constants from "./Constants";
import * as utils from "./Utils";


describe("StrategicClubNftCollection1.Deploy", () => {
  let test_ctx: utils.TestContext;

  beforeEach(async () => {
    test_ctx = await utils.initTestContext();
  });

  it("should be constructed correctly", async () => {
    const owner_address: string = await test_ctx.accounts.owner.getAddress();

    expect(await test_ctx.nft.name()).to.equal(constants.TOKEN_NAME);
    expect(await test_ctx.nft.symbol()).to.equal(constants.TOKEN_SYMBOL);
    expect(await test_ctx.nft.owner()).to.equal(owner_address);
    expect(await test_ctx.nft.maxSupply()).to.equal(constants.TOKEN_INITIAL_MAX_SUPPLY);
    expect(await test_ctx.nft.maxSupplyFreezed()).to.equal(false);
    expect(await test_ctx.nft.defaultWalletMaxTokens()).to.equal(constants.TOKEN_DEF_WALLET_MAX_TOKENS);
    expect(await test_ctx.nft.totalSupply()).to.equal(0);
    expect(await test_ctx.nft.baseURI()).to.equal(constants.TOKEN_INITIAL_BASE_URI);
    expect(await test_ctx.nft.contractURI()).to.equal(constants.TOKEN_INITIAL_CONTRACT_URI);
    expect(await test_ctx.nft.unrevealedURI()).to.equal(constants.TOKEN_INITIAL_UNREVEALED_URI);
    expect(await test_ctx.nft.uriFreezed()).to.equal(false);
    expect(await test_ctx.nft.revealingURIsEnabled()).to.equal(false);
    expect(await test_ctx.nft.allURIsRevealed()).to.equal(false);
    expect(await test_ctx.nft.paused()).to.equal(false);
  });

  it("should upgrade the logic", async () => {
    const new_nft_logic: Contract = await utils.deployNftUpgradedContract();

    await expect(await test_ctx.nft.upgradeTo(new_nft_logic.address))
      .not.to.be.reverted;

    test_ctx.nft = await utils.getNftUpgradedContractAt(test_ctx.nft.address);  // Update ABI
    expect(await test_ctx.nft.isUpgraded())
      .to.equal(true);
  });

  it("should revert if initializing more than once", async () => {
    await expect(test_ctx.nft.init("", 1))
      .to.be.revertedWith("Initializable: contract is already initialized");
  });

  it("should revert if initializing the logic contract without a proxy", async () => {
    const nft = await utils.deployNftContract();
    await expect(nft.init("", 1))
      .to.be.revertedWith("Initializable: contract is already initialized");
  });
});
