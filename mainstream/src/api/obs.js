// frontend/src/api/obs.js

const BASE_URL = 'http://localhost:3000/api/obs';
<<<<<<< HEAD
const TWITCH_BASE_URL = 'http://localhost:3000/api/twitch';
=======
>>>>>>> 78d51491537dc3ef7d162ac123ddc273c6bbb313

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
<<<<<<< HEAD

export async function getInsights() {
  const res = await fetch(`${BASE_URL}/insights`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to get insights');
  }
  return await res.json();
}

// Twitch Chat Sentiment API functions
export async function connectTwitchChat() {
  const res = await fetch(`${TWITCH_BASE_URL}/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to connect to Twitch chat');
  }
  return await res.json();
}

export async function disconnectTwitchChat() {
  const res = await fetch(`${TWITCH_BASE_URL}/disconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to disconnect from Twitch chat');
  }
  return await res.json();
}

export async function getTwitchSentiment() {
  const res = await fetch(`${TWITCH_BASE_URL}/sentiment`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to get Twitch sentiment');
  }
  return await res.json();
}
=======
>>>>>>> 78d51491537dc3ef7d162ac123ddc273c6bbb313
