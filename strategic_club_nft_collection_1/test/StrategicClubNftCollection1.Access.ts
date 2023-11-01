import { expect } from "chai";
import { Signer } from "ethers";
// Project
import * as constants from "./Constants";
import * as utils from "./Utils";


describe("StrategicClubNftCollection1.Access", () => {
  let test_ctx: utils.TestContext;

  beforeEach(async () => {
    test_ctx = await utils.initTestContextAndMint();
  });

  it("should revert if functions are not called by the owner", async () => {
    const dummy_uri: string = "dummy/";
    const dummy_value: number = 5;
    const not_owner_account: Signer = test_ctx.accounts.signers[0];
    const owner_address: string = await test_ctx.accounts.owner.getAddress();

    // Proxy
    await expect(test_ctx.nft.connect(not_owner_account).upgradeTo(constants.NULL_ADDRESS))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).upgradeToAndCall(constants.NULL_ADDRESS, constants.EMPTY_BYTES))
      .to.be.revertedWith("Ownable: caller is not the owner");

    // Mint/Burn
    await expect(test_ctx.nft.connect(not_owner_account).mintTo(owner_address))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).mintBatchTo(owner_address, dummy_value))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).airdrop([owner_address]))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).burn(1))
      .to.be.revertedWith("Ownable: caller is not the owner");

    // Maximum supply management
    await expect(test_ctx.nft.connect(not_owner_account).increaseMaxSupply(dummy_value))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).freezeMaxSupply())
      .to.be.revertedWith("Ownable: caller is not the owner");

    // URIs storage management
    await expect(test_ctx.nft.connect(not_owner_account).setBaseURI(dummy_uri))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).setContractURI(dummy_uri))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).setTokenURI(1, dummy_uri))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).resetTokenURI(1))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).freezeURI())
    // URIs reveal management
    await expect(test_ctx.nft.connect(not_owner_account).setUnrevealedURI(dummy_uri))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).revealAllURIs())
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).revealSingleURI(1))
      .to.be.revertedWithCustomError(test_ctx.nft, "NotTokenOwnerError")
      .withArgs(1);
    await expect(test_ctx.nft.connect(not_owner_account).unrevealSingleURI(1))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).enableURIsRevealing())
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).disableURIsRevealing())
      .to.be.revertedWith("Ownable: caller is not the owner");

    // Maximum tokens per wallet management
    await expect(test_ctx.nft.connect(not_owner_account).setWalletMaxTokens(owner_address, dummy_value))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).setDefaultWalletMaxTokens(dummy_value))
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

    // Royalty management
    await expect(test_ctx.nft.connect(not_owner_account).setDefaultRoyalty(owner_address, dummy_value))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.nft.connect(not_owner_account).deleteDefaultRoyalty())
      .to.be.revertedWith("Ownable: caller is not the owner");
  });
});
