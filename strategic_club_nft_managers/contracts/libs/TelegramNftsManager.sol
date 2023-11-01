// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//=============================================================//
//                            IMPORTS                          //
//=============================================================//
import "./NftsManager.sol";


/**
 * @author Emanuele (@emanueleb88)
 * @title  Contract for NFT managers that handles Telegram IDs
 */
abstract contract TelegramNftsManager is
    NftsManager
{
    //=============================================================//
    //                           ERRORS                            //
    //=============================================================//

    /**
     * Error raised in case of a null Telegram ID
     */
    error NullTelegramIdError();

    /**
     * Error raised in case of a Telegram ID flag is already set
     * @param telegramId  Telegram ID
     * @param nftContract NFT contract address
     * @param nftId       NFT ID
     */
    error TelegramIdFlagAlreadySetError(
        uint256 telegramId,
        address nftContract,
        uint256 nftId           // Only for ERC1155, -1 for ERC721
    );

    /**
     * Error raised in case of a Telegram ID flag is not set
     * @param telegramId  Telegram ID
     * @param nftContract NFT contract address
     * @param nftId       NFT ID
     */
    error TelegramIdFlagNotSetError(
        uint256 telegramId,
        address nftContract,
        uint256 nftId           // Only for ERC1155, -1 for ERC721
    );

    //=============================================================//
    //                             EVENTS                          //
    //=============================================================//

    /**
     * Event emitted when a Telegram ID flag is reset
     * @param telegramId  Telegram ID
     * @param nftContract NFT contract address
     * @param nftId       NFT ID
     */
    event TelegramIdFlagReset(
        uint256 telegramId,
        address nftContract,
        uint256 nftId           // Only for ERC1155, -1 for ERC721
    );

    /**
     * Event emitted when a Telegram ID flag is set
     * @param telegramId  Telegram ID
     * @param nftContract NFT contract address
     * @param nftId       NFT ID
     */
    event TelegramIdFlagSet(
        uint256 telegramId,
        address nftContract,
        uint256 nftId           // Only for ERC1155, -1 for ERC721
    );

    //=============================================================//
    //                           MODIFIERS                         //
    //=============================================================//

    /**
     * Modifier to make a function callable only if the Telegram ID `telegramId_` is not null
     * @param telegramId_ Telegram ID
     */
    modifier notNullTelegramId(
        uint256 telegramId_
    ) {
        if (telegramId_ == 0) {
            revert NullTelegramIdError();
        }
        _;
    }

    //=============================================================//
    //                            STORAGE                          //
    //=============================================================//

    /// Mapping from Telegram ID, token address and ID to completed flag
    /// Token ID is used only for ERC1155, for ERC721 it is always -1
    mapping(uint256 => mapping(address => mapping(uint256 => bool))) public TelegramIdFlags;

    //=============================================================//
    //                       PUBLIC FUNCTIONS                      //
    //=============================================================//

    /**
     * Set Telegram ID flag for ERC721 token
     * @param telegramId_  Telegram ID
     * @param nftContract_ NFT contract address
     */
    function setTelegramIdERC721Flag(
        uint256 telegramId_,
        IERC721 nftContract_
    )
        public
        onlyOwner
    {
        __setTelegramIdFlag(
            telegramId_,
            address(nftContract_),
            type(uint256).max
        );
    }

    /**
     * Set Telegram ID flag for ERC1155 token
     * @param telegramId_  Telegram ID
     * @param nftContract_ NFT contract address
     * @param nftId_       NFT ID
     */
    function setTelegramIdERC1155Flag(
        uint256  telegramId_,
        IERC1155 nftContract_,
        uint256  nftId_
    )
        public
        onlyOwner
    {
        __setTelegramIdFlag(
            telegramId_,
            address(nftContract_),
            nftId_
        );
    }

    /**
     * Reset Telegram ID flag for ERC721 token
     * @param telegramId_  Telegram ID
     * @param nftContract_ NFT contract address
     */
    function resetTelegramIdERC721Flag(
        uint256 telegramId_,
        IERC721 nftContract_
    )
        public
        onlyOwner
    {
        __resetTelegramIdFlag(
            telegramId_,
            address(nftContract_),
            type(uint256).max
        );
    }

    /**
     * Reset Telegram ID flag for ERC1155 token
     * @param telegramId_  Telegram ID
     * @param nftContract_ NFT contract address
     * @param nftId_       NFT ID
     */
    function resetTelegramIdERC1155Flag(
        uint256  telegramId_,
        IERC1155 nftContract_,
        uint256  nftId_
    )
        public
        onlyOwner
    {
        __resetTelegramIdFlag(
            telegramId_,
            address(nftContract_),
            nftId_
        );
    }

    //=============================================================//
    //                      INTERNAL FUNCTIONS                     //
    //=============================================================//

    /**
     * Revert if Telegram ID flag for ERC721 token is set
     * @param telegramId_  Telegram ID
     * @param nftContract_ NFT contract address
     */
    function _revertIfTelegramIdERC721FlagIsSet(
        uint256 telegramId_,
        IERC721 nftContract_
    ) internal view {
        __revertIfTelegramIdFlagIsSet(
            telegramId_,
            address(nftContract_),
            type(uint256).max
        );
    }

    /**
     * Revert if Telegram ID flag for ERC1155 token is set
     * @param telegramId_  Telegram ID
     * @param nftContract_ NFT contract address
     * @param nftId_       NFT ID
     */
    function _revertIfTelegramIdERC1155FlagIsSet(
        uint256  telegramId_,
        IERC1155 nftContract_,
        uint256  nftId_
    ) internal view {
        __revertIfTelegramIdFlagIsSet(
            telegramId_,
            address(nftContract_),
            nftId_
        );
    }

    /**
     * Set Telegram ID flag for ERC721 token
     * @param telegramId_  Telegram ID
     * @param nftContract_ NFT contract address
     */
    function _setTelegramIdERC721Flag(
        uint256 telegramId_,
        IERC721 nftContract_
    ) internal {
        __setTelegramIdFlag(
            telegramId_,
            address(nftContract_),
            type(uint256).max
        );
    }

    /**
     * Set Telegram ID flag for ERC1155 token
     * @param telegramId_  Telegram ID
     * @param nftContract_ NFT contract address
     * @param nftId_       NFT ID
     */
    function _setTelegramIdERC1155Flag(
        uint256  telegramId_,
        IERC1155 nftContract_,
        uint256  nftId_
    ) internal {
        __setTelegramIdFlag(
            telegramId_,
            address(nftContract_),
            nftId_
        );
    }

    //=============================================================//
    //                      PRIVATE FUNCTIONS                      //
    //=============================================================//

    /**
     * Revert if Telegram ID flag is not set
     * @param telegramId_  Telegram ID
     * @param nftContract_ NFT contract address
     * @param nftId_       NFT ID
     */
    function __revertIfTelegramIdFlagIsNotSet(
        uint256 telegramId_,
        address nftContract_,
        uint256 nftId_
    ) private view {
        if (!TelegramIdFlags[telegramId_][nftContract_][nftId_]) {
            revert TelegramIdFlagNotSetError(
                telegramId_,
                nftContract_,
                nftId_
            );
        }
    }

    /**
     * Revert if Telegram ID flag is set
     * @param telegramId_  Telegram ID
     * @param nftContract_ NFT contract address
     * @param nftId_       NFT ID
     */
    function __revertIfTelegramIdFlagIsSet(
        uint256 telegramId_,
        address nftContract_,
        uint256 nftId_
    ) private view {
        if (TelegramIdFlags[telegramId_][nftContract_][nftId_]) {
            revert TelegramIdFlagAlreadySetError(
                telegramId_,
                nftContract_,
                nftId_
            );
        }
    }

    /**
     * Set Telegram ID flag for the specified token
     * @param telegramId_  Telegram ID
     * @param nftContract_ NFT contract address
     * @param nftId_       NFT ID
     */
    function __setTelegramIdFlag(
        uint256 telegramId_,
        address nftContract_,
        uint256 nftId_
    )
        private
        notNullTelegramId(telegramId_)
        notNullAddress(nftContract_)
    {
        __revertIfTelegramIdFlagIsSet(telegramId_, nftContract_, nftId_);

        TelegramIdFlags[telegramId_][nftContract_][nftId_] = true;

        emit TelegramIdFlagSet(
            telegramId_,
            nftContract_,
            nftId_
        );
    }

    /**
     * Reset Telegram ID flag for the specified token
     * @param telegramId_  Telegram ID
     * @param nftContract_ NFT contract address
     * @param nftId_       NFT ID
     */
    function __resetTelegramIdFlag(
        uint256 telegramId_,
        address nftContract_,
        uint256 nftId_
    )
        private
        notNullTelegramId(telegramId_)
        notNullAddress(address(nftContract_))
    {
        __revertIfTelegramIdFlagIsNotSet(telegramId_, nftContract_, nftId_);

        TelegramIdFlags[telegramId_][nftContract_][nftId_] = false;

        emit TelegramIdFlagReset(
            telegramId_,
            nftContract_,
            nftId_
        );
    }
}
