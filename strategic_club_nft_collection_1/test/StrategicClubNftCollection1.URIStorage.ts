import { expect } from "chai";
// Project
import * as constants from "./Constants";
import * as utils from "./Utils";


describe("StrategicClubNftCollection1.URIStorage", () => {
  let test_ctx: utils.TestContext;

  beforeEach(async () => {
    test_ctx = await utils.initTestContextAndMint();
  });

  it("should set base URI if not freezed", async () => {
    const new_uri: string = "new_uri/";

    await expect(await test_ctx.nft.setBaseURI(new_uri))
      .to.emit(test_ctx.nft, "UriChanged")
      .withArgs(constants.TOKEN_INITIAL_BASE_URI, new_uri)
      .to.emit(test_ctx.nft, "BatchMetadataUpdate")
      .withArgs(0, constants.UINT256_MAX);

    expect(await test_ctx.nft.baseURI()).to.equal(new_uri);
    expect(await test_ctx.nft.uriFreezed()).to.equal(false);
  });

  it("should set contract URI if not freezed", async () => {
    const new_uri: string = "new_uri/";

    await expect(await test_ctx.nft.setContractURI(new_uri))
      .to.emit(test_ctx.nft, "UriChanged")
      .withArgs(constants.TOKEN_INITIAL_CONTRACT_URI, new_uri);

    expect(await test_ctx.nft.contractURI()).to.be.equal(new_uri);
    expect(await test_ctx.nft.uriFreezed()).to.be.equal(false);
  });

  it("should set and reset token URI if not freezed", async () => {
    const new_uri: string = "new_uri/";
    const token_num: number = 10;

    await test_ctx.nft.enableURIsRevealing();
    await test_ctx.nft.revealAllURIs();

    // Set URIs
    for (let i = 0; i < token_num; i++) {
      const token_id: number = i;
      const token_uri: string = new_uri + token_id.toString();

      if ((i % 2) == 0) {
        continue;
      }

      await expect(await test_ctx.nft.setTokenURI(token_id, token_uri))
        .to.emit(test_ctx.nft, "TokenUriChanged")
        .withArgs(token_id, "", token_uri)
        .to.emit(test_ctx.nft, "MetadataUpdate")
        .withArgs(token_id);
    }

    // Check and reset URIs
    for (let i = 0; i < token_num; i++) {
      const token_id: number = i;
      const token_base_uri: string = constants.TOKEN_INITIAL_BASE_URI + token_id.toString();
      const token_specific_uri: string = new_uri + token_id.toString();

      if ((i % 2) == 0) {
        expect(await test_ctx.nft.tokenURI(token_id)).to.equal(token_base_uri);
      }
      else {
        expect(await test_ctx.nft.tokenURI(token_id)).to.equal(token_specific_uri);

        await expect(await test_ctx.nft.resetTokenURI(token_id))
          .to.emit(test_ctx.nft, "TokenUriChanged")
          .withArgs(token_id, token_specific_uri, "")
          .to.emit(test_ctx.nft, "MetadataUpdate")
          .withArgs(token_id);
      }
    }

    // Last check (all reset)
    for (let i = 0; i < token_num; i++) {
      const token_id: number = i;
      const token_base_uri: string = constants.TOKEN_INITIAL_BASE_URI + token_id.toString();

      expect(await test_ctx.nft.tokenURI(token_id)).to.equal(token_base_uri);
    }
  });

  it("should freeze URIs", async () => {
    await expect(await test_ctx.nft.freezeURI())
      .to.emit(test_ctx.nft, "UriFreezed")
      .withArgs(constants.TOKEN_INITIAL_BASE_URI, constants.TOKEN_INITIAL_CONTRACT_URI);

    expect(await test_ctx.nft.uriFreezed()).to.equal(true);
    expect(await test_ctx.nft.baseURI()).to.equal(constants.TOKEN_INITIAL_BASE_URI);
    expect(await test_ctx.nft.contractURI()).to.equal(constants.TOKEN_INITIAL_CONTRACT_URI);
  });

  it("should revert if setting empty URIs", async () => {
    await expect(test_ctx.nft.setBaseURI(""))
      .to.be.revertedWithCustomError(test_ctx.nft, "UriEmptyError");
    await expect(test_ctx.nft.setContractURI(""))
      .to.be.revertedWithCustomError(test_ctx.nft, "UriEmptyError");
    await expect(test_ctx.nft.setTokenURI(1, ""))
      .to.be.revertedWithCustomError(test_ctx.nft, "UriEmptyError");
    await expect(test_ctx.nft.setUnrevealedURI(""))
      .to.be.revertedWithCustomError(test_ctx.nft, "UriEmptyError");
  });

  it("should revert if freezing URIs when freezed", async () => {
    await test_ctx.nft.freezeURI();
    await expect(test_ctx.nft.freezeURI())
      .to.be.revertedWithCustomError(test_ctx.nft, "UriFreezedError");
  });

  it("should revert if setting URIs when freezed", async () => {
    const new_uri: string = "new_uri/";

    await test_ctx.nft.freezeURI();

    await expect(test_ctx.nft.setBaseURI(new_uri))
      .to.be.revertedWithCustomError(test_ctx.nft, "UriFreezedError");
    await expect(test_ctx.nft.setContractURI(new_uri))
      .to.be.revertedWithCustomError(test_ctx.nft, "UriFreezedError");
    await expect(test_ctx.nft.setTokenURI(1, new_uri))
      .to.be.revertedWithCustomError(test_ctx.nft, "UriFreezedError");
    await expect(test_ctx.nft.resetTokenURI(1))
      .to.be.revertedWithCustomError(test_ctx.nft, "UriFreezedError");
  });
});
