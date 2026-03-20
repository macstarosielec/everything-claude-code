---
name: skill-health
description: Show skill portfolio health dashboard with charts and analytics
command: true
---

# Skill Health Dashboard

Shows a comprehensive health dashboard for all skills in the portfolio with success rate sparklines, failure pattern clustering, pending amendments, and version history.

## Implementation

Run the skill health CLI in dashboard mode:

```bash
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "console.log((()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),q=p.join('scripts','lib','utils.js'),m=p.join('.claude-plugin','plugin.json'),a=t=>{try{return f.existsSync(p.join(t,q))}catch(x){return false}},r=t=>{try{return f.existsSync(p.join(t,m))}catch(x){return false}},w=process.cwd();for(var c=p.resolve(w);;){if(r(c)&&a(c))return c;var n=p.join(c,'node_modules');if(r(n)&&a(n))return n;try{for(var o of f.readdirSync(n,{withFileTypes:true}))if(o.isDirectory()){var y=p.join(n,o.name);if(r(y)&&a(y))return y}}catch(x){}var u=p.dirname(c);if(u===c)break;c=u}var d=p.join(h,'.claude');if(a(d))return d;try{var b=p.join(d,'plugins','cache','everything-claude-code');for(var g of f.readdirSync(b,{withFileTypes:true}))if(g.isDirectory())for(var v of f.readdirSync(p.join(b,g.name),{withFileTypes:true}))if(v.isDirectory()){var z=p.join(b,g.name,v.name);if(a(z))return z}}catch(x){}return d})())")}"
node "$ECC_ROOT/scripts/skills-health.js" --dashboard
```

For a specific panel only:

```bash
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "console.log((()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),q=p.join('scripts','lib','utils.js'),m=p.join('.claude-plugin','plugin.json'),a=t=>{try{return f.existsSync(p.join(t,q))}catch(x){return false}},r=t=>{try{return f.existsSync(p.join(t,m))}catch(x){return false}},w=process.cwd();for(var c=p.resolve(w);;){if(r(c)&&a(c))return c;var n=p.join(c,'node_modules');if(r(n)&&a(n))return n;try{for(var o of f.readdirSync(n,{withFileTypes:true}))if(o.isDirectory()){var y=p.join(n,o.name);if(r(y)&&a(y))return y}}catch(x){}var u=p.dirname(c);if(u===c)break;c=u}var d=p.join(h,'.claude');if(a(d))return d;try{var b=p.join(d,'plugins','cache','everything-claude-code');for(var g of f.readdirSync(b,{withFileTypes:true}))if(g.isDirectory())for(var v of f.readdirSync(p.join(b,g.name),{withFileTypes:true}))if(v.isDirectory()){var z=p.join(b,g.name,v.name);if(a(z))return z}}catch(x){}return d})())")}"
node "$ECC_ROOT/scripts/skills-health.js" --dashboard --panel failures
```

For machine-readable output:

```bash
ECC_ROOT="${CLAUDE_PLUGIN_ROOT:-$(node -e "console.log((()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),q=p.join('scripts','lib','utils.js'),m=p.join('.claude-plugin','plugin.json'),a=t=>{try{return f.existsSync(p.join(t,q))}catch(x){return false}},r=t=>{try{return f.existsSync(p.join(t,m))}catch(x){return false}},w=process.cwd();for(var c=p.resolve(w);;){if(r(c)&&a(c))return c;var n=p.join(c,'node_modules');if(r(n)&&a(n))return n;try{for(var o of f.readdirSync(n,{withFileTypes:true}))if(o.isDirectory()){var y=p.join(n,o.name);if(r(y)&&a(y))return y}}catch(x){}var u=p.dirname(c);if(u===c)break;c=u}var d=p.join(h,'.claude');if(a(d))return d;try{var b=p.join(d,'plugins','cache','everything-claude-code');for(var g of f.readdirSync(b,{withFileTypes:true}))if(g.isDirectory())for(var v of f.readdirSync(p.join(b,g.name),{withFileTypes:true}))if(v.isDirectory()){var z=p.join(b,g.name,v.name);if(a(z))return z}}catch(x){}return d})())")}"
node "$ECC_ROOT/scripts/skills-health.js" --dashboard --json
```

## Usage

```
/skill-health                    # Full dashboard view
/skill-health --panel failures   # Only failure clustering panel
/skill-health --json             # Machine-readable JSON output
```

## What to Do

1. Run the skills-health.js script with --dashboard flag
2. Display the output to the user
3. If any skills are declining, highlight them and suggest running /evolve
4. If there are pending amendments, suggest reviewing them

## Panels

- **Success Rate (30d)** — Sparkline charts showing daily success rates per skill
- **Failure Patterns** — Clustered failure reasons with horizontal bar chart
- **Pending Amendments** — Amendment proposals awaiting review
- **Version History** — Timeline of version snapshots per skill
