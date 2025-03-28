export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  url: string;
  mimeType: string;
}

export interface EmbeddedResource {
  type: 'embedded';
  name: string;
  data: string;
  mimeType: string;
}

export type ToolOutput = TextContent | ImageContent | EmbeddedResource; 