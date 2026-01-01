// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HypnosDemo
 * @notice Demo contract to showcase Hypnos execution with observable state changes
 * @dev Simple contract with state-changing functions that emit rich events
 */
contract HypnosDemo {
    struct State {
        uint256 counter;
        string message;
        address lastCaller;
        uint256 lastUpdate;
        mapping(address => uint256) callerCounts;
    }
    
    State public state;
    mapping(address => uint256) public balances;
    
    event CounterIncremented(
        address indexed caller,
        uint256 oldValue,
        uint256 newValue,
        uint256 timestamp
    );
    
    event MessageUpdated(
        address indexed caller,
        string oldMessage,
        string newMessage,
        uint256 timestamp
    );
    
    event BalanceDeposited(
        address indexed depositor,
        uint256 amount,
        uint256 newBalance,
        uint256 timestamp
    );
    
    event BalanceWithdrawn(
        address indexed withdrawer,
        uint256 amount,
        uint256 newBalance,
        uint256 timestamp
    );
    
    event StateSnapshot(
        address indexed caller,
        uint256 counter,
        string message,
        uint256 timestamp
    );

    constructor() {
        state.counter = 0;
        state.message = "Initialized";
        state.lastCaller = address(0);
        state.lastUpdate = block.timestamp;
    }

    /**
     * @notice Increment the counter
     * @return newValue The new counter value
     */
    function incrementCounter() external returns (uint256) {
        uint256 oldValue = state.counter;
        state.counter++;
        state.lastCaller = msg.sender;
        state.lastUpdate = block.timestamp;
        state.callerCounts[msg.sender]++;
        
        emit CounterIncremented(
            msg.sender,
            oldValue,
            state.counter,
            block.timestamp
        );
        
        return state.counter;
    }

    /**
     * @notice Update the message
     * @param newMessage The new message
     */
    function updateMessage(string calldata newMessage) external {
        string memory oldMessage = state.message;
        state.message = newMessage;
        state.lastCaller = msg.sender;
        state.lastUpdate = block.timestamp;
        state.callerCounts[msg.sender]++;
        
        emit MessageUpdated(
            msg.sender,
            oldMessage,
            newMessage,
            block.timestamp
        );
    }

    /**
     * @notice Deposit ETH (requires value > 0)
     */
    function deposit() external payable {
        require(msg.value > 0, "HypnosDemo: must send ETH");
        
        balances[msg.sender] += msg.value;
        state.lastCaller = msg.sender;
        state.lastUpdate = block.timestamp;
        state.callerCounts[msg.sender]++;
        
        emit BalanceDeposited(
            msg.sender,
            msg.value,
            balances[msg.sender],
            block.timestamp
        );
    }

    /**
     * @notice Withdraw ETH
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "HypnosDemo: insufficient balance");
        
        balances[msg.sender] -= amount;
        state.lastCaller = msg.sender;
        state.lastUpdate = block.timestamp;
        state.callerCounts[msg.sender]++;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "HypnosDemo: withdrawal failed");
        
        emit BalanceWithdrawn(
            msg.sender,
            amount,
            balances[msg.sender],
            block.timestamp
        );
    }

    /**
     * @notice Get a snapshot of current state
     */
    function snapshot() external {
        state.callerCounts[msg.sender]++;
        
        emit StateSnapshot(
            msg.sender,
            state.counter,
            state.message,
            block.timestamp
        );
    }

    /**
     * @notice Get caller count for an address
     * @param caller Address to check
     * @return count Number of times the address has called functions
     */
    function getCallerCount(address caller) external view returns (uint256) {
        return state.callerCounts[caller];
    }

    /**
     * @notice Get current state values
     * @return counter Current counter value
     * @return message Current message
     * @return lastCaller Last caller address
     * @return lastUpdate Last update timestamp
     */
    function getState() external view returns (
        uint256 counter,
        string memory message,
        address lastCaller,
        uint256 lastUpdate
    ) {
        return (
            state.counter,
            state.message,
            state.lastCaller,
            state.lastUpdate
        );
    }
}
