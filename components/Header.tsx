import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 text-center">
      <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        나노 바나나 이미지 변환기
      </h1>
      <p className="mt-2 text-lg text-gray-400">
        Gemini의 힘으로 당신의 이미지에 새로운 모습을 더해보세요.
      </p>
    </header>
  );
};

export default Header;
