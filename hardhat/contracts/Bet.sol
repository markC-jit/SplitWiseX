// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";

contract Bet is SiweAuth {
    address private _owner;
    uint256 private _nextBetId = 1;
    
    enum BetOutcome {
        YES,
        NO
    }
    
    enum BetStatus {
        Active,
        Won,
        Lost,
        Cancelled
    }
    
    struct SubBet {
        string platform;        // e.g., "Polymarket", "Augur", "Gnosis"
        uint256 amount;         // Amount allocated to this platform
        string marketId;        // Platform-specific market identifier
        BetOutcome outcome;     // Outcome bet on this platform
        BetStatus status;       // Status of this specific subbet
        uint256 payout;         // Payout received from this platform
    }
    
    struct BetInfo {
        uint256 id;
        address user;
        uint256 totalAmount;    // Total amount across all subbets
        BetOutcome outcome;     // Overall outcome for all subbets
        BetStatus status;       // Overall bet status
        uint256 createdAt;
        string description;
        SubBet[] subBets;       // Array of subbets across different platforms
        uint256 totalPayout;    // Total payout across all subbets
    }
    
    // Private bet details (secret, accessible only with SIWE auth)
    BetInfo[] private _betMetas;
    
    mapping(address => uint256[]) private _userBets;
    mapping(address => uint256) public userBalances;
    
    event BetPlaced(
        uint256 indexed betId,
        address indexed user,
        uint256 totalAmount,
        uint256 subBetCount,
        uint256 index
    );
    
    event SubBetPlaced(
        uint256 indexed betId,
        string platform,
        uint256 amount,
        string marketId,
        BetOutcome outcome
    );
    
    event BetResolved(
        uint256 indexed betId,
        BetStatus status,
        uint256 payout
    );
    
    event FundsWithdrawn(
        address indexed user,
        uint256 amount
    );
    
    modifier onlyOwner(bytes memory token) {
        if (msg.sender != _owner && authMsgSender(token) != _owner) {
            revert("not allowed");
        }
        _;
    }
    
    modifier onlyBetOwner(uint256 betId, bytes memory token) {
        require(betId < _betMetas.length, "Bet does not exist");
        address betOwner = _betMetas[betId].user;
        if (msg.sender != betOwner && authMsgSender(token) != betOwner) {
            revert("not bet owner");
        }
        _;
    }
    
    constructor(string memory domain) SiweAuth(domain) {
        _owner = msg.sender;
    }
    
    /**
     * @dev Place a bet with subbets across multiple platforms
     * @param description Description of the bet (private)
     * @param outcome Overall outcome for all subbets (YES/NO)
     * @param platforms Array of platform names
     * @param amounts Array of amounts for each platform
     * @param marketIds Array of market IDs for each platform
     */
    function placeBet(
        string calldata description,
        BetOutcome outcome,
        string[] calldata platforms,
        uint256[] calldata amounts,
        string[] calldata marketIds
    ) external payable {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(platforms.length > 0, "At least one subbet required");
        require(
            platforms.length == amounts.length && 
            amounts.length == marketIds.length,
            "Array lengths must match"
        );
        
        // Verify total amounts match sent value
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "Each subbet amount must be greater than 0");
            totalAmount += amounts[i];
        }
        require(totalAmount == msg.value, "Total subbet amounts must equal sent value");
        
        uint256 betId = _nextBetId++;
        
        // Create the main bet
        _betMetas.push();
        BetInfo storage newBet = _betMetas[_betMetas.length - 1];
        newBet.id = betId;
        newBet.user = msg.sender;
        newBet.totalAmount = msg.value;
        newBet.outcome = outcome;
        newBet.status = BetStatus.Active;
        newBet.createdAt = block.timestamp;
        newBet.description = description;
        newBet.totalPayout = 0;
        
        // Add subbets (all with the same outcome)
        for (uint256 i = 0; i < platforms.length; i++) {
            newBet.subBets.push(SubBet({
                platform: platforms[i],
                amount: amounts[i],
                marketId: marketIds[i],
                outcome: outcome,
                status: BetStatus.Active,
                payout: 0
            }));
            
            emit SubBetPlaced(betId, platforms[i], amounts[i], marketIds[i], outcome);
        }
        
        _userBets[msg.sender].push(_betMetas.length - 1);
        
        // Add bet amount to user's withdrawable balance
        userBalances[msg.sender] += msg.value;
        
        emit BetPlaced(betId, msg.sender, msg.value, platforms.length, _betMetas.length - 1);
    }
    
    /**
     * @dev Get user's bets using SIWE authentication
     * @param token SIWE authentication token
     * @param offset Pagination offset
     * @param count Number of bets to return
     */
    function getUserBets(
        bytes memory token,
        uint256 offset,
        uint256 count
    ) external view returns (BetInfo[] memory) {
        address user = authMsgSender(token);
        require(user != address(0), "Invalid authentication token");
        
        uint256[] memory userBetIndices = _userBets[user];
        
        if (offset >= userBetIndices.length) {
            return new BetInfo[](0);
        }
        
        uint256 end = offset + count;
        if (end > userBetIndices.length) {
            end = userBetIndices.length;
        }
        
        BetInfo[] memory result = new BetInfo[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = _betMetas[userBetIndices[i]];
        }
        
        return result;
    }
    
    
    /**
     * @dev Resolve a bet and all its subbets (only owner)
     * @param betId The bet ID to resolve
     * @param won Whether the bet won or lost
     * @param token SIWE authentication token for owner
     */
    function resolveBet(
        uint256 betId,
        bool won,
        bytes memory token
    ) external onlyOwner(token) {
        require(betId > 0 && betId < _nextBetId, "Invalid bet ID");
        
        // Find the bet in the array
        uint256 betIndex = 0;
        bool found = false;
        for (uint256 i = 0; i < _betMetas.length; i++) {
            if (_betMetas[i].id == betId) {
                betIndex = i;
                found = true;
                break;
            }
        }
        
        require(found, "Bet not found");
        require(_betMetas[betIndex].status == BetStatus.Active, "Bet already resolved");
        
        BetInfo storage bet = _betMetas[betIndex];
        uint256 totalPayout = 0;
        
        // Resolve all subbets with 2x multiplier
        for (uint256 i = 0; i < bet.subBets.length; i++) {
            SubBet storage subBet = bet.subBets[i];
            
            if (won) {
                subBet.status = BetStatus.Won;
                subBet.payout = subBet.amount * 2; // 2x multiplier
                totalPayout += subBet.payout;
                // Add winnings to user balance (original amount already there)
                userBalances[bet.user] += subBet.amount; // Add only the winnings (1x the original amount)
            } else {
                subBet.status = BetStatus.Lost;
                subBet.payout = 0;
                // Remove the subbet amount from user's balance since they lost
                userBalances[bet.user] -= subBet.amount;
            }
        }
        
        // Update main bet
        bet.status = won ? BetStatus.Won : BetStatus.Lost;
        bet.totalPayout = totalPayout;
        
        emit BetResolved(betId, bet.status, totalPayout);
    }
    
    /**
     * @dev Cancel a bet and refund (only owner)
     * @param betId The bet ID to cancel
     * @param token SIWE authentication token for owner
     */
    function cancelBet(
        uint256 betId,
        bytes memory token
    ) external onlyOwner(token) {
        require(betId > 0 && betId < _nextBetId, "Invalid bet ID");
        
        // Find the bet in the array
        uint256 betIndex = 0;
        bool found = false;
        for (uint256 i = 0; i < _betMetas.length; i++) {
            if (_betMetas[i].id == betId) {
                betIndex = i;
                found = true;
                break;
            }
        }
        
        require(found, "Bet not found");
        require(_betMetas[betIndex].status == BetStatus.Active, "Bet already resolved");
        
        BetInfo storage bet = _betMetas[betIndex];
        bet.status = BetStatus.Cancelled;
        
        // Cancel all active subbets
        for (uint256 i = 0; i < bet.subBets.length; i++) {
            if (bet.subBets[i].status == BetStatus.Active) {
                bet.subBets[i].status = BetStatus.Cancelled;
            }
        }
        
        // User already has their bet amount in balance, no need to add again
        
        emit BetResolved(betId, bet.status, bet.totalAmount);
    }
    
    /**
     * @dev Get subbets for a specific bet (requires SIWE authentication)
     * @param token SIWE authentication token
     * @param betId The bet ID to get subbets for
     */
    function getSubBets(
        bytes memory token,
        uint256 betId
    ) external view returns (SubBet[] memory) {
        address user = authMsgSender(token);
        require(user != address(0), "Invalid authentication token");
        require(betId > 0 && betId < _nextBetId, "Invalid bet ID");
        
        // Find the bet in the array
        for (uint256 i = 0; i < _betMetas.length; i++) {
            if (_betMetas[i].id == betId) {
                return _betMetas[i].subBets;
            }
        }
        
        revert("Bet not found");
    }
    
    /**
     * @dev Get bet summary with subbet count (requires SIWE authentication)
     * @param token SIWE authentication token
     * @param betId The bet ID to get summary for
     */
    function getBetSummary(
        bytes memory token,
        uint256 betId
    ) external view returns (
        uint256 id,
        address user,
        uint256 totalAmount,
        BetStatus status,
        uint256 createdAt,
        string memory description,
        uint256 subBetCount,
        uint256 totalPayout
    ) {
        address caller = authMsgSender(token);
        require(caller != address(0), "Invalid authentication token");
        require(betId > 0 && betId < _nextBetId, "Invalid bet ID");
        
        // Find the bet in the array
        for (uint256 i = 0; i < _betMetas.length; i++) {
            if (_betMetas[i].id == betId) {
                BetInfo storage bet = _betMetas[i];
                return (
                    bet.id,
                    bet.user,
                    bet.totalAmount,
                    bet.status,
                    bet.createdAt,
                    bet.description,
                    bet.subBets.length,
                    bet.totalPayout
                );
            }
        }
        
        revert("Bet not found");
    }
    
    /**
     * @dev Withdraw user balance
     */
    function withdrawBalance() external {
        uint256 balance = userBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        
        userBalances[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(msg.sender, balance);
    }
    
    /**
     * @dev Owner withdraws contract funds (only owner)
     * @param amount Amount to withdraw
     * @param token SIWE authentication token for owner
     */
    function ownerWithdraw(
        uint256 amount,
        bytes memory token
    ) external onlyOwner(token) {
        require(amount <= address(this).balance, "Insufficient contract balance");
        
        (bool success, ) = payable(_owner).call{value: amount}("");
        require(success, "Owner withdrawal failed");
        
        emit FundsWithdrawn(_owner, amount);
    }
    
    /**
     * @dev Transfer contract funds to a specified address (only owner)
     * @param to Address to transfer funds to
     * @param amount Amount to transfer
     * @param token SIWE authentication token for owner
     */
    function transferContractBalance(
        address payable to,
        uint256 amount,
        bytes memory token
    ) external onlyOwner(token) {
        require(to != address(0), "Cannot transfer to zero address");
        require(amount > 0, "Transfer amount must be greater than 0");
        require(amount <= address(this).balance, "Insufficient contract balance");
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(to, amount);
    }
    
    /**
     * @dev Get all bet metadata (paginated) - requires SIWE authentication
     * @param token SIWE authentication token
     * @param offset Pagination offset
     * @param count Number of bets to return
     */
    function getAllBets(
        bytes memory token,
        uint256 offset,
        uint256 count
    ) external view returns (BetInfo[] memory) {
        address user = authMsgSender(token);
        require(user != address(0), "Invalid authentication token");
        if (offset >= _betMetas.length) {
            return new BetInfo[](0);
        }
        
        uint256 end = offset + count;
        if (end > _betMetas.length) {
            end = _betMetas.length;
        }
        
        BetInfo[] memory result = new BetInfo[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = _betMetas[offset + i];
        }
        
        return result;
    }
    
    /**
     * @dev Get a specific bet by index - requires SIWE authentication
     * @param token SIWE authentication token
     * @param betIndex Index of the bet in the _betMetas array
     */
    function getBet(
        bytes memory token,
        uint256 betIndex
    ) external view returns (BetInfo memory) {
        address user = authMsgSender(token);
        require(user != address(0), "Invalid authentication token");
        require(betIndex < _betMetas.length, "Bet does not exist");
        
        return _betMetas[betIndex];
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get total number of bets
     */
    function getTotalBets() external view returns (uint256) {
        return _betMetas.length;
    }
    
    /**
     * @dev Get user's total bet count
     * @param user User address
     */
    function getUserBetCount(address user) external view returns (uint256) {
        return _userBets[user].length;
    }
    
    /**
     * @dev Get owner address
     */
    function getOwner() external view returns (address) {
        return _owner;
    }
}