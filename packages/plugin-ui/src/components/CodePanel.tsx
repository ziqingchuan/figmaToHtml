
import { useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow as theme } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyButton } from "./CopyButton";
import EmptyState from "./EmptyState";

interface CodePanelProps {
  code: string;
}

const CodePanel = (props: CodePanelProps) => {
  const [syntaxHovered, setSyntaxHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const initialLinesToShow = 25;
  const {
    code,
  } = props;
  const isCodeEmpty = code === "";

  // Function to truncate code to a specific number of lines
  const truncateCode = (codeString: string, lines: number) => {
    const codeLines = codeString.split("\n");
    if (codeLines.length <= lines) {
      return codeString;
    }
    return codeLines.slice(0, lines).join("\n") + "\n...";
  };

  const prefixedCode = code;
  // Memoize the line count calculation to improve performance for large code blocks
  const lineCount = useMemo(
    () => prefixedCode.split("\n").length,
    [prefixedCode],
  );

  // Determine if code should be truncated
  const shouldTruncate = !isExpanded && lineCount > initialLinesToShow;
  const displayedCode = shouldTruncate
    ? truncateCode(prefixedCode, initialLinesToShow)
    : prefixedCode;
  const showMoreButton = lineCount > initialLinesToShow;

  const handleButtonHover = () => setSyntaxHovered(true);
  const handleButtonLeave = () => setSyntaxHovered(false);

  return (
    <div className="w-full flex flex-col gap-2 mt-2">
      <div className="flex items-center justify-between w-full">
        <p className="text-lg font-medium text-center dark:text-white rounded-lg">
        </p>
        {!isCodeEmpty && (
          <CopyButton
            value={prefixedCode}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          />
        )}
      </div>

      <div
        className={`rounded-lg ring-green-600 transition-all duration-200 overflow-clip ${
          syntaxHovered ? "ring-2" : "ring-0"
        }`}
      >
        {isCodeEmpty ? (
          <EmptyState />
        ) : (
          <>
            <SyntaxHighlighter
              language={
              'html'
              }
              style={theme}
              customStyle={{
                fontSize: 12,
                borderRadius: 8,
                marginTop: 0,
                marginBottom: 0,
                backgroundColor: syntaxHovered ? "#1E2B1A" : "#1B1B1B",
                transitionProperty: "all",
                transitionTimingFunction: "ease",
                transitionDuration: "0.2s",
              }}
            >
              {displayedCode}
            </SyntaxHighlighter>
            {showMoreButton && (
              <div className="flex justify-center dark:bg-[#1B1B1B] border-t dark:border-gray-700">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs w-full flex justify-center py-3 text-blue-500 hover:text-blue-400 transition-colors"
                  aria-label="Show more code. This could be slow or freeze Figma for a few seconds."
                  title="Show more code. This could be slow or freeze Figma for a few seconds."
                >
                  {isExpanded ? "收起" : "展开"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CodePanel;
