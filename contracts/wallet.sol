pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract wallet is Ownable{
    struct Token{
        bytes32 ticker ;
        address tokenAddress ;
    }

    bytes32[] tokenList;
    mapping(bytes32=> Token) public tokenMapping;

    mapping(address=>mapping(bytes32=>uint256)) public balances;

    modifier tokenExists(bytes32 ticker){
        require(tokenMapping[ticker].tokenAddress != address(0), "Token does not exist");
        _;
    }

    function addToken(bytes32 ticker, address tokenAddress) onlyOwner external {
        tokenMapping[ticker] = Token(ticker, tokenAddress);
        tokenList.push(ticker);
    }

    function deposit(bytes32 ticker, uint amount) external tokenExists(ticker) {
        balances[msg.sender][ticker] += amount;
        IERC20(tokenMapping[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount);
    }

    function depositEth(uint amount) external {
        balances[msg.sender]["ETH"] += amount;
    }

    function withdraw(bytes32 ticker, uint amount) external tokenExists(ticker) {
        require(balances[msg.sender][ticker] >= amount, "Insufficient balance");
        balances[msg.sender][ticker] -= amount;
        IERC20(tokenMapping[ticker].tokenAddress).transfer(msg.sender, amount);
    }
}