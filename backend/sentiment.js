const tmi = require('tmi.js');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

let chatClient = null;
let chatMessages = [];
let isConnected = false;

function initializeChatClient(botUsername, oauthToken, channel, notepadSocket) {
  return new Promise((resolve, reject) => {
    if (chatClient && isConnected) {
      resolve(chatClient);
      return;
    }

    chatClient = new tmi.Client({
      options: { debug: true },
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: botUsername,
        password: oauthToken,
      },
      channels: [channel],
    });

    chatClient.on('connected', (addr, port) => {
      console.log(`Connected to Twitch chat on ${addr}:${port}`);
      isConnected = true;
      resolve(chatClient);
    });

    chatClient.on('disconnected', (reason) => {
      console.log(`Disconnected from Twitch chat: ${reason}`);
      isConnected = false;
    });

    chatClient.on('chat', (channel, userstate, message, self) => {
      if (self) return; // ignore bot's own messages

      chatMessages.push({
        username: userstate['display-name'],
        message: message,
        timestamp: new Date(),
      });
      
      if (notepadSocket) {
        notepadSocket.emit('new_chat_message', {msg: message});
      }

      // crashes my computer if i dont do this
      if (chatMessages.length > 100) {
        chatMessages.shift();
      }
    });

    chatClient.connect().catch((err) => {
      console.error('Failed to connect to Twitch chat:', err);
      reject(err);
    });
  });
}

function disconnectChatClient() {
  if (chatClient && isConnected) {
    chatClient.disconnect();
    isConnected = false;
  }
}

async function analyzeSentiment(text) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a sentiment analyzer. Analyze the given text and respond with ONLY one of these emotions: joyful, positive, satisfied, neutral, confused, angry, or rage. Do not include any explanation, punctuation, or extra text. Respond with only the emotion word itself.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 5,
    });

    let emotion = response.choices[0].message.content.trim().toLowerCase();
    
    // remove any punctuation and extra characters
    emotion = emotion.replace(/[^a-z]/g, '');
    
    // validate emotion is one of the 7 categories
    const validEmotions = ['joyful', 'positive', 'satisfied', 'neutral', 'confused', 'angry', 'rage'];
    
    if (!validEmotions.includes(emotion)) {
      console.warn(`Invalid emotion returned: "${response.choices[0].message.content.trim()}", defaulting to neutral`);
      return 'neutral';
    }
    
    console.log(`Analyzed: "${text.substring(0, 50)}" → ${emotion}`);
    return emotion;
  } catch (error) {
    console.error('Error analyzing sentiment with ChatGPT:', error.message);
    return 'neutral';
  }
}

async function getSentimentStats() {
  const emotionCounts = {
    joyful: 0,
    positive: 0,
    satisfied: 0,
    neutral: 0,
    confused: 0,
    angry: 0,
    rage: 0,
  };

  for (const msg of chatMessages) {
    const emotion = await analyzeSentiment(msg.message);
    emotionCounts[emotion]++;
  }

  const total = chatMessages.length;
  const emotionPercentages = {};

  for (const emotion in emotionCounts) {
    emotionPercentages[emotion] =
      total > 0 ? Math.round((emotionCounts[emotion] / total) * 100) : 0;
  }

  return {
    totalMessages: total,
    emotionCounts,
    emotionPercentages,
    recentMessages: chatMessages.slice(-10),
  };
}

async function getEmotionData() {
  const stats = await getSentimentStats();
  return {
    labels: ['Joyful', 'Positive', 'Satisfied', 'Neutral', 'Confused', 'Angry', 'Rage'],
    data: [
      stats.emotionCounts.joyful,
      stats.emotionCounts.positive,
      stats.emotionCounts.satisfied,
      stats.emotionCounts.neutral,
      stats.emotionCounts.confused,
      stats.emotionCounts.angry,
      stats.emotionCounts.rage,
    ],
    percentages: [
      stats.emotionPercentages.joyful,
      stats.emotionPercentages.positive,
      stats.emotionPercentages.satisfied,
      stats.emotionPercentages.neutral,
      stats.emotionPercentages.confused,
      stats.emotionPercentages.angry,
      stats.emotionPercentages.rage,
    ],
        totalMessages: stats.totalMessages,
      };
    }
    
// Notepad stuff
function getMessageList() {
  return chatMessages;
}
  
module.exports = {
  initializeChatClient,
  disconnectChatClient,
  analyzeSentiment,
  getSentimentStats,
  getEmotionData,
  getMessageList,
};