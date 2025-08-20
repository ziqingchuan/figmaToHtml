import React from "react";
const PluginHomepage = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-neutral-900 rounded-lg text-center">
      {/* 简洁的标题和logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md mb-3">
          <svg
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="29028"
            width="200"
            height="200"
            data-spm-anchor-id="a313x.search_index.0.i6.be673a81q1Yypz"
          >
            <path
              d="M96 192h544v256H96V192z m288 384h544v256H384v-256z"
              fill="#5f74ef"
              p-id="29029"
              data-spm-anchor-id="a313x.search_index.0.i1.be673a81q1Yypz"
              className="selected"
            ></path>
            <path
              d="M256 352h320v32H256v-32zM160 256h224v32H160V256z m288 0h64v32h-64V256z m128 384h256v32h-256v-32z m160 96h64v32h-64v-32z m-288 0h224v32h-224v-32z"
              fill="#FFFFFF"
              p-id="29030"
            ></path>
            <path
              d="M240 689.952v116.992c22.72 52.288 49.28 81.952 78.912 90.4a16 16 0 0 1-8.8 30.784c-41.152-11.744-74.464-49.472-100.832-111.648l-1.28-6.24v-120.288l-63.744 57.92a16 16 0 0 1-21.536-23.712L224 632.224l101.28 91.936a16 16 0 0 1-21.536 23.68L240 689.952z m541.696-358.016l2.304-108.16c0.448-34.624-25.952-67.36-82.144-97.92a16 16 0 1 1 15.296-28.16c65.536 35.68 99.456 77.76 98.848 126.656l-2.4 111.872 66.144-60.064a16 16 0 1 1 21.536 23.68L800 391.776 698.72 299.84a16 16 0 0 1 21.536-23.68l61.44 55.776z"
              fill="#5f74ef"
              p-id="29031"
              data-spm-anchor-id="a313x.search_index.0.i7.be673a81q1Yypz"
              className="selected"
            ></path>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Figma to HTML
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          简洁高效的代码转换工具
        </p>
      </div>

      {/* 核心功能展示 */}
      <div className="grid grid-cols-2 gap-3 mb-6 w-full max-w-xs">
        <div className="bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg border border-gray-200 dark:border-neutral-700">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-8 h-8 rounded-md flex items-center justify-center mb-2 mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <h3 className="text-xs font-medium text-gray-700 dark:text-gray-200">
            实时预览
          </h3>
        </div>

        <div className="bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg border border-gray-200 dark:border-neutral-700">
          <div className="bg-green-100 dark:bg-green-900/30 w-8 h-8 rounded-md flex items-center justify-center mb-2 mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          </div>
          <h3 className="text-xs font-medium text-gray-700 dark:text-gray-200">
            一键复制
          </h3>
        </div>
      </div>

      {/* 代码质量说明 */}
      <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 mb-6 text-sm w-full max-w-xs">
        <div className="flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-left text-blue-800 dark:text-blue-200">
            生成的代码包含语义化类名，CSS单独分离，易于维护和扩展。
          </p>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="border border-dashed border-gray-300 dark:border-neutral-700 rounded-lg p-4 w-full max-w-xs">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          请选择一个图层或框架开始转换
        </p>
      </div>
    </div>
  );
};

export default PluginHomepage;
