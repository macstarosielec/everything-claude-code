/**
 * Regression tests for Codex MCP startup timeout defaults in sync-ecc-to-codex.sh.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'sync-ecc-to-codex.sh');
const script = fs.readFileSync(SCRIPT, 'utf8');

console.log('=== Testing sync-ecc-to-codex.sh ===\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    failed++;
  }
}

function getGeneratedSection(sectionName) {
  const sectionHeader = `printf '\\n[${sectionName}]\\n'`;
  const startIndex = script.indexOf(sectionHeader);
  assert.notStrictEqual(startIndex, -1, `Expected generated section [${sectionName}]`);

  const remainder = script.slice(startIndex + sectionHeader.length);
  const nextSectionIndex = remainder.indexOf("printf '\\n[mcp_servers.");
  return nextSectionIndex === -1 ? remainder : remainder.slice(0, nextSectionIndex);
}

test('generated command-based MCP sections use a 30 second startup timeout', () => {
  const generatedSections = [
    'mcp_servers.supabase',
    'mcp_servers.playwright',
    'mcp_servers.context7-mcp',
    'mcp_servers.github',
    'mcp_servers.memory',
    'mcp_servers.sequential-thinking',
  ];

  for (const sectionName of generatedSections) {
    const generatedSection = getGeneratedSection(sectionName);
    assert.ok(
      generatedSection.includes("printf 'startup_timeout_sec = 30.0\\n'"),
      `Expected generated section [${sectionName}] to emit startup_timeout_sec = 30.0`,
    );
  }
});

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
if (failed > 0) process.exit(1);
