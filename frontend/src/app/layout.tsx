import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/providers/InterwovenProvider";

export const metadata: Metadata = {
  title: "initflow",
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

