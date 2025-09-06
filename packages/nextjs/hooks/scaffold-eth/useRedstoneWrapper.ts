import { useMemo } from "react";
import { DataServiceWrapper } from "@redstone-finance/evm-connector";
import { getSignersForDataServiceId } from "@redstone-finance/sdk";

/**
 * Hook to create RedStone data service wrapper for price data injection
 * This provides the RedStone payload that can be injected into transactions
 */
export const useRedstoneWrapper = () => {
  const dataServiceWrapper = useMemo(() => {
    try {
      // Create RedStone data service wrapper
      // Using redstone-main-demo since ManagerBase extends MainDemoConsumerBase
      return new DataServiceWrapper({
        dataServiceId: "redstone-main-demo",
        dataPackagesIds: ["ETH"], // We only need ETH price for this contract
        authorizedSigners: getSignersForDataServiceId("redstone-main-demo"),
      });
    } catch (error) {
      console.error("Failed to create RedStone data service wrapper:", error);
      return null;
    }
  }, []);

  const getRedstonePayload = useMemo(() => {
    if (!dataServiceWrapper) return null;

    return async (contract: any) => {
      try {
        // Get RedStone payload for manual usage
        return await dataServiceWrapper.getRedstonePayloadForManualUsage(contract);
      } catch (error) {
        console.error("Failed to get RedStone payload:", error);
        return null;
      }
    };
  }, [dataServiceWrapper]);

  return {
    dataServiceWrapper,
    getRedstonePayload,
    isWrapped: !!dataServiceWrapper && !!getRedstonePayload,
  };
};
