// sources.js
require('dotenv').config();
const { OBSWebSocket } = require('obs-websocket-js');

const obs = new OBSWebSocket();

// read config from .env
const OBS_ADDRESS = process.env.OBS_ADDRESS;
const OBS_PASSWORD = process.env.OBS_PASSWORD;

//   node sceneSources.js "Scene Name"
//   node sceneSources.js "Scene Name" "New Source Name"
const SCENE_NAME = process.argv[2];
const NEW_SOURCE_NAME = process.argv[3] || null;

async function listSceneSources(sceneName) {
  console.log(`\nGetting sources for scene: "${sceneName}"`);

  const { sceneItems } = await obs.call('GetSceneItemList', {
    sceneName,
  });

  if (!sceneItems || sceneItems.length === 0) {
    console.log('No sources found in this scene.');
    return sceneItems;
  }

  console.log('Sources in this scene:');
  for (const item of sceneItems) {
    console.log(
      `- [id=${item.sceneItemId}] ${item.sourceName}` +
        (item.inputKind ? ` (kind: ${item.inputKind})` : '')
    );
  }

  return sceneItems;
}

async function createColorSourceInScene(sceneName, sourceName) {
  console.log(
    `\nCreating new color source "${sourceName}" in scene "${sceneName}"...`
  );

  const result = await obs.call('CreateInput', {
    sceneName,
    inputName: sourceName,
    inputKind: 'color_source_v3',
    inputSettings: {},
    sceneItemEnabled: true,
  });

  console.log('New source created:', result);
}

async function main() {
  try {
    if (!OBS_ADDRESS || !OBS_PASSWORD) {
      console.error('Missing OBS_ADDRESS or OBS_PASSWORD in .env');
      process.exit(1);
    }

    if (!SCENE_NAME) {
      console.error(
        'Usage: node sceneSources.js "Scene Name" ["New Source Name"]'
      );
      process.exit(1);
    }

    console.log('Using OBS_ADDRESS =', OBS_ADDRESS);
    console.log('Target scene      =', SCENE_NAME);
    if (NEW_SOURCE_NAME) {
      console.log('New source to add =', NEW_SOURCE_NAME);
    }

    console.log('\nConnecting to OBS...');
    await obs.connect(OBS_ADDRESS, OBS_PASSWORD);
    console.log('Connected to OBS');

    const versionInfo = await obs.call('GetVersion');
    console.log('OBS WebSocket version:', versionInfo.obsWebSocketVersion);

    await listSceneSources(SCENE_NAME);

    if (NEW_SOURCE_NAME) {
      await createColorSourceInScene(SCENE_NAME, NEW_SOURCE_NAME);
      await listSceneSources(SCENE_NAME);
    }
  } catch (err) {
    console.error('\nError in main():');
    console.error(err);

    if (err && err.code === 'scene-not-found') {
      console.error(`Scene "${SCENE_NAME}" was not found in OBS.`);
    }
  } finally {
    obs.disconnect();
    console.log('\nDisconnected from OBS');
  }
}

main();
