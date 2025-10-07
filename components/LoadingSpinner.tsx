import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
      <p className="text-lg text-gray-300">이미지를 변환하는 중...</p>
    </div>
  );
};

export default LoadingSpinner;
