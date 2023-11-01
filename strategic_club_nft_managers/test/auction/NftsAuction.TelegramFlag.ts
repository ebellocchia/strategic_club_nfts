// Project
import {
  testTelegramFlagERC721Set, testTelegramFlagERC1155Set,
  testTelegramFlagERC721SetError, testTelegramFlagERC1155SetError
} from "../common/TestTelegramFlag";
import { AuctionTestContext, initAuctionTestContext } from "./UtilsAuction";


describe("NftsAuction.TelegramFlag", () => {
  let test_ctx: AuctionTestContext;

  beforeEach(async () => {
    test_ctx = await initAuctionTestContext();
  });

  it("should set/reset the Telegram flag", async () => {
    const telegram_id: number = 1;

    await testTelegramFlagERC721Set(
      test_ctx.auction,
      telegram_id,
      test_ctx.mock_erc721.address
    );

    await testTelegramFlagERC1155Set(
      test_ctx.auction,
      telegram_id,
      test_ctx.mock_erc1155.address,
      0
    );
  });

  it("should revert if setting/resetting the Telegram flag when already set/reset", async () => {
    const telegram_id: number = 1;

    await testTelegramFlagERC721SetError(
      test_ctx.auction,
      telegram_id,
      test_ctx.mock_erc721.address
    );

    await testTelegramFlagERC1155SetError(
      test_ctx.auction,
      telegram_id,
      test_ctx.mock_erc1155.address,
      0
    );
  });
});
