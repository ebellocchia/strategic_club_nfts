#
# Imports
#
import argparse
import shutil
from pathlib import Path


#
# Constants
#

OUTPUT_DIR_NAME: str = "metadata"
METADATA_TEMPLATE: str = """{{
    "name": "Strategic Club NFT #{token_id}",
    "description": "Strategic Club NFT Collection #2",
    "external_url": "https://strategicclub.io",
    "image": "ipfs://{image_ipfs_id}/{token_id}.png",
    "attributes": [
        {{
          "trait_type": "Group",
          "value": "Strategic Club"
        }}
    ]
}}
"""
CONTRACT_METADATA_TEMPLATE: str = """{{
    "name": "Strategic Club NFT Collection #2",
    "description": "Strategic Club NFT Collection #2",
    "external_url": "https://strategicclub.io",
    "image": "ipfs://{image_ipfs_id}/contract.png"
}}

"""


#
# Functions
#

def CreateOutputFolder() -> None:
    print("Creating output folder...")

    try:
        shutil.rmtree(OUTPUT_DIR_NAME)
    except FileNotFoundError:
        pass
    Path(OUTPUT_DIR_NAME).mkdir(parents=True, exist_ok=True)


def ValidateArguments(args: argparse.Namespace) -> None:
    if args.token_num <= 0:
        raise ValueError("Invalid number of tokens")


def ParseArguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--ipfs",
        type=str,
        required=True,
        help="IPFS folder CID"
    )
    parser.add_argument(
        "--token-num",
        type=int,
        required=True,
        help="Number of tokens"
    )

    args = parser.parse_args()
    ValidateArguments(args)

    return args


def CreateContractMetadataFile(ipfs: str) -> None:
    print("Creating metadata for token contract...")
    with open(Path(OUTPUT_DIR_NAME) / "contract", "w") as fout:
        fout.write(
            CONTRACT_METADATA_TEMPLATE.format(
                image_ipfs_id=ipfs
            )
        )


def CreateMetadataFiles(ipfs: str,
                        token_num: int) -> None:
    for token_id in range(0, token_num):
        print(f"Creating metadata for token #{token_id}...")
        with open(Path(OUTPUT_DIR_NAME) / str(token_id), "w") as fout:
            fout.write(
                METADATA_TEMPLATE.format(
                    image_ipfs_id=ipfs,
                    token_id=token_id
                )
            )


#
# Main
#

def main() -> None:
    CreateOutputFolder()
    args = ParseArguments()

    CreateMetadataFiles(args.ipfs, args.token_num)
    CreateContractMetadataFile(args.ipfs)


#
# Execute main
#

if __name__ == "__main__":
    main()
