# MCP Lokalise Server

A Model Context Protocol (MCP) server for managing Lokalise translations.

## Features

- ✅ Create translation keys with multiple language translations
- ✅ Get specific translation key details by name
- ✅ Delete translation keys 

## Installation

```bash
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

### 2. get_lokalise_key

Get details for a specific translation key by name:

```json
{ "key_name": "my_key" }
```

### 3. delete_lokalise_key

Delete a translation key by ID:

```json
{ "key_id": "123456789" }
```

## Configuration

Create your API token here: https://app.lokalise.com/profile#apitokens

The server uses environment variables for configuration:

### Environment Variables

- `LOKALISE_PROJECT_ID` - Your Lokalise project ID
- `LOKALISE_API_TOKEN` - Your Lokalise API token
- `LOKALISE_PLATFORMS` - Comma-separated platforms (default: `web`)

## MCP Client Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "lokalise": {
      "command": "node",
      "args": ["/path/to/mcp-lokalise-server/index.js"],
      "env": {
        "LOKALISE_PROJECT_ID": "your-project-id",
        "LOKALISE_API_TOKEN": "your-api-token",
        "LOKALISE_PLATFORMS": "web"
      }
    }
  }
}
```
