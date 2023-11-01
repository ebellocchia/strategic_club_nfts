// SPDX-License-Identifier: MIT

//
// Strategic Club (https://strategicclub.io/)
//
//                                    ..:^^~!!777????????777!!~^^:..
//                               .:^!!7????????????????????????????7!!^:.
//                           :^!7????????????????????????????????????????7!^:
//                       .^!7????????????????????????????????????????????????7!^.
//                    .^!????????????????????????????????????????????????????????!^.
//                  :!??????????????????????????????????????????????????????????????!:
//               .^7??????????????????????????????????????????????????????????????????7^.
//             .~7??????????????????????????????????????????????????????????????????????7~.
//            ^7????????????????7~!???????77???7777777????????????????????????????????????7^
//          :7?????????????????!:::~7???7^::~7^:::::::^^^^~!7???????????????????????????????7:
//         ~???????????????????7:::::^^~~::::^^:::::::::::::^~7???????????????????????????????~
//       .!?????????????????????7::::::::::::::::::::::::::::::^!??????????????????????????????!.
//      :7?????????????????????!^::::::::::::::::::::::::::::::::^!?????????????????????????????7:
//     :??????????????????????~:::::::::::::::::::^^::::::::::::^5^^7?????????????????????????????:
//    :??????????????????????~:::::::::::::::::::JG::::::..::..:~#5.:!?????????????????????????????:
//   .7??????????????????????~:::~~::::::::::::::B@?~^~7??YPPJJP&B7:::~????????????????????????????7.
//   !?????????????????????7~::::::::::::::::::::~5##&@@@@@@@@@@B^:::::~????????????????????????????!
//  :????????????????????7~:::::::::::::::::::::::^?G@@@@@@@@@@5^:::::::7????????????????????????????:
//  !???????????????????~:::::::::::::::::::::::::Y@@@@@@@@@@@@&?:::::::~????????????????????????????!
// :????????????????????!::::::::::::::::::::::::.~G#&@@@@@@@@@@@5::::::^?????????????????????????????:
// ~?????????????????????7~^:::::::^^^^:::::::^~?5B&@@@@@@@@@@@@@@Y::::::?????????????????????????????~
// 7????????????????????????7777777G&&##BBBBBB#&@@@@@@@@@@@@@@@@@@#^:::::7????????????????????????????7
// ???????????????????????????????P@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&^::::^??????????????????????????????
// ??????????????????????????????Y@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#:::::~??????????????????????????????
// ?????????????????????????????7P@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@~::::7??????????????????????????????
// 7????????????????????????????7Y@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@5::::^??????????????????????????????7
// ~????????????????????????????G&@@@#BPPGB&@@@@@@@@@@@@@@@@@@@@@Y:::::7??????????????????????????????~
// :???????????????????????????J@@@BY^:::::7@@@#P#@@@@@@@@@#&@@@J.::::~???????????????????????????????:
//  !?????????????????????????7P@@P7?!:::::~&@G^.!@@&YYPPY7:7@@B:::::^???????????????????????????????!
//  :?????????????????????????5@@&?777^.:::7@@Y::!@@5........B@#^:::^7???????????????????????????????:
//   !???????????????????????7Y@@@PY5PGPGBB#@@@&&@@@&#BBGGP55@@@Y~^^7???????????????????????????????!
//   .7?????????????????77?JYPB@@@@@@@&&##BGGPP555YYY5555555P5PPGGPGGPP5YJJ????????????????????????7.
//    :????????????????J5G#&&#GPYJ?7!~~^^:::::::::::::::::::::::::^^^~~!77???77????????????????????:
//     :????????????YPGG5J7!^^:::::^^^^^~~~~~~~~~~~~~!!~~~~~~~~~~~~^^^^^^::::^^^^~!!7?????????????:
//      :7???????7?J?7~^^~~~!!777777????????????????????????????????????77777!!!~~~^^~~!77??????7:
//       .!?????7!!!77???????????????????????????????????????????????????????????????777!!7????!.
//         ~??????????????????????????????????????????????????????????????????????????????????~
//          :7??????????????????????????????????????????????????????????????????????????????7:
//            ^7??????????????????????????????????????????????????????????????????????????7^
//             .~7??????????????????????????????????????????????????????????????????????7~.
//               .^7??????????????????????????????????????????????????????????????????7^.
//                  :!??????????????????????????????????????????????????????????????!:
//                    .^!????????????????????????????????????????????????????????!^.
//                       .^!7????????????????????????????????????????????????7!^.
//                           :^!7????????????????????????????????????????7!^:
//                               .:^!!7????????????????????????????7!!^:.
//                                    ..:^^~!!777????????777!!~^^:..
//

