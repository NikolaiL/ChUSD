"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import type { NextPage } from "next";
import toast from "react-hot-toast";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useBalance } from "wagmi";
import { useMintableTokens } from "~~/hooks/scaffold-eth/useMintableTokens";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useUserInteractionStatus } from "~~/hooks/scaffold-eth/useUserInteractionStatus";

const Home: NextPage = () => {
  const { isConnected, address, chain } = useAccount();
  const { hasInteracted } = useUserInteractionStatus();
  const { setFrameReady, isFrameReady } = useMiniKit();
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [isDepositing, setIsDepositing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [sliderValue, setSliderValue] = useState(3);
  const [showActionModal, setShowActionModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"withdraw" | "refill">("withdraw");
  const [actionType, setActionType] = useState<
    "burn" | "withdraw" | "deposit" | "mint" | "burnAndWithdraw" | "depositAndMint" | null
  >(null);
  const [actionAmount, setActionAmount] = useState("0.1");
  const [burnAndWithdrawAmount, setBurnAndWithdrawAmount] = useState("0.1");
  const [depositAndMintAmount, setDepositAndMintAmount] = useState("0.1");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Debug logging
  console.log("Wallet connected:", isConnected);
  console.log("Wallet address:", address);
  console.log("Wallet chain ID:", chain?.id);
  console.log("Wallet chain name:", chain?.name);
  console.log("Expected chain ID: 84532 (Base Sepolia)");
  console.log("Is on correct network:", chain?.id === 84532);

  // Check if wallet is on the wrong network
  // Override MetaMask's incorrect network detection
  const [actualChainId, setActualChainId] = useState<number | null>(null);

  useEffect(() => {
    if (isConnected && window.ethereum) {
      window.ethereum.request({ method: "eth_chainId" }).then((chainId: string) => {
        const chainIdNumber = parseInt(chainId, 16);
        setActualChainId(chainIdNumber);
        console.log("Actual chain ID from MetaMask:", chainIdNumber);
      });
    }
  }, [isConnected]);

  const isWrongNetwork = isConnected && actualChainId !== 84532;

  // Manual network check and force switch
  useEffect(() => {
    if (isConnected && window.ethereum) {
      // Force MetaMask to refresh its network detection
      const refreshNetwork = () => {
        window.ethereum.request({ method: "eth_chainId" }).then((chainId: string) => {
          const chainIdNumber = parseInt(chainId, 16);
          console.log("Manual chain ID check:", chainIdNumber);
          console.log("Manual chain ID in hex:", chainId);
          console.log("Expected: 84532 (0x14a34)");

          // Force switch to Base Sepolia if on wrong network
          if (chainIdNumber !== 84532) {
            console.log("🔄 Forcing network switch to Base Sepolia...");
            console.log("Current chain ID:", chainIdNumber, "Expected: 84532");

            // Try to switch first
            window.ethereum
              .request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x14a34" }], // 84532 in hex
              })
              .catch((error: any) => {
                console.log("Switch failed, error code:", error.code);
                if (error.code === 4902) {
                  // Chain not added, add it
                  console.log("➕ Adding Base Sepolia network...");
                  window.ethereum
                    .request({
                      method: "wallet_addEthereumChain",
                      params: [
                        {
                          chainId: "0x14a34",
                          chainName: "Base Sepolia",
                          rpcUrls: ["https://sepolia.base.org"],
                          nativeCurrency: {
                            name: "Ethereum",
                            symbol: "ETH",
                            decimals: 18,
                          },
                          blockExplorerUrls: ["https://sepolia.basescan.org"],
                        },
                      ],
                    })
                    .then(() => {
                      console.log("✅ Base Sepolia network added successfully");
                      // Try to switch again after adding
                      window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x14a34" }],
                      });
                    })
                    .catch((addError: any) => {
                      console.error("❌ Failed to add Base Sepolia network:", addError);
                      console.log("This might be due to MetaMask caching. Try manually adding the network.");
                    });
                } else if (error.code === 4900) {
                  // User rejected the request
                  console.log("User rejected network switch");
                } else {
                  console.error("Network switch error:", error);
                  console.log("Error details:", error.message);
                }
              });
          }
        });
      };

      // Initial check
      refreshNetwork();

      // Listen for network changes
      const handleChainChanged = (chainId: string) => {
        console.log("Chain changed to:", parseInt(chainId, 16));
        refreshNetwork();
      };

      window.ethereum.on("chainChanged", handleChainChanged);

      // Cleanup
      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [isConnected]);

  // RedStone manual payload contract write hook - COMMENTED OUT
  // const { writeContractAsync: writeManagerAsync, isLoading: isManagerLoading } =
  //   useScaffoldWriteContractWithRedstoneManual();

  // Calculate mintable tokens for the deposit amount
  const { mintableTokens, isLoading: isLoadingMintable } = useMintableTokens(depositAmount);

  // Get user's ETH balance
  const { data: balance } = useBalance({
    address: address,
  });

  // Contract write hooks
  const { writeContractAsync: writeManagerAsync } = useScaffoldWriteContract({
    contractName: "Manager",
  });

  // Get user's ChUSD balance
  const { data: chUsdBalance } = useScaffoldReadContract({
    contractName: "ChUSD",
    functionName: "balanceOf",
    args: address ? [address] : [undefined],
  });

  // Get user's deposited ETH
  const { data: depositedEth } = useScaffoldReadContract({
    contractName: "Manager",
    functionName: "depositOf",
    args: address ? [address] : [undefined],
  });

  // Get user's minted ChUSD
  const { data: mintedChUsd } = useScaffoldReadContract({
    contractName: "Manager",
    functionName: "mintOf",
    args: address ? [address] : [undefined],
  });

  // Validation states
  const isNegativeAmount = parseFloat(depositAmount) < 0;
  const isExceedingBalance = balance && parseFloat(depositAmount) > parseFloat(balance.formatted);
  const isValidAmount = depositAmount && parseFloat(depositAmount) > 0 && !isNegativeAmount && !isExceedingBalance;

  // Mood mapping for active users
  const moodImages = {
    1: "/pikachu-excited.png",
    2: "/pikachu-happy.png",
    3: "/pikachu-neutral.png",
    4: "/pikachu-sad.png",
    5: "/pikachu-anxious.png",
  };

  const moodLabels = {
    1: "Excited",
    2: "Happy",
    3: "Neutral",
    4: "Sad",
    5: "Anxious",
  };

  // Initialize MiniKit
  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  // Add class to body to prevent scrolling
  useEffect(() => {
    document.body.classList.add("home-page");
    return () => {
      document.body.classList.remove("home-page");
    };
  }, []);

  // Handle slider change for active users
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(e.target.value));
  };

  // Handle deposit amount change with validation
  const handleDepositAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Prevent negative numbers
    if (value.startsWith("-")) {
      return;
    }
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setDepositAmount(value);
    }
  };

  // Show prompt after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Handle animation click
  const handleAnimationClick = () => {
    setShowDepositModal(true);
    setShowPrompt(false);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowDepositModal(false);
  };

  // Handle action modal close
  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setActiveTab("withdraw");
    setActionType(null);
    setActionAmount("0.1");
    setBurnAndWithdrawAmount("0.1");
    setDepositAndMintAmount("0.1");
    setActionError(null);
    setActionSuccess(null);
  };

  // Handle burn and withdraw amount change
  const handleBurnAndWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith("-")) {
      return;
    }
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setBurnAndWithdrawAmount(value);
      setActionError(null);
      setActionSuccess(null);
    }
  };

  // Handle deposit and mint amount change
  const handleDepositAndMintAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith("-")) {
      return;
    }
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setDepositAndMintAmount(value);
      setActionError(null);
      setActionSuccess(null);
    }
  };

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }

    try {
      setIsDepositing(true);

      // COMMENTED OUT: RedStone manual payload contract write
      // await writeManagerAsync({
      //   functionName: "deposit",
      //   value: parseEther(depositAmount),
      // });

      // Simulate deposit success and show animation view
      toast.success(`Deposit of ${depositAmount} ETH simulated successfully!`);

      // Close the modal and trigger the animation view
      setShowDepositModal(false);

      // Simulate a successful deposit by setting the user as having interacted
      // This will trigger the animation view with different expressions
      // Dispatch immediately to avoid showing the animation video
      window.dispatchEvent(
        new CustomEvent("userDeposited", {
          detail: { amount: depositAmount },
        }),
      );
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast.error("Deposit failed. Please try again.");
    } finally {
      setIsDepositing(false);
    }
  };

  // Handle action execution
  const handleAction = async () => {
    if (!isConnected) {
      setActionError("Please connect your wallet first");
      return;
    }

    if (!actionType) {
      setActionError("Please select an action type");
      return;
    }

    // Special validation for burnAndWithdraw and depositAndMint
    if (actionType === "burnAndWithdraw") {
      if (!burnAndWithdrawAmount || parseFloat(burnAndWithdrawAmount) <= 0) {
        setActionError("Please enter a valid amount");
        return;
      }
    } else if (actionType === "depositAndMint") {
      if (!depositAndMintAmount || parseFloat(depositAndMintAmount) <= 0) {
        setActionError("Please enter a valid amount");
        return;
      }
    } else {
      if (!actionAmount || parseFloat(actionAmount) <= 0) {
        setActionError("Please enter a valid amount");
        return;
      }
    }

    try {
      setIsActionLoading(true);
      setActionError(null);
      setActionSuccess(null);

      const amount = parseEther(actionAmount);

      switch (actionType) {
        case "burn":
          await writeManagerAsync({
            functionName: "burn",
            args: [amount],
          });
          setActionSuccess(`Successfully burned ${actionAmount} ChUSD`);
          break;

        case "withdraw":
          await writeManagerAsync({
            functionName: "withdraw",
            args: [amount],
          });
          setActionSuccess(`Successfully withdrew ${actionAmount} ETH`);
          break;

        case "deposit":
          await writeManagerAsync({
            functionName: "deposit",
            value: amount,
          });
          setActionSuccess(`Successfully deposited ${actionAmount} ETH`);
          break;

        case "mint":
          await writeManagerAsync({
            functionName: "mint",
            args: [amount],
          });
          setActionSuccess(`Successfully minted ${actionAmount} ChUSD`);
          break;

        case "burnAndWithdraw":
          await (writeManagerAsync as any)({
            functionName: "burnAndWithdraw",
            args: [parseEther(burnAndWithdrawAmount)],
          });
          setActionSuccess(`Successfully burned and withdrew ${burnAndWithdrawAmount} ChUSD/ETH`);
          break;

        case "depositAndMint":
          await (writeManagerAsync as any)({
            functionName: "depositAndMint",
            args: [parseEther(depositAndMintAmount)],
          });
          setActionSuccess(`Successfully deposited and minted ${depositAndMintAmount} ETH/ChUSD`);
          break;
      }

      toast.success(
        `${actionType} of ${actionAmount} ${actionType === "burn" || actionType === "mint" ? "ChUSD" : "ETH"} completed successfully!`,
      );

      // Close modal after a short delay to show success message
      setTimeout(() => {
        handleCloseActionModal();
      }, 1500);
    } catch (error: any) {
      console.error("Action error:", error);
      const errorMessage = error.message || "Action failed. Please try again.";
      setActionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Show different content based on user interaction status
  if (hasInteracted) {
    // Active user - show Pikachu slider content
    return (
      <div className="h-screen bg-gradient-to-br from-yellow-100 to-yellow-200 flex flex-col">
        {/* Mobile-first responsive container */}
        <div className="container mx-auto px-4 py-4 max-w-md sm:max-w-lg md:max-w-2xl flex-1 flex flex-col">
          {/* Pikachu Mood Display */}
          <div className="mb-4 flex-1 flex items-center justify-center">
            <button
              onClick={() => setShowActionModal(true)}
              className="relative w-full max-w-sm aspect-square bg-yellow-100 rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-300">
                {/* Pikachu Mood Image - fills entire card */}
                <div className="relative w-full h-full">
                  <Image
                    src={moodImages[sliderValue as keyof typeof moodImages]}
                    alt={`Pikachu ${moodLabels[sliderValue as keyof typeof moodLabels]}`}
                    width={512}
                    height={512}
                    className="w-full h-full object-cover drop-shadow-lg"
                  />
                </div>
              </div>
            </button>
          </div>

          {/* Slider Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Mood Slider</h2>

            <div className="space-y-4">
              {/* Slider */}
              <div className="px-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(sliderValue - 1) * 25}%, #e5e7eb ${(sliderValue - 1) * 25}%, #e5e7eb 100%)`,
                  }}
                />

                {/* Slider Labels */}
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span className="font-medium">1</span>
                  <span className="font-medium">2</span>
                  <span className="font-medium">3</span>
                  <span className="font-medium">4</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-600">Powered by ⚡ Pikachu Moods & Scaffold-ETH 2</p>
          </div>
        </div>

        {/* Action Modal */}
        {showActionModal && (
          <div
            className="fixed inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 bg-opacity-95 flex items-center justify-center p-4 z-50"
            onClick={handleCloseActionModal}
          >
            <div
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 animate-in fade-in-0 zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseActionModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">DeFi Actions</h2>

              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                <button
                  onClick={() => {
                    setActiveTab("withdraw");
                    setActionType(null);
                    setActionError(null);
                    setActionSuccess(null);
                    setBurnAndWithdrawAmount("0.1");
                    setDepositAndMintAmount("0.1");
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === "withdraw" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  💸 Withdraw
                </button>
                <button
                  onClick={() => {
                    setActiveTab("refill");
                    setActionType(null);
                    setActionError(null);
                    setActionSuccess(null);
                    setBurnAndWithdrawAmount("0.1");
                    setDepositAndMintAmount("0.1");
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === "refill" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  💰 Refill
                </button>
              </div>

              {/* Balance Overview */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Balances</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ETH Balance:</span>
                    <span className="font-medium">{balance?.formatted || "0.0000"} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ChUSD Balance:</span>
                    <span className="font-medium">
                      {chUsdBalance ? (Number(chUsdBalance) / 1e18).toFixed(4) : "0.0000"} ChUSD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposited ETH:</span>
                    <span className="font-medium">
                      {depositedEth ? (Number(depositedEth) / 1e18).toFixed(4) : "0.0000"} ETH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minted ChUSD:</span>
                    <span className="font-medium">
                      {mintedChUsd ? (Number(mintedChUsd) / 1e18).toFixed(4) : "0.0000"} ChUSD
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "withdraw" ? (
                // Withdraw Tab - Burn and Withdraw Form
                <div className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <label htmlFor="burnAndWithdrawAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (ChUSD/ETH)
                    </label>
                    <input
                      id="burnAndWithdrawAmount"
                      type="text"
                      value={burnAndWithdrawAmount}
                      onChange={handleBurnAndWithdrawAmountChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-200 ${
                        actionError
                          ? "border-red-300 bg-red-50 focus:ring-red-500"
                          : "border-gray-300 focus:ring-yellow-500"
                      }`}
                      placeholder="0.1"
                    />
                  </div>

                  {/* Error Message */}
                  {actionError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {actionError}
                    </p>
                  )}

                  {/* Success Message */}
                  {actionSuccess && (
                    <p className="mt-2 text-sm text-green-600 flex items-center">
                      <span className="mr-1">✅</span>
                      {actionSuccess}
                    </p>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      setActionType("burnAndWithdraw");
                      handleAction();
                    }}
                    disabled={
                      !burnAndWithdrawAmount ||
                      parseFloat(burnAndWithdrawAmount) <= 0 ||
                      isActionLoading ||
                      !!actionError
                    }
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isActionLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "🔥💸 Burn & Withdraw"
                    )}
                  </button>
                </div>
              ) : (
                // Refill Tab - Deposit and Mint Form
                <div className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <label htmlFor="depositAndMintAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (ETH/ChUSD)
                    </label>
                    <input
                      id="depositAndMintAmount"
                      type="text"
                      value={depositAndMintAmount}
                      onChange={handleDepositAndMintAmountChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-200 ${
                        actionError
                          ? "border-red-300 bg-red-50 focus:ring-red-500"
                          : "border-gray-300 focus:ring-yellow-500"
                      }`}
                      placeholder="0.1"
                    />
                  </div>

                  {/* Error Message */}
                  {actionError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {actionError}
                    </p>
                  )}

                  {/* Success Message */}
                  {actionSuccess && (
                    <p className="mt-2 text-sm text-green-600 flex items-center">
                      <span className="mr-1">✅</span>
                      {actionSuccess}
                    </p>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      setActionType("depositAndMint");
                      handleAction();
                    }}
                    disabled={
                      !depositAndMintAmount || parseFloat(depositAndMintAmount) <= 0 || isActionLoading || !!actionError
                    }
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isActionLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "💰🪙 Deposit & Mint"
                    )}
                  </button>
                </div>
              )}

              {/* Info Text */}
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">Production Ready - Real contract interactions</p>
              </div>
            </div>
          </div>
        )}

        {/* Custom Slider Styles */}
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #fbbf24;
            cursor: pointer;
            border: 3px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
          }

          .slider::-webkit-slider-thumb:hover {
            background: #f59e0b;
            transform: scale(1.1);
          }

          .slider::-moz-range-thumb {
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #fbbf24;
            cursor: pointer;
            border: 3px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
          }

          .slider::-moz-range-thumb:hover {
            background: #f59e0b;
            transform: scale(1.1);
          }
        `}</style>
      </div>
    );
  }

  // New user - show original Pikachu video content
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 overflow-hidden">
      {/* Full screen container - accounting for header height */}
      <div
        className="h-[calc(100vh-4rem)] w-full flex flex-col justify-center items-center px-4 overflow-hidden"
        style={{ marginTop: "4rem" }}
      >
        {/* Pikachu Video Container */}
        <div className="w-full max-w-4xl relative">
          <div className="relative w-full aspect-video bg-yellow-100 rounded-2xl shadow-lg overflow-hidden group">
            {/* Clickable Video */}
            <button
              onClick={handleAnimationClick}
              className="w-full h-full relative cursor-pointer transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-50"
            >
              <video className="w-full h-full object-cover rounded-2xl" autoPlay loop muted playsInline>
                <source src="/pikachu-animation.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </button>
          </div>

          {/* Click Prompt Overlay - positioned over both animation and background */}
          {showPrompt && (
            <div className="absolute left-4 -top-8 z-20">
              <Image
                src="/clickme.png"
                alt="Click me!"
                width={160}
                height={160}
                className="w-40 h-40 cursor-pointer"
                style={{
                  animation: "pulse-scale 1.5s ease-in-out infinite, fade-in 0.5s ease-out",
                }}
                onClick={handleAnimationClick}
              />
            </div>
          )}
        </div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div
            className="fixed inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 bg-opacity-95 flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <div
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 animate-in fade-in-0 zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Make a Deposit</h2>

              <div className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Amount (ETH)
                  </label>
                  <input
                    id="depositAmount"
                    type="text"
                    value={depositAmount}
                    onChange={handleDepositAmountChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-200 ${
                      isExceedingBalance
                        ? "border-red-300 bg-red-50 focus:ring-red-500"
                        : isNegativeAmount
                          ? "border-red-300 bg-red-50 focus:ring-red-500"
                          : "border-gray-300 focus:ring-yellow-500"
                    }`}
                    placeholder="0.1"
                  />

                  {/* Validation Messages */}
                  {isNegativeAmount && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      Amount cannot be negative
                    </p>
                  )}
                  {isExceedingBalance && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      Insufficient ETH balance. You have {balance?.formatted} ETH
                    </p>
                  )}
                  {balance && !isExceedingBalance && !isNegativeAmount && depositAmount && (
                    <p className="mt-2 text-sm text-green-600 flex items-center">
                      <span className="mr-1">✅</span>
                      Balance: {balance.formatted} ETH
                    </p>
                  )}
                </div>

                {/* Mintable Tokens Display */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Mintable ChUSD</h3>
                      <p className="text-xs text-gray-500 mt-1">Tokens you can mint with this deposit</p>
                    </div>
                    <div className="text-right">
                      {isLoadingMintable ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                          <span className="text-sm text-gray-500">Calculating...</span>
                        </div>
                      ) : !isConnected ? (
                        <div className="text-sm text-gray-500">Connect wallet</div>
                      ) : mintableTokens ? (
                        <div>
                          <div className="text-lg font-bold text-yellow-700">
                            {(Number(mintableTokens) / 1e18).toFixed(2)} ChUSD
                          </div>
                          <div className="text-xs text-gray-500">≈ ${(Number(mintableTokens) / 1e18).toFixed(2)}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Calculating...</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Network Switch Button */}
                {isWrongNetwork && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-red-800">⚠️ Wrong Network Detected</h3>
                        <p className="text-xs text-red-700 mt-1">
                          Current: Chain ID {actualChainId || chain?.id} ({chain?.name})<br />
                          Required: Chain ID 84532 (Base Sepolia)
                          <br />
                          <span className="text-yellow-600">MetaMask Bug: Showing wrong Chain ID in UI</span>
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            if (window.ethereum) {
                              window.ethereum
                                .request({
                                  method: "wallet_switchEthereumChain",
                                  params: [{ chainId: "0x14a34" }],
                                })
                                .catch((error: any) => {
                                  if (error.code === 4902) {
                                    window.ethereum.request({
                                      method: "wallet_addEthereumChain",
                                      params: [
                                        {
                                          chainId: "0x14a34",
                                          chainName: "Base Sepolia",
                                          rpcUrls: ["https://sepolia.base.org"],
                                          nativeCurrency: {
                                            name: "Ethereum",
                                            symbol: "ETH",
                                            decimals: 18,
                                          },
                                          blockExplorerUrls: ["https://sepolia.basescan.org"],
                                        },
                                      ],
                                    });
                                  }
                                });
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Auto Switch
                        </button>
                        <button
                          onClick={() => {
                            // Manual instructions
                            alert(`Manual Setup Instructions:
1. Open MetaMask
2. Click the network dropdown (top of MetaMask)
3. Click "Add Network" → "Add a network manually"
4. Enter these details:
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532 (0x14a34)
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.basescan.org
5. Click "Save" and switch to Base Sepolia

If you still get Chain ID 84610 error:
- Delete any existing Base Sepolia network from MetaMask
- Clear MetaMask cache (Settings → Advanced → Reset Account)
- Try adding the network again`);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Manual Setup
                        </button>
                        <button
                          onClick={() => {
                            // Force clear and re-add network
                            if (window.ethereum) {
                              // Try to remove existing network first
                              window.ethereum
                                .request({
                                  method: "wallet_removeEthereumChain",
                                  params: [{ chainId: "0x14a34" }],
                                })
                                .catch(() => {
                                  // Network might not exist, that's okay
                                  console.log("No existing network to remove");
                                })
                                .finally(() => {
                                  // Add the network fresh
                                  window.ethereum
                                    .request({
                                      method: "wallet_addEthereumChain",
                                      params: [
                                        {
                                          chainId: "0x14a34",
                                          chainName: "Base Sepolia",
                                          rpcUrls: ["https://sepolia.base.org"],
                                          nativeCurrency: {
                                            name: "Ethereum",
                                            symbol: "ETH",
                                            decimals: 18,
                                          },
                                          blockExplorerUrls: ["https://sepolia.basescan.org"],
                                        },
                                      ],
                                    })
                                    .then(() => {
                                      console.log("✅ Base Sepolia network added fresh");
                                      // Try to switch
                                      window.ethereum.request({
                                        method: "wallet_switchEthereumChain",
                                        params: [{ chainId: "0x14a34" }],
                                      });
                                    })
                                    .catch((error: any) => {
                                      console.error("❌ Failed to add fresh network:", error);
                                    });
                                });
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Force Reset
                        </button>
                        <button
                          onClick={() => {
                            // Force MetaMask to refresh network detection
                            if (window.ethereum) {
                              console.log("🔄 Forcing MetaMask network refresh...");
                              // Force a page reload to refresh MetaMask's network detection
                              window.location.reload();
                            }
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Refresh Page
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deposit Button */}
                <button
                  onClick={handleDeposit}
                  disabled={!isConnected || isDepositing || !isValidAmount || isWrongNetwork}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {isDepositing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Simulating Deposit...</span>
                    </div>
                  ) : !isConnected ? (
                    "Connect Wallet to Deposit"
                  ) : isNegativeAmount ? (
                    "Amount Cannot Be Negative"
                  ) : isExceedingBalance ? (
                    "Insufficient ETH Balance"
                  ) : !depositAmount || parseFloat(depositAmount) <= 0 ? (
                    "Enter Valid Amount"
                  ) : (
                    "Simulate Deposit & View Animation"
                  )}
                </button>
              </div>

              {/* Info Text */}
              <div className="text-center mt-4 space-y-2">
                <p className="text-xs text-gray-500">Connect your wallet and enter an amount to simulate a deposit</p>
                <div className="flex items-center justify-center space-x-2 text-xs">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-yellow-600 font-medium">Demo Mode - No actual contract interaction</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer - Fixed at bottom */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-sm text-gray-600">Powered by ⚡ Pikachu & Scaffold-ETH 2</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
