const Aave = artifacts.require("Aave");
const Dex = artifacts.require("Dex");
const truffleAssert = require('truffle-assertions');

describe("Dex", () => {

    it("should only be possible for owner to add tokens", async() => {
        const dex = await Dex.new();
        const aave = await Aave.new();
        [owner,addr1,addr2] = await ethers.getSigners();

        truffleAssert.passes(
            await dex.addToken(web3.utils.fromUtf8("Aave"), aave.address,{from: owner.address}));

    })
})