pragma solidity ^0.8.0;

//=============================================================//
//                            IMPORTS                          //
//=============================================================//
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "./libs/ERC1155AutoIdUpgradeable.sol";
import "./libs/ERC1155MultipleURIStorageUpgradeable.sol";
import "./libs/ERC1155NameSymbolUpgradeable.sol";
import "./libs/ERC1155SelectivePausableUpgradeable.sol";
import "./libs/ERC1155WalletCappedUpgradeable.sol";


/**
 * @author Emanuele (@emanueleb88)
 * @title  Strategic Club NFT Collection 2
 */
contract StrategicClubNftCollection2 is
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ERC2981Upgradeable,
    ERC1155Upgradeable,
    ERC1155AutoIdUpgradeable,
    ERC1155MultipleURIStorageUpgradeable,
    ERC1155NameSymbolUpgradeable,
    ERC1155SelectivePausableUpgradeable,
    ERC1155WalletCappedUpgradeable
{
    //=============================================================//
    //                           CONSTANTS                         //
    //=============================================================//

    /// NFT name
    string constant private NFT_NAME = "Strategic Club NFT Collection #2";
    /// NFT symbol
    string constant private NFT_SYMBOL = "SCN2";

    //=============================================================//
    //                           ERRORS                            //
    //=============================================================//

    /**
     * Error raised if minting by ID a not existent token
     * @param tokenId Token ID
     */
    error NotExistentTokenMintError(
        uint256 tokenId
    );

    /**
     * Error raised if burning zero tokens
     */
    error ZeroTokensBurnError();

    /**
     * Error raised if minting zero tokens
     */
    error ZeroTokensMintError();

    //=============================================================//
    //                             EVENTS                          //
    //=============================================================//

    /**
     * Event emitted when a single token is minted
     * @param to      Target address
     * @param tokenId Token ID
     * @param amount  Token amount
     */
    event SingleTokenMinted(
        address to,
        uint256 tokenId,
        uint256 amount
    );

    /**
     * Event emitted when multiple tokens are minted
     * @param to           Target address
     * @param startTokenId Start token IDs
     * @param tokenNum     Number of tokens
     * @param amounts      Token amounts
     */
    event MultipleTokensMinted(
        address to,
        uint256 startTokenId,
        uint256 tokenNum,
        uint256[] amounts
    );

    /**
     * Event emitted when a single token is burned
     * @param from    Target address
     * @param tokenId Token ID
     * @param amount  Token amount
     */
    event SingleTokenBurned(
        address from,
        uint256 tokenId,
        uint256 amount
    );

    /**
     * Event emitted when a multiple tokens are burned
     * @param from     Destination address
     * @param tokenIds Token IDs
     * @param amounts  Token amounts
     */
    event MultipleTokensBurned(
        address from,
        uint256[] tokenIds,
        uint256[] amounts
    );

    /**
     * Event emitted when default royalty is set
     * @param receiver    Receiver address
     * @param feeFraction Fee fraction
     */
    event DefaultRoyaltySet(
        address receiver,
        uint256 feeFraction
    );

    /**
     * Event emitted when default royalty is deleted
     */
    event DefaultRoyaltyDeleted();

    //=============================================================//
    //                          CONSTRUCTOR                        //
    //=============================================================//

    /**
     * Constructor
     * @dev Disable initializer for implementation contract
     */
    constructor() {
        _disableInitializers();
    }

    //=============================================================//
    //                       PUBLIC FUNCTIONS                      //
    //=============================================================//

    /**
     * Initialize
     * @param baseURI_ Base URI
     */
    function init(
        string memory baseURI_
    ) public initializer {
        __ERC1155AutoId_init();
        __ERC1155MultipleURIStorage_init(baseURI_);
        __ERC1155NameSymbolUpgradeable_init(NFT_NAME, NFT_SYMBOL);
        __ERC1155SelectivePausable_init();
        __ERC1155WalletCapped_init();

        __ERC1155_init("");
        __ERC2981_init();
        __Ownable_init();
    }

    //
    // Mint/Burn
    //

    /**
     * Mint `amount_` tokens to `to_`
     * @param to_     Receiver address
     * @param amount_ Token amount
     */
    function mintTo(
        address to_,
        uint256 amount_
    ) public onlyOwner {
        if (amount_ == 0) {
            revert ZeroTokensMintError();
        }

        _mintTo(to_, amount_, "");

        emit SingleTokenMinted(to_, totalSupply() - 1, amount_);
    }

    /**
     * Mint `amount_` tokens of token ID `tokenId_` to `to_` (token ID `tokenId_` shall be already minted)
     * @param to_      Receiver address
     * @param tokenId_ Token ID
     * @param amount_  Token amount
     */
    function mintToById(
        address to_,
        uint256 tokenId_,
        uint256 amount_
    ) public onlyOwner {
        if (amount_ == 0) {
            revert ZeroTokensMintError();
        }
        if ((totalSupply() == 0) || (tokenId_ > totalSupply())) {
            revert NotExistentTokenMintError(tokenId_);
        }

        _mint(to_, tokenId_, amount_, "");

        emit SingleTokenMinted(to_, tokenId_, amount_);
    }

    /**
     * Mint `amounts_` of different tokens to `to_`
     * @param to_      Receiver address
     * @param amounts_ Amount for each token
     */
    function mintBatchTo(
        address to_,
        uint256[] memory amounts_
    ) public onlyOwner {
        uint256 tokens_num = amounts_.length;
        for (uint256 i = 0; i < tokens_num; i++) {
            if (amounts_[i] == 0) {
                revert ZeroTokensMintError();
            }
        }

        _mintBatchTo(to_, amounts_, "");

        emit MultipleTokensMinted(to_, totalSupply() - tokens_num, tokens_num, amounts_);
    }

    /**
     * Burn `amount_` tokens of token `id_` from `from_`
     * @param from_   Target address
     * @param id_     Token ID
     * @param amount_ Token amount
     */
    function burn(
        address from_,
        uint256 id_,
        uint256 amount_
    ) public onlyOwner {
        if (amount_ == 0) {
            revert ZeroTokensBurnError();
        }

        _burn(from_, id_, amount_);

        emit SingleTokenBurned(from_, id_, amount_);
    }

    /**
     * Burn `amounts_` tokens of token `ids_` from `from_`
     * @param from_    Target address
     * @param ids_     Token IDs
     * @param amounts_ Token amounts
     */
    function burnBatch(
        address from_,
        uint256[] memory ids_,
        uint256[] memory amounts_
    ) public onlyOwner {
        for (uint256 i = 0; i < amounts_.length; i++) {
            if (amounts_[i] == 0) {
                revert ZeroTokensBurnError();
            }
        }

        _burnBatch(from_, ids_, amounts_);

        emit MultipleTokensBurned(from_, ids_, amounts_);
    }

    //
    // URIs management
    //

    /**
     * Set base URI to `baseUri_`
     * @param baseUri_ URI
     */
    function setBaseURI(
        string memory baseUri_
    ) public onlyOwner notEmptyURI(baseUri_) {
        _setBaseURI(baseUri_);
        _updateEntireCollectionMetadata();
    }

    /**
     * Set contract URI to `contractURI_`
     * @param contractURI_ Contract URI
     */
    function setContractURI(
        string memory contractURI_
    ) public onlyOwner notEmptyURI(contractURI_) {
        _setContractURI(contractURI_);
    }

    /**
     * Set URI of token ID `tokenId_` to `tokenURI_`
     * @param tokenId_  Token ID
     * @param tokenURI_ Token URI
     */
    function setTokenURI(
        uint256 tokenId_,
        string memory tokenURI_
    ) public onlyOwner notEmptyURI(tokenURI_) {
        _setTokenURI(tokenId_, tokenURI_);
    }

    /**
     * Reset URI of token ID `tokenId_` (empty string)
     * @param tokenId_ Token ID
     */
    function resetTokenURI(
        uint256 tokenId_
    ) public onlyOwner {
        _resetTokenURI(tokenId_);
    }

    /**
     * Freeze URI
     */
    function freezeURI() public onlyOwner {
        _freezeURI();
    }

    //
    // Maximum tokens per wallet management
    //

    /**
     * Set the maximum number of token `tokenId_` for the wallet `wallet_` to `maxTokens_`
     * @param wallet_    Wallet address
     * @param tokenId_   Token ID
     * @param maxTokens_ Maximum number of tokens
     */
    function setWalletMaxTokens(
        address wallet_,
        uint256 tokenId_,
        uint256 maxTokens_
    ) public onlyOwner {
        _setWalletMaxTokens(wallet_, tokenId_, maxTokens_);
    }

    /**
     * Set the default wallet maximum number of token `tokenId_` to `maxTokens_`
     * @param tokenId_   Token ID
     * @param maxTokens_ Maximum number of tokens
     */
    function setDefaultWalletMaxTokens(
        uint256 tokenId_,
        uint256 maxTokens_
    ) public onlyOwner {
        _setDefaultWalletMaxTokens(tokenId_, maxTokens_);
    }

    //
    // Pause management
    //

    /**
     * Set the status of paused wallet `wallet_` to `status_`
     * @param wallet_ Wallet address
     * @param status_ True if wallet cannot transfer tokens, false otherwise
     */
    function setPausedWallet(
        address wallet_,
        bool status_
    ) public onlyOwner {
        _setPausedWallet(wallet_, status_);
    }

    /**
     * Set the status of unpaused wallet `wallet_` to `status_`
     * @param wallet_ Wallet address
     * @param status_ True if wallet can transfer tokens when paused, false otherwise
     */
    function setUnpausedWallet(
        address wallet_,
        bool status_
    ) public onlyOwner {
        _setUnpausedWallet(wallet_, status_);
    }

    /**
     * Pause token transfers
     */
    function pauseTransfers() public onlyOwner {
        _pause();
    }

    /**
     * Unpause token transfers
     */
    function unpauseTransfers() public onlyOwner {
        _unpause();
    }

    //
    // Royalties management
    //

    /**
     * Set the royalty information that all ids in this contract will default to
     * @param receiver_    Receiver address
     * @param feeFraction_ Fee fraction
     */
    function setDefaultRoyalty(
        address receiver_,
        uint96 feeFraction_
    ) public onlyOwner {
        _setDefaultRoyalty(receiver_, feeFraction_);

        emit DefaultRoyaltySet(receiver_, feeFraction_);
    }

    /**
     * Delete default royalty information
     */
    function deleteDefaultRoyalty() public onlyOwner {
        _deleteDefaultRoyalty();

        emit DefaultRoyaltyDeleted();
    }

    //=============================================================//
    //                    OVERRIDDEN FUNCTIONS                     //
    //=============================================================//

    /**
     * Restrict upgrade to owner
     * See {UUPSUpgradeable-_authorizeUpgrade}
     */
    function _authorizeUpgrade(
        address newImplementation_
    ) internal override onlyOwner {
    }

    /**
     * See {ERC1155-_beforeTokenTransfer}
     */
    function _beforeTokenTransfer(
        address operator_,
        address from_,
        address to_,
        uint256[] memory ids_,
        uint256[] memory amounts_,
        bytes memory data_
    ) internal virtual override(ERC1155WalletCappedUpgradeable, ERC1155SelectivePausableUpgradeable, ERC1155Upgradeable) {
        super._beforeTokenTransfer(operator_, from_, to_, ids_, amounts_, data_);
    }

    /**
     * See {ERC1155-uri}
     */
    function uri(
        uint256 tokenId_
    ) public view virtual override(ERC1155MultipleURIStorageUpgradeable, ERC1155Upgradeable) returns (string memory) {
        return super.uri(tokenId_);
    }

    /**
     * See {IERC165-supportsInterface}
     */
    function supportsInterface(
        bytes4 interfaceId_
    ) public view virtual override(ERC1155Upgradeable, ERC2981Upgradeable, IERC165Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId_);
    }
}
