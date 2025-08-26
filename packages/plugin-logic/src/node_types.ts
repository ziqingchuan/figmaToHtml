import { type Node } from "./api_types";

export type AltNode = Node & {
  styledTextSegments: Array<
    Pick<StyledTextSegment, any | "characters" | "start" | "end">
  >;
  cumulativeRotation: number;
  uniqueName: string;
  canBeFlattened: boolean;
  isRelative: boolean;
  width: number;
  height: number;
  x: number;
  y: number;
};

export type HtmlNode = {
  tag: 'div' | 'span' | 'img';
  styleID: string;
  isSVG: boolean;
  classID: string;
  svgID?: string;
  children?: HtmlNode[];
  content?: string;
  src?: string;
}
