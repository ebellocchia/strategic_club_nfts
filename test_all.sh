#!/bin/bash

cd strategic_club_erc20_splitter
yarn test

cd ../strategic_club_nft_managers
yarn test

cd ../strategic_club_nft_collection_1
yarn test

cd ../strategic_club_nft_collection_2
yarn test

cd ../strategic_club_tickets
yarn test

cd ..
