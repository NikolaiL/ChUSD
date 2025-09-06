import { useCallback, useState } from "react";
import { useRedstoneManual } from "./useRedstoneManual";
import { useScaffoldWriteContract } from "./useScaffoldWriteContract";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";

/**
 * Hook for writing to contracts with RedStone manual payload approach
 * This avoids ethers.js compatibility issues by using direct API calls
 */
export const useScaffoldWriteContractWithRedstoneManual = () => {
  const { address } = useAccount();
  const { generateRedstonePayload, isLoading: isRedstoneLoading } = useRedstoneManual();
  const { writeContractAsync: originalWriteContractAsync } = useScaffoldWriteContract({
    contractName: "Manager",
  });
  const [isLoading, setIsLoading] = useState(false);

  const writeContractAsync = useCallback(
    async (args: { functionName: string; args?: readonly unknown[]; value?: bigint }) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      try {
        setIsLoading(true);
        toast.loading("Preparing transaction with live price data...", { id: "redstone-tx" });

        // Generate RedStone payload
        const redstonePayload = await generateRedstonePayload();

        // Call the contract function with the payload as additional argument
        const tx = await originalWriteContractAsync({
          functionName: args.functionName as "deposit" | "mint" | "burn" | "depositAndMint" | "liquidate" | "withdraw",
          args: [...(args.args || []), redstonePayload] as any,
          value: args.value,
        });

        toast.success("Transaction with live price data successful!", { id: "redstone-tx" });
        return tx;
      } catch (error: any) {
        console.error("RedStone transaction error:", error);

        let errorMessage = "Transaction failed";
        if (error.message?.includes("User rejected")) {
          errorMessage = "Transaction rejected by user";
        } else if (error.message?.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction";
        } else if (error.message?.includes("price")) {
          errorMessage = "Failed to fetch price data";
        }

        toast.error(errorMessage, { id: "redstone-tx" });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, generateRedstonePayload, originalWriteContractAsync],
  );

  return {
    writeContractAsync,
    isLoading: isLoading || isRedstoneLoading,
    isWrapped: true,
  };
};
