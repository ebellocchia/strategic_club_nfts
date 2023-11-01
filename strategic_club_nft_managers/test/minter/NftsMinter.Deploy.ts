import { expect } from "chai";
// Project
import * as constants from "../common/Constants";
import {
  MinterTestContext,
  deployMinterContract, deployMinterUpgradedContract,
  getMinterUpgradedContractAt, initMinterTestContext
} from "./NftsMinter";


describe("NftsMinter.Deploy", () => {
  let test_ctx: MinterTestContext;

  beforeEach(async () => {
    test_ctx = await initMinterTestContext();
  });

  it("should be constructed correctly", async () => {
    const owner_address: string = await test_ctx.accounts.owner.getAddress();

    expect(await test_ctx.minter.owner()).to.equal(owner_address);
    expect(await test_ctx.minter.paymentERC20Address()).to.equal(test_ctx.payment_erc20_address);
  });

  it("should upgrade the logic", async () => {
    const new_logic = await deployMinterUpgradedContract();

    await expect(await test_ctx.minter.upgradeTo(new_logic.address))
      .not.to.be.reverted;

    test_ctx.minter = await getMinterUpgradedContractAt(test_ctx.minter.address);  // Update ABI
    expect(await test_ctx.minter.isUpgraded())
      .to.equal(true);
  });

  it("should revert if initializing more than once", async () => {
    await expect(test_ctx.minter.init(constants.NULL_ADDRESS))
      .to.be.revertedWith("Initializable: contract is already initialized");
  });

  it("should revert if initializing the logic contract without a proxy", async () => {
    const nft = await deployMinterContract();
    await expect(nft.init(constants.NULL_ADDRESS))
      .to.be.revertedWith("Initializable: contract is already initialized");
  });
});
