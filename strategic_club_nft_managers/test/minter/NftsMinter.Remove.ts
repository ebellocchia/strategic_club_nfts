import { expect } from "chai";
import { Contract } from "ethers";
// Project
import * as constants from "../common/Constants";
import { Mint, MinterTestContext, initMinterTestContextAndCreate } from "./NftsMinter";


async function testRemove(
  minter: Contract,
  mock_token: Contract
) : Promise<void> {
  const nft_id: number = 0;
  const mint_data_before: Mint = await minter.Mints(mock_token.address, nft_id);

  await expect(await minter.removeMint(
    mock_token.address,
    nft_id
  ))
    .to.emit(minter, "MintRemoved")
    .withArgs(
      mock_token.address,
      nft_id
    );

  const mint_data_after: Mint = await minter.Mints(mock_token.address, nft_id);
  expect(mint_data_after.nftAmount).to.equal(mint_data_after.nftAmount);
  expect(mint_data_after.erc20Contract).to.equal(mint_data_before.erc20Contract);
  expect(mint_data_after.erc20Amount).to.equal(mint_data_before.erc20Amount);
  expect(mint_data_after.isActive).to.equal(false);
}

async function testRemoveNotCreated(
  minter: Contract,
  mock_token: Contract
) : Promise<void> {
  const nft_id: number = 1;

  await expect(minter.removeMint(
    mock_token.address,
    nft_id
  ))
    .to.be.revertedWithCustomError(minter, "MintNotCreatedError")
    .withArgs(
      mock_token.address,
      nft_id
    );
}

describe("NftsMinter.Remove", () => {
  let test_ctx: MinterTestContext;

  beforeEach(async () => {
    test_ctx = await initMinterTestContextAndCreate();
  });

  it("should remove a token to be sold", async () => {
    await testRemove(
      test_ctx.minter,
      test_ctx.mock_erc721
    );
    await testRemove(
      test_ctx.minter,
      test_ctx.mock_erc1155
    );
  });

  it("should revert if removing a token mint_ that is not created", async () => {
    await testRemoveNotCreated(
      test_ctx.minter,
      test_ctx.mock_erc721
    );
    await testRemoveNotCreated(
      test_ctx.minter,
      test_ctx.mock_erc1155
    );
  });

  it("should revert if removing a token mint_ with null addresses", async () => {
    await expect(test_ctx.minter.removeMint(constants.NULL_ADDRESS, 0))
      .to.be.revertedWithCustomError(test_ctx.minter, "NullAddressError");
  });
});
