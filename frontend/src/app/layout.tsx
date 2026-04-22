import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/providers/InterwovenProvider";

export const metadata: Metadata = {
  title: "INITIATE AI S1",
  description: "Visual AI-agent orchestration with secure DeFi execution on Initia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}

