import { Obsidian } from './obsidian';
import { 
  ListFilesInVaultToolHandler, 
  ListFilesInDirToolHandler,
  GetFileContentsToolHandler,
  SearchToolHandler,
  AppendContentToolHandler,
  PatchContentToolHandler,
  ComplexSearchToolHandler,
  BatchGetFileContentsToolHandler,
  ToolHandler
} from './tools';
import { PROMPTS } from './prompts';
import { Tool } from './types';

export class ObsidianMCP {
  private obsidian: Obsidian;
  private toolHandlers: Map<string, ToolHandler>;
  
  constructor(apiKey: string, host: string = '127.0.0.1', port: number = 27124) {
    this.obsidian = new Obsidian({ apiKey, host, port });
    this.toolHandlers = new Map();
    
    this.registerTools();
  }
  
  /**
   * Get the Obsidian instance
   * @returns The Obsidian instance
   */
  getObsidian(): Obsidian {
    return this.obsidian;
  }
  
  private registerTools() {
    const handlers: ToolHandler[] = [
      new ListFilesInVaultToolHandler(this.obsidian),
      new ListFilesInDirToolHandler(this.obsidian),
      new GetFileContentsToolHandler(this.obsidian),
      new SearchToolHandler(this.obsidian),
      new AppendContentToolHandler(this.obsidian),
      new PatchContentToolHandler(this.obsidian),
      new ComplexSearchToolHandler(this.obsidian),
      new BatchGetFileContentsToolHandler(this.obsidian),
    ];
    
    for (const handler of handlers) {
      this.toolHandlers.set(handler.name, handler);
    }
  }
  
  getTools(): Tool[] {
    return Array.from(this.toolHandlers.values()).map(handler => handler.getToolDescription());
  }
  
  getPrompts() {
    return PROMPTS;
  }
  
  async runTool(toolName: string, args: Record<string, any>) {
    const handler = this.toolHandlers.get(toolName);
    if (!handler) {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    return await handler.runTool(args);
  }
} 