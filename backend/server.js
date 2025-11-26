// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OBSWebSocket } = require('obs-websocket-js');

const app = express();
const port = process.env.PORT || 3000;

// Allow JSON request bodies
app.use(express.json());

// allowed origins for local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://172.20.202.66:5173',
];

// configure CORS (adjust origin for actual frontend dev server)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin or from origins 
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not specified by CORS. Adjust backend server CORS settings.`));
      }
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  })
);

// OBS client and connection state
const obs = new OBSWebSocket();
let isConnected = false;
let isConnecting = false;

// Set up event listeners for logging and reconnection tracking
obs.on('ConnectionOpened', () => {
  console.log('OBS WebSocket connection opened');
  isConnected = true;
  isConnecting = false;
});

obs.on('ConnectionClosed', () => {
  console.log('OBS WebSocket connection closed');
  isConnected = false;
});

obs.on('error', (err) => {
  console.error('OBS WebSocket error:', err);
  isConnected = false;
});

// Helper: Ensure we are connected to OBS (auto-connect / reconnect)
async function ensureObsConnected() {
  if (isConnected) return;
  if (isConnecting) {
    // If another request is currently connecting, just wait for that
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (isConnected) return;
  }

  isConnecting = true;

  const address = process.env.OBS_ADDRESS;
  const password = process.env.OBS_PASSWORD;

  if (!address || !password) {
    throw new Error('Missing OBS_ADDRESS or OBS_PASSWORD in .env');
  }

  try {
    console.log('Connecting to OBS at', address);
    await obs.connect(address, password);
    console.log('Connected to OBS');
  } catch (err) {
    isConnected = false;
    isConnecting = false;
    console.error('Failed to connect to OBS:', err);
    throw err;
  }
}

// --------- Routes under /api/obs/* ---------

// Health check: is backend alive, and can it reach OBS?
app.get('/api/obs/health', async (req, res) => {
  try {
    await ensureObsConnected();
    const versionInfo = await obs.call('GetVersion');
    res.json({
      ok: true,
      obsConnected: true,
      obsVersion: versionInfo.obsVersion,
      websocketVersion: versionInfo.obsWebSocketVersion,
    });
  } catch (err) {
    console.error('Error in /api/obs/health:', err);
    res.status(500).json({
      ok: false,
      error: 'Could not connect to OBS',
      details: err.message || String(err),
    });
  }
});

// Get list of scenes
app.get('/api/obs/scenes', async (req, res) => {
  try {
    await ensureObsConnected();
    const { scenes, currentProgramSceneName } = await obs.call('GetSceneList');
    res.json({ scenes, currentProgramSceneName });
  } catch (err) {
    console.error('Error in GET /api/obs/scenes:', err);
    res.status(500).json({
      error: 'Failed to get scenes',
      details: err.message || String(err),
    });
  }
});

// Create a new scene
// POST /api/obs/scenes
// Body: { "sceneName": "My New Scene" }
app.post('/api/obs/scenes', async (req, res) => {
  const { sceneName } = req.body;

  if (!sceneName) {
    return res
      .status(400)
      .json({ error: 'Missing required field: sceneName' });
  }

  try {
    await ensureObsConnected();
    const result = await obs.call('CreateScene', { sceneName });
    res.json({ ok: true, result });
  } catch (err) {
    console.error('Error in POST /api/obs/scenes:', err);
    res.status(500).json({
      error: 'Failed to create scene',
      details: err.message || String(err),
      code: err.code,
    });
  }
});

// Get sources in a scene
// GET /api/obs/scenes/:sceneName/sources
app.get('/api/obs/scenes/:sceneName/sources', async (req, res) => {
  const { sceneName } = req.params;

  try {
    await ensureObsConnected();
    const { sceneItems } = await obs.call('GetSceneItemList', {
      sceneName,
    });

    res.json({ sceneName, sceneItems });
  } catch (err) {
    console.error('Error in GET /api/obs/scenes/:sceneName/sources:', err);
    res.status(500).json({
      error: 'Failed to get scene sources',
      details: err.message || String(err),
      code: err.code,
    });
  }
});

// Create a new source in a given scene
// POST /api/obs/scenes/:sceneName/sources
// Body example:
// {
//   "sourceName": "My Color Block",
//   "inputKind": "color_source_v3",
//   "inputSettings": { "width": 1920, "height": 1080 }
// }
app.post('/api/obs/scenes/:sceneName/sources', async (req, res) => {
  const { sceneName } = req.params;
  const {
    sourceName,
    inputKind = 'color_source_v3',
    inputSettings = {},
  } = req.body;

  if (!sourceName) {
    return res
      .status(400)
      .json({ error: 'Missing required field: sourceName' });
  }

  try {
    await ensureObsConnected();

    const result = await obs.call('CreateInput', {
      sceneName,
      inputName: sourceName,
      inputKind,
      inputSettings,
      sceneItemEnabled: true,
    });

    res.json({
      ok: true,
      sceneName,
      sourceName,
      inputKind,
      result,
    });
  } catch (err) {
    console.error('Error in POST /api/obs/scenes/:sceneName/sources:', err);
    res.status(500).json({
      error: 'Failed to create source',
      details: err.message || String(err),
      code: err.code,
    });
  }
});

// Optional: switch current program scene
// POST /api/obs/scenes/switch
// Body: { "sceneName": "Some Scene" }
app.post('/api/obs/scenes/switch', async (req, res) => {
  const { sceneName } = req.body;

  if (!sceneName) {
    return res
      .status(400)
      .json({ error: 'Missing required field: sceneName' });
  }

  try {
    await ensureObsConnected();
    await obs.call('SetCurrentProgramScene', { sceneName });
    res.json({ ok: true, sceneName });
  } catch (err) {
    console.error('Error in POST /api/obs/scenes/switch:', err);
    res.status(500).json({
      error: 'Failed to switch scene',
      details: err.message || String(err),
      code: err.code,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
