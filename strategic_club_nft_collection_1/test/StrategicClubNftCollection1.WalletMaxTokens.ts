import { expect } from "chai";
// Project
import * as constants from "./Constants";
import * as utils from "./Utils";


describe("StrategicClubNftCollection1.WalletMaxTokens", () => {
  const SAFE_TRANSFER_FROM: string = "safeTransferFrom(address,address,uint256)";

  let test_ctx: utils.TestContext;

  beforeEach(async () => {
    test_ctx = await utils.initTestContextAndMint();
  });


  it("should set the maximum number of tokens for a wallet", async () => {
    const new_wallet_max_tokens: number = 2;
    const target_addr: string = await test_ctx.accounts.signers[0].getAddress();

    expect((await test_ctx.nft.walletsMaxTokens(target_addr)).maxTokens).to.equal(0);
    expect((await test_ctx.nft.walletsMaxTokens(target_addr)).isSet).to.equal(false);

    // Set wallet maximum number of tokens
    await expect(await test_ctx.nft.setWalletMaxTokens(target_addr, new_wallet_max_tokens))
      .to.emit(test_ctx.nft, "WalletMaxTokensChanged")
      .withArgs(target_addr, 0, new_wallet_max_tokens);

    expect((await test_ctx.nft.walletsMaxTokens(target_addr)).maxTokens).to.equal(new_wallet_max_tokens);
    expect((await test_ctx.nft.walletsMaxTokens(target_addr)).isSet).to.equal(true);
  });

  it("should set a default wallet maximum number of tokens", async () => {
    const new_def_wallet_max_tokens: number = 2;

    await expect(await test_ctx.nft.setDefaultWalletMaxTokens(new_def_wallet_max_tokens))
      .to.emit(test_ctx.nft, "DefaultMaxTokensChanged")
      .withArgs(constants.TOKEN_DEF_WALLET_MAX_TOKENS, new_def_wallet_max_tokens);

    expect(await test_ctx.nft.defaultWalletMaxTokens()).to.equal(new_def_wallet_max_tokens);
  });

  it("should revert if wallet number of tokens is exceeded", async () => {
    const new_wallet_max_tokens: number = 2;
    const new_def_wallet_max_tokens: number = 3;
    const owner_address: string = await test_ctx.accounts.owner.getAddress();
    const target_addr_1: string = await test_ctx.accounts.signers[0].getAddress();
    const target_addr_2: string = await test_ctx.accounts.signers[1].getAddress();

    await test_ctx.nft.setWalletMaxTokens(target_addr_1, new_wallet_max_tokens);
    await test_ctx.nft.setDefaultWalletMaxTokens(new_def_wallet_max_tokens);

    // Test wallet maximum number of tokens (wallet in mapping)
    for (let i = 0; i < new_wallet_max_tokens; i++) {
      test_ctx.nft[SAFE_TRANSFER_FROM](owner_address, target_addr_1, i + 1);
    }
    await expect(test_ctx.nft[SAFE_TRANSFER_FROM](owner_address, target_addr_1, new_wallet_max_tokens + 1))
      .to.be.revertedWithCustomError(test_ctx.nft, "WalletMaxTokensReachedError")
      .withArgs(new_wallet_max_tokens);

    // Test default wallet maximum number of tokens (wallet not in mapping)
    for (let i = 0; i < new_def_wallet_max_tokens; i++) {
      test_ctx.nft[SAFE_TRANSFER_FROM](
        owner_address,
        target_addr_2,
        new_wallet_max_tokens + i + 1
      );
    }
    await expect(
      test_ctx.nft[SAFE_TRANSFER_FROM](
        owner_address,
        target_addr_2,
        new_def_wallet_max_tokens + new_def_wallet_max_tokens + 1
      )
    )
      .to.be.revertedWithCustomError(test_ctx.nft, "DefaultWalletMaxTokensReachedError")
      .withArgs(new_def_wallet_max_tokens);
  });
});
