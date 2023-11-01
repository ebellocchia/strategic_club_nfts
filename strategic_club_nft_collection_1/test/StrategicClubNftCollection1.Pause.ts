import { expect } from "chai";
// Project
import * as utils from "./Utils";


describe("StrategicClubNftCollection1.Pause", () => {
  const SAFE_TRANSFER_FROM: string = "safeTransferFrom(address,address,uint256)";

  let test_ctx: utils.TestContext;

  beforeEach(async () => {
    test_ctx = await utils.initTestContextAndMint();
  });

  it("should revert if transferring tokens when paused", async () => {
    await expect(await test_ctx.nft.pauseTransfers())
      .to.emit(test_ctx.nft, "Paused");

    expect(await test_ctx.nft.paused()).to.equal(true);
    await expect(test_ctx.nft[SAFE_TRANSFER_FROM](
      await test_ctx.accounts.owner.getAddress(),
      await test_ctx.accounts.signers[0].getAddress(),
      1
    ))
      .to.be.revertedWithCustomError(test_ctx.nft, "TransferWhilePausedError");
  });

  it("should not revert if transferring tokens when unpaused", async () => {
    await test_ctx.nft.pauseTransfers();

    await expect(await test_ctx.nft.unpauseTransfers())
      .to.emit(test_ctx.nft, "Unpaused");
    expect(await test_ctx.nft.paused()).to.equal(false);

    await expect(await test_ctx.nft[SAFE_TRANSFER_FROM](
      await test_ctx.accounts.owner.getAddress(),
      await test_ctx.accounts.signers[0].getAddress(),
      1
    ))
      .not.to.be.reverted;
  });

  it("should allow setting and resetting an unpaused wallet", async () => {
    const owner_address: string = await test_ctx.accounts.owner.getAddress();

    await expect(await test_ctx.nft.setUnpausedWallet(owner_address, true))
      .to.emit(test_ctx.nft, "UnpausedWalletStatusChanged")
      .withArgs(owner_address, true);

    expect(await test_ctx.nft.unpausedWallets(owner_address)).to.equal(true);

    await expect(await test_ctx.nft.setUnpausedWallet(owner_address, false))
      .to.emit(test_ctx.nft, "UnpausedWalletStatusChanged")
      .withArgs(owner_address, false);

    expect(await test_ctx.nft.unpausedWallets(owner_address)).to.equal(false);
  });

  it("should allow transferring an unpaused wallet when paused", async () => {
    const owner_address: string = await test_ctx.accounts.owner.getAddress();
    const target_address: string = await test_ctx.accounts.signers[0].getAddress();

    await test_ctx.nft.pauseTransfers();

    await expect(test_ctx.nft[SAFE_TRANSFER_FROM](
      owner_address,
      target_address,
      1
    ))
      .to.be.revertedWithCustomError(test_ctx.nft, "TransferWhilePausedError");

    await test_ctx.nft.setUnpausedWallet(owner_address, true);
    await expect(await test_ctx.nft[SAFE_TRANSFER_FROM](
      owner_address,
      target_address,
      1
    ))
      .not.to.be.reverted;
  });

  it("should allow setting and resetting a paused wallet", async () => {
    const owner_address: string = await test_ctx.accounts.owner.getAddress();

    await expect(await test_ctx.nft.setPausedWallet(owner_address, true))
      .to.emit(test_ctx.nft, "PausedWalletStatusChanged")
      .withArgs(owner_address, true);

    expect(await test_ctx.nft.pausedWallets(owner_address)).to.equal(true);

    await expect(await test_ctx.nft.setPausedWallet(owner_address, false))
      .to.emit(test_ctx.nft, "PausedWalletStatusChanged")
      .withArgs(owner_address, false);

    expect(await test_ctx.nft.pausedWallets(owner_address)).to.equal(false);
  });

  it("should revert if transferring from a paused wallet", async () => {
    const owner_address: string = await test_ctx.accounts.owner.getAddress();
    const target_address: string = await test_ctx.accounts.signers[0].getAddress();

    await test_ctx.nft.setPausedWallet(owner_address, true);

    await expect(test_ctx.nft[SAFE_TRANSFER_FROM](
      owner_address,
      target_address,
      1
    ))
      .to.be.revertedWithCustomError(test_ctx.nft, "TransferByPausedWalletError");

    await test_ctx.nft.setPausedWallet(owner_address, false);
    await expect(await test_ctx.nft[SAFE_TRANSFER_FROM](
      owner_address,
      target_address,
      1
    ))
      .not.to.be.reverted;
  });

  it("should revert if pausing when paused", async () => {
    await test_ctx.nft.pauseTransfers();
    await expect(test_ctx.nft.pauseTransfers())
      .to.be.revertedWith("Pausable: paused");
  });

  it("should revert if unpausing when unpaused", async () => {
    await expect(test_ctx.nft.unpauseTransfers())
      .to.be.revertedWith("Pausable: not paused");
  });
});
