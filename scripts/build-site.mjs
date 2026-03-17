import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'site');
const gamesDir = path.join(rootDir, 'games');

const manifest = JSON.parse(readFileSync(path.join(rootDir, 'games.manifest.json'), 'utf8'));
const excludedStaticEntries = new Set([
  '.git',
  'node_modules',
  'output',
  'package.json',
  'package-lock.json',
  'serve_no_cache.py',
  'progress.md',
]);
const excludedStaticSuffixes = ['.md', '.log', '.pem'];
const excludedStaticPrefixes = ['test-actions'];

function run(cmd, args, cwd) {
  execFileSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });
}

function copyDashboardFiles() {
  const files = ['index.html', 'styles.css', 'app.js', 'games.manifest.json'];

  files.forEach((fileName) => {
    cpSync(path.join(rootDir, fileName), path.join(outputDir, fileName), { recursive: false });
  });
}

function shouldSkipStaticEntry(entryName) {
  if (excludedStaticEntries.has(entryName)) {
    return true;
  }

  if (excludedStaticPrefixes.some((prefix) => entryName.startsWith(prefix))) {
    return true;
  }

  return excludedStaticSuffixes.some((suffix) => entryName.endsWith(suffix));
}

function copyStaticGame(sourceDir, targetDir) {
  mkdirSync(targetDir, { recursive: true });
  for (const name of readdirSync(sourceDir)) {
    if (shouldSkipStaticEntry(name)) {
      continue;
    }

    cpSync(path.join(sourceDir, name), path.join(targetDir, name), { recursive: true });
  }
}

function ensureViteDependencies(gamePath) {
  if (!existsSync(path.join(gamePath, 'node_modules'))) {
    run('npm', ['install', '--no-fund', '--no-audit'], gamePath);
  }
}

function buildViteGame(gamePath, targetDir) {
  ensureViteDependencies(gamePath);

  run('npx', ['tsc'], gamePath);
  run('npx', ['vite', 'build', '--base=./'], gamePath);

  const distDir = path.join(gamePath, 'dist');
  if (!existsSync(distDir)) {
    throw new Error(`Missing dist output for ${gamePath}`);
  }

  cpSync(distDir, targetDir, { recursive: true });
}

function main() {
  if (!existsSync(gamesDir)) {
    throw new Error('Missing ./games directory. Add submodules first.');
  }

  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(path.join(outputDir, 'games'), { recursive: true });

  copyDashboardFiles();

  for (const game of manifest.games) {
    const gamePath = path.join(gamesDir, game.slug);
    if (!existsSync(gamePath)) {
      throw new Error(`Game not found: ${game.slug}. Run: git submodule update --init --recursive`);
    }

    const gameOutputDir = path.join(outputDir, 'games', game.slug);

    if (game.type === 'vite') {
      buildViteGame(gamePath, gameOutputDir);
      continue;
    }

    copyStaticGame(gamePath, gameOutputDir);
  }

  console.log(`Built site at ${outputDir}`);
}

main();
