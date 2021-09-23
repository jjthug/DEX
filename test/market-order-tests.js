const Aave = artifacts.require("Aave");
const Dex = artifacts.require("Dex");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');


describe.skip("OrderBook", accounts => {
    let dex, aave;
    before(async function () {
        accounts = await web3.eth.getAccounts();
        dex = await Dex.new();
        aave = await Aave.new();
      });

    it("when creating SELL market order, seller must have sufficient tokens for the trade", async() => {
        truffleAssert.passes(
            await dex.addToken(web3.utils.utf8ToHex("Aave"), aave.address,{from: accounts[0]}));

        await truffleAssert.reverts(
            dex.createMarketOrder(1, web3.utils.utf8ToHex("Aave"), 5, {from: accounts[1]}));

        await truffleAssert.passes(
            dex.createMarketOrder(1, web3.utils.utf8ToHex("Aave"), 5, {from: accounts[0]}));
        })

    it("when creating BUY market order, buyer must have sufficient ETH for the trade", async() => {

        await dex.depositEth(10000);

        let balance = await dex.balances(accounts[0], web3.utils.utf8ToHex("ETH"));
        assert.equal(balance, 0, "Eth balances for account[1] is not 0");

        await truffleAssert.reverts(
            dex.createMarketOrder(0, web3.utils.utf8ToHex("Aave"), 10, {from: accounts[1]}));

        await truffleAssert.passes(
            dex.createMarketOrder(0, web3.utils.utf8ToHex("Aave"), 10, {from: accounts[0]})); 

       
    })

    it("market orders can be submitted even if order book is empty", async() =>{

        let orderBook = await dex.getOrderBook(web3.utils.utf8ToHex("Aave", 0));
        assert(orderBook.length ==0, "Length of BUY side orderbook is not 0");

        await truffleAssert.passes(
            dex.createMarketOrder(0, web3.utils.utf8ToHex("Aave"), 10));

    })

    it("Market orders should not fill more limit orders than the market order amount", async() =>{
        //transfer tokens to accounts 1,2,3
        await aave.transfer(accounts[1], 100);
        await aave.transfer(accounts[2], 100);
        await aave.transfer(accounts[3], 100);
        
        //approve for dex deposit
        await aave.approve(dex.address, 100, accounts[1]);
        await aave.approve(dex.address, 100, accounts[2]);
        await aave.approve(dex.address, 100, accounts[3]);

        await dex.deposit(web3.utils.utf8ToHex("Aave"), 100, {from: accounts[1]});
        await dex.deposit(web3.utils.utf8ToHex("Aave"), 100, {from: accounts[2]});
        await dex.deposit(web3.utils.utf8ToHex("Aave"), 100, {from: accounts[3]});

        //create market orders of SELL token
        await dex.createMarketOrder(1, web3.utils.utf8ToHex("Aave"), 50, 3,{from: accounts[1]});
        await dex.createMarketOrder(1, web3.utils.utf8ToHex("Aave"), 50, 4, {from: accounts[2]});
        await dex.createMarketOrder(1, web3.utils.utf8ToHex("Aave"), 50, 5, {from: accounts[3]});

        // create BUY tokens order which fills 2/3 od SELL order
        await dex.createMarketOrder(0,web3.utils.utf8ToHex("Aave"), 100, {from: accounts[0]});

        let orderBook = await dex.getOrderBook(web3.utils.utf8ToHex("Aave"), 1);
        assert(orderBook.length == 1, "1 order present in SELL orderBook");
        assert(orderBook[0].filled == 0, "SELL side orderbook has 0 filled, for the top request");

        await dex.createMarketOrder(0,web3.utils.utf8ToHex("Aave"), 100, {from: accounts[0]});

        let balance = await dex.balances(accounts[0] , web3.utils.utf8ToHex("Aave"));
        assert(balance == 150, "150 Aave received, remaining 50 in BUY order until new SELL order");
                
    })

    it("Filled orders should be removed from the orderbook", async() =>{
        await dex.createMarketOrder(1, web3.utils.utf8ToHex("Aave"), 25, 3,{from: accounts[1]});
        await dex.createMarketOrder(1, web3.utils.utf8ToHex("Aave"), 25, 4, {from: accounts[2]});

        let orderBook = await dex.getOrderBook(web3.utils.utf8ToHex("Aave"), 0);
        assert(orderBook.length == 0, "BUY orderbook should now be completely fulfilled");

    })

    it("ETH blance of owner should decrease with the filled amount", async() =>{
        let balance = await dex.balances(accounts[0], web3.utils.utf8ToHex("ETH"));
        assert(balance == 9225, "775 ETH paid for the Aave purchase");
    })

    it("Partially filled details shoud be correctly functioning", async() =>{
        let length = await dex.getOrderBook(web3.utils.utf8ToHex("Aave"), 0);
        assert( length == 0, "length of BUY orderbook is 0");
        
        await dex.createOrderLimit(1, web3.utils.utf8ToHex("Aave"), 5, 3,{from: accounts[1]});

        await dex.createMarketOrder(0, web3.utils.utf8ToHex("Aave"), 12);

        let orderBook = await dex.getOrderBook(web3.utils.utf8ToHex("Aave"), 0);
        assert(orderBook[0].filled == 5);
        assert(orderBook[0].amount == 12);
    })

})