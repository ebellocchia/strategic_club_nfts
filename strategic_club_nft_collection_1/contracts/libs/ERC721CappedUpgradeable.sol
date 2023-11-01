// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//=============================================================//
//                           IMPORTS                           //
//=============================================================//
import "./ERC721AutoIdUpgradeable.sol";


/**
 * @author Emanuele B. (@emanueleb88)
 * @title  ERC721 token with maximum supply handling
 * @notice Supply can be increased or freezed to prevent future modifications
 */
abstract contract ERC721CappedUpgradeable is
    Initializable,
    ERC721AutoIdUpgradeable
{
    //=============================================================//
    //                           STORAGE                           //
    //=============================================================//

    /// Flag to freeze maximum supply
    bool public maxSupplyFreezed;
    /// Maximum supply
    uint256 public maxSupply;

    //=============================================================//
    //                           ERRORS                            //
    //=============================================================//

    /**
     * Error raised if maximum supply is freezed
     */
    error MaxSupplyFreezedError();

    /**
     * Error raised if maximum supply is reached
     */
    error MaxSupplyReachedError(
        uint256 value
    );

    /**
     * Error raised if maximum supply value `value` is not valid
     */
    error MaxSupplyInvalidValueError(
        uint256 value
    );

    //=============================================================//
    //                           EVENTS                            //
    //=============================================================//

    /**
     * Event emitted when maximum supply is freezed
     */
    event MaxSupplyFreezed(
        uint256 currValue
    );

    /**
     * Event emitted when maximum supply is increased
     */
    event MaxSupplyIncreased(
        uint256 oldValue,
        uint256 newValue
    );

    //=============================================================//
    //                          MODIFIERS                          //
    //=============================================================//

    /**
     * Modifier to make a function callable only when the maximum supply is not freezed.
     * Require maximum supply to be not freezed.
     */
    modifier whenUnfreezedMaxSupply() {
        if (maxSupplyFreezed) {
            revert MaxSupplyFreezedError();
        }
        _;
    }

    //=============================================================//
    //                     INTERNAL FUNCTIONS                      //
    //=============================================================//

    /**
     * Initialize
     */
    function __ERC721Capped_init(
        uint256 maxSupply_
    ) internal onlyInitializing {
        __ERC721AutoId_init_unchained();
        __ERC721Capped_init_unchained(maxSupply_);
    }

    /**
     * Initialize (unchained)
     */
    function __ERC721Capped_init_unchained(
        uint256 maxSupply_
    ) internal onlyInitializing {
        if (maxSupply_ == 0) {
            revert MaxSupplyInvalidValueError(maxSupply_);
        }

        maxSupplyFreezed = false;
        maxSupply = maxSupply_;
    }

    /**
     * Freeze maximum supply
     */
    function _freezeMaxSupply() internal whenUnfreezedMaxSupply {
        maxSupplyFreezed = true;

        emit MaxSupplyFreezed(maxSupply);
    }

    /**
     * Increase maximum supply to `maxSupply_`
     * @param maxSupply_ New maximum supply
     */
    function _increaseMaxSupply(
        uint256 maxSupply_
    ) internal whenUnfreezedMaxSupply {
        if (maxSupply_ <= maxSupply) {
            revert MaxSupplyInvalidValueError(maxSupply_);
        }

        uint256 old_value = maxSupply;
        maxSupply = maxSupply_;

        emit MaxSupplyIncreased(old_value, maxSupply_);
    }

    //=============================================================//
    //                    OVERRIDDEN FUNCTIONS                     //
    //=============================================================//

    /**
     * Check maximum supply when minting.
     * See {ERC721-_mint}
     */
    function _mint(
        address to_,
        uint256 tokenId_
    ) internal virtual override {
        if (tokenId_ >= maxSupply) {
            revert MaxSupplyReachedError(maxSupply);
        }
        super._mint(to_, tokenId_);
    }
}
