import { Tool, ToolOutput, TextContent } from './types';
import { Obsidian } from './obsidian';

export const TOOL_LIST_FILES_IN_VAULT = 'obsidian_list_files_in_vault';
export const TOOL_LIST_FILES_IN_DIR = 'obsidian_list_files_in_dir';
export const TOOL_GET_FILE_CONTENTS = 'obsidian_get_file_contents';
export const TOOL_SEARCH = 'obsidian_simple_search';
export const TOOL_APPEND_CONTENT = 'obsidian_append_content';
export const TOOL_PATCH_CONTENT = 'obsidian_patch_content';
export const TOOL_COMPLEX_SEARCH = 'obsidian_complex_search';
export const TOOL_BATCH_GET_FILE_CONTENTS = 'obsidian_batch_get_file_contents';

export interface ToolHandler {
  name: string;
  getToolDescription(): Tool;
  runTool(args: Record<string, any>): Promise<ToolOutput[]>;
}

export class ListFilesInVaultToolHandler implements ToolHandler {
  name: string;
  private obsidian: Obsidian;

  constructor(obsidian: Obsidian) {
    this.name = TOOL_LIST_FILES_IN_VAULT;
    this.obsidian = obsidian;
  }

  getToolDescription(): Tool {
    return {
      name: this.name,
      description: "Lists all files and directories in the root directory of your Obsidian vault. Use this to discover the top-level structure of your vault.",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    };
  }

  async runTool(args: Record<string, any>): Promise<ToolOutput[]> {
    const files = await this.obsidian.listFilesInVault();

    return [
      {
        type: "text",
        text: JSON.stringify(files, null, 2)
      }
    ];
  }
}

export class ListFilesInDirToolHandler implements ToolHandler {
  name: string;
  private obsidian: Obsidian;

  constructor(obsidian: Obsidian) {
    this.name = TOOL_LIST_FILES_IN_DIR;
    this.obsidian = obsidian;
  }

  getToolDescription(): Tool {
    return {
      name: this.name,
      description: "Lists all files and directories within a specific folder in your Obsidian vault. Use this to browse the contents of a particular directory.",
      inputSchema: {
        type: "object",
        properties: {
          dirpath: {
            type: "string",
            description: "Path to the directory to list (relative to your vault root, e.g., 'Daily Notes' or 'Projects'). Note that empty directories will not be returned."
          },
        },
        required: ["dirpath"]
      }
    };
  }

  async runTool(args: Record<string, any>): Promise<ToolOutput[]> {
    if (!args.dirpath) {
      throw new Error("dirpath argument missing in arguments");
    }

    const files = await this.obsidian.listFilesInDir(args.dirpath);

    return [
      {
        type: "text",
        text: JSON.stringify(files, null, 2)
      }
    ];
  }
}

export class GetFileContentsToolHandler implements ToolHandler {
  name: string;
  private obsidian: Obsidian;

  constructor(obsidian: Obsidian) {
    this.name = TOOL_GET_FILE_CONTENTS;
    this.obsidian = obsidian;
  }

  getToolDescription(): Tool {
    return {
      name: this.name,
      description: "Retrieve the complete content of a single file from your vault. Use this when you need to read an entire note.",
      inputSchema: {
        type: "object",
        properties: {
          filepath: {
            type: "string",
            description: "Path to the file to read (relative to your vault root, e.g., 'Daily Notes/2023-01-01.md')",
            format: "path"
          },
        },
        required: ["filepath"]
      }
    };
  }

  async runTool(args: Record<string, any>): Promise<ToolOutput[]> {
    if (!args.filepath) {
      throw new Error("filepath argument missing in arguments");
    }

    const content = await this.obsidian.getFileContents(args.filepath);

    return [
      {
        type: "text",
        text: content
      }
    ];
  }
}

export class SearchToolHandler implements ToolHandler {
  name: string;
  private obsidian: Obsidian;

  constructor(obsidian: Obsidian) {
    this.name = TOOL_SEARCH;
    this.obsidian = obsidian;
  }

