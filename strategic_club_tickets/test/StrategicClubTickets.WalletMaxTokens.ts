import { expect } from "chai";
// Project
import * as constants from "./Constants";
import * as utils from "./Utils";


describe("StrategicClubTickets.WalletMaxTokens", () => {
  let test_ctx: utils.TestContext;

  beforeEach(async () => {
    test_ctx = await utils.initTestContextAndMint();
  });

  it("should set the maximum number of tokens for a wallet", async () => {
    const new_wallet_max_tokens: number = 2;
    const target_addr: string = await test_ctx.accounts.signers[0].getAddress();
    const token_num: number = 5;

    for (let i = 0; i < token_num; i++) {
      const token_id: number = i;

      expect((await test_ctx.nft.walletsMaxTokens(target_addr, token_id)).maxTokens).to.equal(0);
      expect((await test_ctx.nft.walletsMaxTokens(target_addr, token_id)).isSet).to.equal(false);

      // Set wallet maximum number of tokens
      await expect(await test_ctx.nft.setWalletMaxTokens(target_addr, token_id, new_wallet_max_tokens))
        .to.emit(test_ctx.nft, "WalletMaxTokensChanged")
        .withArgs(target_addr, token_id, 0, new_wallet_max_tokens);

      expect((await test_ctx.nft.walletsMaxTokens(target_addr, token_id)).maxTokens).to.equal(new_wallet_max_tokens);
      expect((await test_ctx.nft.walletsMaxTokens(target_addr, token_id)).isSet).to.equal(true);
    }
  });

  it("should set a default wallet maximum number of tokens", async () => {
    const new_def_wallet_max_tokens: number = 2;
    const token_num: number = 5;

    for (let i = 0; i < token_num; i++) {
      const token_id: number = i + 1;

      await expect(await test_ctx.nft.setDefaultWalletMaxTokens(token_id, new_def_wallet_max_tokens))
        .to.emit(test_ctx.nft, "DefaultMaxTokensChanged")
        .withArgs(token_id, 0, new_def_wallet_max_tokens);

      expect((await test_ctx.nft.defaultWalletMaxTokens(token_id)).maxTokens).to.equal(new_def_wallet_max_tokens);
      expect((await test_ctx.nft.defaultWalletMaxTokens(token_id)).isSet).to.equal(true);
    }
  });

  it("should revert if wallet number of tokens is exceeded", async () => {
    const new_wallet_max_tokens: number = 2;
    const owner_address: string = await test_ctx.accounts.owner.getAddress();
    const target_addr: string = await test_ctx.accounts.signers[0].getAddress();
    const token_id: number = 0;

    await test_ctx.nft.setWalletMaxTokens(target_addr, token_id, new_wallet_max_tokens);

    await expect(test_ctx.nft.safeTransferFrom(
      owner_address, 
      target_addr, 
      token_id, 
      new_wallet_max_tokens, 
      constants.EMPTY_BYTES
    ))
      .not.to.be.reverted;

    await expect(test_ctx.nft.safeTransferFrom(
      owner_address, 
      target_addr, 
      token_id, 
      1, 
      constants.EMPTY_BYTES
    ))
      .to.be.revertedWithCustomError(test_ctx.nft, "WalletMaxTokensReachedError")
      .withArgs(new_wallet_max_tokens);

    // Token ID not in mapping
    await expect(test_ctx.nft.safeTransferFrom(
      owner_address, 
      target_addr, 
      token_id + 1, 
      new_wallet_max_tokens + 1, 
      constants.EMPTY_BYTES
    ))
      .not.to.be.reverted;
  });

  it("should revert if default wallet number of tokens is exceeded", async () => {
    const new_def_wallet_max_tokens: number = 3;
    const owner_address: string = await test_ctx.accounts.owner.getAddress();
    const target_addr: string = await test_ctx.accounts.signers[0].getAddress();
    const token_id: number = 0;

    await test_ctx.nft.setDefaultWalletMaxTokens(token_id, new_def_wallet_max_tokens);

    await expect(test_ctx.nft.safeTransferFrom(
      owner_address, 
      target_addr, 
      token_id, 
      new_def_wallet_max_tokens, 
      constants.EMPTY_BYTES
    ))
      .not.to.be.reverted;

    await expect(test_ctx.nft.safeTransferFrom(
      owner_address, 
      target_addr,
      token_id, 
      1, 
      constants.EMPTY_BYTES
    ))
      .to.be.revertedWithCustomError(test_ctx.nft, "DefaultWalletMaxTokensReachedError")
      .withArgs(new_def_wallet_max_tokens);

    // Token ID not in mapping
    await expect(test_ctx.nft.safeTransferFrom(
      owner_address, 
      target_addr,
      token_id + 1,
      new_def_wallet_max_tokens + 1,
      constants.EMPTY_BYTES
    ))
      .not.to.be.reverted;
  });
});
