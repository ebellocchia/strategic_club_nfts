// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//=============================================================//
//                           IMPORTS                           //
//=============================================================//
import "./ERC721MultipleURIStorageUpgradeable.sol";


/**
 * @author Emanuele B. (@emanueleb88)
 * @title  ERC721 token that stores and handles a single URI with the possibility to reveal it
 * @notice URIs can be revealed all in one go or one by one
 */
abstract contract ERC721RevealableMultipleURIStorageUpgradeable is
    Initializable,
    ERC721MultipleURIStorageUpgradeable
{
    //=============================================================//
    //                          CONSTANTS                          //
    //=============================================================//

    /// Default name for unrevealed URI metadata
    string constant private UNREVEALED_DEFAULT_METADATA = "unrevealed";

    //=============================================================//
    //                           STORAGE                           //
    //=============================================================//

    /// Mapping from token ID to revealed flag
    /// If true, the URI of the specific token ID is revealed
    mapping(uint256 => bool) public tokenURIsRevealed;
    /// Flag to indicate if URIs revealing is enabled or not
    bool public revealingURIsEnabled;
    /// Flag to indicate if all URIs are revealed or not
    bool public allURIsRevealed;
    /// Unrevealed URI
    string public unrevealedURI;

    //=============================================================//
    //                           ERRORS                            //
    //=============================================================//

    /**
     * Error raised if URIs revealing is enabled
     */
    error URIsRevealingEnabledError();

    /**
     * Error raised if all URIs are revealed
     * @param tokenId Token ID
     */
    error SingleURIRevealedError(
        uint256 tokenId
    );

    /**
     * Error raised if all URIs are revealed
     */
    error AllURIsRevealedError();

    //=============================================================//
    //                           EVENTS                            //
    //=============================================================//

    /**
     * Event emitted when URIs revealing is enabled
     */
    event URIsRevealingEnabled();

    /**
     * Event emitted when URIs revealing is disabled
     */
    event URIsRevealingDisabled();

    /**
     * Event emitted when the URI of token `tokenId` is revealed
     * @param tokenId Token ID
     */
    event SingleURIRevealed(
        uint256 tokenId
    );

    /**
     * Event emitted when the URI of token `tokenId` is unrevealed
     * @param tokenId Token ID
     */
    event SingleURIUnrevealed(
        uint256 tokenId
    );

    /**
     * Event emitted when all URIs are revealed
     */
    event AllURIsRevealed();

    //=============================================================//
    //                          MODIFIERS                          //
    //=============================================================//

    /**
     * Modifier to make a function callable only when URIs revealing is enabled
     */
    modifier whenURIsRevealingEnabled() {
        if (!revealingURIsEnabled) {
            revert URIsRevealingEnabledError();
        }
        _;
    }

    /**
     * Modifier to make a function callable only when all URIs are not revealed
     */
    modifier whenNotAllURIsAreRevealed() {
        if (allURIsRevealed) {
            revert AllURIsRevealedError();
        }
        _;
    }

    //=============================================================//
    //                     INTERNAL FUNCTIONS                      //
    //=============================================================//

    /**
     * Initialize
     * @param baseURI_ Base URI
     */
    function __ERC721RevealableMultipleURIStorage_init(
        string memory baseURI_
    ) internal onlyInitializing {
        __ERC721MultipleURIStorage_init_unchained(baseURI_);
        __ERC721RevealableMultipleURIStorage_init_unchained(baseURI_);
    }
    /**
     * Initialize (unchained)
     * @param baseURI_ Base URI
     */
    function __ERC721RevealableMultipleURIStorage_init_unchained(
        string memory baseURI_
    ) internal onlyInitializing {
        allURIsRevealed = false;
        revealingURIsEnabled = false;

        _setUnrevealedURI(string(abi.encodePacked(baseURI_, UNREVEALED_DEFAULT_METADATA)));
    }

    /**
     * Set unrevealed URI to `unrevealedURI_`
     * @param unrevealedURI_ Unrevealed URI
     */
    function _setUnrevealedURI(
        string memory unrevealedURI_
    ) internal whenNotAllURIsAreRevealed {
        string memory old_uri = unrevealedURI;
        unrevealedURI = unrevealedURI_;

        emit UriChanged(old_uri, unrevealedURI);

        _updateEntireCollectionMetadata();
    }

    /**
     * Enable revealing URIs
     */
    function _enableURIsRevealing() internal whenNotAllURIsAreRevealed {
        if (revealingURIsEnabled) {
            revert URIsRevealingEnabledError();
        }

        revealingURIsEnabled = true;

        emit URIsRevealingEnabled();
    }

    /**
     * Disable revealing URIs
     */
    function _disableURIsRevealing() internal whenNotAllURIsAreRevealed {
        if (!revealingURIsEnabled) {
            revert URIsRevealingEnabledError();
        }

        revealingURIsEnabled = false;

        emit URIsRevealingDisabled();
    }

    /**
     * Reveal URI of single token `tokenId_`
     * @param tokenId_ Token ID
     */
    function _revealSingleURI(
        uint256 tokenId_
    ) internal whenURIsRevealingEnabled whenNotAllURIsAreRevealed {
        if (tokenURIsRevealed[tokenId_]) {
            revert SingleURIRevealedError(tokenId_);
        }

        tokenURIsRevealed[tokenId_] = true;

        emit SingleURIRevealed(tokenId_);

        _updateSingleTokenMetadata(tokenId_);
    }

    /**
     * Unreveal URI of single token `tokenId_`
     * @param tokenId_ Token ID
     */
    function _unrevealSingleURI(
        uint256 tokenId_
    ) internal whenURIsRevealingEnabled whenNotAllURIsAreRevealed {
        if (!tokenURIsRevealed[tokenId_]) {
            revert SingleURIRevealedError(tokenId_);
        }

        tokenURIsRevealed[tokenId_] = false;

        emit SingleURIUnrevealed(tokenId_);

        _updateSingleTokenMetadata(tokenId_);
    }

    /**
     * Reveal all URIs
     */
    function _revealAllURIs() internal whenURIsRevealingEnabled whenNotAllURIsAreRevealed {
        allURIsRevealed = true;

        emit AllURIsRevealed();

        _updateEntireCollectionMetadata();
    }

    //=============================================================//
    //                    OVERRIDDEN FUNCTIONS                     //
    //=============================================================//

    /**
     * See {ERC721-tokenURI}
     */
    function tokenURI(
        uint256 tokenId_
    ) public view virtual override returns (string memory) {
        if (!allURIsRevealed && !tokenURIsRevealed[tokenId_]) {
            return unrevealedURI;
        }
        return super.tokenURI(tokenId_);
    }
}
