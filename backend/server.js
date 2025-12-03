// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OBSWebSocket } = require('obs-websocket-js');
const axios = require('axios');

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

// Get AI-generated insights from OBS data
// GET /api/obs/insights
app.get('/api/obs/insights', async (req, res) => {
  try {
    await ensureObsConnected();
    
    // Collect OBS data
    const { scenes, currentProgramSceneName } = await obs.call('GetSceneList');
    
    // Get sources for each scene
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

    // Prepare data for ChatGPT
    const obsDataSummary = {
      totalScenes: scenes.length,
      currentScene: currentProgramSceneName,
      scenes: sceneData,
      mostUsedScenes: scenes.slice(0, 5).map(s => s.sceneName), // Placeholder - in real app, track usage
    };

    // Call ChatGPT API for insights
    const apiKey = process.env.CHATGPT_API_KEY;
    if (!apiKey) {
      throw new Error('CHATGPT_API_KEY not in .env');
    }

    const prompt = `Analyze this OBS Studio streaming data and provide insights in JSON format. 
Focus on streamer-relevant metrics like scene usage patterns, source efficiency, and recommendations.

OBS Data:
- Total Scenes: ${obsDataSummary.totalScenes}
- Current Scene: ${obsDataSummary.currentScene}
- Scene Details: ${JSON.stringify(obsDataSummary.scenes, null, 2)}

Also analyze chat sentiment if provided. If chat messages are included, analyze sentiment (positive, negative, neutral) and engagement patterns.

Return a JSON object with this structure:
{
  "sceneInsights": {
    "mostUsedScenes": [{"name": "Scene1", "usage": 45}],
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "sourceInsights": {
    "mostUsedSources": [{"name": "Source1", "count": 5}],
    "efficiency": "analysis text"
  },
  "chatSentiment": {
    "overall": "positive/negative/neutral",
    "breakdown": {"positive": 60, "negative": 20, "neutral": 20},
    "engagement": "high/medium/low"
  },
  "recommendations": ["actionable recommendation 1", "recommendation 2"]
}

If no chat data is provided, set chatSentiment to null.`;

    let chatResponse;
    try {
      // Try with JSON mode first
      try {
        chatResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are an expert streaming analytics assistant. Analyze OBS data and provide actionable insights. You MUST respond with ONLY valid JSON, no other text. The JSON should have this structure: {"sceneInsights": {"mostUsedScenes": [{"name": "Scene1", "usage": 45}], "recommendations": []}, "sourceInsights": {"mostUsedSources": [{"name": "Source1", "count": 5}], "efficiency": "text"}, "chatSentiment": {"overall": "positive", "breakdown": {"positive": 60, "negative": 20, "neutral": 20}, "engagement": "high"} or null, "recommendations": []}',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' },
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (jsonModeErr) {
        // Fallback: try without JSON mode if it's not supported
        if (jsonModeErr.response?.data?.error?.message?.includes('response_format')) {
          console.log('JSON mode not supported, trying without response_format...');
          chatResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert streaming analytics assistant. Analyze OBS data and provide actionable insights. You MUST respond with ONLY valid JSON, no other text. The JSON should have this structure: {"sceneInsights": {"mostUsedScenes": [{"name": "Scene1", "usage": 45}], "recommendations": []}, "sourceInsights": {"mostUsedSources": [{"name": "Source1", "count": 5}], "efficiency": "text"}, "chatSentiment": {"overall": "positive", "breakdown": {"positive": 60, "negative": 20, "neutral": 20}, "engagement": "high"} or null, "recommendations": []}',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.7,
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
        } else {
          throw jsonModeErr;
        }
      }
    } catch (axiosErr) {
      console.error('ChatGPT API Error:', axiosErr.response?.data || axiosErr.message);
      throw new Error(`ChatGPT API error: ${axiosErr.response?.data?.error?.message || axiosErr.message}`);
    }

    if (!chatResponse?.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from ChatGPT API');
    }

    let insights;
    try {
      const responseText = chatResponse.data.choices[0].message.content.trim();
      // Try to extract JSON if it's wrapped in markdown code blocks
      let jsonText = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      insights = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error('Failed to parse ChatGPT response:', chatResponse.data.choices[0].message.content);
      throw new Error(`Failed to parse AI response: ${parseErr.message}`);
    }

    // Prepare chart data
    const chartData = {
      sceneUsage: {
        labels: insights.sceneInsights?.mostUsedScenes?.map(s => s.name) || [],
        data: insights.sceneInsights?.mostUsedScenes?.map(s => s.usage) || [],
      },
      sourceUsage: {
        labels: insights.sourceInsights?.mostUsedSources?.map(s => s.name) || [],
        data: insights.sourceInsights?.mostUsedSources?.map(s => s.count) || [],
      },
      chatSentiment: insights.chatSentiment
        ? {
            labels: ['Positive', 'Negative', 'Neutral'],
            data: [
              insights.chatSentiment.breakdown?.positive || 0,
              insights.chatSentiment.breakdown?.negative || 0,
              insights.chatSentiment.breakdown?.neutral || 0,
            ],
          }
        : null,
      insights: insights,
    };

    res.json({
      ok: true,
      chartData,
      rawInsights: insights,
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

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
