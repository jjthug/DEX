const Aave = artifacts.require("Aave");
const Dex = artifacts.require("Dex");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

describe("Dex", (accounts) => {
let dex, aave;
    before(async function () {
        accounts = await web3.eth.getAccounts();
        dex = await Dex.new();
        aave = await Aave.new();
      });

    it("should only be possible for owner to add tokens", async() => {

        truffleAssert.passes(
            await dex.addToken(web3.utils.utf8ToHex("Aave"), aave.address,{from: accounts[0]}));
            await truffleAssert.reverts(
             dex.addToken(web3.utils.utf8ToHex("POLKA"), aave.address,{from: accounts[1]}));

    })

    it("should handle deposits correctly", async() => {
        //[owner,addr1,addr2] = await ethers.getSigners(); can use using ethers, owner.address, addr1.address, ...

        await dex.addToken(web3.utils.utf8ToHex("Aave"), aave.address,{from: accounts[0]});
        await aave.approve(dex.address, 500); //approved by owner
        await dex.deposit(web3.utils.utf8ToHex("Aave"),100); // now dex can deposit
        let balance = await dex.balances(accounts[0], web3.utils.utf8ToHex("Aave"));
        assert.equal(balance, 100);
    })

    it("should handle faulty withdrawals correctly", async() => {

        await dex.addToken(web3.utils.utf8ToHex("Aave"), aave.address,{from: accounts[0]});
        await truffleAssert.reverts(dex.withdraw(web3.utils.utf8ToHex("Aave"),6000),"Insufficient balance");

    })

    it("should handle correct withdrawals correctly", async() => {

        await dex.addToken(web3.utils.utf8ToHex("Aave"), aave.address,{from: accounts[0]});
        await truffleAssert.passes(dex.withdraw(web3.utils.utf8ToHex("Aave"),100));

    })
})