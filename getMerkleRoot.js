// Script to build the whitelist
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

let whitelist = [
    "0xD58544Bb5a96EFA3117FfD54dc2E006f01A5F8cE",
    "0x2bc4862403518956E7130ceaEc75fB443e85Bd42",
    "0x8eF2959f1E7c7C497f99e318E2d64c1E98613E9b"
]
const hashedAddresses = whitelist.map(addr => keccak256(addr));
const merkleTree = new MerkleTree(hashedAddresses, keccak256, { sortPairs: true });
var root = merkleTree.getHexRoot();
console.log(root);