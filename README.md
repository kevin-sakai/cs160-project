# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Graphs Page

In the .env file within the backend folder, youll need to set up a few things:

What youll need: Twitch account, ChatGPT API key, OBS

To populate OBS_ADDRESS, OBS_PASSWORD, and PORT:

Open OBS Studio.
Go to Tools → WebSocket Server Settings.
Make sure "Enable WebSocket Server" is checked.
Click "Show Connect Info". You will see:
Server IP (e.g., 127.0.0.1 or an IPv6 address)
Server Port (default: 4455)
Password (if enabled)
Enter those variables in the .env file.

To populate TWITCH_BOT_USERNAME, TWITCH_OAUTH_TOKEN, and TWITCH_CHANNEL:

For TWITCH_BOT_USERNAME, I recommend putting in your own twitch username, but you're welcome to set up a different account to monitor your chat and use its username instead.

For TWITCH_OAUTH_TOKEN, go to this website: https://antiscuff.com/oauth/
After logging in with your twitch account, it will generate an oauth token for you to use as the TWITCH_OATH_TOKEN variable

For TWITCH_CHANNEL, put in the username of your channel.

Running npm start in the backend folder will start the server, which collects twitch messages to analyze and source and scene data. 
Any messages subsequently sent in the twitch chat will populate the sentiment graphs each time you press Refresh Sentiment.
