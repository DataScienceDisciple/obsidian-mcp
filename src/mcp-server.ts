import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ObsidianMCP } from './server';
import * as tools from './tools';
import { NOTE_SUMMARIZATION_PROMPT } from './prompts';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OBSIDIAN_API_KEY;
if (!apiKey) {
  console.error('OBSIDIAN_API_KEY environment variable is required');
  process.exit(1);
}

// Create the Obsidian client
const obsidianClient = new ObsidianMCP(apiKey);

// Get tool descriptions from the tools.ts handlers
const listFilesInVaultHandler = new tools.ListFilesInVaultToolHandler(obsidianClient.getObsidian());
const listFilesInDirHandler = new tools.ListFilesInDirToolHandler(obsidianClient.getObsidian());
const searchHandler = new tools.SearchToolHandler(obsidianClient.getObsidian());
const complexSearchHandler = new tools.ComplexSearchToolHandler(obsidianClient.getObsidian());
const getFileContentsHandler = new tools.GetFileContentsToolHandler(obsidianClient.getObsidian());
const batchGetFileContentsHandler = new tools.BatchGetFileContentsToolHandler(obsidianClient.getObsidian());
const appendContentHandler = new tools.AppendContentToolHandler(obsidianClient.getObsidian());
const patchContentHandler = new tools.PatchContentToolHandler(obsidianClient.getObsidian());

// Create an MCP server
const server = new McpServer({
  name: 'Obsidian',
  version: '1.0.0'
});

// Register search tools
server.tool(
  tools.TOOL_LIST_FILES_IN_VAULT,
  listFilesInVaultHandler.getToolDescription().description,
  async () => {
    const result = await obsidianClient.runTool(tools.TOOL_LIST_FILES_IN_VAULT, {});
    const textContent = result[0];
    if (textContent.type === 'text') {
      return {
        content: [{ type: 'text', text: textContent.text }]
      };
    }
    throw new Error('Unexpected result type from tool');
  }
);

server.tool(
  tools.TOOL_LIST_FILES_IN_DIR,
  listFilesInDirHandler.getToolDescription().description,
  {
    dirpath: z.string().describe(listFilesInDirHandler.getToolDescription().inputSchema.properties.dirpath.description)
  },
  async ({ dirpath }) => {
    const result = await obsidianClient.runTool(tools.TOOL_LIST_FILES_IN_DIR, { dirpath });
    const textContent = result[0];
    if (textContent.type === 'text') {
      return {
        content: [{ type: 'text', text: textContent.text }]
      };
    }
    throw new Error('Unexpected result type from tool');
  }
);

server.tool(
  tools.TOOL_SEARCH,
  searchHandler.getToolDescription().description,
  {
    query: z.string().describe(searchHandler.getToolDescription().inputSchema.properties.query.description),
    context_length: z.number().optional().describe(searchHandler.getToolDescription().inputSchema.properties.context_length.description)
  },
  async ({ query, context_length }) => {
    const result = await obsidianClient.runTool(tools.TOOL_SEARCH, { query, context_length });
    const textContent = result[0];
    if (textContent.type === 'text') {
      return {
        content: [{ type: 'text', text: textContent.text }]
      };
    }
    throw new Error('Unexpected result type from tool');
  }
);

server.tool(
  tools.TOOL_COMPLEX_SEARCH,
  complexSearchHandler.getToolDescription().description,
  {
    query: z.record(z.any()).describe(complexSearchHandler.getToolDescription().inputSchema.properties.query.description)
  },
  async ({ query }) => {
    const result = await obsidianClient.runTool(tools.TOOL_COMPLEX_SEARCH, { query });
    const textContent = result[0];
    if (textContent.type === 'text') {
      return {
        content: [{ type: 'text', text: textContent.text }]
      };
    }
    throw new Error('Unexpected result type from tool');
  }
);

// Register read tools
server.tool(
  tools.TOOL_GET_FILE_CONTENTS,
  getFileContentsHandler.getToolDescription().description,
  {
    filepath: z.string().describe(getFileContentsHandler.getToolDescription().inputSchema.properties.filepath.description)
  },
  async ({ filepath }) => {
    const result = await obsidianClient.runTool(tools.TOOL_GET_FILE_CONTENTS, { filepath });
    const textContent = result[0];
    if (textContent.type === 'text') {
      return {
        content: [{ type: 'text', text: textContent.text }]
      };
    }
    throw new Error('Unexpected result type from tool');
  }
);

server.tool(
  tools.TOOL_BATCH_GET_FILE_CONTENTS,
  batchGetFileContentsHandler.getToolDescription().description,
  {
    filepaths: z.array(z.string()).describe(batchGetFileContentsHandler.getToolDescription().inputSchema.properties.filepaths.description)
  },
  async ({ filepaths }) => {
    const result = await obsidianClient.runTool(tools.TOOL_BATCH_GET_FILE_CONTENTS, { filepaths });
    const textContent = result[0];
    if (textContent.type === 'text') {
      return {
        content: [{ type: 'text', text: textContent.text }]
      };
    }
    throw new Error('Unexpected result type from tool');
  }
);

// Register write tools
server.tool(
  tools.TOOL_APPEND_CONTENT,
  appendContentHandler.getToolDescription().description,
  {
    filepath: z.string().describe(appendContentHandler.getToolDescription().inputSchema.properties.filepath.description),
    content: z.string().describe(appendContentHandler.getToolDescription().inputSchema.properties.content.description)
  },
  async ({ filepath, content }) => {
    const result = await obsidianClient.runTool(tools.TOOL_APPEND_CONTENT, { filepath, content });
    const textContent = result[0];
    if (textContent.type === 'text') {
      return {
        content: [{ type: 'text', text: textContent.text }]
      };
    }
    throw new Error('Unexpected result type from tool');
  }
);

server.tool(
  tools.TOOL_PATCH_CONTENT,
  patchContentHandler.getToolDescription().description,
  {
    filepath: z.string().describe(patchContentHandler.getToolDescription().inputSchema.properties.filepath.description),
    operation: z.enum(['append', 'prepend', 'replace']).describe(patchContentHandler.getToolDescription().inputSchema.properties.operation.description),
    target_type: z.enum(['heading', 'block', 'frontmatter']).describe(patchContentHandler.getToolDescription().inputSchema.properties.target_type.description),
    target: z.string().describe(patchContentHandler.getToolDescription().inputSchema.properties.target.description),
    content: z.string().describe(patchContentHandler.getToolDescription().inputSchema.properties.content.description)
  },
  async ({ filepath, operation, target_type, target, content }) => {
    const result = await obsidianClient.runTool(tools.TOOL_PATCH_CONTENT, { 
      filepath, 
      operation, 
      target_type, 
      target, 
      content 
    });
    const textContent = result[0];
    if (textContent.type === 'text') {
      return {
        content: [{ type: 'text', text: textContent.text }]
      };
    }
    throw new Error('Unexpected result type from tool');
  }
);

// Register prompts
server.prompt(
  'note_summarization',
  {
    note_content: z.string().describe('The content of the note to summarize')
  },
  ({ note_content }) => {
    const promptText = NOTE_SUMMARIZATION_PROMPT.promptText.replace(
      '{{note_content}}',
      note_content
    );
    
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: promptText
          }
        }
      ]
    };
  }
);

export async function startServer() {
  try {
    // Start receiving messages on stdin and sending messages on stdout
    const transport = new StdioServerTransport();
    console.error('Starting Obsidian MCP server...');
    await server.connect(transport);
    console.error('Obsidian MCP server connected and ready.');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

export default server; 