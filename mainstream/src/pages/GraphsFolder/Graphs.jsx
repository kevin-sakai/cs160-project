import { useEffect, useState } from 'react';
import { getInsights, connectTwitchChat, getTwitchSentiment } from '../../api/obs';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  ArcElement,
  RadarController,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';

import { Bar, Radar, Line } from 'react-chartjs-2';
import '../../../src/styles/variables.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  ArcElement,
  RadarController,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  TimeScale
);

import './Graphs.css';

const getComputedColor = (varName) => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
  }
  return '#497bd4';
};

function colorWheel(index) {
  const colors = [
    '#ff6384',
    '#36a2eb',
    '#ffce56',
    '#4bc0c0',
    '#9966ff',
    '#ff9f40',
    '#66ff66',
    '#ff6666',
  ];
  return colors[index % colors.length];
}

export default function Graphs() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [chartData, setChartData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [twitchConnected, setTwitchConnected] = useState(false);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [emotionHistory, setEmotionHistory] = useState([]);

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);
        setErrorMsg('');
        const data = await getInsights();
        setChartData(data.chartData);
        setInsights(data.rawInsights);
      } catch (err) {
        console.error('Error loading insights:', err);
        const errorDetails = err.message || 'Failed to load insights.';
        setErrorMsg(`Error: ${errorDetails}. Check console for details.`);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  async function handleConnectTwitch() {
    try {
      setSentimentLoading(true);
      await connectTwitchChat();
      setTwitchConnected(true);

      setTimeout(() => {
        loadTwitchSentiment();
      }, 2000);
    } catch (err) {
      console.error('Error connecting to Twitch:', err);
      setErrorMsg(`Failed to connect to Twitch: ${err.message}`);
    } finally {
      setSentimentLoading(false);
    }
  }

  async function loadTwitchSentiment() {
    try {
      setSentimentLoading(true);
      const data = await getTwitchSentiment();
      setSentimentData(data);

      setEmotionHistory((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          emotions: data.emotionData.data,
        },
      ]);
    } catch (err) {
      console.error('Error loading Twitch sentiment:', err);
    } finally {
      setSentimentLoading(false);
    }
  }

  function renderState(message) {
    return (
      <div id="graphs-page">
        <h1>Graphs & Insights</h1>
        <p>{message}</p>
      </div>
    );
  }

  if (loading) return renderState('Loading Insights...');
  if (errorMsg && !chartData && !sentimentData) return renderState(errorMsg);

  function simpleBarConfig(labels, data, labelText, color) {
    return {
      labels,
      datasets: [
        {
          label: labelText,
          data,
          backgroundColor: color,
        },
      ],
    };
  }

  function normalizeToPercentages(data) {
    const total = data.reduce((sum, val) => sum + val, 0);
    if (total === 0) return data;
    return data.map((val) => Math.round((val / total) * 100));
  }

  const sceneChartOptions = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value) => value + '%' },
      },
    },
  };

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        max: sentimentData?.emotionData?.data
          ? Math.max(...sentimentData.emotionData.data)
          : 10,
      },
    },
    plugins: { legend: { display: true } },
  };

  // ----------------------------
  // Build line chart dataset
  // ----------------------------
  const buildEmotionLineData = () => {
    if (!emotionHistory.length || !sentimentData) return null;

    const labels = emotionHistory.map((entry) => entry.timestamp);
    const emotionLabels = sentimentData.emotionData.labels;

    const datasets = emotionLabels.map((emotion, index) => ({
      label: emotion,
      data: emotionHistory.map((entry) => entry.emotions[index]),
      borderWidth: 2,
      tension: 0.25,
      borderColor: colorWheel(index),
      backgroundColor: colorWheel(index) + '33',
      pointRadius: 3,
      pointHoverRadius: 5,
    }));

    return { labels, datasets };
  };

  return (
    <div id="graphs-page">
      <h1>Graphs & Insights</h1>

      {errorMsg && (
        <div className="error-message" style={{ color: 'red', marginBottom: '20px' }}>
          {errorMsg}
        </div>
      )}

      {/* ---------------- Scene & Source Charts ---------------- */}
      <div className="chart-blocks">
        {chartData?.sceneUsage?.labels?.length > 0 && (
          <div className="chart-card">
            <h3>Most Used Scenes</h3>
            <Bar
              data={simpleBarConfig(
                chartData.sceneUsage.labels,
                normalizeToPercentages(chartData.sceneUsage.data),
                'Usage %',
                getComputedColor('--elem-color')
              )}
              options={sceneChartOptions}
            />
          </div>
        )}

        {chartData?.sourceUsage?.labels?.length > 0 && (
          <div className="chart-card">
            <h3>Most Used Sources</h3>
            <Bar
              data={simpleBarConfig(
                chartData.sourceUsage.labels,
                chartData.sourceUsage.data,
                'Usage Count',
                getComputedColor('--highlight-color')
              )}
            />
          </div>
        )}
      </div>

   {/* ---------------- Twitch Sentiment ---------------- */}
    <section className="twitch-sentiment-section">
      <h2>Twitch Chat Sentiment Analysis</h2>

      <div className="twitch-controls">
        <button
          onClick={handleConnectTwitch}
          disabled={twitchConnected || sentimentLoading}
        >
          {sentimentLoading
            ? 'Connecting...'
            : twitchConnected
            ? 'Connected'
            : 'Connect to Twitch'}
        </button>

        {twitchConnected && (
          <button onClick={loadTwitchSentiment} disabled={sentimentLoading}>
            {sentimentLoading ? 'Loading...' : 'Refresh Sentiment'}
          </button>
        )}
      </div>

      {/* ---------- Radar + Stats ---------- */}
      {sentimentData && (
        <div className="chart-blocks">
          <div className="chart-card">
            <h3>Chat Emotions - Radar Chart</h3>

            <Radar
              data={{
                labels: sentimentData.emotionData.labels,
                datasets: [
                  {
                    label: 'Emotion Count',
                    data: sentimentData.emotionData.data,
                    borderColor: '#ff6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#ff6384',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                  },
                ],
              }}
              options={radarOptions}
            />

            {/* Stats */}
            <div className="sentiment-stats">
              <p>
                <strong>Total Messages Analyzed:</strong>{' '}
                {sentimentData.stats.totalMessages}
              </p>

              <div className="emotion-breakdown">
                {Object.entries(sentimentData.stats.emotionPercentages).map(
                  ([emotion, percentage]) => (
                    <div key={emotion} className="emotion-item">
                      <span>
                        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}:
                      </span>
                      <span>{percentage}%</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {twitchConnected && !sentimentData && !sentimentLoading && (
        <p>No sentiment data yet. Messages are being collected…</p>
      )}

      {!twitchConnected && !sentimentData && (
        <p>Connect to Twitch chat to start analyzing emotions.</p>
      )}
    </section>



    {/* ---------------- Separate Line Chart Box ---------------- */}
    {sentimentData && emotionHistory.length > 0 && (
      <section className="line-graph-section">
        <div className="chart-card">
          <h3>Emotion Trends Over Time</h3>

          <Line
            data={buildEmotionLineData()}
            options={{
              responsive: true,
              plugins: { legend: { display: true } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </section>
    )}
    </div>
  );
}
