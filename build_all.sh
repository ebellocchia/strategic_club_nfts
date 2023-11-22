#!/bin/bash

cd strategic_club_erc20_splitter
yarn compile

cd ../strategic_club_nft_managers
yarn compile

cd ../strategic_club_nft_collection_1
yarn compile

cd ../strategic_club_nft_collection_2
yarn compile

cd ../strategic_club_tickets
yarn compile

cd ..
