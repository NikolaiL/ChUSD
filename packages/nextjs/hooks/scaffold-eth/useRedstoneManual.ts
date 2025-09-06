import { useCallback, useState } from "react";
import { DataServiceWrapper } from "@redstone-finance/evm-connector";
import { useAccount } from "wagmi";

/**
 * Hook for generating RedStone manual payloads using the official RedStone SDK
 * This approach uses the proper getRedstonePayloadForManualUsage method
 */
export const useRedstoneManual = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Generate RedStone payload for manual usage using the official SDK
   * This follows the RedStone documentation pattern
   */
  const generateRedstonePayload = useCallback(async (): Promise<string> => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    try {
      setIsLoading(true);

      // Create a mock contract object for the RedStone SDK
      // The SDK needs a contract object with the correct interface
      const mockContract = {
        address: address, // Use the user's address as a placeholder
        interface: {
          // Mock interface - the SDK will use this to determine the correct payload format
        },
      };

      // Use the official RedStone SDK to generate the payload
      const redstonePayload = await new DataServiceWrapper({
        dataServiceId: "redstone-main-demo",
        dataPackagesIds: ["redstone-main-demo"],
        authorizedSigners: [], // Empty array for demo purposes
      }).getRedstonePayloadForManualUsage(mockContract as any);

      return redstonePayload;
    } catch (error) {
      console.error("Failed to generate RedStone payload:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  return {
    generateRedstonePayload,
    isLoading,
    isAvailable: !!address,
  };
};
