const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Wallet", function () {
  let owner, addr1, addr2, aave, wallet ;

  this.beforeEach(async()=>{
    const Wallet = await ethers.getContractFactory("wallet");
    wallet = await Wallet.deploy();
    wallet.deployed();

    const Aave = await ethers.getContractFactory("Aave");
    aave = await Aave.deploy();
    aave.deployed();

    [owner,addr1,addr2] = await ethers.getSigners();
  });

  describe("after deployment", () => {
  it("Should run", async function () {

    expect(await aave.balanceOf(owner.address)).to.equal((ethers.BigNumber.from(1000)));

    // toUtf8String
    //formatBytes32String  string to bytes32

    await wallet.addToken(ethers.utils.formatBytes32String("Aave"),aave.address);
    let tick = ethers.utils.formatBytes32String("Aave");
    // expect(wallet.tokenMapping[tick].ticker).to.equal(tick);
    expect("Aave").to.equal(ethers.utils.parseBytes32String(tick));

    expect(0).to.equal(await wallet.balances(owner.address, tick));


    // await aave.connect(owner.address).approve(addr1.address, 500);
    // await wallet.connect(addr1.address).deposit(tick, 500);

    // expect(500).to.equal(await wallet.balances(owner.address, tick));


  });
})
});
