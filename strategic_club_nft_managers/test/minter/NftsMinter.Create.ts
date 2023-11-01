import { expect } from "chai";
import { Contract } from "ethers";
// Project
import * as constants from "../common/Constants";
import { Mint, MinterTestContext, initMinterTestContextAndToken } from "./NftsMinter";


async function testCreate(
  minter: Contract,
  mock_nft: Contract,
  mock_erc20: Contract
) : Promise<void> {
  const is_erc721: boolean = await mock_nft.supportsInterface(constants.ERC721_INTERFACE_ID);
  const erc20_amount: number = 1;
  const nft_amount: number = is_erc721 ? 0 : constants.ERC1155_TOKEN_AMOUNT;
  const nft_id: number = 0;

  if (is_erc721) {
    await expect(await minter.createERC721Mint(
      mock_nft.address,
      nft_id,
      mock_erc20.address,
      erc20_amount
    ))
      .to.emit(minter, "MintCreated")
      .withArgs(
        mock_nft.address,
        nft_id,
        nft_amount,
        mock_erc20.address,
        erc20_amount
      );
  }
  else {
    await expect(await minter.createERC1155Mint(
      mock_nft.address,
      nft_id,
      nft_amount,
      mock_erc20.address,
      erc20_amount
    ))
      .to.emit(minter, "MintCreated")
      .withArgs(
        mock_nft.address,
        nft_id,
        nft_amount,
        mock_erc20.address,
        erc20_amount
      );

  }

  const mint_data: Mint = await minter.Mints(mock_nft.address, nft_id);
  expect(mint_data.nftAmount).to.equal(nft_amount);
  expect(mint_data.erc20Contract).to.equal(mock_erc20.address);
  expect(mint_data.erc20Amount).to.equal(erc20_amount);
  expect(mint_data.isActive).to.equal(true);

  expect(await minter.isMintActive(mock_nft.address, nft_id))
    .to.equal(true);
}

describe("NftsMinter.Create", () => {
  let test_ctx: MinterTestContext;

  beforeEach(async () => {
    test_ctx = await initMinterTestContextAndToken();
  });

  it("should create a token mint", async () => {
    await testCreate(
      test_ctx.minter,
      test_ctx.mock_erc721,
      test_ctx.mock_erc20
    );
    await testCreate(
      test_ctx.minter,
      test_ctx.mock_erc1155,
      test_ctx.mock_erc20
    );
  });

  it("should revert if creating a ERC721 token mint with null addresses", async () => {
    await expect(test_ctx.minter.createERC721Mint(
      constants.NULL_ADDRESS,
      0,
      test_ctx.mock_erc20.address,
      0
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "NullAddressError");

    await expect(test_ctx.minter.createERC721Mint(
      test_ctx.mock_erc721.address,
      0,
      constants.NULL_ADDRESS,
      1
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "NullAddressError");
  });

  it("should revert if creating a ERC1155 token mint with null addresses", async () => {
    await expect(test_ctx.minter.createERC1155Mint(
      constants.NULL_ADDRESS,
      0,
      1,
      test_ctx.mock_erc20.address,
      1
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "NullAddressError");

    await expect(test_ctx.minter.createERC1155Mint(
      test_ctx.mock_erc1155.address,
      0,
      1,
      constants.NULL_ADDRESS,
      1
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "NullAddressError");
  });

  it("should revert if creating a ERC721 token mint that is already existent", async () => {
    await test_ctx.minter.createERC721Mint(
      test_ctx.mock_erc721.address,
      0,
      test_ctx.mock_erc20.address,
      0
    );
    await expect(test_ctx.minter.createERC721Mint(
      test_ctx.mock_erc721.address,
      0,
      test_ctx.mock_erc20.address,
      0
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "MintAlreadyCreatedError")
      .withArgs(test_ctx.mock_erc721.address, 0);
  });

  it("should revert if creating a ERC1155 token mint that is already existent", async () => {
    await test_ctx.minter.createERC1155Mint(
      test_ctx.mock_erc1155.address,
      0,
      1,
      test_ctx.mock_erc20.address,
      0
    );
    await expect(test_ctx.minter.createERC1155Mint(
      test_ctx.mock_erc1155.address,
      0,
      1,
      test_ctx.mock_erc20.address,
      0
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "MintAlreadyCreatedError")
      .withArgs(test_ctx.mock_erc1155.address, 0);
  });

  it("should revert if creating a ERC721 token mint with an invalid ID", async () => {
    const nft_id: number = constants.ERC721_TOKEN_SUPPLY;

    await expect(test_ctx.minter.createERC721Mint(
      test_ctx.mock_erc721.address,
      nft_id,
      test_ctx.mock_erc20.address,
      0
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "NftError")
      .withArgs(test_ctx.mock_erc721.address, nft_id);
  });

  it("should revert if creating a ERC721 token mint with a token owned by another address", async () => {
    const nft_id: number = constants.ERC721_TOKEN_SUPPLY - 1;

    await expect(test_ctx.minter.createERC721Mint(
      test_ctx.mock_erc721.address,
      nft_id,
      test_ctx.mock_erc20.address,
      0
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "NftError")
      .withArgs(test_ctx.mock_erc721.address, nft_id);
  });

  it("should revert if creating a ERC1155 token mint with an invalid ID", async () => {
    const nft_id: number = constants.ERC1155_TOKEN_SUPPLY;

    await expect(test_ctx.minter.createERC1155Mint(
      test_ctx.mock_erc1155.address,
      nft_id,
      1,
      test_ctx.mock_erc20.address,
      0
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "NftError")
      .withArgs(test_ctx.mock_erc1155.address, nft_id);
  });

  it("should revert if creating a ERC1155 token mint with an invalid amount", async () => {
    await expect(test_ctx.minter.createERC1155Mint(
      test_ctx.mock_erc1155.address,
      0,
      0,
      test_ctx.mock_erc20.address,
      0
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "AmountError");

    await expect(test_ctx.minter.createERC1155Mint(
      test_ctx.mock_erc1155.address,
      0,
      constants.ERC1155_TOKEN_AMOUNT + 1,
      test_ctx.mock_erc20.address,
      0
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "NftError")
      .withArgs(test_ctx.mock_erc1155.address, 0);
  });
});
