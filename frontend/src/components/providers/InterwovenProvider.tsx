"use client";

import { ReactNode } from "react";
import { InterwovenKitProvider } from "@initia/interwovenkit-react";

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <InterwovenKitProvider
      chainId={process.env.NEXT_PUBLIC_INITIA_CHAIN_ID || "11155111"}
      apiEndpoint="https://api.testnet.initia.xyz"
    >
      {children}
    </InterwovenKitProvider>
  );
}
