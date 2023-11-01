import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
// Project
import * as constants from "../common/Constants";
import {
  getMockERC20TokenContractAt, getMockERC721TokenContractAt, getMockERC1155TokenContractAt
} from "../common/UtilsCommon";
import {
  Auction, AuctionStates,
  AuctionTestContext, initAuctionTestContextAndBid
} from "./UtilsAuction";


async function testComplete(
  auction: Contract,
  mock_nft: Contract,
  owner: Signer,
  user_account: Signer
) : Promise<void> {
  const is_erc721: boolean = await mock_nft.supportsInterface(constants.ERC721_INTERFACE_ID);
  const telegram_id: number = 1;
  const nft_id: number = 0;
  const auction_data_before: Auction = await auction.Auctions(mock_nft.address, nft_id);
  const mock_erc20: Contract = await getMockERC20TokenContractAt(auction_data_before.erc20Contract);

  const owner_address: string = await owner.getAddress();
  const user_address: string = await user_account.getAddress();
  const initial_owner_balance: BigNumber = await mock_erc20.balanceOf(owner_address);
  const initial_user_balance: BigNumber = await mock_erc20.balanceOf(user_address);

  expect(await auction.isAuctionActive(mock_nft.address, nft_id))
    .to.equal(false);
  expect(await auction.isAuctionExpired(mock_nft.address, nft_id))
    .to.equal(true);
  expect(await auction.isAuctionCompleted(mock_nft.address, nft_id))
    .to.equal(false);

  await expect(await auction.connect(user_account).completeAuction(
    telegram_id,
    mock_nft.address,
    nft_id
  ))
    .to.emit(auction, "TelegramIdFlagSet")
    .withArgs(
      telegram_id,
      mock_nft.address,
      is_erc721 ? constants.UINT256_MAX : nft_id
    )
    .to.emit(auction, "AuctionCompleted")
    .withArgs(
      mock_nft.address,
      nft_id,
      auction_data_before.nftAmount,
      user_address,
      auction_data_before.erc20Contract,
      auction_data_before.erc20HighestBid
    );

  // Check data
  const auction_data_after: Auction = await auction.Auctions(mock_nft.address, nft_id);
  expect(auction_data_after.nftAmount).to.equal(auction_data_before.nftAmount);
  expect(auction_data_after.highestBidder).to.equal(user_address);
  expect(auction_data_after.erc20Contract).to.equal(auction_data_before.erc20Contract);
  expect(auction_data_after.erc20StartPrice).to.equal(auction_data_before.erc20StartPrice);
  expect(auction_data_after.erc20MinimumBidIncrement).to.equal(auction_data_before.erc20MinimumBidIncrement);
  expect(auction_data_after.erc20HighestBid).to.equal(auction_data_before.erc20HighestBid);
  expect(auction_data_after.startTime).to.equal(auction_data_before.startTime);
  expect(auction_data_after.endTime).to.equal(auction_data_before.endTime);
  expect(auction_data_after.state).to.equal(AuctionStates.COMPLETED);

  // Check state
  expect(await auction.isAuctionActive(mock_nft.address, nft_id))
    .to.equal(false);
  expect(await auction.isAuctionExpired(mock_nft.address, nft_id))
    .to.equal(false);
  expect(await auction.isAuctionCompleted(mock_nft.address, nft_id))
    .to.equal(true);
  expect(await (auction.TelegramIdFlags(telegram_id, mock_nft.address, is_erc721 ? constants.UINT256_MAX : nft_id)))
    .to.equal(true);

  // Check token transfers
  expect(await mock_erc20.balanceOf(owner_address))
    .to.equal(initial_owner_balance.add(auction_data_after.erc20HighestBid));
  expect(await mock_erc20.balanceOf(user_address))
    .to.equal(initial_user_balance.sub(auction_data_after.erc20HighestBid));

  if (is_erc721) {
    const mock_erc721: Contract = await getMockERC721TokenContractAt(mock_nft.address);
    expect(await mock_erc721.ownerOf(nft_id))
      .to.equal(user_address);
  }
  else {
    const mock_erc1155: Contract = await getMockERC1155TokenContractAt(mock_nft.address);
    expect(await mock_erc1155.balanceOf(user_address, nft_id))
      .to.equal(auction_data_after.nftAmount);
  }
}

