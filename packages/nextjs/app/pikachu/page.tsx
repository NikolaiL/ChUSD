"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

const PikachuPage = () => {
  const { isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [isDepositing, setIsDepositing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const { writeContractAsync: writeManagerAsync } = useScaffoldWriteContract({
    contractName: "Manager",
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-200">
      {/* Mobile-first responsive container */}
      <div className="container mx-auto px-4 py-8 max-w-md sm:max-w-lg md:max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-600 mb-4 drop-shadow-lg">chUSD</h1>
          <p className="text-lg sm:text-xl text-gray-700 font-medium">
            Pikachu mood changes based on the collateral ratio
          </p>
        </div>

        {/* Pikachu Video Container */}
        <div className="mb-8">
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

              {/* Click Prompt Overlay */}
              {showPrompt && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-2xl animate-pulse">
                  <div className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-xl shadow-lg text-lg font-bold animate-bounce">
                    Click me! ⚡
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 animate-in fade-in-0 zoom-in-95 border border-yellow-200">
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
                    type="number"
                    step="0.001"
                    min="0"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all duration-200 text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.1"
                  />
                </div>

                {/* Deposit Button */}
                <button
                  onClick={handleDeposit}
                  disabled={!isConnected || isDepositing}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {isDepositing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Depositing...</span>
                    </div>
                  ) : !isConnected ? (
                    "Connect Wallet to Deposit"
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

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">Powered by ⚡ Pikachu & Scaffold-ETH 2</p>
        </div>
      </div>
    </div>
  );
};

export default PikachuPage;
