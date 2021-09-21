pragma solidity ^0.8.0;
import "./wallet.sol";

contract Dex is wallet{
    enum Side{BUY,SELL}
    
    struct Order{
        uint id;
        address trader;
        Side buyOrder;
        bytes32 ticker;
        uint amount;
        uint price;
    }

    uint private nextOrderId  = 0;
    //Buy and Sell orderbooks
    mapping(bytes32 => mapping(uint => Order[])) public orderBook;

    function getOrderBook(bytes32 ticker, Side side) view public returns(Order[] memory) {
        return orderBook[ticker][uint(side)];
    }

    function createOrderLimit(Side side, bytes32 ticker, uint amount, uint price) public {
        if(side == Side.BUY)
        {
            require(balances[msg.sender]["ETH"] >= amount*price);
        }
        else  if(side == Side.SELL)
        {
            require(balances[msg.sender][ticker] >= amount);
        }

        Order[] storage orders = orderBook[ticker][uint(side)];
        orders.push(
            Order(nextOrderId, msg.sender, side, ticker, amount, price));
   
    //BubbleSort
    bool isSwapped;

    if(side==Side.BUY) //Biggest price first
    { 
        for(uint i=0; i<orders.length -1; i++)
        {   isSwapped = false;

            for(uint j=0; j<orders.length-1; j++){
                if(orders[j].price < orders[j+1].price){
                    //Swap like this??
                    (orders[j],orders[j+1]) = (orders[j+1],orders[j]);
                    isSwapped = true;
                }
            
            }
            // if(!isSwapped)break;
        }
    }
    else if(side== Side.SELL){ //Least price first
    { 
        for(uint i=0; i<orders.length -1; i++)
        {   isSwapped = false;

            for(uint j=0; j<orders.length-1; j++){
                if(orders[j].price > orders[j+1].price){
                    (orders[j],orders[j+1]) = (orders[j+1],orders[j]);
                    // Order memory order = orders[j];
                    // orders[j]=orders[j+1];
                    // orders[j+1] = order;                    
                    isSwapped = true;
                }
            
            }
            // if(!isSwapped)break;
        }
    }
    }
    nextOrderId++;
    }

}   