import { expect } from "chai";
// Project
import * as constants from "./Constants";
import * as utils from "./Utils";


describe("StrategicClubNftCollection1.Royalty", () => {
  let test_ctx: utils.TestContext;

  beforeEach(async () => {
    test_ctx = await utils.initTestContext();
  });

  it("should set default royalty", async () => {
    const fee_fraction: number = 100;
    const sale_price: number = 5000;
    const fee_amount: number = sale_price * fee_fraction / constants.FEE_DENOMINATOR;
    const owner_address: string = await test_ctx.accounts.owner.getAddress();

    await expect(await test_ctx.nft.setDefaultRoyalty(owner_address, fee_fraction))
      .to.emit(test_ctx.nft, "DefaultRoyaltySet")
      .withArgs(owner_address, fee_fraction);

    const [receiver, amount] = await test_ctx.nft.royaltyInfo(1, sale_price);
    expect(receiver).to.equal(owner_address);
    expect(amount).to.equal(fee_amount);
  });

  it("should delete default royalty", async () => {
    const sale_price: number = 5000;
    const fee_fraction: number = 100;
    const owner_address: string = await test_ctx.accounts.owner.getAddress();

    await test_ctx.nft.setDefaultRoyalty(owner_address, fee_fraction);
    await expect(await test_ctx.nft.deleteDefaultRoyalty())
      .to.emit(test_ctx.nft, "DefaultRoyaltyDeleted");

    const [receiver, amount] = await test_ctx.nft.royaltyInfo(1, sale_price);
    expect(receiver).to.equal(constants.NULL_ADDRESS);
    expect(amount).to.equal(0);
  });
});
