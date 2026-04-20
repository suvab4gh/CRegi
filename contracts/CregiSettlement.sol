// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CregiSettlement {
    struct Settlement {
        address merchant;
        uint256 amount;
        string solanaTx;
        string circleTransferId;
        uint256 settledAt;
    }

    address public owner;
    mapping(string => Settlement) public settlements;

    event SettlementRecorded(
        string indexed invoiceId,
        address indexed merchant,
        uint256 amount,
        string solanaTx,
        string circleTransferId
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address nextOwner) external onlyOwner {
        require(nextOwner != address(0), "ZERO_OWNER");
        owner = nextOwner;
    }

    function recordSettlement(
        string calldata invoiceId,
        address merchant,
        uint256 amount,
        string calldata solanaTx,
        string calldata circleTransferId
    ) external onlyOwner {
        require(merchant != address(0), "ZERO_MERCHANT");
        require(amount > 0, "ZERO_AMOUNT");
        require(settlements[invoiceId].settledAt == 0, "ALREADY_SETTLED");

        settlements[invoiceId] = Settlement({
            merchant: merchant,
            amount: amount,
            solanaTx: solanaTx,
            circleTransferId: circleTransferId,
            settledAt: block.timestamp
        });

        emit SettlementRecorded(
            invoiceId,
            merchant,
            amount,
            solanaTx,
            circleTransferId
        );
    }
}
