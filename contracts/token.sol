pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Aave is ERC20{
    constructor() ERC20("Aave","AA"){
        _mint(msg.sender,1000);
    }
}