  getToolDescription(): Tool {
    return {
      name: this.name,
      description: `Simple text search across all files in the vault. Returns matches with surrounding context.
            Use this tool when you need to find specific text or phrases in your notes. Results include filenames with matches and context around each match.`,
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Text to search for in the vault. Can be a simple word, phrase, or pattern."
          },
          context_length: {
            type: "integer",
            description: "How many characters of context to return around each matching string (default: 100)",
            default: 100
          }
        },
        required: ["query"]
      }
    };
  }

  async runTool(args: Record<string, any>): Promise<ToolOutput[]> {
    if (!args.query) {
      throw new Error("query argument missing in arguments");
    }

    const contextLength = args.context_length || 100;
    const results = await this.obsidian.search(args.query, contextLength);

    const formattedResults = results.map((result: any) => {
      const formattedMatches = (result.matches || []).map((match: any) => {
        const context = match.context || '';
        const matchPos = match.match || {};
        const start = matchPos.start || 0;
        const end = matchPos.end || 0;

        return {
          context,
          match_position: { start, end }
        };
      });

      return {
        filename: result.filename || '',
        score: result.score || 0,
        matches: formattedMatches
      };
    });

    return [
      {
        type: "text",
        text: JSON.stringify(formattedResults, null, 2)
      }
    ];
  }
}

export class AppendContentToolHandler implements ToolHandler {
  name: string;
  private obsidian: Obsidian;

  constructor(obsidian: Obsidian) {
    this.name = TOOL_APPEND_CONTENT;
    this.obsidian = obsidian;
  }

  getToolDescription(): Tool {
    return {
      name: this.name,
      description: "Append content to the end of a new or existing file in the vault. This adds content to the very end of the file. If you need to add content under a specific heading, use the obsidian_patch_content tool instead.",
      inputSchema: {
        type: "object",
        properties: {
          filepath: {
            type: "string",
            description: "Path to the file (relative to vault root)",
            format: "path"
          },
          content: {
            type: "string",
            description: "Content to append to the end of the file"
          }
        },
        required: ["filepath", "content"]
      }
    };
  }

  async runTool(args: Record<string, any>): Promise<ToolOutput[]> {
    if (!args.filepath || !args.content) {
      throw new Error("filepath and content arguments required");
    }

    await this.obsidian.appendContent(args.filepath, args.content);

    return [
      {
        type: "text",
        text: `Successfully appended content to ${args.filepath}`
      }
    ];
  }
}

export class PatchContentToolHandler implements ToolHandler {
  name: string;
  private obsidian: Obsidian;

  constructor(obsidian: Obsidian) {
    this.name = TOOL_PATCH_CONTENT;
    this.obsidian = obsidian;
  }

  getToolDescription(): Tool {
    return {
      name: this.name,
      description: `Insert or modify content at a specific location in an existing note. Use this tool when you need to add or modify content under a specific heading, at a block reference, or in frontmatter fields.

PARAMETERS:
- filepath: The relative path to the file within the vault (e.g., "📔 Periodic Notes/📔 Daily/2025-03-20.md")
- operation: Choose "append" (add after target), "prepend" (add before target), or "replace" (replace target)
- target_type: Choose "heading", "block", or "frontmatter"
- target: Specify what to target (see detailed instructions below)
- content: The content you want to add or replace

HEADING TARGETS - IMPORTANT RULES:
1. For heading targets, use the FULL PATH from the top-level heading (H1) to your target heading
2. Separate heading levels with "::" (e.g., "2025-03-20::Notes" or "Project Ideas::Development::Web Apps")
3. Use the EXACT heading text without any hash symbols (#)
4. Example of a typical hierarchy:
   # Main Title (H1)
     ## Section (H2)
       ### Subsection (H3)
   To target the Subsection, use: "Main Title::Section::Subsection"
5. Common errors:
   - Skipping a heading level (like going H1→H3 without including H2)
   - Using only the immediate parent heading without the full path
   - Using incorrect heading text (case, spacing, or special characters matter)

BLOCK REFERENCE TARGETS:
- Use the block ID without the "^" symbol (e.g., use "2d9b4a" not "^2d9b4a")

FRONTMATTER TARGETS:
- Use the exact field name in the YAML frontmatter (e.g., "tags" or "status")

COMMON ERRORS:
- "invalid-target": Double-check that your heading path is complete, starting from H1
- "content-already-preexists-in-target": The exact content already exists at the target
- If you get errors, try getting the file contents first to verify the exact heading text and structure

EXAMPLES:

Example 1: Add content under a Notes heading in a daily note
obsidian_patch_content(
filepath: "📔 Periodic Notes/📔 Daily/2025-03-20.md",
operation: "append",
target_type: "heading",
target: "2025-03-20::Notes",
content: "Hello from Claude\n\n"
)

Example 2: Add content under a nested heading
obsidian_patch_content(
filepath: "Projects/Development.md",
operation: "prepend",
target_type: "heading",
target: "Development::Web Projects::Current",
content: "- New project idea\n"
)

Example 3: Update a frontmatter field
obsidian_patch_content(
filepath: "Projects/ProjectX.md",
operation: "replace",
target_type: "frontmatter",
target: "status",
content: "In Progress"
)`,
      inputSchema: {
        type: "object",
        properties: {
          filepath: {
            type: "string",
            description: "Path to the file (relative to vault root)",
            format: "path"
          },
          operation: {
            type: "string",
            description: "Operation to perform: 'append' (add after target), 'prepend' (add before target), or 'replace' (replace target)",
            enum: ["append", "prepend", "replace"]
          },
          target_type: {
            type: "string",
            description: "Type of target: 'heading' (a section heading like '## Title'), 'block' (a block reference), or 'frontmatter' (YAML frontmatter field)",
            enum: ["heading", "block", "frontmatter"]
          },
          target: {
            type: "string",
            description: "Target identifier: for headings, use the EXACT full heading text INCLUDING the '#' symbols (e.g., '## Notes 📝' not just 'Notes 📝'); for blocks, use the block ID; for frontmatter, use the field name (e.g., 'tags')"
          },
          content: {
            type: "string",
            description: "Content to insert or replace at the target location"
          }
        },
        required: ["filepath", "operation", "target_type", "target", "content"]
      }
    };
  }

