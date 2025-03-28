#!/usr/bin/env node

import { startServer } from './mcp-server';

async function main() {
  console.error('----------------------------------------');
  console.error('Starting Obsidian MCP server...');
  console.error('This server is designed to work with Claude Desktop');
  console.error('Check README.md for configuration instructions');
  console.error('----------------------------------------');
  
  try {
    await startServer();
  } catch (error) {
    console.error('Error starting MCP server:', error);
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGINT', () => {
  console.error('Received SIGINT - shutting down Obsidian MCP server');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM - shutting down Obsidian MCP server');
  process.exit(0);
});

main(); 