import { useScaffoldReadContract } from "./useScaffoldReadContract";
import { useAccount } from "wagmi";

/**
 * Hook to check if a user has interacted with the ChUSD contract
 * Checks multiple conditions:
 * 1. ChUSD token balance > 0
 * 2. User has deposits (depositOf > 0)
 * 3. User has minted tokens (mintOf > 0)
 */
export const useUserInteractionStatus = () => {
  const { address } = useAccount();

  // Check ChUSD balance
  const { data: chUsdBalance } = useScaffoldReadContract({
    contractName: "ChUSD",
    functionName: "balanceOf",
    args: address ? [address] : [undefined],
  });

  // Check deposit amount
  const { data: depositAmount } = useScaffoldReadContract({
    contractName: "Manager",
    functionName: "depositOf",
    args: address ? [address] : [undefined],
  });

  // Check minted amount
  const { data: mintedAmount } = useScaffoldReadContract({
    contractName: "Manager",
    functionName: "mintOf",
    args: address ? [address] : [undefined],
  });

  // User has interacted if any of these conditions are true
  const hasInteracted =
    (chUsdBalance && chUsdBalance > 0n) || (depositAmount && depositAmount > 0n) || (mintedAmount && mintedAmount > 0n);

  return {
    hasInteracted,
    chUsdBalance,
    depositAmount,
    mintedAmount,
    isConnected: !!address,
  };
};
