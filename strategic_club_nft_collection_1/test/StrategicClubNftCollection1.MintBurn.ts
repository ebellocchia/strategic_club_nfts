import { expect } from "chai";
// Project
import * as utils from "./Utils";


describe("StrategicClubNftCollection1.MintBurn", () => {
  let test_ctx: utils.TestContext;

  beforeEach(async () => {
    test_ctx = await utils.initTestContext();
  });

  it("should mint tokens", async () => {
    const itr_num: number = 5;

    for (let i = 0; i < itr_num; i++) {
      const target_addr: string = await test_ctx.accounts.signers[i].getAddress();
      const token_id: number = i;

      await expect(await test_ctx.nft.mintTo(target_addr))
        .to.emit(test_ctx.nft, "SingleTokenMinted")
        .withArgs(target_addr, token_id);

      expect(await test_ctx.nft.balanceOf(target_addr)).to.equal(1);
      expect(await test_ctx.nft.ownerOf(token_id)).to.equal(target_addr);
      expect(await test_ctx.nft.totalSupply()).to.equal(token_id + 1);
    }
  });

  it("should batch-mint tokens", async () => {
    const itr_num: number = 5;
    const token_num: number = 3;

    for (let i = 0; i < itr_num; i++) {
      const target_addr: string = await test_ctx.accounts.signers[i].getAddress();

      await expect(await test_ctx.nft.mintBatchTo(target_addr, token_num))
        .to.emit(test_ctx.nft, "MultipleTokensMinted")
        .withArgs(target_addr, i * token_num, token_num);

      expect(await test_ctx.nft.balanceOf(target_addr)).to.equal(token_num);
      expect(await test_ctx.nft.totalSupply()).to.equal(token_num * (i + 1));

      for (let j = 0; j < token_num; j++) {
        const token_id: number = j + (i * token_num);

        expect(await test_ctx.nft.ownerOf(token_id)).to.equal(target_addr);
      }
    }
  });

  it("should airdrop tokens", async () => {
    const receivers: string[] = [
      await test_ctx.accounts.signers[0].getAddress(),
      await test_ctx.accounts.signers[1].getAddress(),
      await test_ctx.accounts.signers[2].getAddress(),
      await test_ctx.accounts.signers[3].getAddress(),
      await test_ctx.accounts.signers[4].getAddress(),
    ];

    await expect(await test_ctx.nft.airdrop(receivers))
      .to.emit(test_ctx.nft, "TokensAirdropped")
      .withArgs(receivers, 0, receivers.length);

    expect(await test_ctx.nft.totalSupply()).to.equal(receivers.length);

    for (let i = 0; i < receivers.length; i++) {
      const target_addr: string = receivers[i];
      const token_id: number = i;

      expect(await test_ctx.nft.balanceOf(target_addr)).to.equal(1);
      expect(await test_ctx.nft.ownerOf(token_id)).to.equal(target_addr);
    }
  });

  it("should burn tokens", async () => {
    const target_addr: string = await test_ctx.accounts.owner.getAddress();
    const token_num: number = 5;

    await test_ctx.nft.mintBatchTo(target_addr, token_num);

    for (let i = 0; i < token_num; i++) {
      const token_id: number = i;

      await expect(await test_ctx.nft.burn(token_id))
        .to.emit(test_ctx.nft, "SingleTokenBurned")
        .withArgs(token_id);

      expect(await test_ctx.nft.balanceOf(target_addr)).to.equal(token_num - i - 1);

      await expect(test_ctx.nft.ownerOf(token_id))
        .to.be.revertedWith("ERC721: invalid token ID");
      await expect(test_ctx.nft.burn(token_id))
        .to.be.revertedWith("ERC721: invalid token ID");
    }
  });

  it("should revert if batch-minting zero tokens", async () => {
    const target_addr: string = await test_ctx.accounts.owner.getAddress();

    await expect(test_ctx.nft.mintBatchTo(target_addr, 0))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensMintError");
  });

  it("should revert if airdropping tokens to zero receivers", async () => {
    await expect(test_ctx.nft.airdrop([]))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensAirdropError");
  });
});
