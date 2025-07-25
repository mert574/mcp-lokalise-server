#!/usr/bin/env node

// Simple test script for the MCP Lokalise server
// This demonstrates how the tools would be used

console.log('🧪 Testing MCP Lokalise Server\n');

const testCreateKey = {
  name: 'create_lokalise_key',
  arguments: {
    key_name: 'test_mcp_key_delete_me',
    translations: {
      en: 'Test MCP Key',
      de: 'Test MCP Schlüssel'
    }
    // platforms are configured in the server, not passed as arguments
  }
};

const testGetKey = {
  name: 'get_lokalise_key',
  arguments: {
    key_id: '111110000'
  }
};

console.log('Test case 1 - Create Key:');
console.log(JSON.stringify(testCreateKey, null, 2));

console.log('\nTest case 2 - Get Key:');
console.log(JSON.stringify(testGetKey, null, 2));

console.log('\nTo run the actual server:');
console.log('npm start');

console.log('\n✅ Test configuration ready!');
