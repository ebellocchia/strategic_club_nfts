import { expect } from "chai";
import { Signer } from "ethers";
// Project
import * as constants from "../common/Constants";
import { MinterTestContext, initMinterTestContext } from "./NftsMinter";


describe("NftsMinter.Access", () => {
  let test_ctx: MinterTestContext;

  beforeEach(async () => {
    test_ctx = await initMinterTestContext();
  });

  it("should revert if functions are not called by the owner", async () => {
    const not_owner_account: Signer = test_ctx.accounts.signers[0];

    await expect(test_ctx.minter.connect(not_owner_account).upgradeTo(constants.NULL_ADDRESS))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.minter.connect(not_owner_account).upgradeToAndCall(constants.NULL_ADDRESS, constants.EMPTY_BYTES))
      .to.be.revertedWith("Ownable: caller is not the owner");

    await expect(test_ctx.minter.connect(not_owner_account).setPaymentERC20Address(constants.NULL_ADDRESS))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.minter.connect(not_owner_account).removeMint(
      test_ctx.mock_erc721.address,
      0
    ))
      .to.be.revertedWith("Ownable: caller is not the owner");

    await expect(test_ctx.minter.connect(not_owner_account).createERC721Mint(
      test_ctx.mock_erc721.address,
      0,
      test_ctx.mock_erc20.address,
      0
    ))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.minter.connect(not_owner_account).createERC1155Mint(
      test_ctx.mock_erc721.address,
      0,
      1,
      test_ctx.mock_erc20.address,
      0
    ))
      .to.be.revertedWith("Ownable: caller is not the owner");

    await expect(test_ctx.minter.connect(not_owner_account).withdrawERC721(
      test_ctx.mock_erc721.address,
      0
    ))
      .to.be.revertedWith("Ownable: caller is not the owner");
    await expect(test_ctx.minter.connect(not_owner_account).withdrawERC1155(
      test_ctx.mock_erc1155.address,
      0,
      1
    ))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });
});
