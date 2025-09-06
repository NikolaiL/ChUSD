import { useCallback, useState } from "react";
import { useRedstoneWrapper } from "./useRedstoneWrapper";
import { useScaffoldWriteContract } from "./useScaffoldWriteContract";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";

/**
 * Hook for writing to contracts with RedStone price data injection
 * This automatically injects RedStone price data into transactions
 * that require oracle data (like deposit, mint, etc.)
 */
export const useScaffoldWriteContractWithRedstone = () => {
  const { address } = useAccount();
  const { getRedstonePayload, isWrapped } = useRedstoneWrapper();
  const { writeContractAsync: originalWriteContractAsync } = useScaffoldWriteContract({
    contractName: "Manager",
  });
  const [isLoading, setIsLoading] = useState(false);

  const writeContractAsync = useCallback(
    async (args: { functionName: string; args?: readonly unknown[]; value?: bigint }) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      if (!getRedstonePayload) {
        throw new Error("RedStone not available");
      }

      try {
        setIsLoading(true);

        // Show loading toast
        toast.loading("Preparing transaction with price data...", { id: "redstone-tx" });

        // Get RedStone payload (we need to pass a contract instance, but we'll use a mock)
        const redstonePayload = await getRedstonePayload({} as any);
        if (!redstonePayload) {
          throw new Error("Failed to get RedStone price data");
        }

        // Execute the contract method with RedStone payload
        const tx = await originalWriteContractAsync({
          functionName: args.functionName as "deposit" | "mint" | "burn" | "depositAndMint" | "liquidate" | "withdraw",
          args: [...(args.args || []), redstonePayload] as any,
          value: args.value,
        });

        // Success message is handled by the original hook
        toast.success("Transaction with live price data successful!", { id: "redstone-tx" });

        return tx;
      } catch (error: any) {
        console.error("RedStone contract write error:", error);

        // Enhanced error messages for RedStone-specific issues
        let errorMessage = "Transaction failed";

        if (error.message?.includes("RedStone")) {
          errorMessage = "Price data verification failed. Please try again.";
        } else if (error.message?.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction";
        } else if (error.message?.includes("user rejected")) {
          errorMessage = "Transaction rejected by user";
        } else if (error.shortMessage) {
          errorMessage = error.shortMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage, { id: "redstone-tx" });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, getRedstonePayload, originalWriteContractAsync],
  );

  return {
    writeContractAsync,
    isLoading,
    isWrapped,
  };
};
