import { useScaffoldReadContract } from "./useScaffoldReadContract";
import { parseEther } from "viem";
import { useAccount } from "wagmi";

/**
 * Hook to calculate mintable tokens for a user with additional ETH
 * @param additionalEthAmount - The additional ETH amount to calculate for (in ETH string format like "0.1")
 */
export const useMintableTokens = (additionalEthAmount: string) => {
  const { address } = useAccount();

  // Convert ETH string to wei
  const additionalEthWei = additionalEthAmount ? parseEther(additionalEthAmount) : 0n;

  const { data: mintableTokens, isLoading } = useScaffoldReadContract({
    contractName: "Manager",
    functionName: "calculateMintableTokensForUser",
    args: address ? [address, additionalEthWei] : [undefined, undefined],
  });

  return {
    mintableTokens,
    isLoading,
    additionalEthWei,
  };
};
