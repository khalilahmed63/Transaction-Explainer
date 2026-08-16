import { createPublicClient, http, type PublicClient } from "viem";
import type { SupportedChain } from "@/types/transaction";
import { getChainConfig } from "./chains";

function getRpcUrl(chain: SupportedChain): string {
  const { rpcEnvKey } = getChainConfig(chain);
  const url = process.env[rpcEnvKey];

  if (!url) {
    throw new Error(
      `${rpcEnvKey} is not configured. Add it to your environment variables.`,
    );
  }

  return url;
}

const clientCache = new Map<SupportedChain, PublicClient>();

export function getPublicClient(chain: SupportedChain): PublicClient {
  const cached = clientCache.get(chain);
  if (cached) return cached;

  const config = getChainConfig(chain);
  const client = createPublicClient({
    chain: config.viemChain,
    transport: http(getRpcUrl(chain), {
      timeout: 20_000,
      retryCount: 2,
    }),
  });

  clientCache.set(chain, client);
  return client;
}

/** Clear cached clients — useful when RPC env changes or in tests */
export function clearPublicClientCache(): void {
  clientCache.clear();
}
