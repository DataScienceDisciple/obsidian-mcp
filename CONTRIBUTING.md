# Contributing to Obsidian MCP

Thank you for considering contributing to Obsidian MCP! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to see if the problem has already been reported. When you are creating a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the issue
- Describe the behavior you observed and what you expected to see
- Include screenshots if applicable
- Include error messages or logs
- Include your environment information (OS, Node.js version, etc.)

### Suggesting Enhancements

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Explain why this enhancement would be useful to most users
- Include screenshots or mockups if applicable

### Pull Requests

- Fill in the required template
- Follow the TypeScript code style
- Include tests when adding new features
- Update documentation when changing functionality
- Keep your PR focused on a single concern
- Reference issues or discussions that your PR addresses

## Development Process

### Setting Up the Development Environment

1. Fork the repository
2. Clone your fork
   ```
   git clone https://github.com/your-username/obsidian-mcp.git
   cd obsidian-mcp
   ```
3. Install dependencies
   ```
   npm install
   ```
4. Create a `.env` file and add your Obsidian API key
   ```
   cp .env.example .env
   # Edit the .env file with your API key
   ```
5. Start the development server
   ```
   npm run dev
   ```

### Coding Style

- Use TypeScript
- Follow the existing code style
- Use meaningful variable and function names
- Write comments for complex logic
- Add JSDoc comments for functions and classes

### Testing

- Write tests for new features
- Run tests before submitting PR
  ```
  npm test
  ```

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## Releasing

The project maintainers will handle releases following semantic versioning:

- MAJOR version for incompatible API changes
- MINOR version for added functionality in a backward compatible manner
- PATCH version for backward compatible bug fixes

## Thank You!

Your contributions help make Obsidian MCP better for everyone. We appreciate your time and effort!
