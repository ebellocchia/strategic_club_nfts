import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
// Project
import * as constants from "../common/Constants";
import { getMockERC20TokenContractAt } from "../common/UtilsCommon";
import { Mint, MinterTestContext, initMinterTestContextAndCreate } from "./NftsMinter";


describe("NftsMinter.Mint", () => {
  let test_ctx: MinterTestContext;

  beforeEach(async () => {
    test_ctx = await initMinterTestContextAndCreate();
  });

  it("should allow a user to mint a created ERC721 token", async () => {
    const telegram_id: number = 1;
    const nft_id: number = 0;
    const owner_address: string = await test_ctx.accounts.owner.getAddress();
    const initial_owner_balance: BigNumber = await test_ctx.mock_erc20.balanceOf(owner_address);
    const initial_user_balance: BigNumber = await test_ctx.mock_erc20.balanceOf(test_ctx.user_1_address);
    const mint_data_before: Mint = await test_ctx.minter.Mints(test_ctx.mock_erc721.address, nft_id);

    expect(await test_ctx.minter.isMintActive(test_ctx.mock_erc721.address, nft_id))
      .to.equal(true);

    await expect(await test_ctx.minter.connect(test_ctx.user_1_account).mintERC721(
      telegram_id,
      test_ctx.mock_erc721.address,
      nft_id
    ))
      .to.emit(test_ctx.minter, "TelegramIdFlagSet")
      .withArgs(
        telegram_id,
        test_ctx.mock_erc721.address,
        constants.UINT256_MAX
      )
      .to.emit(test_ctx.minter, "MintCompleted")
      .withArgs(
        telegram_id,
        test_ctx.user_1_address,
        test_ctx.mock_erc721.address,
        nft_id,
        0,
        mint_data_before.erc20Contract,
        mint_data_before.erc20Amount
      );


    // Check data
    const mint_data_after: Mint = await test_ctx.minter.Mints(test_ctx.mock_erc721.address, nft_id);
    expect(mint_data_after.nftAmount).to.equal(mint_data_before.nftAmount);
    expect(mint_data_after.erc20Contract).to.equal(mint_data_before.erc20Contract);
    expect(mint_data_after.erc20Amount).to.equal(mint_data_before.erc20Amount);
    expect(mint_data_after.isActive).to.equal(false);

    // Check state
    expect(await (test_ctx.minter.TelegramIdFlags(telegram_id, test_ctx.mock_erc721.address, constants.UINT256_MAX)))
      .to.equal(true);
    expect(await test_ctx.minter.isMintActive(test_ctx.mock_erc721.address, nft_id))
      .to.equal(false);

    // Check token transfers
    const mock_erc20: Contract = await getMockERC20TokenContractAt(mint_data_before.erc20Contract);

    expect(await mock_erc20.balanceOf(owner_address))
      .to.equal(initial_owner_balance.add(mint_data_before.erc20Amount));
    expect(await mock_erc20.balanceOf(test_ctx.user_1_address))
      .to.equal(initial_user_balance.sub(mint_data_before.erc20Amount));
    expect(await test_ctx.mock_erc721.ownerOf(nft_id))
      .to.equal(test_ctx.user_1_address);
  });

  it("should allow a user to mint a created ERC1155 token", async () => {
    const telegram_id_1: number = 1;
    const telegram_id_2: number = 2;
    const nft_amount_bought: number = constants.ERC1155_TOKEN_AMOUNT - 2;
    const nft_id: number = 0;
    const owner_address: string = await test_ctx.accounts.owner.getAddress();
    const initial_owner_balance: BigNumber = await test_ctx.mock_erc20.balanceOf(owner_address);
    const initial_user_balance: BigNumber = await test_ctx.mock_erc20.balanceOf(test_ctx.user_1_address);
    const mint_data_before: Mint = await test_ctx.minter.Mints(test_ctx.mock_erc1155.address, nft_id);

    expect(await test_ctx.minter.isMintActive(test_ctx.mock_erc1155.address, nft_id))
      .to.equal(true);

    await expect(await test_ctx.minter.connect(test_ctx.user_1_account).mintERC1155(
      telegram_id_1,
      test_ctx.mock_erc1155.address,
      nft_id,
      nft_amount_bought
    ))
      .to.emit(test_ctx.minter, "TelegramIdFlagSet")
      .withArgs(
        telegram_id_1,
        test_ctx.mock_erc1155.address,
        nft_id
      )
      .to.emit(test_ctx.minter, "MintCompleted")
      .withArgs(
        telegram_id_1,
        test_ctx.user_1_address,
        test_ctx.mock_erc1155.address,
        nft_id,
        nft_amount_bought,
        mint_data_before.erc20Contract,
        mint_data_before.erc20Amount
      );

    const token_price_1: BigNumber = mint_data_before.erc20Amount.mul(nft_amount_bought);
    const mock_erc20: Contract = await getMockERC20TokenContractAt(mint_data_before.erc20Contract);

    // Check data, mint is still active because the bought token amount is less than the sold one
    const mint_data_after_1: Mint = await test_ctx.minter.Mints(test_ctx.mock_erc1155.address, nft_id);
    expect(mint_data_after_1.nftAmount).to.equal(mint_data_before.nftAmount.sub(nft_amount_bought));
    expect(mint_data_after_1.erc20Contract).to.equal(mint_data_before.erc20Contract);
    expect(mint_data_after_1.erc20Amount).to.equal(mint_data_before.erc20Amount);
    expect(mint_data_after_1.isActive).to.equal(true);

    // Check state
    expect(await (test_ctx.minter.TelegramIdFlags(telegram_id_1, test_ctx.mock_erc1155.address, nft_id)))
      .to.equal(true);
    expect(await test_ctx.minter.isMintActive(test_ctx.mock_erc1155.address, nft_id))
      .to.equal(true);

    // Check token transfers
    expect(await mock_erc20.balanceOf(owner_address))
      .to.equal(initial_owner_balance.add(token_price_1));
    expect(await mock_erc20.balanceOf(test_ctx.user_1_address))
      .to.equal(initial_user_balance.sub(token_price_1));
    expect(await test_ctx.mock_erc1155.balanceOf(test_ctx.user_1_address, nft_id))
      .to.equal(nft_amount_bought);

    // Compute remaining amounts
    const nft_amount_remaining: number = constants.ERC1155_TOKEN_AMOUNT - nft_amount_bought;
    const token_price_2: BigNumber = mint_data_after_1.erc20Amount.mul(nft_amount_remaining);

    // Mint again the remaining amount to reset the mint
    await test_ctx.minter.connect(test_ctx.user_1_account).mintERC1155(
      telegram_id_2,
      test_ctx.mock_erc1155.address,
      nft_id,
      nft_amount_remaining
    );

    // Check data, mint is now inactive because the total token amount was bought
    const mint_data_after_2: Mint = await test_ctx.minter.Mints(test_ctx.mock_erc1155.address, nft_id);
    expect(mint_data_after_2.nftAmount).to.equal(0);
    expect(mint_data_after_2.erc20Contract).to.equal(mint_data_before.erc20Contract);
    expect(mint_data_after_2.erc20Amount).to.equal(mint_data_before.erc20Amount);
    expect(mint_data_after_2.isActive).to.equal(false);

    // Check state
    expect(await test_ctx.minter.isMintActive(test_ctx.mock_erc1155.address, nft_id))
      .to.equal(false);

    // Check token transfers
    expect(await mock_erc20.balanceOf(owner_address))
      .to.equal(initial_owner_balance.add(token_price_1).add(token_price_2));
    expect(await mock_erc20.balanceOf(test_ctx.user_1_address))
      .to.equal(initial_user_balance.sub(token_price_1).sub(token_price_2));
    expect(await test_ctx.mock_erc1155.balanceOf(test_ctx.user_1_address, nft_id))
      .to.equal(nft_amount_bought + nft_amount_remaining);
  });

  it("should revert if minting a token with not enough balance", async () => {
    await expect(test_ctx.minter.connect(test_ctx.user_3_account).mintERC721(
      1,
      test_ctx.mock_erc721.address,
      0
    ))
      .to.be.revertedWith("ERC20: transfer amount exceeds balance");

    await expect(test_ctx.minter.connect(test_ctx.user_3_account).mintERC1155(
      1,
      test_ctx.mock_erc1155.address,
      0,
      1
    ))
      .to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("should revert if minting a ERC1155 token with invalid amount", async () => {
    const nft_id: number = 0;
    const mint_data: Mint = await test_ctx.minter.Mints(test_ctx.mock_erc1155.address, nft_id);

    await expect(test_ctx.minter.connect(test_ctx.user_1_account).mintERC1155(
      1,
      test_ctx.mock_erc1155.address,
      nft_id,
      mint_data.nftAmount.add(1)
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "AmountError");
  });

  it("should revert if minting a token with null address", async () => {
    await expect(test_ctx.minter.connect(test_ctx.user_1_account).mintERC721(
      1,
      constants.NULL_ADDRESS,
      0
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "NullAddressError");

    await expect(test_ctx.minter.connect(test_ctx.user_1_account).mintERC1155(
      1,
      constants.NULL_ADDRESS,
      0,
      1
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "NullAddressError");
  });

  it("should revert if minting a token whose mint that is not created", async () => {
    const nft_id: number = 1;

    await expect(test_ctx.minter.connect(test_ctx.user_1_account).mintERC721(
      1,
      test_ctx.mock_erc721.address,
      nft_id
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "MintNotCreatedError")
      .withArgs(
        test_ctx.mock_erc721.address,
        nft_id
      );

    await expect(test_ctx.minter.connect(test_ctx.user_1_account).mintERC1155(
      1,
      test_ctx.mock_erc1155.address,
      nft_id,
      1
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "MintNotCreatedError")
      .withArgs(
        test_ctx.mock_erc1155.address,
        nft_id
      );
  });

  it("should revert if minting a ERC721 token more than once with the same Telegram ID", async () => {
    const telegram_id: number = 1;
    const nft_id_1: number = 0;
    const nft_id_2: number = 1;

    await test_ctx.minter.connect(test_ctx.user_1_account).mintERC721(
      telegram_id,
      test_ctx.mock_erc721.address,
      nft_id_1
    );

    await test_ctx.minter.createERC721Mint(
      test_ctx.mock_erc721.address,
      nft_id_2,
      test_ctx.mock_erc20.address,
      1
    );

    await expect(test_ctx.minter.connect(test_ctx.user_1_account).mintERC721(
      telegram_id,
      test_ctx.mock_erc721.address,
      nft_id_2
    ))
      .to.revertedWithCustomError(test_ctx.minter, "TelegramIdFlagAlreadySetError")
      .withArgs(
        telegram_id,
        test_ctx.mock_erc721.address,
        constants.UINT256_MAX
      );
  });

  it("should revert if minting a ERC1155 token more than once with the same Telegram ID", async () => {
    const telegram_id: number = 1;
    const nft_id_1: number = 0;
    const nft_id_2: number = 1;
    const nft_amount: number = 1;

    await test_ctx.minter.connect(test_ctx.user_1_account).mintERC1155(
      telegram_id,
      test_ctx.mock_erc1155.address,
      nft_id_1,
      nft_amount
    );

    await expect(test_ctx.minter.connect(test_ctx.user_1_account).mintERC1155(
      telegram_id,
      test_ctx.mock_erc1155.address,
      nft_id_1,
      nft_amount
    ))
      .to.revertedWithCustomError(test_ctx.minter, "TelegramIdFlagAlreadySetError")
      .withArgs(
        telegram_id,
        test_ctx.mock_erc1155.address,
        nft_id_1
      );

    // It should be able to mint a different NFT ID if token is ERC1155
    await test_ctx.minter.createERC1155Mint(
      test_ctx.mock_erc1155.address,
      nft_id_2,
      constants.ERC1155_TOKEN_AMOUNT,
      test_ctx.mock_erc20.address,
      nft_amount
    );
    await expect(await test_ctx.minter.connect(test_ctx.user_1_account).mintERC1155(
      telegram_id,
      test_ctx.mock_erc1155.address,
      nft_id_2,
      nft_amount
    ))
      .not.to.be.reverted;
  });

  it("should revert if minting a token with null Telegram ID", async () => {
    await expect(test_ctx.minter.connect(test_ctx.user_1_account).mintERC721(
      0,
      test_ctx.mock_erc721.address,
      0
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "NullTelegramIdError");

    await expect(test_ctx.minter.connect(test_ctx.user_1_account).mintERC1155(
      0,
      test_ctx.mock_erc1155.address,
      0,
      1
    ))
      .to.be.revertedWithCustomError(test_ctx.minter, "NullTelegramIdError");
  });
});
