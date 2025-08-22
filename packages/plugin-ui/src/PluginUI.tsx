
import Preview from "./components/Preview";
import CodePanel from "./components/CodePanel";

import {
  Framework,
  HTMLPreview,
  LinearGradientConversion,
  PluginSettings,
  SolidColorConversion,
  Warning,
} from "types";
import Loading from "./components/Loading";
import { useState } from "react";
import React from "react";

type PluginUIProps = {
  code: string;
  htmlPreview: HTMLPreview;
  warnings: Warning[];
  selectedFramework: Framework;
  setSelectedFramework: (framework: Framework) => void;
  settings: PluginSettings | null;
  onPreferenceChanged: (
    key: keyof PluginSettings,
    value: boolean | string | number,
  ) => void;
  colors: SolidColorConversion[];
  gradients: LinearGradientConversion[];
  isLoading: boolean;
};

export const PluginUI = (props: PluginUIProps) => {

  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [previewViewMode, setPreviewViewMode] = useState<
    "desktop" | "mobile" | "precision"
  >("precision");
  const [previewBgColor, setPreviewBgColor] = useState<"white" | "black">(
    "white",
  );

  if (props.isLoading) return <Loading />;

  const isEmpty = props.code === "";

  return (
    <div className="flex flex-col h-full dark:text-white">
      <div
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.12)",
        }}
      ></div>
      <div className="flex flex-col h-full overflow-y-auto">
        {
          <div className="flex flex-col items-center px-4 py-2 gap-2 dark:bg-transparent">
            {!isEmpty && props.htmlPreview && (
              <Preview htmlPreview={props.htmlPreview} />
            )}


            <CodePanel code={props.code} />
          </div>
        }
      </div>
    </div>
  );
};
