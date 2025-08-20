import React from "react";

interface LoadingProps {}

const Loading = (_props: LoadingProps) => (
  <div className="flex items-center justify-center w-full h-full p-4 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white animate-fadeIn">
    <div className="flex flex-col items-center max-w-sm">
      {/* 纯CSS加载动画 */}
      <div className="relative w-16 h-16 mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 dark:border-blue-500/30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 dark:border-blue-400 border-t-transparent animate-spin"></div>
      </div>

      {/* 文字部分 */}
      <h2 className="text-xl font-semibold mb-2 text-center">
        正在转换设计
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-xs">
        请稍候，正在将您的设计转换为代码。复杂设计可能需要一些时间。
      </p>
    </div>
  </div>
);

export default Loading;
