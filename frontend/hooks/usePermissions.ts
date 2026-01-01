"use client";

import { useState, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { useMetaMask, PermissionRequest, GrantedPermission, ContractCallPermission, NativeTokenTransferPermission } from "@/providers/MetaMaskProvider";

// Constants
const SEPOLIA_CHAIN_ID = "0xaa36a7";

// Permission Templates
export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Array<ContractCallPermission | NativeTokenTransferPermission>;
  defaultExpiry: number; // in days
  policies?: Array<{
    type: string;
    data: any;
  }>;
}

// Executor Contract ABI for permissions
export const EXECUTOR_ABI = [
  // Permission management
  "function grantPermission(address executor, address target, bytes4 selector, uint256 maxValue, uint256 maxTokenAmount, address tokenAddress, uint256 expiry) external returns (bytes32)",
  "function revokePermission(bytes32 permissionId) external",
  "function executeWithPermission(bytes32 permissionId, address target, bytes calldata data, uint256 value) external payable returns (bool success, bytes memory returnData)",
  "function getPermission(address executor, bytes32 permissionId) external view returns (tuple(address target, bytes4 selector, uint256 maxValue, uint256 maxTokenAmount, address tokenAddress, uint256 expiry, bool active))",
  "function getUserPermissions(address executor) external view returns (bytes32[])",
  
  // Events
  "event PermissionGranted(address indexed user, bytes32 indexed permissionId, address target, bytes4 selector, uint256 maxValue, uint256 maxTokenAmount, address tokenAddress, uint256 expiry)",
  "event PermissionRevoked(address indexed user, bytes32 indexed permissionId)",
  "event PermissionUsed(address indexed user, bytes32 indexed permissionId, bytes32 indexed executionId, address target, bytes4 selector, uint256 value, bool success)",
  "event ExecutionRecorded(bytes32 indexed executionId, address indexed executor, address indexed target, bytes4 selector, uint256 value, bytes32 permissionId, bool success, string reason)",
];

// Demo Contract ABI
export const DEMO_ABI = [
  "function incrementCounter() external returns (uint256)",
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function updateMessage(string calldata newMessage) external",
  "function getState() external view returns (uint256 counter, string memory message, uint256 balance)",
  
  // Events
  "event CounterIncremented(address indexed caller, uint256 oldValue, uint256 newValue)",
  "event MessageUpdated(address indexed caller, string oldMessage, string newMessage)",
  "event BalanceDeposited(address indexed depositor, uint256 amount, uint256 newBalance)",
  "event BalanceWithdrawn(address indexed withdrawer, uint256 amount, uint256 newBalance)",
];

// Permission result interface
export interface HypnosPermission {
  id: string;
  permissionId: string; // On-chain permission ID
  permissionsContext?: string; // ERC-7715 context (if using native)
  target: string;
  selector: string;
  maxValue: string;
  maxTokenAmount: string;
  tokenAddress: string;
  expiry: number;
  active: boolean;
  isNative: boolean; // True if using ERC-7715 native, false if on-chain
  grantedAt: number;
}

// Execution result
export interface ExecutionResult {
  success: boolean;
  transactionHash: string;
  executionId?: string;
  error?: string;
}

// Hook State
interface UsePermissionsState {
  permissions: HypnosPermission[];
  isLoading: boolean;
  error: string | null;
}

// Hook Return Type
interface UsePermissionsReturn extends UsePermissionsState {
  // Permission Management
  grantPermission: (params: GrantPermissionParams) => Promise<HypnosPermission | null>;
  revokePermission: (permissionId: string) => Promise<boolean>;
  refreshPermissions: () => Promise<void>;
  
  // Execution
  executeWithPermission: (permissionId: string, action: ExecutionAction) => Promise<ExecutionResult>;
  
  // Helpers
  getPermissionById: (permissionId: string) => HypnosPermission | undefined;
  hasValidPermission: (target: string, selector?: string) => boolean;
  getExpiringPermissions: (days: number) => HypnosPermission[];
}

