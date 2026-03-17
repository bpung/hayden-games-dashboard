async function loadManifest() {
  const response = await fetch('./games.manifest.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Unable to load manifest: ${response.status}`);
  }
  return response.json();
}

function createTile(game, template) {
  const fragment = template.content.cloneNode(true);
  const link = fragment.querySelector('.game-tile');
  const icon = fragment.querySelector('.game-icon');
  const name = fragment.querySelector('.game-name');

  link.href = `./games/${game.slug}/`;
  link.setAttribute('aria-label', `Play ${game.name}`);
  icon.textContent = game.icon || '🎮';
  name.textContent = game.name;

  return fragment;
}

async function renderGames() {
  const manifest = await loadManifest();
  const grid = document.getElementById('games-grid');
  const template = document.getElementById('game-tile-template');

  document.title = manifest.title || "Hayden's Games";

  const entries = manifest.games || [];
  if (entries.length === 0) {
    grid.innerHTML = '<li>No games found yet.</li>';
    return;
  }

  entries.forEach((game) => {
    grid.appendChild(createTile(game, template));
  });
}

renderGames().catch((error) => {
  console.error(error);
  const grid = document.getElementById('games-grid');
  grid.innerHTML = '<li>Failed to load games list.</li>';
});
