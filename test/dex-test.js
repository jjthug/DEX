const Aave = artifacts.require("Aave");
const Dex = artifacts.require("Dex");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

describe("Dex", (accounts) => {

    before(async function () {
        accounts = await web3.eth.getAccounts();
      });

    it("should only be possible for owner to add tokens", async() => {
        const dex = await Dex.new();
        const aave = await Aave.new();

        truffleAssert.passes(
            await dex.addToken(web3.utils.utf8ToHex("Aave"), aave.address,{from: accounts[0]}));
        // truffleAssert.reverts(
        //     await dex.addToken(web3.utils.utf8ToHex("POLKA"), aave.address,{from: addr1.address}));
    })

    it("should handle deposits correctly", async() => {
        const dex = await Dex.new();
        const aave = await Aave.new();
        //[owner,addr1,addr2] = await ethers.getSigners(); can use using ethers, owner.address, addr1.address, ...

        await dex.addToken(web3.utils.utf8ToHex("Aave"), aave.address,{from: accounts[0]});
        await aave.approve(dex.address, 500); //approved by owner
        await dex.deposit(web3.utils.utf8ToHex("Aave"),100); // now dex can deposit
        let balance = await dex.balances(accounts[0], web3.utils.utf8ToHex("Aave"));
        assert.equal(balance, 100);



    })
})