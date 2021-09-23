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
        uint filled;
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
            Order(nextOrderId, msg.sender, side, ticker, amount, price, 0));
   
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

    function createMarketOrder(Side side, bytes32 ticker, uint amount) public {
        uint orderBookSide;
        uint totalFilled;
        uint filled;

        if(side == Side.BUY)
        orderBookSide = 1;
        else{
            orderBookSide = 0;
        }

        Order[] storage orders = orderBook[ticker][orderBookSide];
        uint i;
        for(i =0; i<orders.length && totalFilled < amount; i++)
        {
            if(orders[i].amount >= (amount - totalFilled))
            {
                orders[i].filled = amount - totalFilled;
                filled = amount- totalFilled;
                totalFilled = amount;
            }
            else {
                filled = orders[i].amount;
            totalFilled += orders[i].amount;
            // orders[i].filled = orders[i].amount;
            }

        if(side == Side.BUY)
        {
            require(balances[msg.sender]["ETH"] >= filled*orders[i].price);
            //Execute trade
            //transfer token to buyer in the dex
            balances[msg.sender][ticker] += filled;
            balances[orders[i].trader][ticker] -= filled;

            //transfer eth to seller of token in the dex
            balances[msg.sender]["ETH"] -= filled;
            balances[orders[i].trader]["ETH"] += filled;
        }
        else if(side==Side.SELL) {
            
            require(balances[msg.sender][ticker] >= filled);
            //Execute trade
            //transfer token to buyer in the dex
            balances[msg.sender][ticker] -= filled;
            balances[orders[i].trader][ticker] += filled;

            //transfer eth to seller of token in the dex
            balances[msg.sender]["ETH"] += filled;
            balances[orders[i].trader]["ETH"] -= filled;
        }

    }
            //Remove filled orders
            Order[] memory ordersToDelete = new Order[](i);
            
            uint j;
            uint toShift;
            for(j=0; j<i; j++)
            {
                if(j==i-1)
                {
                    if(orders[j].filled == amount)
                    {ordersToDelete[j]=orders[j];
                    toShift=j;}
                    else{
                        toShift=j-1;
                    }
                }
                else{
                    ordersToDelete[j]=orders[j];
                }
            }

            //shift
            uint length = orders.length;
            for(j=0; j<length-toShift; j++)
            {//swap
                (orders[j], orders[j+toShift+1])=(orders[j+toShift+1], orders[j]);
            }

            //pop from last
            for(j=length-1; j>=length-toShift; j--){
                orders.pop();
            }


    }

}