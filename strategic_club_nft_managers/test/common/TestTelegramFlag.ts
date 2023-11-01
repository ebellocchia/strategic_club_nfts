import { expect } from "chai";
import { Contract } from "ethers";
// Project
import * as constants from "./Constants";


//
// Exported functions
//

export async function testTelegramFlagERC721Set(
  manager: Contract,
  telegramId: number,
  nftAddress: string
) : Promise<void> {
  await expect(await manager.setTelegramIdERC721Flag(telegramId, nftAddress))
    .to.emit(manager, "TelegramIdFlagSet")
    .withArgs(telegramId, nftAddress, constants.UINT256_MAX);

  expect(await manager.TelegramIdFlags(telegramId, nftAddress, constants.UINT256_MAX))
    .to.equal(true);

  await expect(await manager.resetTelegramIdERC721Flag(telegramId, nftAddress))
    .to.emit(manager, "TelegramIdFlagReset")
    .withArgs(telegramId, nftAddress, constants.UINT256_MAX);

  expect(await manager.TelegramIdFlags(telegramId, nftAddress, constants.UINT256_MAX))
    .to.equal(false);
}

export async function testTelegramFlagERC1155Set(
  manager: Contract,
  telegramId: number,
  nftAddress: string,
  nftId: number
) : Promise<void> {
  await expect(await manager.setTelegramIdERC1155Flag(telegramId, nftAddress, nftId))
    .to.emit(manager, "TelegramIdFlagSet")
    .withArgs(telegramId, nftAddress, nftId);

  expect(await manager.TelegramIdFlags(telegramId, nftAddress, nftId))
    .to.equal(true);

  await expect(await manager.resetTelegramIdERC1155Flag(telegramId, nftAddress, nftId))
    .to.emit(manager, "TelegramIdFlagReset")
    .withArgs(telegramId, nftAddress, nftId);

  expect(await manager.TelegramIdFlags(telegramId, nftAddress, nftId))
    .to.equal(false);
}

export async function testTelegramFlagERC721SetError(
  manager: Contract,
  telegramId: number,
  nftAddress: string
) : Promise<void> {
  await expect(manager.resetTelegramIdERC721Flag(telegramId, nftAddress))
    .to.be.revertedWithCustomError(manager, "TelegramIdFlagNotSetError")
    .withArgs(telegramId, nftAddress, constants.UINT256_MAX);

  await manager.setTelegramIdERC721Flag(telegramId, nftAddress);
  await expect(manager.setTelegramIdERC721Flag(telegramId, nftAddress))
  .to.be.revertedWithCustomError(manager, "TelegramIdFlagAlreadySetError")
  .withArgs(telegramId, nftAddress, constants.UINT256_MAX);
}

export async function testTelegramFlagERC1155SetError(
  manager: Contract,
  telegramId: number,
  nftAddress: string,
  nftId: number
) : Promise<void> {
  await expect(manager.resetTelegramIdERC1155Flag(telegramId, nftAddress, nftId))
    .to.be.revertedWithCustomError(manager, "TelegramIdFlagNotSetError")
    .withArgs(telegramId, nftAddress, nftId);

  await manager.setTelegramIdERC1155Flag(telegramId, nftAddress, nftId);
  await expect(manager.setTelegramIdERC1155Flag(telegramId, nftAddress, nftId))
  .to.be.revertedWithCustomError(manager, "TelegramIdFlagAlreadySetError")
  .withArgs(telegramId, nftAddress, nftId);
}
