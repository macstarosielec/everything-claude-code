'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Resolve the ECC source root directory.
 *
 * Tries, in order:
 *   1. CLAUDE_PLUGIN_ROOT env var (set by Claude Code for hooks, or by user)
 *   2. Common local/plugin layouts relative to the current working directory
 *      (for example ./.claude-plugin/, ./node_modules/.claude-plugin/,
 *      ./node_modules/<package>/.claude-plugin/)
 *   3. Standard install location (~/.claude/) — when scripts exist there
 *   4. Plugin cache auto-detection — scans ~/.claude/plugins/cache/everything-claude-code/
 *   5. Fallback to ~/.claude/ (original behaviour)
 *
 * @param {object} [options]
 * @param {string} [options.homeDir]  Override home directory (for testing)
 * @param {string} [options.envRoot]  Override CLAUDE_PLUGIN_ROOT (for testing)
 * @param {string} [options.cwd]      Override current working directory (for testing)
 * @param {string} [options.probe]    Relative path used to verify a candidate root
 *                                    contains ECC scripts. Default: 'scripts/lib/utils.js'
 * @returns {string} Resolved ECC root path
 */
function resolveEccRoot(options = {}) {
  const envRoot = options.envRoot !== undefined
    ? options.envRoot
    : (process.env.CLAUDE_PLUGIN_ROOT || '');

  if (envRoot && envRoot.trim()) {
    return envRoot.trim();
  }

  const homeDir = options.homeDir || os.homedir();
  const cwd = options.cwd || process.cwd();
  const claudeDir = path.join(homeDir, '.claude');
  const probe = options.probe || path.join('scripts', 'lib', 'utils.js');

  function hasProbe(candidateRoot) {
    try {
      return fs.existsSync(path.join(candidateRoot, probe));
    } catch {
      return false;
    }
  }

  function hasPluginMarker(candidateRoot) {
    try {
      return fs.existsSync(path.join(candidateRoot, '.claude-plugin', 'plugin.json'));
    } catch {
      return false;
    }
  }

  function findLocalPluginRoot(startDir) {
    if (!startDir || typeof startDir !== 'string') {
      return null;
    }

    let currentDir = path.resolve(startDir);

    while (true) {
      if (hasPluginMarker(currentDir) && hasProbe(currentDir)) {
        return currentDir;
      }

      const nodeModulesDir = path.join(currentDir, 'node_modules');
      if (hasPluginMarker(nodeModulesDir) && hasProbe(nodeModulesDir)) {
        return nodeModulesDir;
      }

      try {
        const packageDirs = fs.readdirSync(nodeModulesDir, { withFileTypes: true });
        for (const entry of packageDirs) {
          if (!entry.isDirectory()) continue;
          const candidateRoot = path.join(nodeModulesDir, entry.name);
          if (hasPluginMarker(candidateRoot) && hasProbe(candidateRoot)) {
            return candidateRoot;
          }
        }
      } catch {
        // node_modules doesn't exist or isn't readable — continue walking up
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        return null;
      }
      currentDir = parentDir;
    }
  }

  const localPluginRoot = findLocalPluginRoot(cwd);
  if (localPluginRoot) {
    return localPluginRoot;
  }

  // Standard install — files are copied directly into ~/.claude/
  if (hasProbe(claudeDir)) {
    return claudeDir;
  }

  // Plugin cache — Claude Code stores marketplace plugins under
  // ~/.claude/plugins/cache/<plugin-name>/<org>/<version>/
  try {
    const cacheBase = path.join(claudeDir, 'plugins', 'cache', 'everything-claude-code');
    const orgDirs = fs.readdirSync(cacheBase, { withFileTypes: true });

    for (const orgEntry of orgDirs) {
      if (!orgEntry.isDirectory()) continue;
      const orgPath = path.join(cacheBase, orgEntry.name);

      let versionDirs;
      try {
        versionDirs = fs.readdirSync(orgPath, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const verEntry of versionDirs) {
        if (!verEntry.isDirectory()) continue;
        const candidate = path.join(orgPath, verEntry.name);
        if (hasProbe(candidate)) {
          return candidate;
        }
      }
    }
  } catch {
    // Plugin cache doesn't exist or isn't readable — continue to fallback
  }

  return claudeDir;
}

/**
 * Compact inline version for embedding in command .md code blocks.
 *
 * This is the minified form of resolveEccRoot() suitable for use in
 * node -e "..." scripts where require() is not available before the
 * root is known.
 *
 * Usage in commands:
 *   const _r = <paste INLINE_RESOLVE>;
 *   const sm = require(_r + '/scripts/lib/session-manager');
 */
const INLINE_RESOLVE = `(()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),q=p.join('scripts','lib','utils.js'),m=p.join('.claude-plugin','plugin.json'),a=t=>{try{return f.existsSync(p.join(t,q))}catch(x){return false}},r=t=>{try{return f.existsSync(p.join(t,m))}catch(x){return false}},w=process.cwd();for(var c=p.resolve(w);;){if(r(c)&&a(c))return c;var n=p.join(c,'node_modules');if(r(n)&&a(n))return n;try{for(var o of f.readdirSync(n,{withFileTypes:true}))if(o.isDirectory()){var y=p.join(n,o.name);if(r(y)&&a(y))return y}}catch(x){}var u=p.dirname(c);if(u===c)break;c=u}var d=p.join(h,'.claude');if(a(d))return d;try{var b=p.join(d,'plugins','cache','everything-claude-code');for(var g of f.readdirSync(b,{withFileTypes:true}))if(g.isDirectory())for(var v of f.readdirSync(p.join(b,g.name),{withFileTypes:true}))if(v.isDirectory()){var z=p.join(b,g.name,v.name);if(a(z))return z}}catch(x){}return d})()`;

module.exports = {
  resolveEccRoot,
  INLINE_RESOLVE,
};
