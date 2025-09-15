#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const include = [path.join(root, 'src'), root];
const patterns = [
  /#[0-9A-Fa-f]{3,8}\b/g, // hex colors
  /\b(?:rgb|hsl)a?\([^\)]*\)/g, // rgb/hsl
  /\b\d+(?:\.\d+)?(?:px|rem|em|vh|vw)\b/g, // lengths
  /\b(?:box-shadow|text-shadow)\s*:\s*[^;]*;/g // shadows
];

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir)) {
    if (entry.startsWith('.')) continue;
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (p.includes('node_modules') || p.includes('dist') || p.includes('build')) continue;
      walk(p, files);
    } else if (/\.(ts|tsx|js|jsx|css|scss|html)$/.test(p)) {
      files.push(p);
    }
  }
  return files;
}

const files = include.flatMap((p) => fs.existsSync(p) ? walk(p) : []);
const results: {file:string; line:number; match:string}[] = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const pat of patterns) {
      const m = line.match(pat);
      if (m) m.forEach((s) => results.push({file, line: i+1, match: s}));
    }
  });
}

if (results.length === 0) {
  console.log('No literal tokens found. Great job!');
} else {
  console.log('Literal token candidates:');
  for (const r of results) {
    console.log(`${r.file}:${r.line}: ${r.match}`);
  }
  process.exitCode = 1;
}
