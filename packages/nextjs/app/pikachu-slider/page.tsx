"use client";

import { useState } from "react";
import Link from "next/link";

const PikachuSliderPage = () => {
  const [sliderValue, setSliderValue] = useState(3);

  // Mood mapping
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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(e.target.value));
  };

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
                  <img
                    src={moodImages[sliderValue as keyof typeof moodImages]}
                    alt={`Pikachu ${moodLabels[sliderValue as keyof typeof moodLabels]}`}
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

        {/* Navigation */}
        <div className="text-center space-y-4">
          <Link
            href="/pikachu"
            className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            ← Back to Deposit Page
          </Link>

          <div>
            <p className="text-sm text-gray-600">Powered by ⚡ Pikachu Moods & Scaffold-ETH 2</p>
          </div>
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
};

export default PikachuSliderPage;