async function testNotEnoughBalance(
  auction: Contract,
  mock_nft: Contract,
  mock_erc20: Contract,
  user_account: Signer,
  other_address: string
) : Promise<void> {
  const user_address: string = await user_account.getAddress();
  const balance: BigNumber = await mock_erc20.balanceOf(user_address);

  await mock_erc20
    .connect(user_account)
    .transfer(other_address, balance.sub(1));

  await expect(auction.connect(user_account).completeAuction(
    1,
    mock_nft.address,
    0
  ))
    .to.be.revertedWith("ERC20: transfer amount exceeds balance");
}

async function testNotExpired(
  auction: Contract,
  mock_nft: Contract,
  mock_erc20: Contract,
  user_account: Signer
) : Promise<void> {
  const is_erc721: boolean = await mock_nft.supportsInterface(constants.ERC721_INTERFACE_ID);
  const nft_id: number = 1;

  // Inactive auction (not created)
  await expect(auction.connect(user_account).completeAuction(
    1,
    mock_nft.address,
    nft_id
  ))
    .to.revertedWithCustomError(auction, "AuctionNotExpiredError")
    .withArgs(
      mock_nft.address,
      nft_id
    );

  // Active auction
  if (is_erc721) {
    await auction.createERC721Auction(
      mock_nft.address,
      nft_id,
      mock_erc20.address,
      1,
      1,
      10,
      0
    );
  }
  else {
    await auction.createERC1155Auction(
      mock_nft.address,
      nft_id,
      1,
      mock_erc20.address,
      1,
      1,
      10,
      0
    );
  }

  await expect(auction.connect(user_account).completeAuction(
    1,
    mock_nft.address,
    nft_id
  ))
    .to.revertedWithCustomError(auction, "AuctionNotExpiredError")
    .withArgs(
      mock_nft.address,
      nft_id
    );
}

async function testNotWinner(
  auction: Contract,
  mock_nft: Contract,
  user_account: Signer
) : Promise<void> {
  const user_address: string = await user_account.getAddress();

  await expect(auction.connect(user_account).completeAuction(
    1,
    mock_nft.address,
    0
  ))
    .to.revertedWithCustomError(auction, "BidderNotWinnerError")
    .withArgs(user_address);
}

async function testNullTelegramId(
  auction: Contract,
  mock_nft: Contract,
  user_account: Signer
) : Promise<void> {
  await expect(auction.connect(user_account).completeAuction(
    0,
    mock_nft.address,
    0
  ))
    .to.revertedWithCustomError(auction, "NullTelegramIdError");
}

