#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './config.js';

const LOKALISE_API_BASE_URL = 'https://api.lokalise.com/api2/projects';

class LokaliseServer {
  constructor() {
    this.server = new Server(
      {
        name: 'lokalise-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_lokalise_key',
            description: 'Create a new translation key in Lokalise with translations',
            inputSchema: {
              type: 'object',
              properties: {
                key_name: {
                  type: 'string',
                  description: 'The name/identifier for the translation key',
                },
                translations: {
                  type: 'object',
                  description: 'Translation values by language code (e.g., {"en": "Hello", "de": "Hallo"})',
                  additionalProperties: {
                    type: 'string'
                  }
                },
              },
              required: ['key_name', 'translations'],
            },
          },
          {
            name: 'delete_lokalise_key',
            description: 'Delete a translation key from Lokalise',
            inputSchema: {
              type: 'object',
              properties: {
                key_id: {
                  type: 'string',
                  description: 'The ID of the key to delete',
                },
              },
              required: ['key_id'],
            },
          },
          {
            name: 'get_lokalise_key',
            description: 'Get a specific translation key from Lokalise by name',
            inputSchema: {
              type: 'object',
              properties: {
                key_name: {
                  type: 'string',
                  description: 'The name of the key to retrieve',
                },
              },
              required: ['key_name'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_lokalise_key':
            return await this.createLokaliseKey(args);
          case 'delete_lokalise_key':
            return await this.deleteLokaliseKey(args);
          case 'get_lokalise_key':
            return await this.getLokaliseKey({ key_name: args.key_name });
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  getConfig() {
    // Load configuration from config module
    return loadConfig();
  }

  async lokaliseApiCall(endpoint, method = 'GET', body = null) {
    const config = this.getConfig();
    const projectId = config.project_id;
    const apiToken = config.api_token;

    const url = `${LOKALISE_API_BASE_URL}/${projectId}${endpoint}`;
    const headers = {
      'X-Api-Token': apiToken,
    };

    const options = {
      method,
      headers,
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Lokalise API error: ${data.error?.message || 'Unknown error'}`);
    }

    return data;
  }

  async createLokaliseKey(args) {
    const platforms = this.getConfig().platforms;

    // Convert translations object to API format
    const translations = Object.entries(args.translations).map(([language_iso, translation]) => ({
      language_iso,
      translation,
    }));

    const payload = {
      keys: [
        {
          key_name: args.key_name,
          platforms,
          translations,
        },
      ],
    };

    const data = await this.lokaliseApiCall('/keys', 'POST', payload);

    const createdKey = data.keys[0];
    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully created key "${args.key_name}"\n\n` +
            `Key ID: ${createdKey.key_id}\n` +
            `Platforms: ${createdKey.platforms.join(', ')}\n` +
            `Translations: ${createdKey.translations.length}\n` +
            `Created: ${createdKey.created_at}\n\n` +
            `Translations:\n${createdKey.translations
              .filter(t => t.translation) // Only show non-empty translations
              .map(t => `  ${t.language_iso}: "${t.translation}"`)
              .join('\n')}`,
        },
      ],
    };
  }

  async deleteLokaliseKey(args) {
    await this.lokaliseApiCall(`/keys/${args.key_id}`, 'DELETE');

    return {
      content: [
        {
          type: 'text',
          text: `✅ Successfully deleted key with ID: ${args.key_id}`,
        },
      ],
    };
  }

  async getLokaliseKey(args) {
    const keyName = args.key_name;

    const listData = await this.lokaliseApiCall(`/keys?filter_keys=${encodeURIComponent(keyName)}`);

    if (!listData.keys || listData.keys.length === 0) {
      throw new Error(`No key found with name: ${keyName}`);
    }
    // Use the first matching key
    const keyId = listData.keys[0].key_id;

    // Fetch the key details by key_id
    const data = await this.lokaliseApiCall(`/keys/${keyId}`);

    const key = data.key;
    const translations = key.translations
      .map(t => `  ${t.language_iso}: "${t.translation}"`)
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `🔍 Key Details: ${key.key_name.web || key.key_name.other}\n\n` +
            `Key ID: ${key.key_id}\n` +
            `Platforms: ${key.platforms.join(', ')}\n` +
            `Created: ${key.created_at}\n` +
            `Modified: ${key.modified_at}\n` +
            `Base Words: ${key.base_words}\n` +
            `Is Plural: ${key.is_plural}\n` +
            `Is Hidden: ${key.is_hidden}\n` +
            `Is Archived: ${key.is_archived}\n\n` +
            `Translations:\n${translations}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Lokalise MCP server running on stdio');
  }
}

const server = new LokaliseServer();
server.run().catch(console.error);
