## Running the Project

1. Install the latest versions of `npm` and `node`.
2. Open two terminals from the repository directory.
4. In one terminal, go to the frontend folder `mainstream` with `cd mainstream`.
5. From this terminal, run `npm install` to install dependencies and `npm run dev` to start the React frontend.
6. In the other terminal, go to the backend server folder `backend` with `cd backend`.
7. In this terminal, run `npm install` to install dependencies and `npm start` to start the backend server.
8. Navigate to `http://localhost:5173/` in your browser to open the app.

## Graphs Page

In the .env file within the backend folder, youll need to set up a few things:

What youll need: Twitch account, ChatGPT API key, OBS

To populate OBS_ADDRESS and OBS_PASSWORD:

Open OBS Studio.
Go to Tools → WebSocket Server Settings.
Make sure "Enable WebSocket Server" is checked.
Click "Show Connect Info". You will see:
Server IP (e.g., 127.0.0.1 or an IPv6 address)
Server Port (default: 4455)
Password (if enabled)
Enter those variables in the .env file.

Start streaming to begin collecting usage percentage data for scenes. 
Sources will be counted irrespective of usage.

To populate CHATGPT_API_KEY, go to this website: https://platform.openai.com/settings/organization/api-keys
and create an api key. Otherwise, if you're Tim, I've sent you an email with my api key.

To populate TWITCH_BOT_USERNAME, TWITCH_OAUTH_TOKEN, and TWITCH_CHANNEL:

For TWITCH_BOT_USERNAME, I recommend putting in your own twitch username, but you're welcome to set up a different account to monitor your chat and use its username instead.

For TWITCH_OAUTH_TOKEN, go to this website: https://antiscuff.com/oauth/
After logging in with your twitch account, it will generate an oauth token for you to use as the TWITCH_OATH_TOKEN variable

For TWITCH_CHANNEL, put in the username of your channel.

Running npm start in the backend folder will start the server, which collects twitch messages to analyze and source and scene data. 
Any messages subsequently sent in the twitch chat will populate the sentiment graphs each time you press Refresh Sentiment.
## Trigger Events Page

The **Trigger Events** page allows users to configure automated actions that control on-screen overlays during a stream. Users can define *when* an overlay should appear and *how* it behaves, without writing code.

Supported trigger types include:
- **Timed Events** (e.g., show an overlay every N minutes)
- **Chat Sentiment & Themes** (trigger based on chat mood or phrases)
- **Chat Followers** (trigger on new or milestone followers)
- **Chat Banning & Filtering** (moderation-based triggers)

Once configured, users select an overlay template and an OBS scene. The application automatically creates the necessary browser source in OBS and manages visibility at runtime.

> No additional configuration or downloads are required to use this page beyond running the project and connecting OBS. However, you MUST have OBS open and running locally. 

## OBS Page

The **OBS Page** provides a lightweight control panel for connecting the app to OBS via OBS WebSocket and managing basic scene/source interactions.

From this page, users can:
- Connect to OBS using their local WebSocket credentials
- View and switch between OBS scenes
- Create new scenes
- Inspect sources grouped by type (e.g., Browser Sources, Color Sources)

Connection details are saved locally in the browser and shared across the app, allowing other pages (such as Trigger Events) to interact with OBS seamlessly.

> As long as OBS is running with WebSocket enabled and you've entered your credentials, no additional setup is needed to use this page.



