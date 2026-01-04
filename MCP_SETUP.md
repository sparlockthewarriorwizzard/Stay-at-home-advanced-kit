# 🔌 MCP Setup Guide

This project is optimized for the **Model Context Protocol (MCP)**. Configuring these servers gives your AI Assistant "superpowers"—the ability to see your database schema, read remote docs, and check GitHub issues directly.

## Essential MCP Servers

### 1. Supabase MCP (`supabase-mcp-server`)
**Why?** Allows the AI to inspect your database schema (`list_tables`), run safe SQL SELECTs, and generate TypeScript types.
- **Config**: You will need your Reference ID (from Supabase URL) and a Service Key (from Project Settings > API).

### 2. Context7 (`context7`)
**Why?** The *only* source of truth for library documentation. Prevents the AI from hallucinating APIs for `react-native-purchases` or `supabase-js`.
- **Config**: No API key required for public mode, or add your key for higher limits.

### 3. GitHub MCP (`github-mcp-server`)
**Why?** Allows the AI to search for code examples and read issues from other repos to solve problems.

## Configuration Examples

### Cursor / Windsurf (`.cursor/mcp.json` or Global Config)
Add these to your MCP configuration file:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server"
      ],
      "env": {
        "SUPABASE_URL": "https://your-project-ref.supabase.co",
        "SUPABASE_SERVICE_KEY": "your-service-role-key"
      }
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-pat"
      }
    },
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "context7-mcp"
      ]
    }
  }
}
```

> [!TIP]
> Once configured, you can say to your AI: *"Check the 'users' table in Supabase and tell me if I missed any columns"* and it will actually look at the live database!
