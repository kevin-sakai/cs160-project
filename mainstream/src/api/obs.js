// frontend/src/api/obs.js

const BASE_URL = 'http://localhost:3000/api/obs';

export async function getObsHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return await res.json();
}

export async function getScenes() {
  const res = await fetch(`${BASE_URL}/scenes`);
  if (!res.ok) {
    throw new Error(`Failed to fetch scenes: ${res.status}`);
  }
  return await res.json();
}

export async function createScene(sceneName) {
  const res = await fetch(`${BASE_URL}/scenes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sceneName }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create scene');
  }
  return await res.json();
}

export async function getSceneSources(sceneName) {
  const res = await fetch(
    `${BASE_URL}/scenes/${encodeURIComponent(sceneName)}/sources`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch sources for scene ${sceneName}`);
  }
  return await res.json();
}

export async function createSource(sceneName, sourceName, options = {}) {
  const res = await fetch(
    `${BASE_URL}/scenes/${encodeURIComponent(sceneName)}/sources`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceName,
        inputKind: options.inputKind, // optional, defaults on backend
        inputSettings: options.inputSettings || {},
      }),
    }
  );
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create source');
  }
  return await res.json();
}

export async function switchScene(sceneName) {
  const res = await fetch(`${BASE_URL}/scenes/switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sceneName }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to switch scene');
  }
  return await res.json();
}
