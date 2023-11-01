# Description

ERC20 splitter for Strategic Club.

Split the ERC20 tokens received from NFTs minting or auctioning among different wallets with different percentages.

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

To deploy the contract:

    yarn deploy <NETWORK> --primary-addr <PRIMARY_ADDRESS> --secondary-addr <SECONDARY_ADDRESS>

To upgrade the contract:

    yarn upgrade-to <NETWORK> --proxy-addr <PROXY_ADDRESS>

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
