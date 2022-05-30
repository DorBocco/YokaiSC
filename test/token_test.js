const Yokai = artifacts.require('Yokai');
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

contract('Yokai: security tests', (accounts) => {
    it('passes tests', async () => {
        const deployer = accounts[0];
        const owner = accounts[1];
        const alice = accounts[2];
        const bob = accounts[3];
        const royaltyReceiver = accounts[4];
        const saleReceiver = accounts[5];
        const u1 = accounts[6];
        const u2 = accounts[7];
        const u3 = accounts[8];
        const u4 = accounts[9];
        const u5 = accounts[10];
        const u6 = accounts[11];
        const u7 = accounts[12];
        const u8 = accounts[13];

        let whitelist = [
            alice,
            u1, u2, u3, u4, u5, u6, u7, u8,
        ]
        const hashedAddresses = whitelist.map(addr => keccak256(addr));
        const merkleTree = new MerkleTree(hashedAddresses, keccak256, { sortPairs: true });
        const root = merkleTree.getHexRoot();
        console.log("ROOT : ", root);
        
        const txParams = {
            from: deployer
        };
        const token = await Yokai.new("initialURI", saleReceiver, txParams);

        // case01 - deployer transfer ownership to owner
        await token.transferOwnership(owner, { from: deployer });
        assert.equal(await token.owner(), owner, "Failed case01");

        // case02 - Alice tries to pass owners functions
        await truffleAssert.fails(token.setDefaultRoyalty(alice, 20, { from: alice}));
        await truffleAssert.fails(token.toggleReveal("bob", { from: alice}));
        await truffleAssert.fails(token.switchSaleType({ from: alice}));
        await truffleAssert.fails(token.setPrice(1, { from: alice}));

        // case03 - owner setPrice, setDefaultRoyalty, setMaxMintPerPerson, setWhitelistRoot
        await token.setDefaultRoyalty(royaltyReceiver, 200, { from: owner});
        console.log("royalty 1 : ", await token.royaltyInfo(1, 100));
        console.log("royalty 2 : ", await token.royaltyInfo(2, 100));
        // assert.equal(await token.royaltyInfo(1, 100), {0: royaltyReceiver, 1: 2}, "Case03: incorrect royalty");
        // assert.equal(await token.royaltyInfo(2, 100), {0: royaltyReceiver, 1: 2}, "Case03: incorrect royalty");
        await token.setPrice(web3.utils.toBN(10000000000000000000), { from: owner});
        assert.equal(await token.tokenPrice(), 10000000000000000000, "Case03: incorrect price");
        await token.setMaxMintPerPerson(3, { from: owner});
        assert.equal(await token.MINT_PER_PERS(), 3, "Case03: incorrect max mint per person");
        await token.setWhitelistRoot(root, { from: owner});

        // case04 - Bob tries to mint before public while
        await truffleAssert.fails(token.mint(1, { from: bob, value: 10000000000000000000 }));

        // case05a - Bob tries to mint while not whitelisted with wrong proof
        var hashedAddress = keccak256(bob);
        var proof = merkleTree.getHexProof(hashedAddress);
        await truffleAssert.fails(token.whitelistMint(proof, 1, { from: bob, value: 10000000000000000000 }));

        // case05b - Bob tries to mint while not whitelisted with alice's proof
        var hashedAddress = keccak256(alice);
        var proof = merkleTree.getHexProof(hashedAddress);
        await truffleAssert.fails(token.whitelistMint(proof, 1, { from: bob, value: 10000000000000000000 }));

        // case06 - Alice tries to mint more than 1 token - depreciated
        // await truffleAssert.fails(token.whitelistMint(proof, 2, { from: alice, value: (10000000000000000000*3) }));

        // case07 - Alice tries to mint without paying enough
        await truffleAssert.fails(token.whitelistMint(proof, 1, { from: alice, value: 1000000000000000000 }));

        // case08 - Alice mint 2 token while whitelisted
        let receiverOldBalance = await web3.eth.getBalance(saleReceiver);
        await token.whitelistMint(proof, 2, { from: alice, value: 10000000000000000000*2 });
        assert.equal(await token.balanceOf(alice), 2, "Case08: Token not minted");
        let receiverNewBalance = await web3.eth.getBalance(saleReceiver);
        let totalSup = await token.totalSupply();
        console.log("Case08: Balance before : ", receiverOldBalance);
        console.log("Case08: Balance after  : ", receiverNewBalance);
        console.log("Case08 : Total supply : ", totalSup);

        // case09 - owner start public sale
        await truffleAssert.passes(token.switchSaleType({ from: owner }));

        // case10 - Bob tries to mint without paying enough
        await truffleAssert.fails(token.mint(1, { from: bob, value: 100000000000000000 }));

        // case11 - Bob mint 3 tokens
        receiverOldBalance = await web3.eth.getBalance(saleReceiver);
        await token.mint(3, { from: bob, value: (10000000000000000000*3) });
        assert.equal(await token.balanceOf(bob), 3, "Failed case11");
        receiverNewBalance = await web3.eth.getBalance(saleReceiver);
        console.log("Case11: Balance before : ", receiverOldBalance);
        console.log("Case11: Balance after  : ", receiverNewBalance);

        // case12 - Bob tries to mint more than 3 tokens
        await truffleAssert.fails(token.mint(5, { from: bob, value: (10000000000000000000*5) }));

        // case13 - Alice mint 1 more token (already have 2)
        receiverOldBalance = await web3.eth.getBalance(saleReceiver);
        await token.mint(1, { from: alice, value: 10000000000000000000 });
        assert.equal(await token.balanceOf(alice), 3, "Failed case13");
        receiverNewBalance = await web3.eth.getBalance(saleReceiver);
        console.log("Case13: Balance before : ", receiverOldBalance);
        console.log("Case13: Balance after  : ", receiverNewBalance);

        // case14 - Alice tries to mint 2 more token (already have 3)
        await truffleAssert.fails(token.mint(2, { from: alice, value: (10000000000000000000*2) }));

        // case15 - owner reveals
        assert.equal(await token.tokenURI(2), "initialURI", "Case 13: incorrect initial URI");
        await token.toggleReveal("new.super.uri/", { from: owner});
        assert.equal(await token.tokenURI(2), "new.super.uri/2", "Case 13: incorrect revealed URI");

    });
});