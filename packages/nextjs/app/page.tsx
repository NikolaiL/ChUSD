"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import toast from "react-hot-toast";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useBalance } from "wagmi";
import { useMintableTokens } from "~~/hooks/scaffold-eth/useMintableTokens";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useUserInteractionStatus } from "~~/hooks/scaffold-eth/useUserInteractionStatus";

const Home: NextPage = () => {
  const { isConnected } = useAccount();
  const { hasInteracted } = useUserInteractionStatus();
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [isDepositing, setIsDepositing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [sliderValue, setSliderValue] = useState(3);

  const { writeContractAsync: writeManagerAsync } = useScaffoldWriteContract({
    contractName: "Manager",
  });

  // Calculate mintable tokens for the deposit amount
  const { mintableTokens, isLoading: isLoadingMintable } = useMintableTokens(depositAmount);

  // Get user's ETH balance
  const { data: balance } = useBalance({
    address: isConnected ? undefined : undefined,
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
      toast.loading("Processing deposit...", { id: "deposit" });

      await writeManagerAsync({
        functionName: "deposit",
        value: parseEther(depositAmount),
      });

      toast.success("Deposit successful!", { id: "deposit" });
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast.error("Deposit failed: " + (error?.shortMessage || error?.message || "Unknown error"), {
        id: "deposit",
      });
    } finally {
      setIsDepositing(false);
    }
  };

  // Show different content based on user interaction status
  if (hasInteracted) {
    // Active user - show Pikachu slider content
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-200">
        {/* Mobile-first responsive container */}
        <div className="container mx-auto px-4 py-8 max-w-md sm:max-w-lg md:max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-600 mb-4 drop-shadow-lg">
              Pikachu Moods
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 font-medium">
              Adjust the slider to see different Pikachu emotions
            </p>
          </div>

          {/* Pikachu Mood Display */}
          <div className="mb-8">
            <div className="relative w-full aspect-square bg-yellow-100 rounded-2xl shadow-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-200 to-yellow-300">
                <div className="relative">
                  {/* Pikachu Mood Image */}
                  <div className="relative animate-pulse">
                    <Image
                      src={moodImages[sliderValue as keyof typeof moodImages]}
                      alt={`Pikachu ${moodLabels[sliderValue as keyof typeof moodLabels]}`}
                      width={384}
                      height={384}
                      className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain drop-shadow-lg"
                    />
                  </div>

                  {/* Mood Label */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl shadow-lg font-bold text-lg">
                      {moodLabels[sliderValue as keyof typeof moodLabels]} ⚡
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Mood Slider</h2>

            <div className="space-y-6">
              {/* Slider */}
              <div className="px-4">
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
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span className="font-medium">1</span>
                  <span className="font-medium">2</span>
                  <span className="font-medium">3</span>
                  <span className="font-medium">4</span>
                  <span className="font-medium">5</span>
                </div>
              </div>

              {/* Current Value Display */}
              <div className="text-center">
                <div className="bg-yellow-100 rounded-xl p-4 inline-block">
                  <p className="text-lg text-gray-700">
                    Current Mood:{" "}
                    <span className="font-bold text-yellow-700">
                      {moodLabels[sliderValue as keyof typeof moodLabels]}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Value: {sliderValue}/5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">Powered by ⚡ Pikachu Moods & Scaffold-ETH 2</p>
          </div>
        </div>

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
                      ) : mintableTokens ? (
                        <div>
                          <div className="text-lg font-bold text-yellow-700">
                            {(Number(mintableTokens) / 1e18).toFixed(2)} ChUSD
                          </div>
                          <div className="text-xs text-gray-500">≈ ${(Number(mintableTokens) / 1e18).toFixed(2)}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Connect wallet</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deposit Button */}
                <button
                  onClick={handleDeposit}
                  disabled={!isConnected || isDepositing || !isValidAmount}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {isDepositing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Depositing...</span>
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
                    "Deposit"
                  )}
                </button>
              </div>

              {/* Info Text */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Connect your wallet and enter an amount to make a deposit
              </p>
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
