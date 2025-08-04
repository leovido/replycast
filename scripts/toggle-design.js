#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
const appPath = path.join(__dirname, "..", "components", "FarcasterApp.tsx");

function getCurrentDesign() {
  // Check environment variable first
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/NEXT_PUBLIC_USE_NEW_DESIGN=(true|false)/);
    if (match) {
      return match[1] === "true" ? "new" : "old";
    }
  }

  // Check code fallback
  const appContent = fs.readFileSync(appPath, "utf8");
  const match = appContent.match(/const USE_NEW_DESIGN = (true|false)/);
  if (match) {
    return match[1] === "true" ? "new" : "old";
  }

  return "old"; // default
}

function setDesign(design) {
  const isNew = design === "new";

  // Update .env.local
  const envContent = `# Feature flag to control which design to use
# Set to 'true' to use the new design with theme toggle
# Set to 'false' or remove to use the old design
NEXT_PUBLIC_USE_NEW_DESIGN=${isNew}
`;

  fs.writeFileSync(envPath, envContent);

  // Update code fallback
  let appContent = fs.readFileSync(appPath, "utf8");
  appContent = appContent.replace(
    /const USE_NEW_DESIGN = (true|false);/,
    `const USE_NEW_DESIGN = ${isNew};`
  );
  fs.writeFileSync(appPath, appContent);

  console.log(`✅ Switched to ${design} design`);
  console.log(`📝 Updated .env.local and FarcasterApp.tsx`);
  console.log(`🔄 Restart your dev server to see the changes`);
}

function showHelp() {
  console.log(`
🎨 Design Toggle Script

Usage:
  node scripts/toggle-design.js [old|new]

Commands:
  old    Switch to the original design (what users liked)
  new    Switch to the new design with theme toggle

Examples:
  node scripts/toggle-design.js old
  node scripts/toggle-design.js new

Current design: ${getCurrentDesign()}
`);
}

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  showHelp();
  process.exit(0);
}

const design = args[0].toLowerCase();

if (design !== "old" && design !== "new") {
  console.error('❌ Invalid design. Use "old" or "new"');
  process.exit(1);
}

setDesign(design);
