// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title HypnosExecutor
 * @notice Permission-gated execution contract for Hypnos cognitive layer
 * @dev This contract implements fine-grained permission checks and rich event emission
 *      for observability. Designed to work with MetaMask Advanced Permissions (ERC-7715)
 *      and Smart Accounts.
 */
contract HypnosExecutor is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    
    // Permission structure
    struct Permission {
        address target;           // Target contract or address
        bytes4 selector;          // Function selector (0x0 for any)
        uint256 maxValue;         // Maximum ETH value (0 = no ETH)
        uint256 maxTokenAmount;   // Maximum token amount (0 = no tokens)
        address tokenAddress;     // Token address (address(0) for ETH)
        uint256 expiry;           // Expiration timestamp (0 = no expiry)
        bool active;              // Whether permission is active
    }

    // Permission tracking
    mapping(address => mapping(bytes32 => Permission)) public permissions;
    mapping(address => bytes32[]) public userPermissions;
    
    // Execution tracking
    struct ExecutionRecord {
        address executor;
        address target;
        bytes4 selector;
        uint256 value;
        bytes data;
        uint256 timestamp;
        bytes32 permissionId;
        bool success;
        string reason;
    }
    
    mapping(bytes32 => ExecutionRecord) public executions;
    bytes32[] public executionHistory;

    // Events for observability
    event PermissionGranted(
        address indexed user,
        bytes32 indexed permissionId,
        address target,
        bytes4 selector,
        uint256 maxValue,
        uint256 maxTokenAmount,
        address tokenAddress,
        uint256 expiry
    );
    
    event PermissionRevoked(
        address indexed user,
        bytes32 indexed permissionId
    );
    
    event PermissionUsed(
        address indexed user,
        bytes32 indexed permissionId,
        bytes32 indexed executionId,
        address target,
        bytes4 selector,
        uint256 value,
        bool success
    );
    
    event ExecutionRecorded(
        bytes32 indexed executionId,
        address indexed executor,
        address indexed target,
        bytes4 selector,
        uint256 value,
        bytes32 permissionId,
        bool success,
        string reason
    );
    
    event StateChanged(
        bytes32 indexed executionId,
        address indexed target,
        string changeType,
        bytes changeData
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Grant a permission to an executor (typically a Smart Account)
     * @param executor The address that will execute (Smart Account)
     * @param target Target contract address
     * @param selector Function selector (0x0 for any function)
     * @param maxValue Maximum ETH value (0 for no ETH)
     * @param maxTokenAmount Maximum token amount (0 for no tokens)
     * @param tokenAddress Token contract address (address(0) for ETH)
     * @param expiry Expiration timestamp (0 for no expiry)
     * @return permissionId The unique identifier for this permission
     */
    function grantPermission(
        address executor,
        address target,
        bytes4 selector,
        uint256 maxValue,
        uint256 maxTokenAmount,
        address tokenAddress,
        uint256 expiry
    ) external returns (bytes32) {
        require(target != address(0), "HypnosExecutor: invalid target");
        require(expiry == 0 || expiry > block.timestamp, "HypnosExecutor: expired");
        
        bytes32 permissionId = keccak256(
            abi.encodePacked(
                executor,
                target,
                selector,
                maxValue,
                maxTokenAmount,
                tokenAddress,
                expiry,
                block.timestamp,
                block.number
            )
        );
        
        permissions[executor][permissionId] = Permission({
            target: target,
            selector: selector,
            maxValue: maxValue,
            maxTokenAmount: maxTokenAmount,
            tokenAddress: tokenAddress,
            expiry: expiry,
            active: true
        });
        
        userPermissions[executor].push(permissionId);
        
        emit PermissionGranted(
            executor,
            permissionId,
            target,
            selector,
            maxValue,
            maxTokenAmount,
            tokenAddress,
            expiry
        );
        
        return permissionId;
    }

    /**
     * @notice Revoke a permission
     * @param permissionId The permission to revoke
     */
    function revokePermission(bytes32 permissionId) external {
        Permission storage perm = permissions[msg.sender][permissionId];
        require(perm.target != address(0), "HypnosExecutor: permission not found");
        
        perm.active = false;
        
        emit PermissionRevoked(msg.sender, permissionId);
    }

    /**
     * @notice Execute a function call with permission checks
     * @param permissionId The permission ID to use
     * @param target Target contract address
     * @param data Calldata for the function call
     * @param value ETH value to send (must be 0 or within limit)
     * @return success Whether the execution succeeded
     * @return returnData Return data from the call
     */
    function executeWithPermission(
        bytes32 permissionId,
        address target,
        bytes calldata data,
        uint256 value
    ) external nonReentrant returns (bool success, bytes memory returnData) {
        Permission storage perm = permissions[msg.sender][permissionId];
        
        // Validate permission exists and is active
        require(perm.target != address(0), "HypnosExecutor: permission not found");
        require(perm.active, "HypnosExecutor: permission inactive");
        require(perm.target == target, "HypnosExecutor: target mismatch");
        
        // Check expiry
        require(perm.expiry == 0 || perm.expiry >= block.timestamp, "HypnosExecutor: permission expired");
        
        // Extract function selector
        bytes4 selector = bytes4(data);
        
        // Validate selector if not wildcard
        if (perm.selector != bytes4(0)) {
            require(perm.selector == selector, "HypnosExecutor: selector mismatch");
        }
        
        // Validate value limit
        require(value <= perm.maxValue, "HypnosExecutor: value exceeds limit");
        
        // Execute the call
        bytes32 executionId = keccak256(
            abi.encodePacked(
                msg.sender,
                target,
                data,
                value,
                block.timestamp,
                block.number
            )
        );
        
        (success, returnData) = target.call{value: value}(data);
        
        string memory reason = success ? "success" : _extractRevertReason(returnData);
        
        // Record execution
        executions[executionId] = ExecutionRecord({
            executor: msg.sender,
            target: target,
            selector: selector,
            value: value,
            data: data,
            timestamp: block.timestamp,
            permissionId: permissionId,
            success: success,
            reason: reason
        });
        
        executionHistory.push(executionId);
        
        emit ExecutionRecorded(
            executionId,
            msg.sender,
            target,
            selector,
            value,
            permissionId,
            success,
            reason
        );
        
        emit PermissionUsed(
            msg.sender,
            permissionId,
            executionId,
            target,
            selector,
            value,
            success
        );
        
        return (success, returnData);
    }

    /**
     * @notice Execute a token transfer with permission checks
     * @param permissionId The permission ID to use
     * @param tokenAddress Token contract address
     * @param to Recipient address
     * @param amount Amount to transfer
     * @return success Whether the transfer succeeded
     */
    function executeTokenTransfer(
        bytes32 permissionId,
        address tokenAddress,
        address to,
        uint256 amount
    ) external nonReentrant returns (bool success) {
        Permission storage perm = permissions[msg.sender][permissionId];
        
        require(perm.target != address(0), "HypnosExecutor: permission not found");
        require(perm.active, "HypnosExecutor: permission inactive");
        require(perm.tokenAddress == tokenAddress, "HypnosExecutor: token mismatch");
        require(amount <= perm.maxTokenAmount, "HypnosExecutor: amount exceeds limit");
        require(perm.expiry == 0 || perm.expiry >= block.timestamp, "HypnosExecutor: permission expired");
        
        IERC20 token = IERC20(tokenAddress);
        
        bytes32 executionId = keccak256(
            abi.encodePacked(
                msg.sender,
                tokenAddress,
                to,
                amount,
                block.timestamp
            )
        );
        
        token.safeTransferFrom(msg.sender, to, amount);
        
        executions[executionId] = ExecutionRecord({
            executor: msg.sender,
            target: tokenAddress,
            selector: bytes4(keccak256("transfer(address,uint256)")),
            value: 0,
            data: abi.encodeWithSignature("transfer(address,uint256)", to, amount),
            timestamp: block.timestamp,
            permissionId: permissionId,
            success: true,
            reason: "success"
        });
        
        executionHistory.push(executionId);
        
        emit ExecutionRecorded(
            executionId,
            msg.sender,
            tokenAddress,
            bytes4(keccak256("transfer(address,uint256)")),
            0,
            permissionId,
            true,
            "success"
        );
        
        emit PermissionUsed(
            msg.sender,
            permissionId,
            executionId,
            tokenAddress,
            bytes4(keccak256("transfer(address,uint256)")),
            amount,
            true
        );
        
        return true;
    }

    /**
     * @notice Get permission details
     * @param executor Executor address
     * @param permissionId Permission ID
     * @return Permission struct
     */
    function getPermission(
        address executor,
        bytes32 permissionId
    ) external view returns (Permission memory) {
        return permissions[executor][permissionId];
    }

    /**
     * @notice Get all permission IDs for an executor
     * @param executor Executor address
     * @return Array of permission IDs
     */
    function getUserPermissions(address executor) external view returns (bytes32[] memory) {
        return userPermissions[executor];
    }

    /**
     * @notice Get execution record
     * @param executionId Execution ID
     * @return ExecutionRecord struct
     */
    function getExecution(bytes32 executionId) external view returns (ExecutionRecord memory) {
        return executions[executionId];
    }

    /**
     * @notice Get total execution count
     * @return Count of executions
     */
    function getExecutionCount() external view returns (uint256) {
        return executionHistory.length;
    }

    /**
     * @notice Extract revert reason from return data
     * @param returnData Return data from failed call
     * @return reason Revert reason string
     */
    function _extractRevertReason(bytes memory returnData) private pure returns (string memory) {
        if (returnData.length == 0) {
            return "unknown error";
        }
        
        // Try to extract error message
        if (returnData.length >= 68 && returnData[0] == 0x08 && returnData[1] == 0xc3 && returnData[2] == 0x79 && returnData[3] == 0xa0) {
            // Error(string) selector
            assembly {
                returnData := add(returnData, 4)
            }
            (string memory reason) = abi.decode(returnData, (string));
            return reason;
        }
        
        return "execution reverted";
    }

    // Receive function for ETH handling
    receive() external payable {
        // Contract can receive ETH for executing calls
    }
}
