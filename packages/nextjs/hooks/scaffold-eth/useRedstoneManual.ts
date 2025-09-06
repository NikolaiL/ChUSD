import { useCallback, useState } from "react";
import { useAccount } from "wagmi";

/**
 * Hook for generating RedStone manual payloads without ethers.js dependencies
 * This approach fetches price data directly from RedStone's API and creates a minimal payload
 */
export const useRedstoneManual = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch ETH price from RedStone API
   */
  const fetchEthPrice = useCallback(async (): Promise<number> => {
    try {
      // Fetch from RedStone's public API
      const response = await fetch("https://api.redstone.finance/prices?symbol=ETH&provider=redstone&limit=1");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("No price data received");
      }

      // Return the price value (assuming it's in USD with 8 decimals)
      return parseFloat(data[0].value);
    } catch (error) {
      console.error("Failed to fetch ETH price from RedStone:", error);
      throw error;
    }
  }, []);

  /**
   * Generate a simple RedStone payload for manual usage
   * This creates a minimal payload that can be used with our RedStone Extractor contract
   */
  const generateRedstonePayload = useCallback(async (): Promise<string> => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    try {
      setIsLoading(true);

      // Fetch current ETH price
      const ethPrice = await fetchEthPrice();

      // Create a simple payload structure
      // This is a simplified version - in production you'd want to use the full RedStone SDK
      const payload = {
        timestamp: Math.floor(Date.now() / 1000),
        price: Math.floor(ethPrice * 1e8), // Convert to 8 decimal places
        symbol: "ETH",
        source: "redstone-manual",
      };

      // Encode as hex string (simplified encoding)
      const payloadHex = "0x" + Buffer.from(JSON.stringify(payload)).toString("hex");

      return payloadHex;
    } catch (error) {
      console.error("Failed to generate RedStone payload:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, fetchEthPrice]);

  return {
    generateRedstonePayload,
    isLoading,
    isAvailable: !!address,
  };
};
