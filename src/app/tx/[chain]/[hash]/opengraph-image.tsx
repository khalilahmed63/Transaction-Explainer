import type { Hash } from "viem";
import { APP_NAME } from "@/config/app";
import { getChainConfig } from "@/lib/blockchain/chains";
import { explainTransaction } from "@/lib/blockchain/fetch-transaction";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderStaticOgImage,
  renderTransactionOgImage,
  transactionTypeLabel,
} from "@/lib/og/transaction-card";
import {
  isSupportedChain,
  isValidTxHash,
  normalizeHash,
} from "@/lib/validation/transaction";

export const alt = `${APP_NAME} transaction explanation`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type ImageProps = {
  params: Promise<{ chain: string; hash: string }>;
};

export default async function Image({ params }: ImageProps) {
  try {
    const { chain: chainParam, hash: hashParam } = await params;

    if (!isSupportedChain(chainParam) || !isValidTxHash(hashParam)) {
      return renderStaticOgImage();
    }

    const chain = chainParam;
    const hash = normalizeHash(hashParam) as Hash;
    const data = await explainTransaction(chain, hash);
    const chainName = getChainConfig(chain).name;

    return renderTransactionOgImage({
      chainName,
      typeLabel: transactionTypeLabel(data.transactionType),
      summary: data.summary,
    });
  } catch {
    // Never break link unfurls — fall back to the homepage-style card.
    return renderStaticOgImage();
  }
}
