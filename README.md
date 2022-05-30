# YOKAI

Smart-contracts in Solidy for the Ethereum implementation of Yokai's NFTs.

## Contracts

Yokai : Main contract, implementation of the ERC721 token. Inerits from the ERC721Enumerable, Ownable and ERC2981 Openzeppelin contracts.


## Tests

The tests are performed in the `test` folder. `token_test.js` contains multiple tests scenarios concerning the main contract. You can find here the list of tests cases that have been currently passed. 

### Dependencies

@truffle/hdwallet-provider,
truffle,
truffle-assertions,
dotenv,
keccak256,
merkletreejs

### Yokai: security tests

Launch with the command : `truffle test`

- case01 - deployer transfer ownership to owner
- case02 - Alice tries to pass owners functions
- case03 - owner setPrice, setDefaultRoyalty, setMaxMintPerPerson, setWhitelistRoot
- case04 - Bob tries to mint before public while
- case05a - Bob tries to mint while not whitelisted with wrong proof
- case05b - Bob tries to mint while not whitelisted with alice's proof
- case06 - Alice tries to mint more than 1 token - depreciated
- case07 - Alice tries to mint without paying enough
- case08 - Alice mint 2 token while whitelisted
- case09 - owner start public sale
- case10 - Bob tries to mint without paying enough
- case11 - Bob mint 3 tokens
- case12 - Bob tries to mint more than 3 tokens
- case13 - Alice mint 1 more token (already have 2)
- case14 - Alice tries to mint 2 more token (already have 3)
- case15 - owner reveals

## Deployment

`truffle deploy`
