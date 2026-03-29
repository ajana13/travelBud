import { readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve, dirname } from "path";

const FUNCTIONS_DIR = join(import.meta.dirname, "../insforge/functions");
const OUT_DIR = join(import.meta.dirname, "../.build/functions");
const SKIP = ["_shared"];

function resolveFile(fromFile, importPath) {
  return resolve(dirname(fromFile), importPath);
}

// Collapse multi-line import statements into single lines
// e.g. import {\n  a,\n  b\n} from "x" -> import { a, b } from "x"
function flattenImports(src) {
  return src.replace(/import\s*\{[\s\S]*?\}\s*from\s/g, function (match) {
    return match.replace(/\n\s*/g, " ");
  });
}

function inlineModule(filePath, visited, externalImports) {
  if (visited.has(filePath)) return "";
  visited.add(filePath);

  var raw = readFileSync(filePath, "utf-8");
  var code = flattenImports(raw);
  var lines = code.split("\n");
  var bodyLines = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    // External npm: imports
    var extMatch = line.match(/^import\s+(.*?)\s+from\s+"(npm:[^"]+)"\s*;?\s*$/);
    if (extMatch) {
      var specPart = extMatch[1];
      var mod = extMatch[2];
      if (!externalImports.has(mod)) {
        externalImports.set(mod, new Set());
      }
      var braceMatch = specPart.match(/\{([^}]+)\}/);
      if (braceMatch) {
        var specs = braceMatch[1].split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        for (var j = 0; j < specs.length; j++) {
          externalImports.get(mod).add(specs[j]);
        }
      }
      continue;
    }

    // Relative imports -> inline the dependency
    var relMatch = line.match(/^import\s+(.*?)\s+from\s+"(\.\.?\/.+)"\s*;?\s*$/);
    if (relMatch) {
      var relPath = relMatch[2];
      var depPath = resolveFile(filePath, relPath);
      var depCode = inlineModule(depPath, visited, externalImports);
      if (depCode) bodyLines.push(depCode);
      continue;
    }

    // Strip export keyword from declarations
    if (/^export\s+(async\s+)?function\s+/.test(line)) {
      bodyLines.push(line.replace(/^export\s+/, ""));
      continue;
    }
    if (/^export\s+(const|let|type|interface)\s+/.test(line)) {
      bodyLines.push(line.replace(/^export\s+/, ""));
      continue;
    }
    if (/^export\s+default\s+/.test(line)) {
      bodyLines.push(line);
      continue;
    }

    bodyLines.push(line);
  }

  return bodyLines.join("\n");
}

function bundleFunction(entryPath) {
  var visited = new Set();
  var externalImports = new Map();

  var raw = readFileSync(entryPath, "utf-8");
  var code = flattenImports(raw);
  var lines = code.split("\n");
  var inlinedParts = [];
  var entryBodyLines = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    // External npm: imports
    var extMatch = line.match(/^import\s+(.*?)\s+from\s+"(npm:[^"]+)"\s*;?\s*$/);
    if (extMatch) {
      var specPart = extMatch[1];
      var mod = extMatch[2];
      if (!externalImports.has(mod)) {
        externalImports.set(mod, new Set());
      }
      var braceMatch = specPart.match(/\{([^}]+)\}/);
      if (braceMatch) {
        var specs = braceMatch[1].split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        for (var j = 0; j < specs.length; j++) {
          externalImports.get(mod).add(specs[j]);
        }
      }
      continue;
    }

    // Relative imports -> inline
    var relMatch = line.match(/^import\s+(.*?)\s+from\s+"(\.\.?\/.+)"\s*;?\s*$/);
    if (relMatch) {
      var relPath = relMatch[2];
      var depPath = resolveFile(entryPath, relPath);
      var depCode = inlineModule(depPath, visited, externalImports);
      if (depCode.trim()) inlinedParts.push(depCode);
      continue;
    }

    entryBodyLines.push(line);
  }

  // Build import block
  var importLines = [];
  externalImports.forEach(function (specs, mod) {
    var specList = Array.from(specs);
    var typeSpecs = specList.filter(function (s) { return s.startsWith("type "); });
    var valueSpecs = specList.filter(function (s) { return !s.startsWith("type "); });
    if (valueSpecs.length > 0) {
      importLines.push("import { " + valueSpecs.join(", ") + ' } from "' + mod + '";');
    }
    if (typeSpecs.length > 0) {
      var pfx = typeSpecs.length === specList.length ? "type " : "";
      var names = typeSpecs.map(function (s) { return s.replace(/^type /, ""); }).join(", ");
      importLines.push("import " + pfx + "{ " + names + ' } from "' + mod + '";');
    }
  });
  var importBlock = importLines.join("\n");

  var body = inlinedParts.concat([entryBodyLines.join("\n")])
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  var result = "";
  if (importBlock) result += importBlock + "\n\n";
  result += body + "\n";

  return result;
}

function bundle() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  var dirs = readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
    .filter(function (d) { return d.isDirectory() && !SKIP.includes(d.name); })
    .map(function (d) { return d.name; });

  console.log("Bundling " + dirs.length + " functions...");

  for (var i = 0; i < dirs.length; i++) {
    var fn = dirs[i];
    var entry = join(FUNCTIONS_DIR, fn, "index.ts");
    if (!existsSync(entry)) {
      console.log("  SKIP " + fn + " (no index.ts)");
      continue;
    }

    var outfile = join(OUT_DIR, fn, "index.ts");
    mkdirSync(join(OUT_DIR, fn), { recursive: true });

    var output = bundleFunction(entry);
    writeFileSync(outfile, output);

    console.log("  OK " + fn);
  }
  console.log("Done.");
}

bundle();
