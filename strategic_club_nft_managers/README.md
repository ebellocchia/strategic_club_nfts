# Introduction

NFTs manager for Strategic Club:

- `StrategicClubNftsAuction`: it allows to auction ERC721 or ERC1155 tokens by paying in ERC20 tokens (e.g. stablecoins)
- `StrategicClubNftsMinter`: it allows to mint ERC721 or ERC1155 tokens by paying in ERC20 tokens (e.g. stablecoins)
- `StrategicClubNftsRedeemer`: it allows to reserve a ERC721 or ERC1155 token for a specific wallet, which can redeem it by paying in ERC20 tokens (e.g. stablecoins)

# Setup

Install `yarn` if not installed:

    npm install -g yarn

## Install package

Simply run:

    npm i --include=dev

## Compile

- To compile the contract:

        yarn compile

- To compile by starting from a clean build:

        yarn recompile

## Run tests

- To run tests without coverage:

        yarn test

- To run tests with coverage:

        yarn coverage

## Deploy

To deploy all contracts:

    yarn deploy-all <NETWORK> --wallet-addr <WALLET_ADDRESS>

To deploy the `StrategicClubNftsAuction` contract:

    yarn deploy-auction <NETWORK> --wallet-addr <WALLET_ADDRESS>

To deploy the `StrategicClubNftsRedeemer` contract:

    yarn deploy-redeemer <NETWORK> --wallet-addr <WALLET_ADDRESS>

To deploy the `StrategicClubNftsMinter` contract:

    yarn deploy-minter <NETWORK> --wallet-addr <WALLET_ADDRESS>

To upgrade the `StrategicClubNftsAuction` contract:

    yarn upgrade-auction-to <NETWORK> --proxy-addr <PROXY_ADDRESS>

To upgrade the `StrategicClubNftsRedeemer` contract:

    yarn upgrade-redeemer-to <NETWORK> --proxy-addr <PROXY_ADDRESS>

To upgrade the `StrategicClubNftsMinter` contract:

    yarn upgrade-minter-to <NETWORK> --proxy-addr <PROXY_ADDRESS>

To deploy the test tokens (i.e. `MockERC20Token`,  `MockERC721Token`,  `MockERC1155Token`):

    yarn deploy-test-tokens <NETWORK> --erc20-supply <ERC20_SUPPLY>

## Configuration

Hardhat is configured with the following networks:

|Network name|Description|
|---|---|
|`hardhat`|Hardhat built-in network|
|`locahost`|Localhost network (address: `127.0.0.1:8545`, it can be run with the following command: `yarn run-node`)|
|`bscTestnet`|Zero address|
|`bsc`|BSC mainnet|
|`ethereumSepolia`|ETH testnet (Sepolia)|
|`ethereum`|ETH mainnet|
|`polygonMumbai`|Polygon testnet (Mumbai)|
|`polygon`|Polygon mainnet|

The API keys, RPC nodes and mnemonic shall be configured in the `.env` file.\
You may need to modify the gas limit and price in the Hardhat configuration file for some networks (e.g. Polygon), to successfully execute the transactions (you'll get a gas error).