// Grant Permission Parameters
export interface GrantPermissionParams {
  target: string;
  selector?: string; // 0x00000000 for any function
  maxValue: string; // in ETH
  maxTokenAmount?: string;
  tokenAddress?: string;
  expiryDays: number;
  useNative?: boolean; // Try ERC-7715 native first
}

// Execution Action
export interface ExecutionAction {
  type: "increment" | "deposit" | "withdraw" | "updateMessage" | "custom";
  value?: string; // in ETH
  message?: string;
  customData?: string;
  customTarget?: string;
}

export function usePermissions(): UsePermissionsReturn {
  const {
    signer,
    account,
    isConnected,
    requestPermissions,
    revokePermissions: revokeNativePermissions,
    grantedPermissions,
    executeWithPermission: executeNative,
  } = useMetaMask();

  const [permissions, setPermissions] = useState<HypnosPermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract addresses from env
  const executorAddress = process.env.NEXT_PUBLIC_EXECUTOR_ADDRESS || "";
  const demoAddress = process.env.NEXT_PUBLIC_DEMO_ADDRESS || "";

  // Create contract instances
  const getExecutorContract = useCallback(() => {
    if (!signer || !executorAddress) return null;
    return new ethers.Contract(executorAddress, EXECUTOR_ABI, signer);
  }, [signer, executorAddress]);

  const getDemoContract = useCallback(() => {
    if (!signer || !demoAddress) return null;
    return new ethers.Contract(demoAddress, DEMO_ABI, signer);
  }, [signer, demoAddress]);

  // Grant Permission (tries ERC-7715 native first, falls back to on-chain)
  const grantPermission = useCallback(async (params: GrantPermissionParams): Promise<HypnosPermission | null> => {
    if (!isConnected || !account) {
      setError("Wallet not connected");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const {
        target,
        selector = "0x00000000",
        maxValue,
        maxTokenAmount = "0",
        tokenAddress = ethers.ZeroAddress,
        expiryDays,
        useNative = true,
      } = params;

      const expiryTimestamp = Math.floor(Date.now() / 1000) + (expiryDays * 24 * 60 * 60);
      const maxValueWei = ethers.parseEther(maxValue);
      const maxTokenAmountWei = ethers.parseEther(maxTokenAmount);

      let nativeResult: GrantedPermission | null = null;

      // Try ERC-7715 native first
      if (useNative) {
        try {
          const permissionRequest: PermissionRequest = {
            chainId: SEPOLIA_CHAIN_ID,
            expiry: expiryTimestamp * 1000, // Convert to milliseconds
            signer: {
              type: "account",
              data: {
                id: account,
              },
            },
            permissions: [
              {
                type: "contract-call",
                data: {
                  address: target,
                  abi: target.toLowerCase() === demoAddress.toLowerCase() ? DEMO_ABI : EXECUTOR_ABI,
                  functions: selector === "0x00000000" 
                    ? [
                        { functionName: "incrementCounter" },
                        { functionName: "deposit" },
                        { functionName: "updateMessage" },
                      ]
                    : [{ functionName: selector }],
                },
                required: true,
                policies: maxValueWei > 0n ? [
                  {
                    type: "native-token-limit",
                    data: {
                      allowance: maxValueWei.toString(),
                    },
                  },
                ] : undefined,
              },
            ],
          };

          if (maxValueWei > 0n) {
            permissionRequest.permissions.push({
              type: "native-token-transfer",
              data: {
                recipient: target,
                allowance: maxValueWei.toString(),
              },
              required: false,
            });
          }

          nativeResult = await requestPermissions(permissionRequest);
        } catch (e) {
          console.log("ERC-7715 native not available, using on-chain fallback");
        }
      }

      // On-chain permission grant
      const executor = getExecutorContract();
      if (!executor) {
        throw new Error("Executor contract not available");
      }

      const tx = await executor.grantPermission(
        account, // executor is the user's account
        target,
        selector,
        maxValueWei,
        maxTokenAmountWei,
        tokenAddress,
        expiryTimestamp
      );

      const receipt = await tx.wait();
      
      // Find PermissionGranted event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = executor.interface.parseLog(log);
          return parsed?.name === "PermissionGranted";
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error("Permission grant event not found");
      }

      const parsedEvent = executor.interface.parseLog(event);
      const permissionId = parsedEvent?.args?.permissionId || "";

      const newPermission: HypnosPermission = {
        id: `${account}-${permissionId}`,
        permissionId: permissionId,
        permissionsContext: nativeResult?.permissionsContext,
        target,
        selector,
        maxValue,
        maxTokenAmount,
        tokenAddress,
        expiry: expiryTimestamp,
        active: true,
        isNative: !!nativeResult,
        grantedAt: Date.now(),
      };

      setPermissions((prev) => [...prev, newPermission]);
      return newPermission;

    } catch (err: any) {
      console.error("Grant permission error:", err);
      setError(err.message || "Failed to grant permission");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, requestPermissions, getExecutorContract, demoAddress]);

  // Revoke Permission
  const revokePermission = useCallback(async (permissionId: string): Promise<boolean> => {
    if (!isConnected) {
      setError("Wallet not connected");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const permission = permissions.find((p) => p.permissionId === permissionId);
      
      // Revoke native permission if exists
      if (permission?.permissionsContext) {
        await revokeNativePermissions(permission.permissionsContext);
      }

      // Revoke on-chain permission
      const executor = getExecutorContract();
      if (executor) {
        const tx = await executor.revokePermission(permissionId);
        await tx.wait();
      }

      setPermissions((prev) => 
        prev.map((p) => 
          p.permissionId === permissionId ? { ...p, active: false } : p
        )
      );

      return true;
    } catch (err: any) {
      console.error("Revoke permission error:", err);
      setError(err.message || "Failed to revoke permission");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, permissions, revokeNativePermissions, getExecutorContract]);

  // Refresh Permissions from chain
  const refreshPermissions = useCallback(async () => {
    if (!isConnected || !account) return;

    setIsLoading(true);
    try {
      const executor = getExecutorContract();
      if (!executor) return;

      const permissionIds = await executor.getUserPermissions(account);
      const fetchedPermissions: HypnosPermission[] = [];

      for (const permissionId of permissionIds) {
        const perm = await executor.getPermission(account, permissionId);
        
        fetchedPermissions.push({
          id: `${account}-${permissionId}`,
          permissionId,
          target: perm.target,
          selector: perm.selector,
          maxValue: ethers.formatEther(perm.maxValue),
          maxTokenAmount: ethers.formatEther(perm.maxTokenAmount),
          tokenAddress: perm.tokenAddress,
          expiry: Number(perm.expiry),
          active: perm.active,
          isNative: false,
          grantedAt: 0, // Unknown
        });
      }

      setPermissions(fetchedPermissions);
    } catch (err: any) {
      console.error("Refresh permissions error:", err);
      setError(err.message || "Failed to refresh permissions");
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, getExecutorContract]);

  // Execute with Permission
  const executeWithPermission = useCallback(async (
    permissionId: string,
    action: ExecutionAction
  ): Promise<ExecutionResult> => {
    if (!isConnected || !signer) {
      return { success: false, transactionHash: "", error: "Wallet not connected" };
    }

    const permission = permissions.find((p) => p.permissionId === permissionId);
    if (!permission) {
      return { success: false, transactionHash: "", error: "Permission not found" };
    }

    try {
      const demo = getDemoContract();
      const executor = getExecutorContract();
      
      if (!demo || !executor) {
        throw new Error("Contracts not available");
      }

      let callData: string;
      let value = ethers.parseEther(action.value || "0");

      // Build calldata based on action type
      switch (action.type) {
        case "increment":
          callData = demo.interface.encodeFunctionData("incrementCounter");
          break;
        case "deposit":
          callData = demo.interface.encodeFunctionData("deposit");
          value = ethers.parseEther(action.value || "0.001");
          break;
        case "withdraw":
          callData = demo.interface.encodeFunctionData("withdraw", [
            ethers.parseEther(action.value || "0.001"),
          ]);
          break;
        case "updateMessage":
          callData = demo.interface.encodeFunctionData("updateMessage", [
            action.message || "Hello from Hypnos!",
          ]);
          break;
        case "custom":
          callData = action.customData || "0x";
          break;
        default:
          throw new Error("Unknown action type");
      }

      // Try native execution first (ERC-7715)
      if (permission.permissionsContext) {
        try {
          const txHash = await executeNative(permission.permissionsContext, [
            {
              to: permission.target,
              value: value.toString(),
              data: callData,
            },
          ]);
          
          if (txHash) {
            return {
              success: true,
              transactionHash: txHash,
            };
          }
        } catch (e) {
          console.log("Native execution failed, using on-chain fallback");
        }
      }

      // On-chain execution via executor
      const tx = await executor.executeWithPermission(
        permissionId,
        permission.target,
        callData,
        value,
        { value }
      );

      const receipt = await tx.wait();

      // Find ExecutionRecorded event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = executor.interface.parseLog(log);
          return parsed?.name === "ExecutionRecorded";
        } catch {
          return false;
        }
      });

      const parsedEvent = event ? executor.interface.parseLog(event) : null;

      return {
        success: true,
        transactionHash: receipt.hash,
        executionId: parsedEvent?.args?.executionId,
      };

    } catch (err: any) {
      console.error("Execution error:", err);
      return {
        success: false,
        transactionHash: "",
        error: err.message || "Execution failed",
      };
    }
  }, [isConnected, signer, permissions, getDemoContract, getExecutorContract, executeNative]);

  // Helper: Get permission by ID
  const getPermissionById = useCallback((permissionId: string): HypnosPermission | undefined => {
    return permissions.find((p) => p.permissionId === permissionId);
  }, [permissions]);

  // Helper: Check for valid permission
  const hasValidPermission = useCallback((target: string, selector?: string): boolean => {
    const now = Math.floor(Date.now() / 1000);
    return permissions.some((p) => 
      p.active &&
      p.expiry > now &&
      p.target.toLowerCase() === target.toLowerCase() &&
      (selector === undefined || p.selector === "0x00000000" || p.selector === selector)
    );
  }, [permissions]);

  // Helper: Get expiring permissions
  const getExpiringPermissions = useCallback((days: number): HypnosPermission[] => {
    const threshold = Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);
    return permissions.filter((p) => p.active && p.expiry <= threshold && p.expiry > Date.now() / 1000);
  }, [permissions]);

  return {
    permissions,
    isLoading,
    error,
    grantPermission,
    revokePermission,
    refreshPermissions,
    executeWithPermission,
    getPermissionById,
    hasValidPermission,
    getExpiringPermissions,
  };
}

