// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//=============================================================//
//                           IMPORTS                           //
//=============================================================//
import "@openzeppelin/contracts-upgradeable/interfaces/IERC4906Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";


/**
 * @author Emanuele B. (@emanueleb88)
 * @title  ERC721 token that stores and handles a multiple URIs
 * @notice Both base URI and contract URI can be set. A custom URI for a specific token ID can also be set.
 *         URIs can be freezed to prevent future modifications.
 */
abstract contract ERC721MultipleURIStorageUpgradeable is
    Initializable,
    IERC4906Upgradeable,
    ERC721Upgradeable
{
    //=============================================================//
    //                          CONSTANTS                          //
    //=============================================================//

    /// Default name for contract metadata
    string constant private CONTRACT_DEFAULT_METADATA = "contract";

    //=============================================================//
    //                           STORAGE                           //
    //=============================================================//

    /// Flag to indicate if the URI is freezed or not
    bool public uriFreezed;
    /// Base URI
    string public baseURI;
    /// Contract URI
    string public contractURI;
    /// Mapping from token ID to specific token URI
    mapping(uint256 => string) private _tokenURIs;

    //=============================================================//
    //                           ERRORS                            //
    //=============================================================//

    /**
     * Error raised if URI is empty
     */
    error UriEmptyError();

    /**
     * Error raised if URI is freezed
     */
    error UriFreezedError();

    //=============================================================//
    //                           EVENTS                            //
    //=============================================================//

    /**
     * Event emitted when URI is freezed
     */
    event UriFreezed(
        string baseURI,
        string contractURI
    );

    /**
     * Event emitted when URI is changed
     */
    event UriChanged(
        string oldURI,
        string newURI
    );

    /**
     * Event emitted when a token URI is changed
     */
    event TokenUriChanged(
        uint256 tokenId,
        string oldURI,
        string newURI
    );

    //=============================================================//
    //                          MODIFIERS                          //
    //=============================================================//

    /**
     * Modifier to make a function callable only if the URI `uri_` is not empty
     * @param uri_ URI
     */
    modifier notEmptyURI(
        string memory uri_
    ) {
        if (bytes(uri_).length == 0) {
            revert UriEmptyError();
        }
        _;
    }

    /**
     * Modifier to make a function callable only when the URI is not freezed
     */
    modifier whenUnfreezedUri() {
        if (uriFreezed) {
            revert UriFreezedError();
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
    function __ERC721MultipleURIStorage_init(
        string memory baseURI_
    ) internal onlyInitializing {
        __ERC721MultipleURIStorage_init_unchained(baseURI_);
    }

    /**
     * Initialize (unchained)
     * @param baseURI_ Base URI
     */
    function __ERC721MultipleURIStorage_init_unchained(
        string memory baseURI_
    ) internal onlyInitializing {
        uriFreezed = false;

        _setBaseURI(baseURI_);
        _setContractURI(string(abi.encodePacked(baseURI_, CONTRACT_DEFAULT_METADATA)));
    }

    /**
     * Freeze URI
     */
    function _freezeURI() internal whenUnfreezedUri {
        uriFreezed = true;

        emit UriFreezed(baseURI, contractURI);
    }

    /**
     * Set base URI to `baseURI_`
     * @param baseURI_ Base URI
     */
    function _setBaseURI(
        string memory baseURI_
    ) internal whenUnfreezedUri {
        string memory old_uri = baseURI;
        baseURI = baseURI_;

        emit UriChanged(old_uri, baseURI);

        _updateEntireCollectionMetadata();
    }

    /**
     * Set contract URI to `contractURI_`
     * @param contractURI_ Contract URI
     */
    function _setContractURI(
        string memory contractURI_
    ) internal whenUnfreezedUri {
        string memory old_uri = contractURI;
        contractURI = contractURI_;

        emit UriChanged(old_uri, contractURI);
    }

    /**
     * Set URI of token ID `tokenId_` to `tokenURI_`
     * @param tokenId_  Token ID
     * @param tokenURI_ Token URI
     */
    function _setTokenURI(
        uint256 tokenId_,
        string memory tokenURI_
    ) internal whenUnfreezedUri {
        string memory old_uri = _tokenURIs[tokenId_];
        _tokenURIs[tokenId_] = tokenURI_;

        emit TokenUriChanged(tokenId_, old_uri, tokenURI_);

        _updateSingleTokenMetadata(tokenId_);
    }

    /**
     * Reset URI of token ID `tokenId_` (empty string)
     * @param tokenId_ Token ID
     */
    function _resetTokenURI(
        uint256 tokenId_
    ) internal whenUnfreezedUri {
        string memory old_uri = _tokenURIs[tokenId_];
        _tokenURIs[tokenId_] = "";

        emit TokenUriChanged(tokenId_, old_uri, "");

        _updateSingleTokenMetadata(tokenId_);
    }

    /**
     * Update metadata of token `tokenId_`
     * @param tokenId_ Token ID
     */
    function _updateSingleTokenMetadata(
        uint256 tokenId_
    ) internal {
        emit MetadataUpdate(tokenId_);
    }

    /**
     * Update metadata of the entire collection
     */
    function _updateEntireCollectionMetadata() internal {
        emit BatchMetadataUpdate(0, type(uint256).max);
    }

    //=============================================================//
    //                    OVERRIDDEN FUNCTIONS                     //
    //=============================================================//

    /**
     * See {ERC721-_baseURI}
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    /**
     * See {ERC721-tokenURI}.
     */
    function tokenURI(
        uint256 tokenId_
    ) public view virtual override returns (string memory) {
        string memory token_uri = _tokenURIs[tokenId_];
        if (bytes(token_uri).length > 0) {
            return token_uri;
        }
        return super.tokenURI(tokenId_);
    }
}
