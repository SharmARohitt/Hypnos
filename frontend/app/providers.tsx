"use client";

import { ReactNode } from "react";
import { MetaMaskProvider } from "@/providers/MetaMaskProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MetaMaskProvider
      dappMetadata={{
        name: "Hypnos",
        url: typeof window !== "undefined" ? window.location.origin : "https://hypnos.app",
        iconUrl: "/logo.png",
      }}
    >
      {children}
    </MetaMaskProvider>
  );
}
