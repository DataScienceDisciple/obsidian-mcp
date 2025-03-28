# Obsidian MCP - TypeScript Implementation

This project provides a TypeScript implementation of the Obsidian Model Context Protocol (MCP) server. It allows AI models to interact with an Obsidian vault using the Obsidian Local REST API.

## Features

### Search Tools

- **Simple Search** - Search for documents matching a specified text query across all files in the vault
- **Complex Search** - Search using JsonLogic queries for more advanced filtering
- **List Files in Vault** - Lists all files and directories in the root directory
- **List Files in Directory** - Lists all files and directories in a specific path

### Read Tools

- **Get Content** - Get content from a single file
- **Get Batch Contents** - Get contents from multiple files at once

### Write Tools

- **Append Content** - Append content to a new or existing file
- **Patch Content** - Insert content relative to a heading, block reference, or frontmatter field

### Prompts

- **Note Summarization** - Generate summaries for long notes

## Installation

```bash
# Clone the repository
git clone https://github.com/DataScienceDisciple/obsidian-mcp.git
cd obsidian-mcp

# Install dependencies
npm install


# Build the project
npm run build
```

## Usage as MCP Server

This project implements a Model Context Protocol (MCP) server that can be used with MCP-compatible LLM clients like Claude.

### Starting the Server

```bash
# Start the MCP server (after building)
npm start
```

For development, you can use:

```bash
# Start with TypeScript directly (no build needed)
npm run dev

# Start with auto-reloading on file changes
npm run start:dev
```

The MCP server communicates through standard input/output (stdio), so it's designed to be run by an MCP client.

### Setting up with Claude Desktop

1. Make sure you have Claude for Desktop installed. [Download it here](https://claude.ai/download) if you don't have it yet.

2. Make sure you've built the project with `npm run build` first.

3. Open your Claude for Desktop App configuration:

   **MacOS**:

   ```bash
   code ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

   **Windows**:

   ```powershell
   code $env:AppData\Claude\claude_desktop_config.json
   ```

4. Add the Obsidian MCP server to the `mcpServers` section (create the file if it doesn't exist):

   **MacOS**:

   ```json
   {
     "mcpServers": {
       "obsidian": {
         "command": "node",
         "args": ["/ABSOLUTE/PATH/TO/obsidian-mcp/dist/main.js"],
         "env": {
           "OBSIDIAN_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

   **Windows**:

   ```json
   {
     "mcpServers": {
       "obsidian": {
         "command": "node",
         "args": ["C:\\ABSOLUTE\\PATH\\TO\\obsidian-mcp\\dist\\main.js"],
         "env": {
           "OBSIDIAN_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

   Replace `/ABSOLUTE/PATH/TO/obsidian-mcp` with the actual path to your project directory.

   Replace `your_api_key_here` with your actual Obsidian API key. This is **essential** - without this environment variable, the server won't be able to connect to your Obsidian vault.

5. Save the file and restart Claude for Desktop.

6. When you open Claude for Desktop, you should see a hammer icon in the top right corner, indicating that MCP servers are available.

### Troubleshooting Claude Desktop Integration

If the server isn't showing up in Claude Desktop:

1. Make sure you've built the project with `npm run build`
2. Make sure you've restarted Claude for Desktop completely
3. Check your `claude_desktop_config.json` file syntax
4. Ensure the file paths in `claude_desktop_config.json` are absolute, not relative
5. Verify that you've added the `env` section with your `OBSIDIAN_API_KEY`
6. Look at Claude logs:
   - macOS: `~/Library/Logs/Claude/mcp*.log`
   - Windows: `%APPDATA%\Claude\logs\mcp*.log`

## Prerequisites

- Node.js 16 or later
- Obsidian with the Local REST API plugin installed and configured

## Tool Usage Examples

Here are examples of how to use the various tools:

### Append Content

This tool adds content to the end of a file:

```
Tool: obsidian_append_content
Arguments:
{
  "filepath": "Projects/Project X.md",
  "content": "New content to add at the end of the file"
}
```

### Patch Content

This tool is for adding or modifying content at specific locations in a file:

#### Example 1: Add content under a heading in a daily note

```
Tool: obsidian_patch_content
Arguments:
{
  "filepath": "📔 Periodic Notes/📔 Daily/2025-03-20.md",
  "operation": "append",
  "target_type": "heading",
  "target": "2025-03-20::Notes",
  "content": "Hello from Claude\n\n"
}
```

#### Example 2: Add content under a nested heading

```
Tool: obsidian_patch_content
Arguments:
{
  "filepath": "Projects/Development.md",
  "operation": "prepend",
  "target_type": "heading",
  "target": "Development::Web Projects::Current",
  "content": "- New project idea\n"
}
```

#### Example 3: Update a frontmatter field

```
Tool: obsidian_patch_content
Arguments:
{
  "filepath": "Projects/ProjectX.md",
  "operation": "replace",
  "target_type": "frontmatter",
  "target": "status",
  "content": "In Progress"
}
```

### Search

Simple text search:

```
Tool: obsidian_simple_search
Arguments:
{
  "query": "project deadline",
  "context_length": 150
}
```

### Complex Search

Advanced search using JsonLogic query expressions for complex criteria:

```
Tool: obsidian_complex_search
Arguments:
{
  "query": {
    "and": [
      {"glob": ["*.md", {"var": "path"}]},
      {"in": ["#project", {"var": "tags"}]}
    ]
  }
}
```

### Get File Contents

Get a single file:

```
Tool: obsidian_get_file_contents
Arguments:
{
  "filepath": "Projects/Project X.md"
}
```

Get multiple files:

```
Tool: obsidian_batch_get_file_contents
Arguments:
{
  "filepaths": [
    "Projects/Project X.md",
    "Projects/Project Y.md"
  ]
}
```

### List Files

List all files at the root:

```
Tool: obsidian_list_files_in_vault
Arguments: {}
```

List files in a specific directory:

```
Tool: obsidian_list_files_in_dir
Arguments:
{
  "dirpath": "Projects"
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the [Contributing Guide](CONTRIBUTING.md) for more information.

## Issues and Support

If you encounter any problems or have questions, please [open an issue](https://github.com/yourusername/obsidian-mcp/issues).
