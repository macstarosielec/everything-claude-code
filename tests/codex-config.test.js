/**
 * Tests for `.codex/config.toml` reference defaults.
 *
 * Run with: node tests/codex-config.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

const repoRoot = path.join(__dirname, '..');
const configPath = path.join(repoRoot, '.codex', 'config.toml');
const config = fs.readFileSync(configPath, 'utf8');
const codexAgentsDir = path.join(repoRoot, '.codex', 'agents');

function getTomlSection(source, sectionName) {
  const escapedSectionName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sectionPattern = new RegExp(
    `^\\[${escapedSectionName}\\]\\n([\\s\\S]*?)(?=^\\[|\\Z)`,
    'm',
  );
  const match = source.match(sectionPattern);
  return match ? match[1] : '';
}

let passed = 0;
let failed = 0;

if (
  test('reference config does not pin a top-level model', () => {
    assert.ok(!/^model\s*=/m.test(config), 'Expected `.codex/config.toml` to inherit the CLI default model');
  })
)
  passed++;
else failed++;

if (
  test('reference config does not pin a top-level model provider', () => {
    assert.ok(
      !/^model_provider\s*=/m.test(config),
      'Expected `.codex/config.toml` to inherit the CLI default provider',
    );
  })
)
  passed++;
else failed++;

if (
  test('sample Codex role configs do not use o4-mini', () => {
    const roleFiles = fs.readdirSync(codexAgentsDir).filter(file => file.endsWith('.toml'));
    assert.ok(roleFiles.length > 0, 'Expected sample role config files under `.codex/agents`');

    for (const roleFile of roleFiles) {
      const rolePath = path.join(codexAgentsDir, roleFile);
      const roleConfig = fs.readFileSync(rolePath, 'utf8');
      assert.ok(
        !/^model\s*=\s*"o4-mini"$/m.test(roleConfig),
        `Expected sample role config to avoid o4-mini: ${roleFile}`,
      );
    }
  })
)
  passed++;
else failed++;

if (
  test('bundled command-based MCP servers raise startup timeout above the CLI default', () => {
    const expectedServers = [
      'mcp_servers.github',
      'mcp_servers.context7',
      'mcp_servers.memory',
      'mcp_servers.playwright',
      'mcp_servers.sequential-thinking',
    ];

    for (const serverName of expectedServers) {
      const section = getTomlSection(config, serverName);
      assert.ok(section, `Expected config section [${serverName}]`);
      assert.ok(
        /startup_timeout_sec\s*=\s*30(?:\.0)?/m.test(section),
        `Expected [${serverName}] to set startup_timeout_sec = 30.0`,
      );
    }
  })
)
  passed++;
else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
