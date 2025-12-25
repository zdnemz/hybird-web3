"use client";

import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import { useConnectors } from "wagmi";

export default function ConnectPage() {
  const { login, isLoading } = useAuth();
  const connectors = useConnectors();
  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <div className="p-6">
        <h1>Connect Your Wallet</h1>
        <p>Please connect your wallet to access the dashboard.</p>
        <div className="mt-4 flex max-w-sm flex-col gap-2">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => login(connector.id)}
              className="bg-foreground text-background hover:bg-foreground/80 flex cursor-pointer items-center gap-2 rounded-md px-4 py-1 transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              <span>
                <Image
                  src={connector.icon || "/wallets/generic-wallet-icon.svg"}
                  alt={connector.name}
                  width={20}
                  height={20}
                />
              </span>
              <span>Connect with {connector.name}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
