import {
  htmlColorFromFill,
  htmlGradientFromFills,
} from "../../html/builderImpl/htmlColor";
import { calculateContrastRatio } from "./commonUI";
import {
  LinearGradientConversion,
  SolidColorConversion,
} from "types";
import { processColorVariables } from "../../altNodes/jsonNodeConversion";

const rgbTo6hex = (color: RGB | RGBA): string => {
  return (
    ((color.r * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.g * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.b * 255) | (1 << 8)).toString(16).slice(1)
  );
};


export const retrieveGenericSolidUIColors = async (): Promise<Array<SolidColorConversion>> => {
  const selectionColors = figma.getSelectionColors();
  if (!selectionColors || selectionColors.paints.length === 0) return [];

  const colors: Array<SolidColorConversion> = [];

  // Process all paints in parallel to handle variables
  await Promise.all(
    selectionColors.paints.map(async (d) => {
      const paint = { ...d } as Paint;
      await processColorVariables(paint as any);

      const fill = await convertSolidColor(paint);
      if (fill) {
        const exists = colors.find(
          (col) => col.exportValue === fill.exportValue,
        );
        if (!exists) {
          colors.push(fill);
        }
      }
    }),
  );

  return colors.sort((a, b) => a.hex.localeCompare(b.hex));
};

const convertSolidColor = async (
  fill: Paint
): Promise<SolidColorConversion | null> => {
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 1, g: 1, b: 1 };

  if (fill.type !== "SOLID") return null;

  const output = {
    hex: rgbTo6hex(fill.color).toUpperCase(),
    colorName: "",
    exportValue: "",
    contrastBlack: calculateContrastRatio(fill.color, black),
    contrastWhite: calculateContrastRatio(fill.color, white),
  };
  output.exportValue = htmlColorFromFill(fill as any);

  return output;
};

export const retrieveGenericLinearGradients = async (): Promise<Array<LinearGradientConversion>> => {
  const selectionColors = figma.getSelectionColors();
  const colorStr: Array<LinearGradientConversion> = [];

  if (!selectionColors || selectionColors.paints.length === 0) return [];

  // Process all gradient paints
  await Promise.all(
    selectionColors.paints.map(async (paint) => {
      if (paint.type === "GRADIENT_LINEAR") {
        let fill = { ...paint };
        const t = fill.gradientTransform;
        // @ts-ignore
        fill.gradientHandlePositions = [
          { x: t[0][2], y: t[1][2] }, // Start: (e, f)
          { x: t[0][0] + t[0][2], y: t[1][0] + t[1][2] }, // End: (a + e, b + f)
        ];

        // Process gradient stops for variables
        if (fill.gradientStops) {
          for (const stop of fill.gradientStops) {
            if (stop.boundVariables?.color) {
              try {
                const variableId = stop.boundVariables.color.id;
                const variable = figma.variables.getVariableById(variableId);
                if (variable) {
                  (stop as any).variableColorName = variable.name
                    .replace(/\s+/g, "-")
                    .toLowerCase();
                }
              } catch (e) {
                console.error(
                  "Error retrieving variable for gradient stop:",
                  e,
                );
              }
            }
          }
        }

        let exportValue: string;
        // @ts-ignore
        exportValue = htmlGradientFromFills(fill);

        colorStr.push({
          // @ts-ignore
          cssPreview: htmlGradientFromFills(fill),
          exportValue,
        });
      }
    }),
  );

  return colorStr;
};
