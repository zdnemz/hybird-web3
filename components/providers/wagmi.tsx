"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, WagmiProvider as BaseProvider, http } from "wagmi";
import { localhost, mainnet, sepolia } from "wagmi/chains";

const chains = [mainnet, sepolia, localhost] as const;

const config = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [localhost.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function WagmiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BaseProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BaseProvider>
  );
}
