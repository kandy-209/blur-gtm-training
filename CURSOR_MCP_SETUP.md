# Cursor MCP Configuration for Alpha Vantage

## ✅ Configuration Complete

Your Cursor MCP configuration has been set up at `~/.cursor/mcp.json` with your Alpha Vantage API key.

## Configuration Details

**File Location:** `~/.cursor/mcp.json`

**Configuration:**
```json
{
  "mcpServers": {
    "alphavantage": {
      "url": "https://mcp.alphavantage.co/mcp?apikey=D05K80BVIL89XP20"
    }
  }
}
```

## What This Enables

With MCP configured, Cursor can:
- Access Alpha Vantage financial data directly
- Query company financials through the MCP interface
- Integrate financial data into your development workflow

## Alternative: Local Server Connection

If you prefer a local connection instead of remote, you can use:

1. **Install uv** (Python package manager):
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Update `~/.cursor/mcp.json`**:
   ```json
   {
     "mcpServers": {
       "alphavantage": {
         "command": "uvx",
         "args": ["av-mcp", "D05K80BVIL89XP20"]
       }
     }
   }
   ```

## Restart Cursor

After configuring, restart Cursor for the MCP connection to take effect.

## Testing

Once Cursor restarts, you should be able to:
- Query Alpha Vantage data through Cursor's MCP interface
- Access financial data directly in your development environment

## Your API Key

**Alpha Vantage API Key:** `D05K80BVIL89XP20`
- Free tier: 5 requests/minute, 500 requests/day
- Used for both MCP and direct API calls in the application



