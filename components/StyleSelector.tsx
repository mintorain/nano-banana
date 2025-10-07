import React from 'react';
import { StyleOption } from '../types';
import { STYLE_CATEGORIES } from '../constants';

interface StyleSelectorProps {
  selectedStyleId: string | null;
  onStyleSelect: (style: StyleOption) => void;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyleId,
  onStyleSelect,
  customPrompt,
  onCustomPromptChange,
}) => {
  return (
    <div className="w-full space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-100">스타일 선택</h3>
        <div className="space-y-5">
          {STYLE_CATEGORIES.map((category) => (
            <div key={category.title}>
              <h4 className="text-md font-semibold mb-3 text-gray-300">{category.title}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {category.options.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => onStyleSelect(style)}
                    className={`px-3 py-2 text-sm rounded-md transition-all duration-200 ease-in-out font-medium truncate
                      ${
                        selectedStyleId === style.id
                          ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-100">또는 직접 프롬프트 작성하기</h3>
        <textarea
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="예: 빈티지 만화책 표지처럼 만들어 줘"
          className="w-full h-24 p-3 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
        />
      </div>
    </div>
  );
};

export default StyleSelector;
