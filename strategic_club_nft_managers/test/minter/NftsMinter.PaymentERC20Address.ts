// Project
import { testPaymentERC20AddressSet, testPaymentERC20AddressNullAddress } from "../common/TestPaymentERC20Address";
import { MinterTestContext, initMinterTestContext } from "./NftsMinter";


describe("NftsMinter.PaymentERC20Address", () => {
  let test_ctx: MinterTestContext;

  beforeEach(async () => {
    test_ctx = await initMinterTestContext();
  });

  it("should set the payment wallet", async () => {
    await testPaymentERC20AddressSet(
      test_ctx.minter,
      test_ctx.user_1_address
    );
  });

  it("should revert if setting a payment wallet with null address", async () => {
    await testPaymentERC20AddressNullAddress(
      test_ctx.minter
    );
  });
});
