// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OBSWebSocket } = require('obs-websocket-js');
// axios removed — not needed when insights are generated locally
const {
  initializeChatClient,
  disconnectChatClient,
  getEmotionData,
  getSentimentStats,
} = require('./sentiment');
const http = require('http'); 
const { Server } = require('socket.io');


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

// Track scene usage over time
const sceneUsageTracker = {
  currentScene: null,
  sceneStartTime: null,
  sceneDurations: {}, // { sceneName: totalMs }
};

// Set up event listeners for logging and reconnection tracking
obs.on('ConnectionOpened', () => {
  console.log('OBS WebSocket connection opened');
  isConnected = true;
  isConnecting = false;
});

// Track scene switches
obs.on('CurrentProgramSceneChanged', (data) => {
  const { sceneName } = data;
  
  // Log previous scene duration
  if (sceneUsageTracker.currentScene && sceneUsageTracker.sceneStartTime) {
    const duration = Date.now() - sceneUsageTracker.sceneStartTime;
    sceneUsageTracker.sceneDurations[sceneUsageTracker.currentScene] =
      (sceneUsageTracker.sceneDurations[sceneUsageTracker.currentScene] || 0) + duration;
  }
  
  // Switch to new scene
  sceneUsageTracker.currentScene = sceneName;
  sceneUsageTracker.sceneStartTime = Date.now();
  console.log(`Scene switched to: ${sceneName}`);
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

//get source/scene data from obs for da graphs
app.get('/api/obs/insights', async (req, res) => {
  try {
    await ensureObsConnected();
    
    const { scenes, currentProgramSceneName } = await obs.call('GetSceneList');
    
    const sceneData = [];
    for (const scene of scenes) {
      try {
        const { sceneItems } = await obs.call('GetSceneItemList', {
          sceneName: scene.sceneName,
        });
        sceneData.push({
          sceneName: scene.sceneName,
          sourceCount: sceneItems.length,
          sources: sceneItems.map(item => ({
            name: item.sourceName,
            kind: item.inputKind,
            enabled: item.sceneItemEnabled,
          })),
        });
      } catch (err) {
        console.error(`Error getting sources for ${scene.sceneName}:`, err);
      }
    }

    const obsDataSummary = {
      totalScenes: scenes.length,
      currentScene: currentProgramSceneName,
      scenes: sceneData,
      mostUsedScenes: scenes.slice(0, 5).map(s => s.sceneName),
    };

    let insights;
    
    // get time for current scene
    if (sceneUsageTracker.currentScene && sceneUsageTracker.sceneStartTime) {
      const duration = Date.now() - sceneUsageTracker.sceneStartTime;
      sceneUsageTracker.sceneDurations[sceneUsageTracker.currentScene] =
        (sceneUsageTracker.sceneDurations[sceneUsageTracker.currentScene] || 0) + duration;
      sceneUsageTracker.sceneStartTime = Date.now();
    }
    
    //sort them scenes by time used
    const mostUsedScenes = (obsDataSummary.mostUsedScenes || [])
      .map((name) => ({
        name,
        usage: sceneUsageTracker.sceneDurations[name] || 0,
      }))
      .sort((a, b) => b.usage - a.usage);

      //count source usages by scene
      const sourceCounts = {};
      for (const s of obsDataSummary.scenes || []) {
        for (const src of s.sources || []) {
          sourceCounts[src.name] = (sourceCounts[src.name] || 0) + 1;
        }
      }

      const mostUsedSources = Object.entries(sourceCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      insights = {
        sceneInsights: {
          mostUsedScenes,
          recommendations: [],
        },
        sourceInsights: {
          mostUsedSources,
          efficiency: 'derived from source counts',
        },
      };

    const chartData = {
      sceneUsage: {
        labels: insights.sceneInsights?.mostUsedScenes?.map(s => s.name) || [],
        data: insights.sceneInsights?.mostUsedScenes?.map(s => s.usage) || [],
      },
      sourceUsage: {
        labels: insights.sourceInsights?.mostUsedSources?.map(s => s.name) || [],
        data: insights.sourceInsights?.mostUsedSources?.map(s => s.count) || [],
      },
    };

    res.json({
      ok: true,
      chartData,
      obsData: obsDataSummary,
    });
  } catch (err) {
    console.error('Error in GET /api/obs/insights:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      error: 'Failed to generate insights',
      details: err.message || String(err),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

// connect to Twitch chat and start collecting messages
app.post('/api/twitch/connect', async (req, res) => {
  try {
    const botUsername = process.env.TWITCH_BOT_USERNAME;
    const oauthToken = process.env.TWITCH_OAUTH_TOKEN;
    const channel = process.env.TWITCH_CHANNEL;

    if (!botUsername || !oauthToken || !channel) {
      return res.status(400).json({
        error: 'Missing Twitch environment variables',
        details: 'TWITCH_BOT_USERNAME, TWITCH_OAUTH_TOKEN, and TWITCH_CHANNEL are required',
      });
    }

    await initializeChatClient(botUsername, oauthToken, channel);
    res.json({
      ok: true,
      message: `Connected to ${channel}'s Twitch chat`,
    });
  } catch (err) {
    console.error('Error connecting to Twitch chat:', err);
    res.status(500).json({
      error: 'Failed to connect to Twitch chat',
      details: err.message || String(err),
    });
  }
});

// disconnect from Twitch chat
app.post('/api/twitch/disconnect', (req, res) => {
  try {
    disconnectChatClient();
    res.json({
      ok: true,
      message: 'Disconnected from Twitch chat',
    });
  } catch (err) {
    console.error('Error disconnecting from Twitch chat:', err);
    res.status(500).json({
      error: 'Failed to disconnect from Twitch chat',
      details: err.message || String(err),
    });
  }
});

// get sentiment analysis from collected Twitch chat messages
app.get('/api/twitch/sentiment', async (req, res) => {
  try {
    const emotionData = await getEmotionData();
    const stats = await getSentimentStats();

    res.json({
      ok: true,
      emotionData: {
        labels: emotionData.labels,
        data: emotionData.data,
        percentages: emotionData.percentages,
      },
      stats: {
        totalMessages: stats.totalMessages,
        emotionCounts: stats.emotionCounts,
        emotionPercentages: stats.emotionPercentages,
      },
      recentMessages: stats.recentMessages,
    });
  } catch (err) {
    console.error('Error getting sentiment analysis:', err);
    res.status(500).json({
      error: 'Failed to get sentiment analysis',
      details: err.message || String(err),
    });
  }
});

app.get('api/twitch/messages', async (req, res) => {
  const messages = getMessageList();
  res.json({
    ok: true,
    msg: JSON.stringify(messages),
  });
});

const httpServer = http.createServer(app);
let currentNoteText = "";

export const notepadSocket = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"]
    }
});

app.get("/api/notepad", (req, res) => {
    console.log("GET request for text");
    res.json({ text: currentNoteText });
});

notepadSocket.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.emit('text_update', { text: currentNoteText });

    socket.on('text_input', (data) => {
        const newText = data.text;
        currentNoteText = newText;
        socket.broadcast.emit('text_update', { text: newText });
        socket.emit('confirm_input', { message: 'Text update received.' });
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

httpServer.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});

/*
// Start the server
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
*/