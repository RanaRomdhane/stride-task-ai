
import React from "react";

export const Logo = () => {
  return (
    <div className="relative">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
        <div className="text-white font-bold text-lg">T</div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
