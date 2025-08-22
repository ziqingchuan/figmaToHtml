// Copied from https://github.com/figma/rest-api-spec/blob/main/dist/api_types.ts
// @ts-nocheck
export type IsLayerTrait = {
    /**
     * A string uniquely identifying this node within the document.
     */
    id: string

    /**
     * The name given to the node by the user in the tool.
     */
    name: string

    /**
     * The type of the node
     */
    type: string

    /**
     * Whether or not the node is visible on the canvas.
     */
    visible?: boolean

    /**
     * If true, layer is locked and cannot be edited
     */
    locked?: boolean

    /**
     * Whether the layer is fixed while the parent is scrolling
     *
     * @deprecated
     */
    isFixed?: boolean

    /**
     * How layer should be treated when the frame is resized
     */
    scrollBehavior: 'SCROLLS' | 'FIXED' | 'STICKY_SCROLLS'

    /**
     * The rotation of the node, if not 0.
     */
    rotation?: number

    /**
     * A mapping of a layer's property to component property name of component properties attached to
     * this node. The component property name can be used to look up more information on the
     * corresponding component's or component set's componentPropertyDefinitions.
     */
    componentPropertyReferences?: { [key: string]: string }

    /**
     * Data written by plugins that is visible only to the plugin that wrote it. Requires the
     * `pluginData` to include the ID of the plugin.
     */
    pluginData?: unknown

    /**
     * Data written by plugins that is visible to all plugins. Requires the `pluginData` parameter to
     * include the string "shared".
     */
    sharedPluginData?: unknown

    /**
     * A mapping of field to the variables applied to this field. Most fields will only map to a single
     * `VariableAlias`. However, for properties like `fills`, `strokes`, `size`, `componentProperties`,
     * and `textRangeFills`, it is possible to have multiple variables bound to the field.
     */
    boundVariables?: {
      size?: {
        x?: VariableAlias

        y?: VariableAlias
      }

      individualStrokeWeights?: {
        top?: VariableAlias

        bottom?: VariableAlias

        left?: VariableAlias

        right?: VariableAlias
      }

      characters?: VariableAlias

      itemSpacing?: VariableAlias

      paddingLeft?: VariableAlias

      paddingRight?: VariableAlias

      paddingTop?: VariableAlias

      paddingBottom?: VariableAlias

      visible?: VariableAlias

      topLeftRadius?: VariableAlias

      topRightRadius?: VariableAlias

      bottomLeftRadius?: VariableAlias

      bottomRightRadius?: VariableAlias

      minWidth?: VariableAlias

      maxWidth?: VariableAlias

      minHeight?: VariableAlias

      maxHeight?: VariableAlias

      counterAxisSpacing?: VariableAlias

      opacity?: VariableAlias

      fontFamily?: VariableAlias[]

      fontSize?: VariableAlias[]

      fontStyle?: VariableAlias[]

      fontWeight?: VariableAlias[]

      letterSpacing?: VariableAlias[]

      lineHeight?: VariableAlias[]

      paragraphSpacing?: VariableAlias[]

      paragraphIndent?: VariableAlias[]

      fills?: VariableAlias[]

      strokes?: VariableAlias[]

      componentProperties?: { [key: string]: VariableAlias }

      textRangeFills?: VariableAlias[]

      effects?: VariableAlias[]

      layoutGrids?: VariableAlias[]
    }

    /**
     * A mapping of variable collection ID to mode ID representing the explicitly set modes for this
     * node.
     */
    explicitVariableModes?: { [key: string]: string }
  }

  export type HasChildrenTrait = {
    /**
     * An array of nodes that are direct children of this node
     */
    children: SubcanvasNode[]
  }

  export type HasLayoutTrait = {
    /**
     * Bounding box of the node in absolute space coordinates.
     */
    absoluteBoundingBox: Rectangle | null

    /**
     * The actual bounds of a node accounting for drop shadows, thick strokes, and anything else that
     * may fall outside the node's regular bounding box defined in `x`, `y`, `width`, and `height`. The
     * `x` and `y` inside this property represent the absolute position of the node on the page. This
     * value will be `null` if the node is invisible.
     */
    absoluteRenderBounds: Rectangle | null

    /**
     * Keep height and width constrained to same ratio.
     */
    preserveRatio?: boolean

    /**
     * Horizontal and vertical layout constraints for node.
     */
    constraints?: LayoutConstraint

    /**
     * The top two rows of a matrix that represents the 2D transform of this node relative to its
     * parent. The bottom row of the matrix is implicitly always (0, 0, 1). Use to transform coordinates
     * in geometry. Only present if `geometry=paths` is passed.
     */
    relativeTransform?: Transform

    /**
     * Width and height of element. This is different from the width and height of the bounding box in
     * that the absolute bounding box represents the element after scaling and rotation. Only present if
     * `geometry=paths` is passed.
     */
    size?: Vector

    /**
     * Determines if the layer should stretch along the parent's counter axis. This property is only
     * provided for direct children of auto-layout frames.
     *
     * - `INHERIT`
     * - `STRETCH`
     *
     * In previous versions of auto layout, determined how the layer is aligned inside an auto-layout
     * frame. This property is only provided for direct children of auto-layout frames.
     *
     * - `MIN`
     * - `CENTER`
     * - `MAX`
     * - `STRETCH`
     *
     * In horizontal auto-layout frames, "MIN" and "MAX" correspond to "TOP" and "BOTTOM". In vertical
     * auto-layout frames, "MIN" and "MAX" correspond to "LEFT" and "RIGHT".
     */
    layoutAlign?: 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX'

    /**
     * This property is applicable only for direct children of auto-layout frames, ignored otherwise.
     * Determines whether a layer should stretch along the parent's primary axis. A `0` corresponds to a
     * fixed size and `1` corresponds to stretch.
     */
    layoutGrow?: 0 | 1

    /**
     * Determines whether a layer's size and position should be determined by auto-layout settings or
     * manually adjustable.
     */
    layoutPositioning?: 'AUTO' | 'ABSOLUTE'

    /**
     * The minimum width of the frame. This property is only applicable for auto-layout frames or direct
     * children of auto-layout frames.
     */
    minWidth?: number

    /**
     * The maximum width of the frame. This property is only applicable for auto-layout frames or direct
     * children of auto-layout frames.
     */
    maxWidth?: number

    /**
     * The minimum height of the frame. This property is only applicable for auto-layout frames or
     * direct children of auto-layout frames.
     */
    minHeight?: number

    /**
     * The maximum height of the frame. This property is only applicable for auto-layout frames or
     * direct children of auto-layout frames.
     */
    maxHeight?: number

    /**
     * The horizontal sizing setting on this auto-layout frame or frame child.
     *
     * - `FIXED`
     * - `HUG`: only valid on auto-layout frames and text nodes
     * - `FILL`: only valid on auto-layout frame children
     */
    layoutSizingHorizontal?: 'FIXED' | 'HUG' | 'FILL'

    /**
     * The vertical sizing setting on this auto-layout frame or frame child.
     *
     * - `FIXED`
     * - `HUG`: only valid on auto-layout frames and text nodes
     * - `FILL`: only valid on auto-layout frame children
     */
    layoutSizingVertical?: 'FIXED' | 'HUG' | 'FILL'
  }

  export type HasFramePropertiesTrait = {
    /**
     * Whether or not this node clip content outside of its bounds
     */
    clipsContent: boolean

    /**
     * Background of the node. This is deprecated, as backgrounds for frames are now in the `fills`
     * field.
     *
     * @deprecated
     */
    background?: Paint[]

    /**
     * Background color of the node. This is deprecated, as frames now support more than a solid color
     * as a background. Please use the `fills` field instead.
     *
     * @deprecated
     */
    backgroundColor?: RGBA

    /**
     * An array of layout grids attached to this node (see layout grids section for more details). GROUP
     * nodes do not have this attribute
     */
    layoutGrids?: LayoutGrid[]

    /**
     * Whether a node has primary axis scrolling, horizontal or vertical.
     */
    overflowDirection?:
      | 'HORIZONTAL_SCROLLING'
      | 'VERTICAL_SCROLLING'
      | 'HORIZONTAL_AND_VERTICAL_SCROLLING'
      | 'NONE'

    /**
     * Whether this layer uses auto-layout to position its children.
     */
    layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL'

    /**
     * Whether the primary axis has a fixed length (determined by the user) or an automatic length
     * (determined by the layout engine). This property is only applicable for auto-layout frames.
     */
    primaryAxisSizingMode?: 'FIXED' | 'AUTO'

    /**
     * Whether the counter axis has a fixed length (determined by the user) or an automatic length
     * (determined by the layout engine). This property is only applicable for auto-layout frames.
     */
    counterAxisSizingMode?: 'FIXED' | 'AUTO'

    /**
     * Determines how the auto-layout frame's children should be aligned in the primary axis direction.
     * This property is only applicable for auto-layout frames.
     */
    primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'

    /**
     * Determines how the auto-layout frame's children should be aligned in the counter axis direction.
     * This property is only applicable for auto-layout frames.
     */
    counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE'

    /**
     * The padding between the left border of the frame and its children. This property is only
     * applicable for auto-layout frames.
     */
    paddingLeft?: number

    /**
     * The padding between the right border of the frame and its children. This property is only
     * applicable for auto-layout frames.
     */
    paddingRight?: number

    /**
     * The padding between the top border of the frame and its children. This property is only
     * applicable for auto-layout frames.
     */
    paddingTop?: number

    /**
     * The padding between the bottom border of the frame and its children. This property is only
     * applicable for auto-layout frames.
     */
    paddingBottom?: number

    /**
     * The distance between children of the frame. Can be negative. This property is only applicable for
     * auto-layout frames.
     */
    itemSpacing?: number

    /**
     * Determines the canvas stacking order of layers in this frame. When true, the first layer will be
     * draw on top. This property is only applicable for auto-layout frames.
     */
    itemReverseZIndex?: boolean

    /**
     * Determines whether strokes are included in layout calculations. When true, auto-layout frames
     * behave like css "box-sizing: border-box". This property is only applicable for auto-layout
     * frames.
     */
    strokesIncludedInLayout?: boolean

    /**
     * Whether this auto-layout frame has wrapping enabled.
     */
    layoutWrap?: 'NO_WRAP' | 'WRAP'

    /**
     * The distance between wrapped tracks of an auto-layout frame. This property is only applicable for
     * auto-layout frames with `layoutWrap: "WRAP"`
     */
    counterAxisSpacing?: number

    /**
     * Determines how the auto-layout frame’s wrapped tracks should be aligned in the counter axis
     * direction. This property is only applicable for auto-layout frames with `layoutWrap: "WRAP"`.
     */
    counterAxisAlignContent?: 'AUTO' | 'SPACE_BETWEEN'
  }

  export type HasBlendModeAndOpacityTrait = {
    /**
     * How this node blends with nodes behind it in the scene (see blend mode section for more details)
     */
    blendMode: BlendMode

    /**
     * Opacity of the node
     */
    opacity?: number
  }

  export type HasExportSettingsTrait = {
    /**
     * An array of export settings representing images to export from the node.
     */
    exportSettings?: ExportSetting[]
  }

  export type HasGeometryTrait = MinimalFillsTrait &
    MinimalStrokesTrait & {
      /**
       * Map from ID to PaintOverride for looking up fill overrides. To see which regions are overriden,
       * you must use the `geometry=paths` option. Each path returned may have an `overrideID` which maps
       * to this table.
       */
      fillOverrideTable?: { [key: string]: PaintOverride | null }

      /**
       * Only specified if parameter `geometry=paths` is used. An array of paths representing the object
       * fill.
       */
      fillGeometry?: Path[]

      /**
       * Only specified if parameter `geometry=paths` is used. An array of paths representing the object
       * stroke.
       */
      strokeGeometry?: Path[]

      /**
       * A string enum describing the end caps of vector paths.
       */
      strokeCap?:
        | 'NONE'
        | 'ROUND'
        | 'SQUARE'
        | 'LINE_ARROW'
        | 'TRIANGLE_ARROW'
        | 'DIAMOND_FILLED'
        | 'CIRCLE_FILLED'
        | 'TRIANGLE_FILLED'
        | 'WASHI_TAPE_1'
        | 'WASHI_TAPE_2'
        | 'WASHI_TAPE_3'
        | 'WASHI_TAPE_4'
        | 'WASHI_TAPE_5'
        | 'WASHI_TAPE_6'

      /**
       * Only valid if `strokeJoin` is "MITER". The corner angle, in degrees, below which `strokeJoin`
       * will be set to "BEVEL" to avoid super sharp corners. By default this is 28.96 degrees.
       */
      strokeMiterAngle?: number
    }

  export type MinimalFillsTrait = {
    /**
     * An array of fill paints applied to the node.
     */
    fills: Paint[]

    /**
     * A mapping of a StyleType to style ID (see Style) of styles present on this node. The style ID can
     * be used to look up more information about the style in the top-level styles field.
     */
    styles?: { [key: string]: string }
  }

  export type MinimalStrokesTrait = {
    /**
     * An array of stroke paints applied to the node.
     */
    strokes?: Paint[]

    /**
     * The weight of strokes on the node.
     */
    strokeWeight?: number

    /**
     * Position of stroke relative to vector outline, as a string enum
     *
     * - `INSIDE`: stroke drawn inside the shape boundary
     * - `OUTSIDE`: stroke drawn outside the shape boundary
     * - `CENTER`: stroke drawn centered along the shape boundary
     */
    strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER'

    /**
     * A string enum with value of "MITER", "BEVEL", or "ROUND", describing how corners in vector paths
     * are rendered.
     */
    strokeJoin?: 'MITER' | 'BEVEL' | 'ROUND'

    /**
     * An array of floating point numbers describing the pattern of dash length and gap lengths that the
     * vector stroke will use when drawn.
     *
     * For example a value of [1, 2] indicates that the stroke will be drawn with a dash of length 1
     * followed by a gap of length 2, repeated.
     */
    strokeDashes?: number[]
  }

  export type IndividualStrokesTrait = {
    /**
     * An object including the top, bottom, left, and right stroke weights. Only returned if individual
     * stroke weights are used.
     */
    individualStrokeWeights?: StrokeWeights
  }

  export type CornerTrait = {
    /**
     * Radius of each corner if a single radius is set for all corners
     */
    cornerRadius?: number

    /**
     * A value that lets you control how "smooth" the corners are. Ranges from 0 to 1. 0 is the default
     * and means that the corner is perfectly circular. A value of 0.6 means the corner matches the iOS
     * 7 "squircle" icon shape. Other values produce various other curves.
     */
    cornerSmoothing?: number

    /**
     * Array of length 4 of the radius of each corner of the frame, starting in the top left and
     * proceeding clockwise.
     *
     * Values are given in the order top-left, top-right, bottom-right, bottom-left.
     */
    rectangleCornerRadii?: number[]
  }

  export type HasEffectsTrait = {
    /**
     * An array of effects attached to this node (see effects section for more details)
     */
    effects: Effect[]
  }

  export type HasMaskTrait = {
    /**
     * Does this node mask sibling nodes in front of it?
     */
    isMask?: boolean

    /**
     * If this layer is a mask, this property describes the operation used to mask the layer's siblings.
     * The value may be one of the following:
     *
     * - ALPHA: the mask node's alpha channel will be used to determine the opacity of each pixel in the
     *   masked result.
     * - VECTOR: if the mask node has visible fill paints, every pixel inside the node's fill regions will
     *   be fully visible in the masked result. If the mask has visible stroke paints, every pixel
     *   inside the node's stroke regions will be fully visible in the masked result.
     * - LUMINANCE: the luminance value of each pixel of the mask node will be used to determine the
     *   opacity of that pixel in the masked result.
     */
    maskType?: 'ALPHA' | 'VECTOR' | 'LUMINANCE'

    /**
     * True if maskType is VECTOR. This field is deprecated; use maskType instead.
     *
     * @deprecated
     */
    isMaskOutline?: boolean
  }

  export type ComponentPropertiesTrait = {
    /**
     * A mapping of name to `ComponentPropertyDefinition` for every component property on this
     * component. Each property has a type, defaultValue, and other optional values.
     */
    componentPropertyDefinitions?: { [key: string]: ComponentPropertyDefinition }
  }

  export type TypePropertiesTrait = {
    /**
     * The raw characters in the text node.
     */
    characters: string

    /**
     * Style of text including font family and weight.
     */
    style: TypeStyle

    /**
     * The array corresponds to characters in the text box, where each element references the
     * 'styleOverrideTable' to apply specific styles to each character. The array's length can be less
     * than or equal to the number of characters due to the removal of trailing zeros. Elements with a
     * value of 0 indicate characters that use the default type style. If the array is shorter than the
     * total number of characters, the characters beyond the array's length also use the default style.
     */
    characterStyleOverrides: number[]

    /**
     * Internal property, preserved for backward compatibility. Avoid using this value.
     */
    layoutVersion?: number

    /**
     * Map from ID to TypeStyle for looking up style overrides.
     */
    styleOverrideTable: { [key: string]: TypeStyle }

    /**
     * An array with the same number of elements as lines in the text node, where lines are delimited by
     * newline or paragraph separator characters. Each element in the array corresponds to the list type
     * of a specific line. List types are represented as string enums with one of these possible
     * values:
     *
     * - `NONE`: Not a list item.
     * - `ORDERED`: Text is an ordered list (numbered).
     * - `UNORDERED`: Text is an unordered list (bulleted).
     */
    lineTypes: ('NONE' | 'ORDERED' | 'UNORDERED')[]

    /**
     * An array with the same number of elements as lines in the text node, where lines are delimited by
     * newline or paragraph separator characters. Each element in the array corresponds to the
     * indentation level of a specific line.
     */
    lineIndentations: number[]
  }

  export type HasTextSublayerTrait = {
    /**
     * Text contained within a text box.
     */
    characters: string
  }

  export type TransitionSourceTrait = {
    /**
     * Node ID of node to transition to in prototyping
     */
    transitionNodeID?: string

    /**
     * The duration of the prototyping transition on this node (in milliseconds). This will override the
     * default transition duration on the prototype, for this node.
     */
    transitionDuration?: number

    /**
     * The easing curve used in the prototyping transition on this node.
     */
    transitionEasing?: EasingType

    interactions?: Interaction[]
  }

  export type DevStatusTrait = {
    /**
     * Represents whether or not a node has a particular handoff (or dev) status applied to it.
     */
    devStatus?: {
      type: 'NONE' | 'READY_FOR_DEV' | 'COMPLETED'

      /**
       * An optional field where the designer can add more information about the design and what has
       * changed.
       */
      description?: string
    }
  }

  export type AnnotationsTrait = object

  export type FrameTraits = IsLayerTrait &
    HasBlendModeAndOpacityTrait &
    HasChildrenTrait &
    HasLayoutTrait &
    HasFramePropertiesTrait &
    CornerTrait &
    HasGeometryTrait &
    HasExportSettingsTrait &
    HasEffectsTrait &
    HasMaskTrait &
    TransitionSourceTrait &
    IndividualStrokesTrait &
    DevStatusTrait &
    AnnotationsTrait

  export type DefaultShapeTraits = IsLayerTrait &
    HasBlendModeAndOpacityTrait &
    HasLayoutTrait &
    HasGeometryTrait &
    HasExportSettingsTrait &
    HasEffectsTrait &
    HasMaskTrait &
    TransitionSourceTrait

  export type CornerRadiusShapeTraits = DefaultShapeTraits & CornerTrait

  export type RectangularShapeTraits = DefaultShapeTraits &
    CornerTrait &
    IndividualStrokesTrait &
    AnnotationsTrait

  export type Node =
    | BooleanOperationNode
    | ComponentNode
    | ComponentSetNode
    | ConnectorNode
    | EllipseNode
    | EmbedNode
    | FrameNode
    | GroupNode
    | InstanceNode
    | LineNode
    | LinkUnfurlNode
    | RectangleNode
    | RegularPolygonNode
    | SectionNode
    | ShapeWithTextNode
    | SliceNode
    | StarNode
    | StickyNode
    | TableNode
    | TableCellNode
    | TextNode
    | VectorNode
    | WashiTapeNode
    | WidgetNode
    | DocumentNode
    | CanvasNode

  export type DocumentNode = {
    type: 'DOCUMENT'

    children: CanvasNode[]
  } & IsLayerTrait

  export type CanvasNode = {
    type: 'CANVAS'

    children: SubcanvasNode[]

    /**
     * Background color of the canvas.
     */
    backgroundColor: RGBA

    /**
     * Node ID that corresponds to the start frame for prototypes. This is deprecated with the
     * introduction of multiple flows. Please use the `flowStartingPoints` field.
     *
     * @deprecated
     */
    prototypeStartNodeID: string | null

    /**
     * An array of flow starting points sorted by its position in the prototype settings panel.
     */
    flowStartingPoints: FlowStartingPoint[]

    /**
     * The device used to view a prototype.
     */
    prototypeDevice: PrototypeDevice

    measurements?: Measurement[]
  } & IsLayerTrait &
    HasExportSettingsTrait

  export type SubcanvasNode =
    | BooleanOperationNode
    | ComponentNode
    | ComponentSetNode
    | ConnectorNode
    | EllipseNode
    | EmbedNode
    | FrameNode
    | GroupNode
    | InstanceNode
    | LineNode
    | LinkUnfurlNode
    | RectangleNode
    | RegularPolygonNode
    | SectionNode
    | ShapeWithTextNode
    | SliceNode
    | StarNode
    | StickyNode
    | TableNode
    | TableCellNode
    | TextNode
    | VectorNode
    | WashiTapeNode
    | WidgetNode

  export type BooleanOperationNode = {
    /**
     * The type of this node, represented by the string literal "BOOLEAN_OPERATION"
     */
    type: 'BOOLEAN_OPERATION'

    /**
     * A string enum indicating the type of boolean operation applied.
     */
    booleanOperation: 'UNION' | 'INTERSECT' | 'SUBTRACT' | 'EXCLUDE'
  } & IsLayerTrait &
    HasBlendModeAndOpacityTrait &
    HasChildrenTrait &
    HasLayoutTrait &
    HasGeometryTrait &
    HasExportSettingsTrait &
    HasEffectsTrait &
    HasMaskTrait &
    TransitionSourceTrait

  export type SectionNode = {
    /**
     * The type of this node, represented by the string literal "SECTION"
     */
    type: 'SECTION'

    /**
     * Whether the contents of the section are visible
     */
    sectionContentsHidden: boolean
  } & IsLayerTrait &
    HasGeometryTrait &
    HasChildrenTrait &
    HasLayoutTrait &
    DevStatusTrait

  export type FrameNode = {
    /**
     * The type of this node, represented by the string literal "FRAME"
     */
    type: 'FRAME'
  } & FrameTraits

  export type GroupNode = {
    /**
     * The type of this node, represented by the string literal "GROUP"
     */
    type: 'GROUP'
  } & FrameTraits

  export type ComponentNode = {
    /**
     * The type of this node, represented by the string literal "COMPONENT"
     */
    type: 'COMPONENT'
  } & FrameTraits &
    ComponentPropertiesTrait

  export type ComponentSetNode = {
    /**
     * The type of this node, represented by the string literal "COMPONENT_SET"
     */
    type: 'COMPONENT_SET'
  } & FrameTraits &
    ComponentPropertiesTrait

  export type VectorNode = {
    /**
     * The type of this node, represented by the string literal "VECTOR"
     */
    type: 'VECTOR'
  } & CornerRadiusShapeTraits &
    AnnotationsTrait

  export type StarNode = {
    /**
     * The type of this node, represented by the string literal "STAR"
     */
    type: 'STAR'
  } & CornerRadiusShapeTraits &
    AnnotationsTrait

  export type LineNode = {
    /**
     * The type of this node, represented by the string literal "LINE"
     */
    type: 'LINE'
  } & DefaultShapeTraits &
    AnnotationsTrait

  export type EllipseNode = {
    /**
     * The type of this node, represented by the string literal "ELLIPSE"
     */
    type: 'ELLIPSE'

    arcData: ArcData
  } & DefaultShapeTraits &
    AnnotationsTrait

  export type RegularPolygonNode = {
    /**
     * The type of this node, represented by the string literal "REGULAR_POLYGON"
     */
    type: 'REGULAR_POLYGON'
  } & CornerRadiusShapeTraits &
    AnnotationsTrait

  export type RectangleNode = {
    /**
     * The type of this node, represented by the string literal "RECTANGLE"
     */
    type: 'RECTANGLE'
  } & RectangularShapeTraits

  export type TextNode = {
    /**
     * The type of this node, represented by the string literal "TEXT"
     */
    type: 'TEXT'
  } & DefaultShapeTraits &
    TypePropertiesTrait &
    AnnotationsTrait

  export type TableNode = {
    /**
     * The type of this node, represented by the string literal "TABLE"
     */
    type: 'TABLE'
  } & IsLayerTrait &
    HasChildrenTrait &
    HasLayoutTrait &
    MinimalStrokesTrait &
    HasEffectsTrait &
    HasBlendModeAndOpacityTrait &
    HasExportSettingsTrait

  export type TableCellNode = {
    /**
     * The type of this node, represented by the string literal "TABLE_CELL"
     */
    type: 'TABLE_CELL'
  } & IsLayerTrait &
    MinimalFillsTrait &
    HasLayoutTrait &
    HasTextSublayerTrait

  export type SliceNode = {
    /**
     * The type of this node, represented by the string literal "SLICE"
     */
    type: 'SLICE'
  } & IsLayerTrait

  export type InstanceNode = {
    /**
     * The type of this node, represented by the string literal "INSTANCE"
     */
    type: 'INSTANCE'

    /**
     * ID of component that this instance came from.
     */
    componentId: string

    /**
     * If true, this node has been marked as exposed to its containing component or component set.
     */
    isExposedInstance?: boolean

    /**
     * IDs of instances that have been exposed to this node's level.
     */
    exposedInstances?: string[]

    /**
     * A mapping of name to `ComponentProperty` for all component properties on this instance. Each
     * property has a type, value, and other optional values.
     */
    componentProperties?: { [key: string]: ComponentProperty }

    /**
     * An array of all of the fields directly overridden on this instance. Inherited overrides are not
     * included.
     */
    overrides: Overrides[]
  } & FrameTraits

  export type EmbedNode = {
    /**
     * The type of this node, represented by the string literal "EMBED"
     */
    type: 'EMBED'
  } & IsLayerTrait &
    HasExportSettingsTrait

  export type LinkUnfurlNode = {
    /**
     * The type of this node, represented by the string literal "LINK_UNFURL"
     */
    type: 'LINK_UNFURL'
  } & IsLayerTrait &
    HasExportSettingsTrait

  export type StickyNode = {
    /**
     * The type of this node, represented by the string literal "STICKY"
     */
    type: 'STICKY'

    /**
     * If true, author name is visible.
     */
    authorVisible?: boolean
  } & IsLayerTrait &
    HasLayoutTrait &
    HasBlendModeAndOpacityTrait &
    MinimalFillsTrait &
    HasMaskTrait &
    HasEffectsTrait &
    HasExportSettingsTrait &
    HasTextSublayerTrait

  export type ShapeWithTextNode = {
    /**
     * The type of this node, represented by the string literal "SHAPE_WITH_TEXT"
     */
    type: 'SHAPE_WITH_TEXT'

    /**
     * Geometric shape type. Most shape types have the same name as their tooltip but there are a few
     * exceptions. ENG_DATABASE: Cylinder, ENG_QUEUE: Horizontal cylinder, ENG_FILE: File, ENG_FOLDER:
     * Folder.
     */
    shapeType: ShapeType
  } & IsLayerTrait &
    HasLayoutTrait &
    HasBlendModeAndOpacityTrait &
    MinimalFillsTrait &
    HasMaskTrait &
    HasEffectsTrait &
    HasExportSettingsTrait &
    HasTextSublayerTrait &
    CornerTrait &
    MinimalStrokesTrait

  export type ConnectorNode = {
    /**
     * The type of this node, represented by the string literal "CONNECTOR"
     */
    type: 'CONNECTOR'

    /**
     * The starting point of the connector.
     */
    connectorStart: ConnectorEndpoint

    /**
     * The ending point of the connector.
     */
    connectorEnd: ConnectorEndpoint

    /**
     * A string enum describing the end cap of the start of the connector.
     */
    connectorStartStrokeCap:
      | 'NONE'
      | 'LINE_ARROW'
      | 'TRIANGLE_ARROW'
      | 'DIAMOND_FILLED'
      | 'CIRCLE_FILLED'
      | 'TRIANGLE_FILLED'

    /**
     * A string enum describing the end cap of the end of the connector.
     */
    connectorEndStrokeCap:
      | 'NONE'
      | 'LINE_ARROW'
      | 'TRIANGLE_ARROW'
      | 'DIAMOND_FILLED'
      | 'CIRCLE_FILLED'
      | 'TRIANGLE_FILLED'

    /**
     * Connector line type.
     */
    connectorLineType: ConnectorLineType

    /**
     * Connector text background.
     */
    textBackground?: ConnectorTextBackground
  } & IsLayerTrait &
    HasLayoutTrait &
    HasBlendModeAndOpacityTrait &
    HasEffectsTrait &
    HasExportSettingsTrait &
    HasTextSublayerTrait &
    MinimalStrokesTrait

  export type WashiTapeNode = {
    /**
     * The type of this node, represented by the string literal "WASHI_TAPE"
     */
    type: 'WASHI_TAPE'
  } & DefaultShapeTraits

  export type WidgetNode = {
    /**
     * The type of this node, represented by the string literal "WIDGET"
     */
    type: 'WIDGET'
  } & IsLayerTrait &
    HasExportSettingsTrait &
    HasChildrenTrait

  /**
   * An RGB color
   */
  export type RGB = {
    /**
     * Red channel value, between 0 and 1.
     */
    r: number

    /**
     * Green channel value, between 0 and 1.
     */
    g: number

    /**
     * Blue channel value, between 0 and 1.
     */
    b: number
  }

  /**
   * An RGBA color
   */
  export type RGBA = {
    /**
     * Red channel value, between 0 and 1.
     */
    r: number

    /**
     * Green channel value, between 0 and 1.
     */
    g: number

    /**
     * Blue channel value, between 0 and 1.
     */
    b: number

    /**
     * Alpha channel value, between 0 and 1.
     */
    a: number
  }

  /**
   * A flow starting point used when launching a prototype to enter Presentation view.
   */
  export type FlowStartingPoint = {
    /**
     * Unique identifier specifying the frame.
     */
    nodeId: string

    /**
     * Name of flow.
     */
    name: string
  }

  /**
   * A width and a height.
   */
  export type Size = {
    /**
     * The width of a size.
     */
    width: number

    /**
     * The height of a size.
     */
    height: number
  }

  /**
   * The device used to view a prototype.
   */
  export type PrototypeDevice = {
    type: 'NONE' | 'PRESET' | 'CUSTOM' | 'PRESENTATION'

    size?: Size

    presetIdentifier?: string

    rotation: 'NONE' | 'CCW_90'
  }

  /**
   * Sizing constraint for exports.
   */
  export type Constraint = {
    /**
     * Type of constraint to apply:
     *
     * - `SCALE`: Scale by `value`.
     * - `WIDTH`: Scale proportionally and set width to `value`.
     * - `HEIGHT`: Scale proportionally and set height to `value`.
     */
    type: 'SCALE' | 'WIDTH' | 'HEIGHT'

    /**
     * See type property for effect of this field.
     */
    value: number
  }

  /**
   * An export setting.
   */
  export type ExportSetting = {
    suffix: string

    format: 'JPG' | 'PNG' | 'SVG' | 'PDF'

    constraint: Constraint
  }

  /**
   * This type is a string enum with the following possible values
   *
   * Normal blends:
   *
   * - `PASS_THROUGH` (only applicable to objects with children)
   * - `NORMAL`
   *
   * Darken:
   *
   * - `DARKEN`
   * - `MULTIPLY`
   * - `LINEAR_BURN`
   * - `COLOR_BURN`
   *
   * Lighten:
   *
   * - `LIGHTEN`
   * - `SCREEN`
   * - `LINEAR_DODGE`
   * - `COLOR_DODGE`
   *
   * Contrast:
   *
   * - `OVERLAY`
   * - `SOFT_LIGHT`
   * - `HARD_LIGHT`
   *
   * Inversion:
   *
   * - `DIFFERENCE`
   * - `EXCLUSION`
   *
   * Component:
   *
   * - `HUE`
   * - `SATURATION`
   * - `COLOR`
   * - `LUMINOSITY`
   */
  export type BlendMode =
    | 'PASS_THROUGH'
    | 'NORMAL'
    | 'DARKEN'
    | 'MULTIPLY'
    | 'LINEAR_BURN'
    | 'COLOR_BURN'
    | 'LIGHTEN'
    | 'SCREEN'
    | 'LINEAR_DODGE'
    | 'COLOR_DODGE'
    | 'OVERLAY'
    | 'SOFT_LIGHT'
    | 'HARD_LIGHT'
    | 'DIFFERENCE'
    | 'EXCLUSION'
    | 'HUE'
    | 'SATURATION'
    | 'COLOR'
    | 'LUMINOSITY'

  /**
   * A 2d vector.
   */
  export type Vector = {
    /**
     * X coordinate of the vector.
     */
    x: number

    /**
     * Y coordinate of the vector.
     */
    y: number
  }

  /**
   * A single color stop with its position along the gradient axis, color, and bound variables if any
   */
  export type ColorStop = {
    /**
     * Value between 0 and 1 representing position along gradient axis.
     */
    position: number

    /**
     * Color attached to corresponding position.
     */
    color: RGBA

    /**
     * The variables bound to a particular gradient stop
     */
    boundVariables?: { color?: VariableAlias }
  }

  /**
   * A transformation matrix is standard way in computer graphics to represent translation and
   * rotation. These are the top two rows of a 3x3 matrix. The bottom row of the matrix is assumed to
   * be [0, 0, 1]. This is known as an affine transform and is enough to represent translation,
   * rotation, and skew.
   *
   * The identity transform is [[1, 0, 0], [0, 1, 0]].
   *
   * A translation matrix will typically look like:
   *
   *     ;[
   *       [1, 0, tx],
   *       [0, 1, ty],
   *     ]
   *
   * And a rotation matrix will typically look like:
   *
   *     ;[
   *       [cos(angle), sin(angle), 0],
   *       [-sin(angle), cos(angle), 0],
   *     ]
   *
   * Another way to think about this transform is as three vectors:
   *
   * - The x axis (t[0][0], t[1][0])
   * - The y axis (t[0][1], t[1][1])
   * - The translation offset (t[0][2], t[1][2])
   *
   * The most common usage of the Transform matrix is the `relativeTransform property`. This
   * particular usage of the matrix has a few additional restrictions. The translation offset can take
   * on any value but we do enforce that the axis vectors are unit vectors (i.e. have length 1). The
   * axes are not required to be at 90° angles to each other.
   */
  export type Transform = number[][]

  /**
   * Image filters to apply to the node.
   */
  export type ImageFilters = {
    exposure?: number

    contrast?: number

    saturation?: number

    temperature?: number

    tint?: number

    highlights?: number

    shadows?: number
  }

  export type BasePaint = {
    /**
     * Is the paint enabled?
     */
    visible?: boolean

    /**
     * Overall opacity of paint (colors within the paint can also have opacity values which would blend
     * with this)
     */
    opacity?: number

    /**
     * How this node blends with nodes behind it in the scene
     */
    blendMode: BlendMode
  }

  export type SolidPaint = {
    /**
     * The string literal "SOLID" representing the paint's type. Always check the `type` before reading
     * other properties.
     */
    type: 'SOLID'

    /**
     * Solid color of the paint
     */
    color: RGBA

    /**
     * The variables bound to a particular field on this paint
     */
    boundVariables?: { color?: VariableAlias }
  } & BasePaint

  export type GradientPaint = {
    /**
     * The string literal representing the paint's type. Always check the `type` before reading other
     * properties.
     */
    type: 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND'

    /**
     * This field contains three vectors, each of which are a position in normalized object space
     * (normalized object space is if the top left corner of the bounding box of the object is (0, 0)
     * and the bottom right is (1,1)). The first position corresponds to the start of the gradient
     * (value 0 for the purposes of calculating gradient stops), the second position is the end of the
     * gradient (value 1), and the third handle position determines the width of the gradient.
     */
    gradientHandlePositions: Vector[]

    /**
     * Positions of key points along the gradient axis with the colors anchored there. Colors along the
     * gradient are interpolated smoothly between neighboring gradient stops.
     */
    gradientStops: ColorStop[]
  } & BasePaint

  export type ImagePaint = {
    /**
     * The string literal "IMAGE" representing the paint's type. Always check the `type` before reading
     * other properties.
     */
    type: 'IMAGE'

    /**
     * Image scaling mode.
     */
    scaleMode: 'FILL' | 'FIT' | 'TILE' | 'STRETCH'

    /**
     * A reference to an image embedded in this node. To download the image using this reference, use
     * the `GET file images` endpoint to retrieve the mapping from image references to image URLs.
     */
    imageRef: string

    /**
     * Affine transform applied to the image, only present if `scaleMode` is `STRETCH`
     */
    imageTransform?: Transform

    /**
     * Amount image is scaled by in tiling, only present if scaleMode is `TILE`.
     */
    scalingFactor?: number

    /**
     * Defines what image filters have been applied to this paint, if any. If this property is not
     * defined, no filters have been applied.
     */
    filters?: ImageFilters

    /**
     * Image rotation, in degrees.
     */
    rotation?: number

    /**
     * A reference to an animated GIF embedded in this node. To download the image using this reference,
     * use the `GET file images` endpoint to retrieve the mapping from image references to image URLs.
     */
    gifRef?: string
  } & BasePaint

  export type Paint = SolidPaint | GradientPaint | ImagePaint

  /**
   * Layout constraint relative to containing Frame
   */
  export type LayoutConstraint = {
    /**
     * Vertical constraint (relative to containing frame) as an enum:
     *
     * - `TOP`: Node is laid out relative to top of the containing frame
     * - `BOTTOM`: Node is laid out relative to bottom of the containing frame
     * - `CENTER`: Node is vertically centered relative to containing frame
     * - `TOP_BOTTOM`: Both top and bottom of node are constrained relative to containing frame (node
     *   stretches with frame)
     * - `SCALE`: Node scales vertically with containing frame
     */
    vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE'

    /**
     * Horizontal constraint (relative to containing frame) as an enum:
     *
     * - `LEFT`: Node is laid out relative to left of the containing frame
     * - `RIGHT`: Node is laid out relative to right of the containing frame
     * - `CENTER`: Node is horizontally centered relative to containing frame
     * - `LEFT_RIGHT`: Both left and right of node are constrained relative to containing frame (node
     *   stretches with frame)
     * - `SCALE`: Node scales horizontally with containing frame
     */
    horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE'
  }

  /**
   * A rectangle that expresses a bounding box in absolute coordinates.
   */
  export type Rectangle = {
    /**
     * X coordinate of top left corner of the rectangle.
     */
    x: number

    /**
     * Y coordinate of top left corner of the rectangle.
     */
    y: number

    /**
     * Width of the rectangle.
     */
    width: number

    /**
     * Height of the rectangle.
     */
    height: number
  }

  /**
   * Guides to align and place objects within a frames.
   */
  export type LayoutGrid = {
    /**
     * Orientation of the grid as a string enum
     *
     * - `COLUMNS`: Vertical grid
     * - `ROWS`: Horizontal grid
     * - `GRID`: Square grid
     */
    pattern: 'COLUMNS' | 'ROWS' | 'GRID'

    /**
     * Width of column grid or height of row grid or square grid spacing.
     */
    sectionSize: number

    /**
     * Is the grid currently visible?
     */
    visible: boolean

    /**
     * Color of the grid
     */
    color: RGBA

    /**
     * Positioning of grid as a string enum
     *
     * - `MIN`: Grid starts at the left or top of the frame
     * - `MAX`: Grid starts at the right or bottom of the frame
     * - `STRETCH`: Grid is stretched to fit the frame
     * - `CENTER`: Grid is center aligned
     */
    alignment: 'MIN' | 'MAX' | 'STRETCH' | 'CENTER'

    /**
     * Spacing in between columns and rows
     */
    gutterSize: number

    /**
     * Spacing before the first column or row
     */
    offset: number

    /**
     * Number of columns or rows
     */
    count: number

    /**
     * The variables bound to a particular field on this layout grid
     */
    boundVariables?: {
      gutterSize?: VariableAlias

      numSections?: VariableAlias

      sectionSize?: VariableAlias

      offset?: VariableAlias
    }
  }

  /**
   * Base properties shared by all shadow effects
   */
  export type BaseShadowEffect = {
    /**
     * The color of the shadow
     */
    color: RGBA

    /**
     * Blend mode of the shadow
     */
    blendMode: BlendMode

    /**
     * How far the shadow is projected in the x and y directions
     */
    offset: Vector

    /**
     * Radius of the blur effect (applies to shadows as well)
     */
    radius: number

    /**
     * The distance by which to expand (or contract) the shadow.
     *
     * For drop shadows, a positive `spread` value creates a shadow larger than the node, whereas a
     * negative value creates a shadow smaller than the node.
     *
     * For inner shadows, a positive `spread` value contracts the shadow. Spread values are only
     * accepted on rectangles and ellipses, or on frames, components, and instances with visible fill
     * paints and `clipsContent` enabled. When left unspecified, the default value is 0.
     */
    spread?: number

    /**
     * Whether this shadow is visible.
     */
    visible: boolean

    /**
     * The variables bound to a particular field on this shadow effect
     */
    boundVariables?: {
      radius?: VariableAlias

      spread?: VariableAlias

      color?: VariableAlias

      offsetX?: VariableAlias

      offsetY?: VariableAlias
    }
  }

  export type DropShadowEffect = {
    /**
     * A string literal representing the effect's type. Always check the type before reading other
     * properties.
     */
    type: 'DROP_SHADOW'

    /**
     * Whether to show the shadow behind translucent or transparent pixels
     */
    showShadowBehindNode: boolean
  } & BaseShadowEffect

  export type InnerShadowEffect = {
    /**
     * A string literal representing the effect's type. Always check the type before reading other
     * properties.
     */
    type?: 'INNER_SHADOW'
  } & BaseShadowEffect

  /**
   * A blur effect
   */
  export type BlurEffect = {
    /**
     * A string literal representing the effect's type. Always check the type before reading other
     * properties.
     */
    type: 'LAYER_BLUR' | 'BACKGROUND_BLUR'

    /**
     * Whether this blur is active.
     */
    visible: boolean

    /**
     * Radius of the blur effect
     */
    radius: number

    /**
     * The variables bound to a particular field on this blur effect
     */
    boundVariables?: { radius?: VariableAlias }
  }

  export type Effect = DropShadowEffect | InnerShadowEffect | BlurEffect


  export type EasingType =
    | 'EASE_IN'
    | 'EASE_OUT'
    | 'EASE_IN_AND_OUT'
    | 'LINEAR'
    | 'EASE_IN_BACK'
    | 'EASE_OUT_BACK'
    | 'EASE_IN_AND_OUT_BACK'
    | 'CUSTOM_CUBIC_BEZIER'
    | 'GENTLE'
    | 'QUICK'
    | 'BOUNCY'
    | 'SLOW'
    | 'CUSTOM_SPRING'

  /**
   * Individual stroke weights
   */
  export type StrokeWeights = {
    /**
     * The top stroke weight.
     */
    top: number

    /**
     * The right stroke weight.
     */
    right: number

    /**
     * The bottom stroke weight.
     */
    bottom: number

    /**
     * The left stroke weight.
     */
    left: number
  }

  /**
   * Paint metadata to override default paints.
   */
  export type PaintOverride = {
    /**
     * Paints applied to characters.
     */
    fills?: Paint[]

    /**
     * ID of style node, if any, that this inherits fill data from.
     */
    inheritFillStyleId?: string
  }

  /**
   * Defines a single path
   */
  export type Path = {
    /**
     * A series of path commands that encodes how to draw the path.
     */
    path: string

    /**
     * The winding rule for the path (same as in SVGs). This determines whether a given point in space
     * is inside or outside the path.
     */
    windingRule: 'NONZERO' | 'EVENODD'

    /**
     * If there is a per-region fill, this refers to an ID in the `fillOverrideTable`.
     */
    overrideID?: number
  }

  /**
   * Information about the arc properties of an ellipse. 0° is the x axis and increasing angles rotate
   * clockwise.
   */
  export type ArcData = {
    /**
     * Start of the sweep in radians.
     */
    startingAngle: number

    /**
     * End of the sweep in radians.
     */
    endingAngle: number

    /**
     * Inner radius value between 0 and 1
     */
    innerRadius: number
  }

  /**
   * A link to either a URL or another frame (node) in the document.
   */
  export type Hyperlink = {
    /**
     * The type of hyperlink. Can be either `URL` or `NODE`.
     */
    type: 'URL' | 'NODE'

    /**
     * The URL that the hyperlink points to, if `type` is `URL`.
     */
    url?: string

    /**
     * The ID of the node that the hyperlink points to, if `type` is `NODE`.
     */
    nodeID?: string
  }

  /**
   * Metadata for character formatting.
   */
  export type TypeStyle = {
    /**
     * Font family of text (standard name).
     */
    fontFamily?: string

    /**
     * PostScript font name.
     */
    fontPostScriptName?: string | null

    /**
     * Describes visual weight or emphasis, such as Bold or Italic.
     */
    fontStyle?: string

    /**
     * Space between paragraphs in px, 0 if not present.
     */
    paragraphSpacing?: number

    /**
     * Paragraph indentation in px, 0 if not present.
     */
    paragraphIndent?: number

    /**
     * Space between list items in px, 0 if not present.
     */
    listSpacing?: number

    /**
     * Whether or not text is italicized.
     */
    italic?: boolean

    /**
     * Numeric font weight.
     */
    fontWeight?: number

    /**
     * Font size in px.
     */
    fontSize?: number

    /**
     * Text casing applied to the node, default is the original casing.
     */
    textCase?: 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED'

    /**
     * Text decoration applied to the node, default is none.
     */
    textDecoration?: 'NONE' | 'STRIKETHROUGH' | 'UNDERLINE'

    /**
     * Dimensions along which text will auto resize, default is that the text does not auto-resize.
     * TRUNCATE means that the text will be shortened and trailing text will be replaced with "…" if the
     * text contents is larger than the bounds. `TRUNCATE` as a return value is deprecated and will be
     * removed in a future version. Read from `textTruncation` instead.
     */
    textAutoResize?: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE'

    /**
     * Whether this text node will truncate with an ellipsis when the text contents is larger than the
     * text node.
     */
    textTruncation?: 'DISABLED' | 'ENDING'

    /**
     * When `textTruncation: "ENDING"` is set, `maxLines` determines how many lines a text node can grow
     * to before it truncates.
     */
    maxLines?: number

    /**
     * Horizontal text alignment as string enum.
     */
    textAlignHorizontal?: 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED'

    /**
     * Vertical text alignment as string enum.
     */
    textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM'

    /**
     * Space between characters in px.
     */
    letterSpacing?: number

    /**
     * An array of fill paints applied to the characters.
     */
    fills?: Paint[]

    /**
     * Link to a URL or frame.
     */
    hyperlink?: Hyperlink

    /**
     * A map of OpenType feature flags to 1 or 0, 1 if it is enabled and 0 if it is disabled. Note that
     * some flags aren't reflected here. For example, SMCP (small caps) is still represented by the
     * `textCase` field.
     */
    opentypeFlags?: { [key: string]: number }

    /**
     * Line height in px.
     */
    lineHeightPx?: number

    /**
     * Line height as a percentage of normal line height. This is deprecated; in a future version of the
     * API only lineHeightPx and lineHeightPercentFontSize will be returned.
     */
    lineHeightPercent?: number

    /**
     * Line height as a percentage of the font size. Only returned when `lineHeightPercent` (deprecated)
     * is not 100.
     */
    lineHeightPercentFontSize?: number

    /**
     * The unit of the line height value specified by the user.
     */
    lineHeightUnit?: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%'

    /**
     * The variables bound to a particular field on this style
     */
    boundVariables?: {
      fontFamily?: VariableAlias

      fontSize?: VariableAlias

      fontStyle?: VariableAlias

      fontWeight?: VariableAlias

      letterSpacing?: VariableAlias

      lineHeight?: VariableAlias

      paragraphSpacing?: VariableAlias

      paragraphIndent?: VariableAlias
    }

    /**
     * Whether or not this style has overrides over a text style. The possible fields to override are
     * semanticWeight, semanticItalic, hyperlink, and textDecoration. If this is true, then those fields
     * are overrides if present.
     */
    isOverrideOverTextStyle?: boolean

    /**
     * Indicates how the font weight was overridden when there is a text style override.
     */
    semanticWeight?: 'BOLD' | 'NORMAL'

    /**
     * Indicates how the font style was overridden when there is a text style override.
     */
    semanticItalic?: 'ITALIC' | 'NORMAL'
  }

  /**
   * Component property type.
   */
  export type ComponentPropertyType = 'BOOLEAN' | 'INSTANCE_SWAP' | 'TEXT' | 'VARIANT'

  /**
   * Instance swap preferred value.
   */
  export type InstanceSwapPreferredValue = {
    /**
     * Type of node for this preferred value.
     */
    type: 'COMPONENT' | 'COMPONENT_SET'

    /**
     * Key of this component or component set.
     */
    key: string
  }

  /**
   * A property of a component.
   */
  export type ComponentPropertyDefinition = {
    /**
     * Type of this component property.
     */
    type: ComponentPropertyType

    /**
     * Initial value of this property for instances.
     */
    defaultValue: boolean | string

    /**
     * All possible values for this property. Only exists on VARIANT properties.
     */
    variantOptions?: string[]

    /**
     * Preferred values for this property. Only applicable if type is `INSTANCE_SWAP`.
     */
    preferredValues?: InstanceSwapPreferredValue[]
  }

  /**
   * A property of a component.
   */
  export type ComponentProperty = {
    /**
     * Type of this component property.
     */
    type: ComponentPropertyType

    /**
     * Value of the property for this component instance.
     */
    value: boolean | string

    /**
     * Preferred values for this property. Only applicable if type is `INSTANCE_SWAP`.
     */
    preferredValues?: InstanceSwapPreferredValue[]

    /**
     * The variables bound to a particular field on this component property
     */
    boundVariables?: { value?: VariableAlias }
  }

  /**
   * Fields directly overridden on an instance. Inherited overrides are not included.
   */
  export type Overrides = {
    /**
     * A unique ID for a node.
     */
    id: string

    /**
     * An array of properties.
     */
    overriddenFields: string[]
  }

  /**
   * Geometric shape type.
   */
  export type ShapeType =
    | 'SQUARE'
    | 'ELLIPSE'
    | 'ROUNDED_RECTANGLE'
    | 'DIAMOND'
    | 'TRIANGLE_UP'
    | 'TRIANGLE_DOWN'
    | 'PARALLELOGRAM_RIGHT'
    | 'PARALLELOGRAM_LEFT'
    | 'ENG_DATABASE'
    | 'ENG_QUEUE'
    | 'ENG_FILE'
    | 'ENG_FOLDER'
    | 'TRAPEZOID'
    | 'PREDEFINED_PROCESS'
    | 'SHIELD'
    | 'DOCUMENT_SINGLE'
    | 'DOCUMENT_MULTIPLE'
    | 'MANUAL_INPUT'
    | 'HEXAGON'
    | 'CHEVRON'
    | 'PENTAGON'
    | 'OCTAGON'
    | 'STAR'
    | 'PLUS'
    | 'ARROW_LEFT'
    | 'ARROW_RIGHT'
    | 'SUMMING_JUNCTION'
    | 'OR'
    | 'SPEECH_BUBBLE'
    | 'INTERNAL_STORAGE'

  /**
   * Stores canvas location for a connector start/end point.
   */
  export type ConnectorEndpoint =
    | {
        /**
         * Node ID that this endpoint attaches to.
         */
        endpointNodeId?: string

        /**
         * The position of the endpoint relative to the node.
         */
        position?: Vector
      }
    | {
        /**
         * Node ID that this endpoint attaches to.
         */
        endpointNodeId?: string

        /**
         * The magnet type is a string enum.
         */
        magnet?: 'AUTO' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'CENTER'
      }

  /**
   * Connector line type.
   */
  export type ConnectorLineType = 'STRAIGHT' | 'ELBOWED'

  export type ConnectorTextBackground = CornerTrait & MinimalFillsTrait


  /**
   * Contains a variable alias
   */
  export type VariableAlias = {
    type: 'VARIABLE_ALIAS'

    /**
     * The id of the variable that the current variable is aliased to. This variable can be a local or
     * remote variable, and both can be retrieved via the GET /v1/files/:file_key/variables/local
     * endpoint.
     */
    id: string
  }

  /**
   * An interaction in the Figma viewer, containing a trigger and one or more actions.
   */
  export type Interaction = {
    /**
     * The user event that initiates the interaction.
     */
    trigger: Trigger | null

    /**
     * The actions that are performed when the trigger is activated.
     */
    actions?: Action[]
  }

  /**
   * The `"ON_HOVER"` and `"ON_PRESS"` trigger types revert the navigation when the trigger is
   * finished (the result is temporary). `"MOUSE_ENTER"`, `"MOUSE_LEAVE"`, `"MOUSE_UP"` and
   * `"MOUSE_DOWN"` are permanent, one-way navigation. The `delay` parameter requires the trigger to
   * be held for a certain duration of time before the action occurs. Both `timeout` and `delay`
   * values are in milliseconds. The `"ON_MEDIA_HIT"` and `"ON_MEDIA_END"` trigger types can only
   * trigger from a video. They fire when a video reaches a certain time or ends. The `timestamp`
   * value is in seconds.
   */
  export type Trigger =
    | { type: 'ON_CLICK' | 'ON_HOVER' | 'ON_PRESS' | 'ON_DRAG' }
    | AfterTimeoutTrigger
    | {
        type: 'MOUSE_ENTER' | 'MOUSE_LEAVE' | 'MOUSE_UP' | 'MOUSE_DOWN'

        delay: number

        /**
         * Whether this is a [deprecated
         * version](https://help.figma.com/hc/en-us/articles/360040035834-Prototype-triggers#h_01HHN04REHJNP168R26P1CMP0A)
         * of the trigger that was left unchanged for backwards compatibility. If not present, the trigger
         * is the latest version.
         */
        deprecatedVersion?: boolean
      }
    | OnKeyDownTrigger
    | OnMediaHitTrigger
    | { type: 'ON_MEDIA_END' }

  export type AfterTimeoutTrigger = {
    type: 'AFTER_TIMEOUT'

    timeout: number
  }

  export type OnKeyDownTrigger = {
    type: 'ON_KEY_DOWN'

    device: 'KEYBOARD' | 'XBOX_ONE' | 'PS4' | 'SWITCH_PRO' | 'UNKNOWN_CONTROLLER'

    keyCodes: number[]
  }

  export type OnMediaHitTrigger = {
    type: 'ON_MEDIA_HIT'

    mediaHitTime: number
  }

  /**
   * An action that is performed when a trigger is activated.
   */
  export type Action =
    | { type: 'BACK' | 'CLOSE' }
    | OpenURLAction
    | UpdateMediaRuntimeAction
    | SetVariableAction
    | SetVariableModeAction
    | ConditionalAction
    | NodeAction

  /**
   * An action that opens a URL.
   */
  export type OpenURLAction = {
    type: 'URL'

    url: string
  }

  /**
   * An action that affects a video node in the Figma viewer. For example, to play, pause, or skip.
   */
  export type UpdateMediaRuntimeAction =
    | {
        type: 'UPDATE_MEDIA_RUNTIME'

        destinationId: string | null

        mediaAction: 'PLAY' | 'PAUSE' | 'TOGGLE_PLAY_PAUSE' | 'MUTE' | 'UNMUTE' | 'TOGGLE_MUTE_UNMUTE'
      }
    | {
        type: 'UPDATE_MEDIA_RUNTIME'

        destinationId?: string | null

        mediaAction: 'SKIP_FORWARD' | 'SKIP_BACKWARD'

        amountToSkip: number
      }
    | {
        type: 'UPDATE_MEDIA_RUNTIME'

        destinationId?: string | null

        mediaAction: 'SKIP_TO'

        newTimestamp: number
      }

  /**
   * An action that navigates to a specific node in the Figma viewer.
   */
  export type NodeAction = {
    type: 'NODE'

    destinationId: string | null

    navigation: Navigation

    transition: Transition | null

    /**
     * Whether the scroll offsets of any scrollable elements in the current screen or overlay are
     * preserved when navigating to the destination. This is applicable only if the layout of both the
     * current frame and its destination are the same.
     */
    preserveScrollPosition?: boolean

    /**
     * Applicable only when `navigation` is `"OVERLAY"` and the destination is a frame with
     * `overlayPosition` equal to `"MANUAL"`. This value represents the offset by which the overlay is
     * opened relative to this node.
     */
    overlayRelativePosition?: Vector

    /**
     * When true, all videos within the destination frame will reset their memorized playback position
     * to 00:00 before starting to play.
     */
    resetVideoPosition?: boolean

    /**
     * Whether the scroll offsets of any scrollable elements in the current screen or overlay reset when
     * navigating to the destination. This is applicable only if the layout of both the current frame
     * and its destination are the same.
     */
    resetScrollPosition?: boolean

    /**
     * Whether the state of any interactive components in the current screen or overlay reset when
     * navigating to the destination. This is applicable if there are interactive components in the
     * destination frame.
     */
    resetInteractiveComponents?: boolean
  }

  /**
   * The method of navigation. The possible values are:
   *
   * - `"NAVIGATE"`: Replaces the current screen with the destination, also closing all overlays.
   * - `"OVERLAY"`: Opens the destination as an overlay on the current screen.
   * - `"SWAP"`: On an overlay, replaces the current (topmost) overlay with the destination. On a
   *   top-level frame, behaves the same as `"NAVIGATE"` except that no entry is added to the
   *   navigation history.
   * - `"SCROLL_TO"`: Scrolls to the destination on the current screen.
   * - `"CHANGE_TO"`: Changes the closest ancestor instance of source node to the specified variant.
   */
  export type Navigation = 'NAVIGATE' | 'SWAP' | 'OVERLAY' | 'SCROLL_TO' | 'CHANGE_TO'

  export type Transition = SimpleTransition | DirectionalTransition

  /**
   * Describes an animation used when navigating in a prototype.
   */
  export type SimpleTransition = {
    type: 'DISSOLVE' | 'SMART_ANIMATE' | 'SCROLL_ANIMATE'

    /**
     * The duration of the transition in milliseconds.
     */
    duration: number

    /**
     * The easing curve of the transition.
     */
    easing: Easing
  }

  /**
   * Describes an animation used when navigating in a prototype.
   */
  export type DirectionalTransition = {
    type: 'MOVE_IN' | 'MOVE_OUT' | 'PUSH' | 'SLIDE_IN' | 'SLIDE_OUT'

    direction: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM'

    /**
     * The duration of the transition in milliseconds.
     */
    duration: number

    /**
     * The easing curve of the transition.
     */
    easing: Easing

    /**
     * When the transition `type` is `"SMART_ANIMATE"` or when `matchLayers` is `true`, then the
     * transition will be performed using smart animate, which attempts to match corresponding layers an
     * interpolate other properties during the animation.
     */
    matchLayers?: boolean
  }

  /**
   * Describes an easing curve.
   */
  export type Easing = {
    /**
     * The type of easing curve.
     */
    type: EasingType

    /**
     * A cubic bezier curve that defines the easing.
     */
    easingFunctionCubicBezier?: {
      /**
       * The x component of the first control point.
       */
      x1: number

      /**
       * The y component of the first control point.
       */
      y1: number

      /**
       * The x component of the second control point.
       */
      x2: number

      /**
       * The y component of the second control point.
       */
      y2: number
    }

    /**
     * A spring function that defines the easing.
     */
    easingFunctionSpring?: {
      mass: number

      stiffness: number

      damping: number
    }
  }

  /**
   * Sets a variable to a specific value.
   */
  export type SetVariableAction = {
    type: 'SET_VARIABLE'

    variableId: string | null

    variableValue?: VariableData
  }

  /**
   * Sets a variable to a specific mode.
   */
  export type SetVariableModeAction = {
    type: 'SET_VARIABLE_MODE'

    variableCollectionId?: string | null

    variableModeId?: string | null
  }

  /**
   * Checks if a condition is met before performing certain actions by using an if/else conditional
   * statement.
   */
  export type ConditionalAction = {
    type: 'CONDITIONAL'

    conditionalBlocks: ConditionalBlock[]
  }

  /**
   * A value to set a variable to during prototyping.
   */
  export type VariableData = {
    type?: VariableDataType

    resolvedType?: VariableResolvedDataType

    value?: boolean | number | string | RGB | RGBA | VariableAlias | Expression
  }

  /**
   * Defines the types of data a VariableData object can hold
   */
  export type VariableDataType =
    | 'BOOLEAN'
    | 'FLOAT'
    | 'STRING'
    | 'COLOR'
    | 'VARIABLE_ALIAS'
    | 'EXPRESSION'

  /**
   * Defines the types of data a VariableData object can eventually equal
   */
  export type VariableResolvedDataType = 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR'

  /**
   * Defines the [Expression](https://help.figma.com/hc/en-us/articles/15253194385943) object, which
   * contains a list of `VariableData` objects strung together by operators (`ExpressionFunction`).
   */
  export type Expression = {
    expressionFunction: ExpressionFunction

    expressionArguments: VariableData[]
  }

  /**
   * Defines the list of operators available to use in an Expression.
   */
  export type ExpressionFunction =
    | 'ADDITION'
    | 'SUBTRACTION'
    | 'MULTIPLICATION'
    | 'DIVISION'
    | 'EQUALS'
    | 'NOT_EQUAL'
    | 'LESS_THAN'
    | 'LESS_THAN_OR_EQUAL'
    | 'GREATER_THAN'
    | 'GREATER_THAN_OR_EQUAL'
    | 'AND'
    | 'OR'
    | 'VAR_MODE_LOOKUP'
    | 'NEGATE'
    | 'NOT'

  /**
   * Either the if or else conditional blocks. The if block contains a condition to check. If that
   * condition is met then it will run those list of actions, else it will run the actions in the else
   * block.
   */
  export type ConditionalBlock = {
    condition?: VariableData

    actions: Action[]
  }

  /**
   * A pinned distance between two nodes in Dev Mode
   */
  export type Measurement = {
    id: string

    start: MeasurementStartEnd

    end: MeasurementStartEnd

    offset: MeasurementOffsetInner | MeasurementOffsetOuter

    /**
     * When manually overridden, the displayed value of the measurement
     */
    freeText?: string
  }

  /**
   * The node and side a measurement is pinned to
   */
  export type MeasurementStartEnd = {
    nodeId: string

    side: 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT'
  }

  /**
   * Measurement offset relative to the inside of the start node
   */
  export type MeasurementOffsetInner = {
    type: 'INNER'

    relative: number
  }

  /**
   * Measurement offset relative to the outside of the start node
   */
  export type MeasurementOffsetOuter = {
    type: 'OUTER'

    fixed: number
  }
