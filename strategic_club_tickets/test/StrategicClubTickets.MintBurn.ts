import { expect } from "chai";
// Project
import * as utils from "./Utils";


describe("StrategicClubTickets.MintBurn", () => {
  let test_ctx: utils.TestContext;

  beforeEach(async () => {
    test_ctx = await utils.initTestContext();
  });

  it("should mint tokens", async () => {
    const itr_num: number = 5;

    for (let i = 0; i < itr_num; i++) {
      const target_addr: string = await test_ctx.accounts.signers[i].getAddress();
      const token_id: number = i;
      const token_amount: number = (token_id + 1) * 10;

      await expect(await test_ctx.nft.mintTo(target_addr, token_amount))
        .to.emit(test_ctx.nft, "SingleTokenMinted")
        .withArgs(target_addr, token_id, token_amount);

      expect(await test_ctx.nft.balanceOf(target_addr, token_id)).to.equal(token_amount);
      expect(await test_ctx.nft.totalSupply()).to.equal(token_id + 1);
    }
  });

  it("should mint tokens by ID", async () => {
    const itr_num: number = 5;
    const target_addr: string = await test_ctx.accounts.owner.getAddress();
    const initial_token_amount: number = 10;
    const token_id: number = 0;

    await test_ctx.nft.mintTo(target_addr, initial_token_amount);

    let total_token_amount: number = initial_token_amount;
    for (let i = 0; i < itr_num; i++) {
      const token_amount: number = (i + 1) * 5;
      total_token_amount += token_amount;

      await expect(await test_ctx.nft.mintToById(target_addr, token_id, token_amount))
        .to.emit(test_ctx.nft, "SingleTokenMinted")
        .withArgs(target_addr, token_id, token_amount);

      expect(await test_ctx.nft.balanceOf(target_addr, token_id)).to.equal(total_token_amount);
    }
  });

  it("should batch-mint tokens", async () => {
    const itr_num: number = 5;

    for (let i = 0; i < itr_num; i++) {
      const target_addr: string = await test_ctx.accounts.signers[i].getAddress();
      const token_amounts: number[] = [(i + 1) * 10, (i + 1) * 20, (i + 1) * 30];
      const token_num: number = token_amounts.length;
      const token_ids: number[] = [i * token_num, (i * token_num) + 1, (i * token_num) + 2];

      await expect(await test_ctx.nft.mintBatchTo(target_addr, token_amounts))
        .to.emit(test_ctx.nft, "MultipleTokensMinted")
        .withArgs(target_addr, i * token_num, token_num, token_amounts);

      for (let j = 0; j < token_num; j++) {
        expect(await test_ctx.nft.balanceOf(target_addr, token_ids[j])).to.equal(token_amounts[j]);
      }
      expect(await test_ctx.nft.totalSupply()).to.equal(token_num * (i + 1));
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
    const token_num: number = 3;

    for (let i = 0; i < token_num; i++) {
      const token_id: number = i;

      await expect(await test_ctx.nft.airdropSingle(receivers))
        .to.emit(test_ctx.nft, "TokensAirdropped")
        .withArgs(receivers, token_id, receivers.length);

      expect(await test_ctx.nft.totalSupply()).to.equal(i + 1);

      for (let j = 0; j < receivers.length; j++) {
        const target_addr: string = receivers[j];

        expect(await test_ctx.nft.balanceOf(target_addr, token_id)).to.equal(1);
      }
    }
  });

  it("should airdrop tokens by ID", async () => {
    const receivers: string[] = [
      await test_ctx.accounts.signers[0].getAddress(),
      await test_ctx.accounts.signers[1].getAddress(),
      await test_ctx.accounts.signers[2].getAddress(),
      await test_ctx.accounts.signers[3].getAddress(),
      await test_ctx.accounts.signers[4].getAddress(),
    ];
    const target_addr: string = await test_ctx.accounts.owner.getAddress();
    const initial_token_amount: number = 10;
    const token_id: number = 0;
  
    await test_ctx.nft.mintTo(target_addr, initial_token_amount);

    await expect(await test_ctx.nft.airdropSingleById(receivers, token_id))
      .to.emit(test_ctx.nft, "TokensAirdropped")
      .withArgs(receivers, token_id, receivers.length);

    expect(await test_ctx.nft.totalSupply()).to.equal(1);

    for (let j = 0; j < receivers.length; j++) {
      const target_addr: string = receivers[j];

      expect(await test_ctx.nft.balanceOf(target_addr, token_id)).to.equal(1);
    }
  });

  it("should burn tokens", async () => {
    const target_addr: string = await test_ctx.accounts.owner.getAddress();
    const token_num: number = 5;

    const token_amounts: number[] = [];
    const token_burned_amounts: number[] = [];

    for (let i = 0; i < token_num; i++) {
      token_amounts.push((i + 1) * 10);
      token_burned_amounts.push((i + 1) * 5);
    }

    await test_ctx.nft.mintBatchTo(target_addr, token_amounts);

    for (let i = 0; i < token_num; i++) {
      const token_id: number = i;

      await expect(await test_ctx.nft.burn(target_addr, token_id, token_burned_amounts[i]))
        .to.emit(test_ctx.nft, "SingleTokenBurned")
        .withArgs(target_addr, token_id, token_burned_amounts[i]);

      expect(await test_ctx.nft.balanceOf(target_addr, token_id)).to.equal(token_amounts[i] - token_burned_amounts[i]);

      await expect(test_ctx.nft.burn(target_addr, token_id, (await test_ctx.nft.balanceOf(target_addr, token_id)) + 1))
        .to.be.revertedWith("ERC1155: burn amount exceeds balance");
    }
  });

  it("should batch-burn tokens", async () => {
    const target_addr: string = await test_ctx.accounts.owner.getAddress();
    const token_num: number = 5;

    const token_amounts: number[] = [];
    const token_burned_amounts: number[] = [];
    const token_burned_ids: number[] = [];

    for (let i = 0; i < token_num; i++) {
      token_amounts.push((i + 1) * 10);
      token_burned_amounts.push((i + 1) * 5);
      token_burned_ids.push(i);
    }

    await test_ctx.nft.mintBatchTo(target_addr, token_amounts);

    await expect(await test_ctx.nft.burnBatch(target_addr, token_burned_ids, token_burned_amounts))
      .to.emit(test_ctx.nft, "MultipleTokensBurned")
      .withArgs(target_addr, token_burned_ids, token_burned_amounts);

    for (let i = 0; i < token_num; i++) {
      const token_id: number = i;

      expect(await test_ctx.nft.balanceOf(target_addr, token_id)).to.equal(token_amounts[i] - token_burned_amounts[i]);

      await expect(test_ctx.nft.burn(target_addr, token_id, (await test_ctx.nft.balanceOf(target_addr, token_id)) + 1))
        .to.be.revertedWith("ERC1155: burn amount exceeds balance");
    }
  });

  it("should revert if minting by ID a not existent token", async () => {
    const target_addr: string = await test_ctx.accounts.owner.getAddress();
    const token_amounts: number[] = [1, 1, 1];

    await expect(test_ctx.nft.mintToById(target_addr, 1, 1))
      .to.be.revertedWithCustomError(test_ctx.nft, "NotExistentTokenMintError")
      .withArgs(1);

    await test_ctx.nft.mintBatchTo(target_addr, token_amounts);

    await expect(test_ctx.nft.mintToById(target_addr, token_amounts.length, 1))
      .not.to.be.reverted;

    await expect(test_ctx.nft.mintToById(target_addr, token_amounts.length + 1, 1))
      .to.be.revertedWithCustomError(test_ctx.nft, "NotExistentTokenMintError")
      .withArgs(token_amounts.length + 1);
  });

  it("should revert if minting zero tokens", async () => {
    const owner_address: string = await test_ctx.accounts.owner.getAddress();

    await expect(test_ctx.nft.mintTo(owner_address, 0))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensMintError");
    await expect(test_ctx.nft.mintToById(owner_address, 1, 0))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensMintError");
    await expect(test_ctx.nft.mintBatchTo(owner_address, [0, 5, 5]))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensMintError");
    await expect(test_ctx.nft.mintBatchTo(owner_address, [5, 5, 0]))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensMintError");
    await expect(test_ctx.nft.mintBatchTo(owner_address, [5, 0, 5]))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensMintError");
  });

  it("should revert if airdropping by ID a not existent token", async () => {
    const target_addr: string[] = [await test_ctx.accounts.owner.getAddress()];
    const token_amounts: number[] = [1, 1, 1];

    await expect(test_ctx.nft.airdropSingleById(target_addr, 1))
      .to.be.revertedWithCustomError(test_ctx.nft, "NotExistentTokenMintError")
      .withArgs(1);

    await test_ctx.nft.mintBatchTo(target_addr[0], token_amounts);

    await expect(test_ctx.nft.airdropSingleById(target_addr, token_amounts.length))
      .not.to.be.reverted;

    await expect(test_ctx.nft.airdropSingleById(target_addr, token_amounts.length + 1))
      .to.be.revertedWithCustomError(test_ctx.nft, "NotExistentTokenMintError")
      .withArgs(token_amounts.length + 1);
  });

  it("should revert if airdropping tokens to zero receivers", async () => {    
    await expect(test_ctx.nft.airdropSingle([]))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensAirdropError");
    await expect(test_ctx.nft.airdropSingleById([], 0))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensAirdropError");
  });

  it("should revert if burning zero tokens", async () => {
    const owner_address: string = await test_ctx.accounts.owner.getAddress();

    await expect(test_ctx.nft.burn(owner_address, 1, 0))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensBurnError");
    await expect(test_ctx.nft.burnBatch(owner_address, [1, 2, 3], [0, 5, 5]))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensBurnError");
    await expect(test_ctx.nft.burnBatch(owner_address, [1, 2, 3], [5, 5, 0]))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensBurnError");
    await expect(test_ctx.nft.burnBatch(owner_address, [1, 2, 3], [5, 0, 5]))
      .to.be.revertedWithCustomError(test_ctx.nft, "ZeroTokensBurnError");
  });
});
