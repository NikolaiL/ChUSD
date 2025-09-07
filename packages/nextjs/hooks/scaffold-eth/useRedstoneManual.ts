import { useCallback, useState } from "react";
import { useAccount } from "wagmi";

/**
 * Hook for generating RedStone manual payloads WITHOUT ethers.js dependencies
 * This avoids the ethers.js compatibility issues by using direct API calls
 * Reference: https://docs.redstone.finance/docs/dapps/redstone-pull/#manual-payload
 */
export const useRedstoneManual = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Generate RedStone payload using direct API calls (NO ETHERJS DEPENDENCIES)
   * This avoids the ethers.js compatibility issues
   */
  const generateRedstonePayload = useCallback(async (): Promise<string> => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    try {
      setIsLoading(true);

      // Fetch RedStone data directly from their API to avoid ethers.js dependencies
      const response = await fetch("https://api.redstone.finance/prices?symbol=ETH&provider=redstone&limit=1");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("No price data received");
      }

      const ethPrice = parseFloat(data[0].value);

      // Create a simple RedStone payload structure that our contract can understand
      // This mimics the manual payload format without using ethers.js
      const redstonePayload = {
        dataServiceId: "redstone-main-demo",
        dataFeeds: ["ETH"],
        timestamp: Math.floor(Date.now() / 1000),
        prices: {
          ETH: Math.floor(ethPrice * 1e8), // 8 decimal places as per RedStone standard
        },
        signatures: [], // Empty for manual usage
        dataPoints: [
          {
            dataFeedId: "ETH",
            value: Math.floor(ethPrice * 1e8),
            decimals: 8,
            timestamp: Math.floor(Date.now() / 1000),
          },
        ],
      };

      // Encode the payload as hex string for contract interaction
      const payloadHex = "0x" + Buffer.from(JSON.stringify(redstonePayload)).toString("hex");

      console.log("Generated RedStone manual payload (NO ETHERJS):", redstonePayload);
      console.log("Payload hex:", payloadHex);

      return payloadHex;
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