describe("NftsAuction.Complete", () => {
  let test_ctx: AuctionTestContext;

  beforeEach(async () => {
    test_ctx = await initAuctionTestContextAndBid();
  });

  it("should allow the winner to complete a token auction", async () => {
    await testComplete(
      test_ctx.auction,
      test_ctx.mock_erc721,
      test_ctx.accounts.owner,
      test_ctx.user_1_account
    );
    await testComplete(
      test_ctx.auction,
      test_ctx.mock_erc1155,
      test_ctx.accounts.owner,
      test_ctx.user_2_account
    );
  });

  it("should revert if completing a token auction with not enough balance", async () => {
    await testNotEnoughBalance(
      test_ctx.auction,
      test_ctx.mock_erc721,
      test_ctx.mock_erc20,
      test_ctx.user_1_account,
      test_ctx.user_2_address
    );
    await testNotEnoughBalance(
      test_ctx.auction,
      test_ctx.mock_erc1155,
      test_ctx.mock_erc20,
      test_ctx.user_2_account,
      test_ctx.user_1_address
    );
  });

  it("should revert if completing a token auction that is not expired", async () => {
    await testNotExpired(
      test_ctx.auction,
      test_ctx.mock_erc721,
      test_ctx.mock_erc20,
      test_ctx.user_1_account
    );
    await testNotExpired(
      test_ctx.auction,
      test_ctx.mock_erc1155,
      test_ctx.mock_erc20,
      test_ctx.user_1_account
    );
  });

  it("should revert if completing a token auction with a user that is not the winner", async () => {
    await testNotWinner(
      test_ctx.auction,
      test_ctx.mock_erc721,
      test_ctx.user_2_account
    );
    await testNotWinner(
      test_ctx.auction,
      test_ctx.mock_erc1155,
      test_ctx.user_1_account
    );
  });

  it("should revert if completing a token auction with null addresses", async () => {
    await expect(test_ctx.auction.completeAuction(
      1,
      constants.NULL_ADDRESS,
      0
    ))
      .to.be.revertedWithCustomError(test_ctx.auction, "NullAddressError");
  });

  it("should revert if minting a token with null Telegram ID", async () => {
    await testNullTelegramId(
      test_ctx.auction,
      test_ctx.mock_erc721,
      test_ctx.user_1_account
    );
    await testNullTelegramId(
      test_ctx.auction,
      test_ctx.mock_erc1155,
      test_ctx.user_2_account
    );
  });

  it("should revert if bidding for a ERC721 token with a Telegram ID that has already completed it", async () => {
    const telegram_id: number = 1;
    const nft_id_1: number = 0;
    const nft_id_2: number = 1;

    await test_ctx.auction.connect(test_ctx.user_1_account).completeAuction(
      telegram_id,
      test_ctx.mock_erc721.address,
      nft_id_1
    );

    await test_ctx.auction.createERC721Auction(
      test_ctx.mock_erc721.address,
      nft_id_2,
      test_ctx.mock_erc20.address,
      1,
      1,
      1,
      0
    );
    await expect(test_ctx.auction.connect(test_ctx.user_1_account).bidAtAuction(
      telegram_id,
      test_ctx.mock_erc721.address,
      nft_id_2,
      2
    ))
      .to.revertedWithCustomError(test_ctx.auction, "TelegramIdFlagAlreadySetError")
      .withArgs(
        telegram_id,
        test_ctx.mock_erc721.address,
        constants.UINT256_MAX
      );
  });

  it("should revert if bidding for a ERC1155 token with a Telegram ID that has already completed it", async () => {
    const telegram_id: number = 1;
    const nft_id_1: number = 0;
    const nft_id_2: number = 1;
    const nft_amount: number = 1;

    await test_ctx.auction.connect(test_ctx.user_2_account).completeAuction(
      telegram_id,
      test_ctx.mock_erc1155.address,
      nft_id_1
    );

    await test_ctx.auction.createERC1155Auction(
      test_ctx.mock_erc1155.address,
      nft_id_1,
      nft_amount,
      test_ctx.mock_erc20.address,
      1,
      1,
      1,
      0
    );
    await expect(test_ctx.auction.connect(test_ctx.user_2_account).bidAtAuction(
      telegram_id,
      test_ctx.mock_erc1155.address,
      nft_id_1,
      2
    ))
      .to.revertedWithCustomError(test_ctx.auction, "TelegramIdFlagAlreadySetError")
      .withArgs(
        telegram_id,
        test_ctx.mock_erc1155.address,
        nft_id_1
      );

    // It should be able to bid for a different NFT ID auction if token is ERC1155
    await test_ctx.auction.createERC1155Auction(
      test_ctx.mock_erc1155.address,
      nft_id_2,
      nft_amount,
      test_ctx.mock_erc20.address,
      1,
      1,
      1,
      0
    );
    await expect(await test_ctx.auction.connect(test_ctx.user_2_account).bidAtAuction(
      telegram_id,
      test_ctx.mock_erc1155.address,
      nft_id_2,
      2
    ))
      .not.to.be.reverted;
  });
});
