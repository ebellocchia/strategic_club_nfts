import { BigNumber } from "ethers";

//
// Constants for testing
//
export const NULL_ADDRESS: string = "0x0000000000000000000000000000000000000000";
export const EMPTY_BYTES: string = "0x";
export const FEE_DENOMINATOR: number = 10000;
export const UINT256_MAX: BigNumber = BigNumber.from("115792089237316195423570985008687907853269984665640564039457584007913129639935");
export const TOKEN_NAME: string = "Strategic Club NFT Collection #2";
export const TOKEN_SYMBOL: string = "SCN2";
export const TOKEN_INITIAL_MAX_SUPPLY: number = 20;
export const TOKEN_INITIAL_BASE_URI: string = "test_uri/";
export const TOKEN_INITIAL_CONTRACT_URI: string = TOKEN_INITIAL_BASE_URI + "contract";
