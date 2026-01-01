"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from "react";
import { MetaMaskSDK, SDKProvider } from "@metamask/sdk";
import { BrowserProvider, JsonRpcSigner, ethers } from "ethers";

// Types for ERC-7715 Advanced Permissions
export interface PermissionContext {
  address: string;
  chainId: string;
}

export interface ContractCallPermission {
  type: "contract-call";
  data: {
    address: string;
    abi: any[];
    functions: Array<{
      functionName: string;
      args?: any[];
    }>;
  };
  required: boolean;
  policies?: Array<{
    type: string;
    data: any;
  }>;
}

export interface NativeTokenTransferPermission {
  type: "native-token-transfer";
  data: {
    recipient?: string;
    allowance: string;
  };
  required: boolean;
  policies?: Array<{
    type: string;
    data: any;
  }>;
}

export type Permission = ContractCallPermission | NativeTokenTransferPermission;

export interface PermissionRequest {
  chainId: string;
  address?: string;
  expiry: number;
  signer: {
    type: "keys" | "account";
    data: {
      keys?: Array<{ type: string; publicKey: string }>;
      id?: string;
    };
  };
  permissions: Permission[];
  policies?: Array<{
    type: string;
    data: any;
  }>;
}

export interface GrantedPermission {
  permissionsContext: string;
  expiry: number;
  signerData: {
    submitToAddress?: string;
  };
  factory?: string;
  factoryData?: string;
}

export interface SmartAccountInfo {
  address: string;
  isDeployed: boolean;
  type: "erc-4337" | "erc-7579" | "erc-7715";
}

// MetaMask Context Type
interface MetaMaskContextType {
  // Connection state
  sdk: MetaMaskSDK | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  balance: string | null;
  
  // Connection status
  isConnected: boolean;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  
  // Smart Account
  smartAccount: SmartAccountInfo | null;
  hasSmartAccount: boolean;
  
  // ERC-7715 Permissions
  grantedPermissions: GrantedPermission[];
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToSepolia: () => Promise<void>;
  
  // ERC-7715 Methods
  requestPermissions: (request: PermissionRequest) => Promise<GrantedPermission | null>;
  revokePermissions: (permissionsContext: string) => Promise<boolean>;
  getPermissions: () => Promise<GrantedPermission[]>;
  
