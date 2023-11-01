import { expect } from "chai";
import { Signer } from "ethers";
// Project
import * as constants from "./Constants";
import * as utils from "./Utils";


describe("StrategicClubNftCollection2.Access", () => {
  let test_ctx: utils.TestContext;

  beforeEach(async () => {
    test_ctx = await utils.initTestContextAndMint();
  });

  it("should revert if functions are not called by the owner", async () => {
    const dummy_uri: string = "dummy/";
    const dummy_amount: number = 10;
    const dummy_value: number = 5;
    const not_owner_account: Signer = test_ctx.accounts.signers[0];
    const owner_address: string = await test_ctx.accounts.owner.getAddress();

    // Proxy
    await expect(test_ctx.nft.connect(not_owner_account).upgradeTo(constants.NULL_ADDRESS))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).upgradeToAndCall(constants.NULL_ADDRESS, constants.EMPTY_BYTES))
      .to.be.revertedWith("Ownable: caller is not the owner");

    // Mint/Burn
    await expect(test_ctx.nft.connect(not_owner_account).mintTo(owner_address, dummy_amount))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).mintToById(owner_address, 1, dummy_amount))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).mintBatchTo(owner_address, [dummy_amount]))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).burn(owner_address, 1, dummy_amount))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).burnBatch(owner_address, [1], [dummy_amount]))
      .to.be.revertedWith("Ownable: caller is not the owner");

    // URIs management
    await expect(test_ctx.nft.connect(not_owner_account).setBaseURI(dummy_uri))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).setContractURI(dummy_uri))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).setTokenURI(1, dummy_uri))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).resetTokenURI(1))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).freezeURI())
      .to.be.revertedWith("Ownable: caller is not the owner");

    // Maximum tokens per wallet management
    await expect(test_ctx.nft.connect(not_owner_account).setWalletMaxTokens(owner_address, 1, dummy_value))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).setDefaultWalletMaxTokens(1, dummy_value))
      .to.be.revertedWith("Ownable: caller is not the owner");

    // Pause management
    await expect(test_ctx.nft.connect(not_owner_account).setPausedWallet(owner_address, false))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).setUnpausedWallet(owner_address, false))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).pauseTransfers())
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).unpauseTransfers())
      .to.be.revertedWith("Ownable: caller is not the owner");
  });
});
