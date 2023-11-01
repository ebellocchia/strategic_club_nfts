// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//=============================================================//
//                           IMPORTS                           //
//=============================================================//
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";


/**
 * @author Emanuele B. (@emanueleb88)
 * @title  ERC721 token with the possibility to limit the maximum number of token owned by each wallet
 */
abstract contract ERC721WalletCappedUpgradeable is
    Initializable,
    ERC721Upgradeable
{
    //=============================================================//
    //                         STRUCTURES                          //
    //=============================================================//

    /// Data for wallet maximum number of tokens
    struct WalletMaxTokens {
        uint256 maxTokens;
        bool isSet;
    }

    //=============================================================//
    //                           STORAGE                           //
    //=============================================================//

    /// Mapping from wallet address to the maximum number of ownable tokens
    mapping(address => WalletMaxTokens) public walletsMaxTokens;
    /// Default maximum number of tokens if address is not in the mapping
    uint256 public defaultWalletMaxTokens;

    //=============================================================//
    //                           ERRORS                            //
    //=============================================================//

    /**
     * Error raised if default wallet maximum number of tokens is reached
     */
    error DefaultWalletMaxTokensReachedError(
        uint256 maxValue
    );

    /**
     * Error raised if specific wallet maximum number of tokens is reached
     */
    error WalletMaxTokensReachedError(
        uint256 maxValue
    );

    //=============================================================//
    //                           EVENTS                            //
    //=============================================================//

    /**
     * Event emitted when default maximum number of tokens is changed
     */
    event DefaultMaxTokensChanged(
        uint256 oldValue,
        uint256 newValue
    );

    /**
     * Event emitted when maximum number of tokens for a wallet is changed
     */
    event WalletMaxTokensChanged(
        address walletAddress,
        uint256 oldValue,
        uint256 newValue
    );

    //=============================================================//
    //                     INTERNAL FUNCTIONS                      //
    //=============================================================//

    /**
     * Initialize
     */
    function __ERC721WalletCapped_init() internal onlyInitializing {
       __ERC721WalletCapped_init_unchained();
    }

    /**
     * Initialize (unchained)
     */
    function __ERC721WalletCapped_init_unchained() internal onlyInitializing {
       defaultWalletMaxTokens = type(uint256).max;
    }

    /**
     * Set the maximum number of tokens for the wallet `wallet_` to `maxTokens_`
     * @param wallet_    Wallet address
     * @param maxTokens_ Maximum number of tokens
     */
    function _setWalletMaxTokens(
        address wallet_,
        uint256 maxTokens_
    ) internal {
        uint256 old_value = walletsMaxTokens[wallet_].maxTokens;

        WalletMaxTokens storage wallet_max_tokens = walletsMaxTokens[wallet_];

        wallet_max_tokens.isSet = true;
        wallet_max_tokens.maxTokens = maxTokens_;

        emit WalletMaxTokensChanged(wallet_, old_value, maxTokens_);
    }

    /**
     * Set the default wallet maximum number of tokens to `maxTokens_`
     * @param maxTokens_ Maximum number of tokens
     */
    function _setDefaultWalletMaxTokens(
        uint256 maxTokens_
    ) internal {
        uint256 old_value = defaultWalletMaxTokens;
        defaultWalletMaxTokens = maxTokens_;

        emit DefaultMaxTokensChanged(old_value, maxTokens_);
    }

    //=============================================================//
    //                    OVERRIDDEN FUNCTIONS                     //
    //=============================================================//

    /**
     * See {ERC721-_beforeTokenTransfer}
     */
    function _beforeTokenTransfer(
        address from_,
        address to_,
        uint256 firstTokenId_,
        uint256 batchSize_
    ) internal virtual override {
        super._beforeTokenTransfer(from_, to_, firstTokenId_, batchSize_);

        // Do not check address zero (in case of burning)
        if (to_ == address(0)) {
            return;
        }

        uint256 new_balance = balanceOf(to_) + batchSize_;

        WalletMaxTokens storage wallet_max_tokens = walletsMaxTokens[to_];
        if (wallet_max_tokens.isSet && new_balance > wallet_max_tokens.maxTokens) {
            revert WalletMaxTokensReachedError(wallet_max_tokens.maxTokens);
        } else if (new_balance > defaultWalletMaxTokens) {
            revert DefaultWalletMaxTokensReachedError(defaultWalletMaxTokens);
        }
    }
}