  // Smart Account Methods
  createSmartAccount: () => Promise<SmartAccountInfo | null>;
  executeWithPermission: (
    permissionsContext: string,
    calls: Array<{ to: string; value: string; data: string }>
  ) => Promise<string | null>;
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

interface MetaMaskProviderProps {
  children: ReactNode;
  dappMetadata?: {
    name: string;
    url: string;
    iconUrl?: string;
  };
}

export function MetaMaskProvider({ 
  children, 
  dappMetadata = {
    name: "Hypnos",
    url: typeof window !== "undefined" ? window.location.origin : "https://hypnos.app",
    iconUrl: "/logo.png"
  }
}: MetaMaskProviderProps) {
  // SDK and Provider State
  const [sdk, setSdk] = useState<MetaMaskSDK | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  
  // Account State
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  
  // Connection State
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Smart Account State
  const [smartAccount, setSmartAccount] = useState<SmartAccountInfo | null>(null);
  
  // ERC-7715 Permissions State
  const [grantedPermissions, setGrantedPermissions] = useState<GrantedPermission[]>([]);

  // Computed States
  const isConnected = useMemo(() => !!account, [account]);
  const isCorrectNetwork = useMemo(() => chainId === SEPOLIA_CHAIN_ID, [chainId]);
  const hasSmartAccount = useMemo(() => !!smartAccount, [smartAccount]);

  // Initialize SDK
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initSDK = async () => {
      try {
        const MMSDK = new MetaMaskSDK({
          dappMetadata,
          logging: {
            developerMode: process.env.NODE_ENV === "development",
          },
          checkInstallationImmediately: false,
          // Enable ERC-7715 capabilities
          extensionOnly: false,
          preferDesktop: true,
        });

        await MMSDK.init();
        setSdk(MMSDK);

        const sdkProvider = MMSDK.getProvider();
        if (sdkProvider) {
          const browserProvider = new BrowserProvider(sdkProvider as any);
          setProvider(browserProvider);

          // Check existing connection
          try {
            const accounts = await browserProvider.listAccounts();
            if (accounts.length > 0) {
              const address = accounts[0].address;
              setAccount(address);
              const signerInstance = await browserProvider.getSigner();
              setSigner(signerInstance);
              await fetchBalance(browserProvider, address);
            }
            
            const network = await browserProvider.getNetwork();
            setChainId(Number(network.chainId));
          } catch (e) {
            console.log("No existing connection");
          }

          // Setup event listeners
          setupEventListeners(sdkProvider);
        }
      } catch (error) {
        console.error("Failed to initialize MetaMask SDK:", error);
      }
    };

    initSDK();

    return () => {
      sdk?.terminate();
    };
  }, []);

  // Setup event listeners
  const setupEventListeners = useCallback((sdkProvider: SDKProvider) => {
    const handleAccountsChanged = async (accounts: unknown) => {
      const accountsList = accounts as string[];
      if (accountsList.length > 0) {
        setAccount(accountsList[0]);
        if (provider) {
          const signerInstance = await provider.getSigner();
          setSigner(signerInstance);
          await fetchBalance(provider, accountsList[0]);
        }
      } else {
        setAccount(null);
        setSigner(null);
        setBalance(null);
        setSmartAccount(null);
        setGrantedPermissions([]);
      }
    };

    const handleChainChanged = (newChainId: unknown) => {
      const chainIdStr = newChainId as string;
      setChainId(parseInt(chainIdStr, 16));
    };

    const handleDisconnect = () => {
      setAccount(null);
      setSigner(null);
      setBalance(null);
      setSmartAccount(null);
      setGrantedPermissions([]);
    };

    sdkProvider.on("accountsChanged", handleAccountsChanged);
    sdkProvider.on("chainChanged", handleChainChanged);
    sdkProvider.on("disconnect", handleDisconnect);

    return () => {
      sdkProvider.removeListener("accountsChanged", handleAccountsChanged);
      sdkProvider.removeListener("chainChanged", handleChainChanged);
      sdkProvider.removeListener("disconnect", handleDisconnect);
    };
  }, [provider]);

  // Fetch Balance
  const fetchBalance = useCallback(async (browserProvider: BrowserProvider, address: string) => {
    try {
      const bal = await browserProvider.getBalance(address);
      setBalance(ethers.formatEther(bal));
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  }, []);

  // Connect Wallet
  const connect = useCallback(async () => {
    if (!sdk || isConnecting) return;

    setIsConnecting(true);
    try {
      const sdkProvider = sdk.getProvider();
      if (!sdkProvider) throw new Error("No provider available");

      const accounts = await sdkProvider.request({
        method: "eth_requestAccounts",
      }) as string[];

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        const browserProvider = new BrowserProvider(sdkProvider as any);
        setProvider(browserProvider);
        
        const signerInstance = await browserProvider.getSigner();
        setSigner(signerInstance);
        
        const network = await browserProvider.getNetwork();
        setChainId(Number(network.chainId));
        
        await fetchBalance(browserProvider, accounts[0]);
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [sdk, isConnecting, fetchBalance]);

  // Disconnect Wallet
  const disconnect = useCallback(() => {
    if (sdk) {
      sdk.terminate();
    }
    setAccount(null);
    setSigner(null);
    setBalance(null);
    setSmartAccount(null);
    setGrantedPermissions([]);
  }, [sdk]);

  // Switch to Sepolia
  const switchToSepolia = useCallback(async () => {
    if (!sdk) return;

    const sdkProvider = sdk.getProvider();
    if (!sdkProvider) return;

    try {
      await sdkProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
    } catch (switchError: any) {
      // If chain doesn't exist, add it
      if (switchError.code === 4902) {
        await sdkProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID_HEX,
              chainName: "Sepolia Testnet",
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "SEP",
                decimals: 18,
              },
              rpcUrls: ["https://sepolia.infura.io/v3/"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }, [sdk]);

  // ERC-7715: Request Permissions
  const requestPermissions = useCallback(async (request: PermissionRequest): Promise<GrantedPermission | null> => {
    if (!sdk || !account) {
      throw new Error("Wallet not connected");
    }

    const sdkProvider = sdk.getProvider();
    if (!sdkProvider) {
      throw new Error("No provider available");
    }

    try {
      console.log("Requesting ERC-7715 permissions:", request);
      
      // Use wallet_grantPermissions (ERC-7715)
      const result = await sdkProvider.request({
        method: "wallet_grantPermissions",
        params: [request],
      }) as GrantedPermission;

      console.log("Permissions granted:", result);

      // Update state
      setGrantedPermissions((prev) => [...prev, result]);

      return result;
    } catch (error: any) {
      console.error("Failed to request permissions:", error);
      
      // If ERC-7715 is not supported, fall back to custom implementation
      if (error.code === -32601 || error.message?.includes("not supported")) {
        console.log("ERC-7715 not natively supported, using fallback");
        return null;
      }
      
      throw error;
    }
  }, [sdk, account]);

  // ERC-7715: Revoke Permissions
  const revokePermissions = useCallback(async (permissionsContext: string): Promise<boolean> => {
    if (!sdk) {
      throw new Error("Wallet not connected");
    }

    const sdkProvider = sdk.getProvider();
    if (!sdkProvider) {
      throw new Error("No provider available");
    }

    try {
      await sdkProvider.request({
        method: "wallet_revokePermissions",
        params: [{ permissionsContext }],
      });

      // Update state
      setGrantedPermissions((prev) => 
        prev.filter((p) => p.permissionsContext !== permissionsContext)
      );

      return true;
    } catch (error) {
      console.error("Failed to revoke permissions:", error);
      return false;
    }
  }, [sdk]);

  // ERC-7715: Get Permissions
  const getPermissions = useCallback(async (): Promise<GrantedPermission[]> => {
    if (!sdk) {
      return [];
    }

    const sdkProvider = sdk.getProvider();
    if (!sdkProvider) {
      return [];
    }

    try {
      const permissions = await sdkProvider.request({
        method: "wallet_getPermissions",
        params: [],
      }) as GrantedPermission[];

      setGrantedPermissions(permissions);
      return permissions;
    } catch (error) {
      console.error("Failed to get permissions:", error);
      return [];
    }
  }, [sdk]);

  // Create Smart Account
  const createSmartAccount = useCallback(async (): Promise<SmartAccountInfo | null> => {
    if (!sdk || !account) {
      throw new Error("Wallet not connected");
    }

    const sdkProvider = sdk.getProvider();
    if (!sdkProvider) {
      throw new Error("No provider available");
    }

    try {
      // Request Smart Account creation via MetaMask
      const result = await sdkProvider.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: "npm:@metamask/smart-account-snap",
          request: {
            method: "createAccount",
            params: {
              type: "erc-7715",
              owner: account,
            },
          },
        },
      }) as SmartAccountInfo;

      setSmartAccount(result);
      return result;
    } catch (error: any) {
      console.error("Failed to create Smart Account:", error);
      
      // Fallback: Simulate Smart Account for demo
      if (error.code === -32601 || error.message?.includes("not supported")) {
        const simulatedAccount: SmartAccountInfo = {
          address: ethers.getAddress(
            ethers.keccak256(
              ethers.solidityPacked(["address", "uint256"], [account, Date.now()])
            ).slice(0, 42)
          ),
          isDeployed: false,
          type: "erc-7715",
        };
        setSmartAccount(simulatedAccount);
        return simulatedAccount;
      }
      
      throw error;
    }
  }, [sdk, account]);

  // Execute with Permission (ERC-7715)
  const executeWithPermission = useCallback(async (
    permissionsContext: string,
    calls: Array<{ to: string; value: string; data: string }>
  ): Promise<string | null> => {
    if (!sdk) {
      throw new Error("Wallet not connected");
    }

    const sdkProvider = sdk.getProvider();
    if (!sdkProvider) {
      throw new Error("No provider available");
    }

    try {
      console.log("Executing with permission:", { permissionsContext, calls });
      
      // Use wallet_sendCalls (ERC-5792) with permissions
      const result = await sdkProvider.request({
        method: "wallet_sendCalls",
        params: [{
          version: "1.0",
          chainId: SEPOLIA_CHAIN_ID_HEX,
          from: account,
          calls: calls.map((call) => ({
            to: call.to,
            value: call.value,
            data: call.data,
          })),
          capabilities: {
            permissions: {
              context: permissionsContext,
            },
          },
        }],
      }) as string;

      console.log("Execution result:", result);
      return result;
    } catch (error) {
      console.error("Failed to execute with permission:", error);
      throw error;
    }
  }, [sdk, account]);

  const contextValue: MetaMaskContextType = {
    sdk,
    provider,
    signer,
    account,
    chainId,
    balance,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    smartAccount,
    hasSmartAccount,
    grantedPermissions,
    connect,
    disconnect,
    switchToSepolia,
    requestPermissions,
    revokePermissions,
    getPermissions,
    createSmartAccount,
    executeWithPermission,
  };

  return (
    <MetaMaskContext.Provider value={contextValue}>
      {children}
    </MetaMaskContext.Provider>
  );
}

export function useMetaMask() {
  const context = useContext(MetaMaskContext);
  if (context === undefined) {
    throw new Error("useMetaMask must be used within a MetaMaskProvider");
  }
  return context;
}

// Export types for external use
export type { MetaMaskContextType };
