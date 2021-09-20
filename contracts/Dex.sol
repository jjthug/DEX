pragma solidity ^0.8.0;
import "./wallet.sol";

contract Dex is wallet{
    enum Side{BUY,SELL}
    
    struct Order{
        uint id;
        address trader;
        bool buyOrder;
        bytes32 ticker;
        uint amount;
        uint price;
    }

    //Buy and Sell orderbooks
    mapping(bytes32 => mapping(uint => Order[])) public orderBook;

    function getOrderBook(bytes32 ticker, Side side) view public returns(Order[] memory) {
        return orderBook[ticker][uint(side)];
    }

}   