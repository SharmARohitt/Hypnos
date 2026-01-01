"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

interface MetaMaskContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  chainId: number | null;
  isCorrectNetwork: boolean;
  switchToSepolia: () => Promise<void>;
  balance: string | null;
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

const SEPOLIA_CHAIN_ID = 11155111;

export function MetaMaskProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const fetchBalance = useCallback(async (browserProvider: BrowserProvider, address: string) => {
    try {
      const bal = await browserProvider.getBalance(address);
      setBalance((Number(bal) / 1e18).toFixed(4));
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const browserProvider = new BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      // Check if already connected
      browserProvider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          const address = accounts[0].address;
          setAccount(address);
          browserProvider.getSigner().then(setSigner);
          fetchBalance(browserProvider, address);
        }
      });

      browserProvider.getNetwork().then((network) => {
        setChainId(Number(network.chainId));
      });

      // Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          browserProvider.getSigner().then(setSigner);
          fetchBalance(browserProvider, accounts[0]);
        } else {
          setAccount(null);
          setSigner(null);
          setBalance(null);
        }
      };

      // Listen for chain changes
      const handleChainChanged = (newChainId: string) => {
        setChainId(parseInt(newChainId, 16));
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [fetchBalance]);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // Sepolia
      });
    } catch (switchError: any) {
      // If chain doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia Testnet",
              rpcUrls: ["https://rpc.sepolia.org"],
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "ETH",
                decimals: 18,
              },
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      fetchBalance(browserProvider, address);

      // Prompt to switch to Sepolia if not on it
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        await switchToSepolia();
      }
    } catch (error) {
      console.error("Connection error:", error);
    }
  }, [fetchBalance, switchToSepolia]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setSigner(null);
    setBalance(null);
  }, []);

  return (
    <MetaMaskContext.Provider
      value={{
        provider,
        signer,
        account,
        connect,
        disconnect,
        isConnected: !!account && !!signer,
        chainId,
        isCorrectNetwork: chainId === SEPOLIA_CHAIN_ID,
        switchToSepolia,
        balance,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
}

export function useMetaMask() {
  const context = useContext(MetaMaskContext);
  if (context === undefined) {
    throw new Error("useMetaMask must be used within MetaMaskProvider");
  }
  return context;
}