// Export common permission templates
export const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: "demo-counter",
    name: "Counter Operations",
    description: "Allow incrementing the demo counter",
    permissions: [
      {
        type: "contract-call",
        data: {
          address: "", // Set at runtime
          abi: DEMO_ABI,
          functions: [{ functionName: "incrementCounter" }],
        },
        required: true,
      },
    ],
    defaultExpiry: 7,
  },
  {
    id: "demo-deposit",
    name: "Deposit Operations",
    description: "Allow depositing up to 0.1 ETH",
    permissions: [
      {
        type: "contract-call",
        data: {
          address: "", // Set at runtime
          abi: DEMO_ABI,
          functions: [{ functionName: "deposit" }],
        },
        required: true,
        policies: [
          {
            type: "native-token-limit",
            data: { allowance: ethers.parseEther("0.1").toString() },
          },
        ],
      },
      {
        type: "native-token-transfer",
        data: {
          allowance: ethers.parseEther("0.1").toString(),
        },
        required: false,
      },
    ],
    defaultExpiry: 1,
  },
  {
    id: "demo-full",
    name: "Full Demo Access",
    description: "All demo contract operations with limits",
    permissions: [
      {
        type: "contract-call",
        data: {
          address: "", // Set at runtime
          abi: DEMO_ABI,
          functions: [
            { functionName: "incrementCounter" },
            { functionName: "deposit" },
            { functionName: "updateMessage" },
          ],
        },
        required: true,
        policies: [
          {
            type: "native-token-limit",
            data: { allowance: ethers.parseEther("0.01").toString() },
          },
        ],
      },
    ],
    defaultExpiry: 7,
  },
];