  async runTool(args: Record<string, any>): Promise<ToolOutput[]> {
    const required = ["filepath", "operation", "target_type", "target", "content"];
    if (!required.every(key => key in args)) {
      throw new Error(`Missing required arguments: ${required.filter(key => !(key in args)).join(', ')}`);
    }

    await this.obsidian.patchContent(
      args.filepath,
      args.operation as any,
      args.target_type as any,
      args.target,
      args.content
    );

    return [
      {
        type: "text",
        text: `Successfully patched content in ${args.filepath}`
      }
    ];
  }
}

export class ComplexSearchToolHandler implements ToolHandler {
  name: string;
  private obsidian: Obsidian;

  constructor(obsidian: Obsidian) {
    this.name = TOOL_COMPLEX_SEARCH;
    this.obsidian = obsidian;
  }

  getToolDescription(): Tool {
    return {
      name: this.name,
      description: `Advanced search using JsonLogic query expressions.
           Use this for complex search criteria like finding files with specific tags, paths, or content patterns.
           
           Example queries:
           1. Find all markdown files: {"glob": ["*.md", {"var": "path"}]}
           2. Find files with specific tag: {"in": ["#project", {"var": "tags"}]}
           3. Find files in a folder: {"startsWith": [{"var": "path"}, "Projects/"]}
           
           Only use this if the simple search tool isn't sufficient for your needs.`,
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "object",
            description: "JsonLogic query object defining search criteria."
          }
        },
        required: ["query"]
      }
    };
  }

  async runTool(args: Record<string, any>): Promise<ToolOutput[]> {
    if (!args.query) {
      throw new Error("query argument missing in arguments");
    }

    const results = await this.obsidian.searchJson(args.query);

    return [
      {
        type: "text",
        text: JSON.stringify(results, null, 2)
      }
    ];
  }
}

export class BatchGetFileContentsToolHandler implements ToolHandler {
  name: string;
  private obsidian: Obsidian;

  constructor(obsidian: Obsidian) {
    this.name = TOOL_BATCH_GET_FILE_CONTENTS;
    this.obsidian = obsidian;
  }

  getToolDescription(): Tool {
    return {
      name: this.name,
      description: "Retrieve the contents of multiple files in one operation. This is more efficient than making separate calls when you need content from multiple files. Each file's content is returned with a header indicating the filename and separated by dividers.",
      inputSchema: {
        type: "object",
        properties: {
          filepaths: {
            type: "array",
            items: {
              type: "string",
              description: "Path to a file (relative to your vault root)",
              format: "path"
            },
            description: "List of file paths to read (e.g., ['Daily Notes/2023-01-01.md', 'Projects/Project X.md'])"
          },
        },
        required: ["filepaths"]
      }
    };
  }

  async runTool(args: Record<string, any>): Promise<ToolOutput[]> {
    if (!args.filepaths || !Array.isArray(args.filepaths)) {
      throw new Error("filepaths argument missing or not an array");
    }

    const content = await this.obsidian.getBatchFileContents(args.filepaths);

    return [
      {
        type: "text",
        text: content
      }
    ];
  }
} 