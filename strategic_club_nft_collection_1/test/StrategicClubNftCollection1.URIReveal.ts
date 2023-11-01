import { expect } from "chai";
// Project
import * as constants from "./Constants";
import * as utils from "./Utils";


describe("StrategicClubNftCollection1.URIReveal", () => {
  let test_ctx: utils.TestContext;

  beforeEach(async () => {
    test_ctx = await utils.initTestContextAndMint();
  });

  it("should have unrevealed URI if not revealed", async () => {
    const max_supply: number = await test_ctx.nft.maxSupply();

    for (let i = 0; i < max_supply; i++) {
      const token_id: number = i;
      expect(await test_ctx.nft.tokenURI(token_id)).to.equal(constants.TOKEN_INITIAL_UNREVEALED_URI);
    }
  });

  it("should set unrevealed URI if not revealed", async () => {
    const new_uri: string = "new_uri/";

    await expect(await test_ctx.nft.setUnrevealedURI(new_uri))
      .to.emit(test_ctx.nft, "UriChanged")
      .withArgs(constants.TOKEN_INITIAL_UNREVEALED_URI, new_uri)
      .to.emit(test_ctx.nft, "BatchMetadataUpdate")
      .withArgs(0, constants.UINT256_MAX);

    expect(await test_ctx.nft.unrevealedURI()).to.equal(new_uri);
    expect(await test_ctx.nft.allURIsRevealed()).to.equal(false);
  });

  it("should enable URI revealing", async () => {
    expect(await test_ctx.nft.revealingURIsEnabled()).to.equal(false);

    await expect(await test_ctx.nft.enableURIsRevealing())
      .to.emit(test_ctx.nft, "URIsRevealingEnabled");

    expect(await test_ctx.nft.revealingURIsEnabled()).to.equal(true);
  });

  it("should diseable URI revealing", async () => {
    await test_ctx.nft.enableURIsRevealing();

    await expect(await test_ctx.nft.disableURIsRevealing())
      .to.emit(test_ctx.nft, "URIsRevealingDisabled");

    expect(await test_ctx.nft.revealingURIsEnabled()).to.equal(false);
  });

  it("should reveal a single URI", async () => {
    const max_supply: number = await test_ctx.nft.maxSupply();

    await test_ctx.nft.enableURIsRevealing();

    // Reveal one by one
    for (let i = 0; i < max_supply; i++) {
      const token_id: number = i;
      const token_uri: string = constants.TOKEN_INITIAL_BASE_URI + token_id.toString();

      expect(await test_ctx.nft.tokenURI(token_id)).to.equal(constants.TOKEN_INITIAL_UNREVEALED_URI);

      await expect(await test_ctx.nft.revealSingleURI(token_id))
        .to.emit(test_ctx.nft, "SingleURIRevealed")
        .withArgs(token_id)
        .to.emit(test_ctx.nft, "MetadataUpdate")
        .withArgs(token_id);

      expect(await test_ctx.nft.tokenURI(token_id)).to.equal(token_uri);
    }
  });

  it("should unreveal a single URI", async () => {
    const token_id: number = 0;

    await test_ctx.nft.enableURIsRevealing();
    await test_ctx.nft.revealSingleURI(token_id);

    await expect(await test_ctx.nft.unrevealSingleURI(token_id))
      .to.emit(test_ctx.nft, "SingleURIUnrevealed")
      .withArgs(token_id)
      .to.emit(test_ctx.nft, "MetadataUpdate")
      .withArgs(token_id);

    expect(await test_ctx.nft.tokenURI(token_id)).to.equal(constants.TOKEN_INITIAL_UNREVEALED_URI);
  });

  it("should have revealed URIs if all revealed", async () => {
    const max_supply: number = await test_ctx.nft.maxSupply();

    await test_ctx.nft.enableURIsRevealing();
    await expect(await test_ctx.nft.revealAllURIs())
      .to.emit(test_ctx.nft, "AllURIsRevealed")
      .to.emit(test_ctx.nft, "BatchMetadataUpdate")
      .withArgs(0, constants.UINT256_MAX);
    expect(await test_ctx.nft.allURIsRevealed()).to.equal(true);

    // All shall be revealed
    for (let i = 0; i < max_supply; i++) {
      const token_id: number = i;
      const token_uri: string = constants.TOKEN_INITIAL_BASE_URI + token_id.toString();

      expect(await test_ctx.nft.tokenURI(token_id)).to.equal(token_uri);
    }
  });

  it("should revert if enabling URIs revealing when already enabled", async () => {
    await test_ctx.nft.enableURIsRevealing();

    await expect(test_ctx.nft.enableURIsRevealing())
      .to.be.revertedWithCustomError(test_ctx.nft, "URIsRevealingEnabledError");
  });

  it("should revert if enabling URIs revealing when all revealed", async () => {
    await test_ctx.nft.enableURIsRevealing();
    await test_ctx.nft.revealAllURIs();

    await expect(test_ctx.nft.enableURIsRevealing())
      .to.be.revertedWithCustomError(test_ctx.nft, "AllURIsRevealedError");
  });

  it("should revert if disabling URIs revealing when already disabled", async () => {
    await expect(test_ctx.nft.disableURIsRevealing())
      .to.be.revertedWithCustomError(test_ctx.nft, "URIsRevealingEnabledError");

    await test_ctx.nft.enableURIsRevealing();
    await test_ctx.nft.disableURIsRevealing();

    await expect(test_ctx.nft.disableURIsRevealing())
      .to.be.revertedWithCustomError(test_ctx.nft, "URIsRevealingEnabledError");
  });

  it("should revert if disabling URIs revealing when all revealed", async () => {
    await test_ctx.nft.enableURIsRevealing();
    await test_ctx.nft.revealAllURIs();

    await expect(test_ctx.nft.disableURIsRevealing())
      .to.be.revertedWithCustomError(test_ctx.nft, "AllURIsRevealedError");
  });

  it("should revert if revealing URIs when revealing is disabled", async () => {
    await expect(test_ctx.nft.revealSingleURI(1))
      .to.be.revertedWithCustomError(test_ctx.nft, "URIsRevealingEnabledError");
    await expect(test_ctx.nft.revealAllURIs())
      .to.be.revertedWithCustomError(test_ctx.nft, "URIsRevealingEnabledError");
  });

  it("should revert if revealing single URI when already revealed", async () => {
    await test_ctx.nft.enableURIsRevealing();

    await test_ctx.nft.revealSingleURI(1);
    await expect(test_ctx.nft.revealSingleURI(1))
      .to.be.revertedWithCustomError(test_ctx.nft, "SingleURIRevealedError")
      .withArgs(1);
  });

  it("should revert if unrevealing single URI when already unrevealed", async () => {
    await test_ctx.nft.enableURIsRevealing();

    await expect(test_ctx.nft.unrevealSingleURI(1))
      .to.be.revertedWithCustomError(test_ctx.nft, "SingleURIRevealedError")
      .withArgs(1);
  });

  it("should revert if revealing single URI when all revealed", async () => {
    await test_ctx.nft.enableURIsRevealing();

    await test_ctx.nft.revealSingleURI(1);
    await test_ctx.nft.revealAllURIs();

    await expect(test_ctx.nft.revealSingleURI(1))
      .to.be.revertedWithCustomError(test_ctx.nft, "AllURIsRevealedError");
  });

  it("should revert if unrevealing single URI when all revealed", async () => {
    await test_ctx.nft.enableURIsRevealing();

    await test_ctx.nft.revealAllURIs();

    await expect(test_ctx.nft.unrevealSingleURI(1))
      .to.be.revertedWithCustomError(test_ctx.nft, "AllURIsRevealedError");
  });

  it("should revert if revealing all URIs when all revealed", async () => {
    await test_ctx.nft.enableURIsRevealing();
    await test_ctx.nft.revealAllURIs();

    await expect(test_ctx.nft.revealAllURIs())
      .to.be.revertedWithCustomError(test_ctx.nft, "AllURIsRevealedError");
  });

  it("should revert if setting unrevealed URI when all revealed", async () => {
    const new_uri: string = "new_uri/";

    await test_ctx.nft.enableURIsRevealing();
    await test_ctx.nft.revealAllURIs();

    await expect(test_ctx.nft.setUnrevealedURI(new_uri))
      .to.be.revertedWithCustomError(test_ctx.nft, "AllURIsRevealedError");
  });
});
