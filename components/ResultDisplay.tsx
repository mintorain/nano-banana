import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ResultDisplayProps {
  sourceImages: { label: string; url: string }[];
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ sourceImages, generatedImage, isLoading, error }) => {
  return (
    <div className="w-full mt-10 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-100">결과</h2>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-start">
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-300">원본 이미지</h3>
          <div className="w-full aspect-square bg-gray-800 rounded-lg flex items-center justify-center p-2 border border-gray-700 shadow-lg">
            {sourceImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 w-full h-full">
                {sourceImages.map(({ label, url }) => (
                  <div key={label} className="relative w-full h-full">
                    <img src={url} alt={label} className="w-full h-full object-contain rounded-md" />
                    <span className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">{label}</span>
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-gray-500">원본 이미지가 여기에 표시됩니다.</p>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-300">합성된 이미지</h3>
            <div className="w-full aspect-square bg-gray-800 rounded-lg flex items-center justify-center p-2 border border-gray-700 shadow-lg">
            {isLoading ? <LoadingSpinner /> : 
             generatedImage ? <img src={generatedImage} alt="합성된 이미지" className="max-h-full max-w-full object-contain rounded-md" /> :
             (
                <div className="text-center text-gray-500 p-4">
                {error ? (
                    <>
                    <p className="text-red-400 font-semibold">오류가 발생했습니다</p>
                    <p className="text-sm mt-2">{error}</p>
                    </>
                ) : (
                    <p>합성된 이미지는 처리 후 여기에 표시됩니다.</p>
                )}
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;