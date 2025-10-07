import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleOption } from './types';
import { generateCompositeImage, generateRandomImage } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageUploader from './components/ImageUploader';
import StyleSelector from './components/StyleSelector';
import ResultDisplay from './components/ResultDisplay';
import SparklesIcon from './components/icons/SparklesIcon';
import DiceIcon from './components/icons/DiceIcon';

type ImageCategory = 'character' | 'background' | 'object';

const App: React.FC = () => {
  const [images, setImages] = useState<Record<ImageCategory, File | null>>({
    character: null,
    background: null,
    object: null,
  });
  const [previews, setPreviews] = useState<Record<ImageCategory, string | null>>({
    character: null,
    background: null,
    object: null,
  });
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingRandom, setIsGeneratingRandom] = useState<Record<ImageCategory, boolean>>({
    character: false,
    background: false,
    object: false,
  });


  const latestPreviews = useRef(previews);
  useEffect(() => {
    latestPreviews.current = previews;
  });

  // FIX: The original useEffect hook for cleaning up object URLs on unmount
  // had a stale closure over the `previews` state, which would prevent it
  // from cleaning up any URLs. This has been fixed by using a ref to
  // keep track of the latest `previews` value for the cleanup function.
  useEffect(() => {
    // Clean up all object URLs on component unmount
    return () => {
      Object.values(latestPreviews.current).forEach(url => {
        // FIX: Added a `typeof` check to ensure `url` is a string before revoking.
        // This resolves an error where `url` could be inferred as `unknown`.
        if (typeof url === 'string') {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const handleImageUpload = useCallback((file: File, category: ImageCategory) => {
    setImages(prev => ({ ...prev, [category]: file }));
    setPreviews(prev => {
      // Revoke the old URL to prevent memory leaks
      if (prev[category]) {
        URL.revokeObjectURL(prev[category]!);
      }
      return { ...prev, [category]: URL.createObjectURL(file) };
    });
  }, []);

  const base64ToFile = (base64: string, filename: string): File => {
    const mimeType = 'image/png';
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  };

  const handleRandomImageGeneration = async (category: ImageCategory) => {
    setIsGeneratingRandom(prev => ({ ...prev, [category]: true }));
    setError(null);

    const prompts: Record<ImageCategory, string> = {
        character: 'A high-quality, detailed digital painting of a random fantasy character, full body, on a plain white background.',
        background: 'A beautiful, high-resolution digital painting of a random fantasy landscape background, no people.',
        object: 'A detailed, high-resolution digital painting of a random magical object, on a plain white background.',
    };

    try {
        const resultBase64 = await generateRandomImage(prompts[category]);
        const fileName = `${category}_${Date.now()}.png`;
        const imageFile = base64ToFile(resultBase64, fileName);
        handleImageUpload(imageFile, category);
    } catch (e: unknown) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('랜덤 이미지 생성 중 예상치 못한 오류가 발생했습니다.');
        }
    } finally {
        setIsGeneratingRandom(prev => ({ ...prev, [category]: false }));
    }
  };

  const handleStyleSelect = useCallback((style: StyleOption) => {
    setSelectedStyleId(style.id);
    setPrompt(style.prompt);
  }, []);

  const handleCustomPromptChange = useCallback((newPrompt: string) => {
    setPrompt(newPrompt);
    // If user types, deselect the preset style
    if (selectedStyleId !== null) {
      setSelectedStyleId(null);
    }
  }, [selectedStyleId]);

  const handleSubmit = async () => {
    const orderedFiles: File[] = [];
    let synthesisPrompt = '다음 이미지들을 자연스럽게 합성해줘. ';
    
    // Enforce a specific order for more predictable model behavior
    if (images.character) {
        orderedFiles.push(images.character);
        synthesisPrompt += `첫 번째 이미지는 캐릭터야. `;
    }
    if (images.background) {
        orderedFiles.push(images.background);
        synthesisPrompt += `${orderedFiles.length === 1 ? '첫' : '두 번째'} 번째 이미지는 배경이야. `;
    }
    if (images.object) {
        orderedFiles.push(images.object);
        synthesisPrompt += `${orderedFiles.length === 1 ? '첫' : orderedFiles.length === 2 ? '두 번째' : '세 번째'} 번째 이미지는 사물이야. `;
    }

    if (orderedFiles.length === 0 || !prompt) {
      setError('이미지를 하나 이상 업로드하고 스타일을 선택하거나 프롬프트를 작성해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    const finalPrompt = synthesisPrompt + prompt;

    try {
      const resultBase64 = await generateCompositeImage(orderedFiles, finalPrompt);
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('예상치 못한 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const isSubmitDisabled = Object.values(images).every(f => f === null) || !prompt || isLoading;

  const sourceImagesForDisplay = (Object.keys(previews) as ImageCategory[])
    .filter(key => previews[key] !== null)
    .map(key => ({
        label: { character: '캐릭터', background: '배경', object: '사물' }[key],
        url: previews[key]!,
    }));

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <main className="container mx-auto px-4 py-8">
        <Header />
        <div className="mt-12 max-w-5xl mx-auto p-8 bg-gray-800/30 border border-gray-700 rounded-2xl shadow-2xl shadow-purple-900/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex flex-col gap-8">
               <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-100">1. 이미지 업로드 (합성)</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-400">캐릭터</label>
                             <button onClick={() => handleRandomImageGeneration('character')} disabled={isGeneratingRandom.character || isLoading} className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-purple-300 bg-purple-900/50 rounded-full hover:bg-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {isGeneratingRandom.character ? '생성 중...' : <><DiceIcon className="w-3 h-3" /> 랜덤 생성</>}
                            </button>
                        </div>
                        <ImageUploader onImageUpload={(file) => handleImageUpload(file, 'character')} previewUrl={previews.character} />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-400">배경</label>
                            <button onClick={() => handleRandomImageGeneration('background')} disabled={isGeneratingRandom.background || isLoading} className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-purple-300 bg-purple-900/50 rounded-full hover:bg-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {isGeneratingRandom.background ? '생성 중...' : <><DiceIcon className="w-3 h-3" /> 랜덤 생성</>}
                            </button>
                        </div>
                        <ImageUploader onImageUpload={(file) => handleImageUpload(file, 'background')} previewUrl={previews.background} />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-400">사물</label>
                             <button onClick={() => handleRandomImageGeneration('object')} disabled={isGeneratingRandom.object || isLoading} className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-purple-300 bg-purple-900/50 rounded-full hover:bg-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {isGeneratingRandom.object ? '생성 중...' : <><DiceIcon className="w-3 h-3" /> 랜덤 생성</>}
                            </button>
                        </div>
                        <ImageUploader onImageUpload={(file) => handleImageUpload(file, 'object')} previewUrl={previews.object} />
                    </div>
                </div>
              </div>
               <div className="flex flex-col items-center justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  className={`w-full max-w-sm flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform
                    ${isSubmitDisabled
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 focus:outline-none focus:ring-4 focus:ring-purple-400/50'
                    }`}
                >
                  <SparklesIcon className="w-6 h-6" />
                  <span>{isLoading ? '합성 중...' : '이미지 합성'}</span>
                </button>
                {error && !isLoading && <p className="mt-4 text-red-400 text-center">{error}</p>}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-100">2. 합성 스타일 선택</h2>
              <StyleSelector
                selectedStyleId={selectedStyleId}
                onStyleSelect={handleStyleSelect}
                customPrompt={prompt}
                onCustomPromptChange={handleCustomPromptChange}
              />
            </div>
          </div>
        </div>

        <ResultDisplay
          sourceImages={sourceImagesForDisplay}
          generatedImage={generatedImage}
          isLoading={isLoading}
          error={error}
        />
        <Footer />
      </main>
    </div>
  );
};

export default App;