// scenes.js
require('dotenv').config();               // load .env variables
const { OBSWebSocket } = require('obs-websocket-js');

const obs = new OBSWebSocket();

// Read config from .env
const OBS_ADDRESS = process.env.OBS_ADDRESS;
const OBS_PASSWORD = process.env.OBS_PASSWORD;

// passing the scene name as a command line arg:
//   node listScenes.js MySceneName
const NEW_SCENE_NAME = process.argv[2] || 'new scene from node';

async function main() {
  try {
    // 1. Connect to OBS
    await obs.connect(OBS_ADDRESS, OBS_PASSWORD);
    console.log('Connected to OBS');

    // 2. Create a new scene
    console.log(`% Creating scene: "${NEW_SCENE_NAME}"...`);
    const created = await obs.call('CreateScene', {
      sceneName: NEW_SCENE_NAME,
    });

    // returned data from the CreateScene request
    console.log('Scene created:', created);

    // 3. Get the updated scene list
    const { scenes, currentProgramSceneName } = await obs.call('GetSceneList');

    console.log('\nCurrent Program Scene:', currentProgramSceneName);
    console.log('All Scenes:');
    for (const scene of scenes) {
      console.log(`- ${scene.sceneName}`);
    }
  } catch (err) {
    // if the scene already exists, OBS will throw a specific error
    if (err.code === 'resource-already-exists') {
      console.error(
        `A scene named "${NEW_SCENE_NAME}" already exists in OBS.`
      );
    }
  } finally {
    obs.disconnect();
    console.log('\n🔌 Disconnected from OBS');
  }
}

main();
