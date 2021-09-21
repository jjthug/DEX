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

        await aave.approve(dex.address, 500); //approved by owner
        await dex.deposit(web3.utils.utf8ToHex("Aave"),100); // now dex can deposit
        let balance = await dex.balances(accounts[0], web3.utils.utf8ToHex("Aave"));
        assert.equal(balance, 100);
    })

    it("should handle faulty withdrawals correctly", async() => {

        await truffleAssert.reverts(dex.withdraw(web3.utils.utf8ToHex("Aave"),6000),"Insufficient balance");

    })

    it("should handle correct withdrawals correctly", async() => {

        await truffleAssert.passes(dex.withdraw(web3.utils.utf8ToHex("Aave"),100));

    })

    it("should throw error if ETH balance is too low, while creating BUY order", async() => {

        await truffleAssert.reverts(dex.createOrderLimit(0,web3.utils.utf8ToHex("Aave"),10,2));

    })

    it("should throw an error if token balance is too low when creating SELL limit order", async () => {
        
        await aave.approve(dex.address, 500); //approved by owner
        await dex.deposit(web3.utils.utf8ToHex("Aave"),100); // now dex can deposit
        await truffleAssert.passes(
            dex.createOrderLimit(1, web3.utils.fromUtf8("Aave"), 10, 1));
    })

    it("The BUY order book should be ordered on price from highest to lowest starting at index 0", async () => {

        // await aave.approve(dex.address, 700);
        await dex.depositEth(100);
        await dex.createOrderLimit(0, web3.utils.fromUtf8("Aave"), 1, 10)
        await dex.createOrderLimit(0, web3.utils.fromUtf8("Aave"), 1, 30)
        await dex.createOrderLimit(0, web3.utils.fromUtf8("Aave"), 1, 20)

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("Aave"), 0);

        assert(orderbook.length > 0)
        for (let i = 0; i < orderbook.length - 1; i++) {
            assert(orderbook[i].price >= orderbook[i+1].price, "not right order of BUY orderbook")
        }
    })

    it("The SELL order book should be ordered on price from lowest to highest starting at index 0", async () => {

        // await aave.approve(dex.address, 700);
        await dex.createOrderLimit(1, web3.utils.fromUtf8("Aave"), 1, 300)
        await dex.createOrderLimit(1, web3.utils.fromUtf8("Aave"), 1, 100)
        await dex.createOrderLimit(1, web3.utils.fromUtf8("Aave"), 1, 200)

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("Aave"), 1);

        assert(orderbook.length > 0)
        for (let i = 0; i < orderbook.length - 1; i++) {
            assert(orderbook[i].price <= orderbook[i+1].price, "not right order of SELL orderbook")
        }
    })

})