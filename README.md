# MCP Lokalise Server

A Model Context Protocol (MCP) server for managing Lokalise translations.

## Features

- ✅ Create translation keys with multiple language translations
- ✅ Delete translation keys 
- ✅ Get specific translation key details by ID

## Installation

```bash
cd mcp-lokalise-server
npm install
```

## Usage

The server can be used with any MCP-compatible client. It provides three main tools:

### 1. create_lokalise_key

Create a new translation key with translations:

```json
{
  "key_name": "my_new_key",
  "translations": {
    "en": "Hello World",
    "de": "Hallo Welt"
  }
}
```

### 2. delete_lokalise_key

Delete a translation key by ID:

```json
{ "key_id": "123456789" }
```

### 3. get_lokalise_key

Get details for a specific translation key:

```json
{ "key_id": "123456789" }
```

## Configuration

The server uses environment variables for configuration:

### Environment Variables

- `LOKALISE_PROJECT_ID` - Your Lokalise project ID
- `LOKALISE_API_TOKEN` - Your Lokalise API token
- `LOKALISE_PLATFORMS` - Comma-separated platforms (default: `web`)

Create your API token here: https://app.lokalise.com/profile#apitokens

## Running the Server

```bash
LOKALISE_PROJECT_ID=x LOKALISE_API_TOKEN=y npm start
```

## MCP Client Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "lokalise": {
      "command": "node",
      "args": ["/path/to/mcp-lokalise-server/index.js"]
    }
  }
}
```
