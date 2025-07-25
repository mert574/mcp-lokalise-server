// Default configuration for the MCP Lokalise server
export const defaultConfig = {
  platforms: ['web'],
};

// Load configuration from environment or use defaults
export function loadConfig() {
  if (!process.env.LOKALISE_PROJECT_ID || !process.env.LOKALISE_API_TOKEN) {
    throw new Error('LOKALISE_PROJECT_ID and LOKALISE_API_TOKEN must be set');
  }

  return {
    project_id: process.env.LOKALISE_PROJECT_ID,
    api_token: process.env.LOKALISE_API_TOKEN,
    platforms: (process.env.LOKALISE_PLATFORMS && process.env.LOKALISE_PLATFORMS.split(',')) || defaultConfig.platforms,
  };
}
