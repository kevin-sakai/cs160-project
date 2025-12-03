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
} from 'chart.js';
import { Bar, Pie, Radar } from 'react-chartjs-2';

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
  Legend
);

import './Graphs.css';

export default function Graphs() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [chartData, setChartData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [twitchConnected, setTwitchConnected] = useState(false);
  const [sentimentLoading, setSentimentLoading] = useState(false);

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
      // Load sentiment data after connecting
      setTimeout(() => loadTwitchSentiment(), 2000);
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

  if (loading) {
    return renderState('Loading AI-generated insights...');
  }

  if (errorMsg && !chartData && !sentimentData) {
    return renderState(errorMsg);
  }

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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  };

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        max: sentimentData?.stats?.totalMessages || 10,
      },
    },
    plugins: {
      legend: { display: true },
    },
  };

  return (
    <div id="graphs-page">
      <h1>Graphs & Insights</h1>

      {errorMsg && (
        <div className="error-message" style={{ color: 'red', marginBottom: '20px' }}>
          {errorMsg}
        </div>
      )}

      {insights && (
        <section className="insights-section">
          <h2>AI Recommendations</h2>
          <ul>
            {insights.recommendations?.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="chart-blocks">
        {chartData?.sceneUsage?.labels?.length > 0 && (
          <div className="chart-card">
            <h3>Most Used Scenes</h3>
            <Bar
              data={simpleBarConfig(
                chartData.sceneUsage.labels,
                chartData.sceneUsage.data,
                'Usage %',
                'rgba(54, 162, 235, 0.7)'
              )}
              options={chartOptions}
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
                'rgba(255, 99, 132, 0.7)'
              )}
              options={chartOptions}
            />
          </div>
        )}

        {chartData?.chatSentiment && (
          <div className="chart-card">
            <h3>Chat Sentiment</h3>
            <Pie
              data={{
                labels: chartData.chatSentiment.labels,
                datasets: [
                  {
                    data: chartData.chatSentiment.data,
                    backgroundColor: [
                      '#4bc0c0',
                      '#ff6384',
                      '#ffce56',
                    ],
                  },
                ],
              }}
              options={chartOptions}
            />
            {insights?.chatSentiment && (
              <p className="sentiment-note">
                Overall: {insights.chatSentiment.overall} | Engagement:{' '}
                {insights.chatSentiment.engagement}
              </p>
            )}
          </div>
        )}

        {!chartData?.chatSentiment && (
          <div className="chart-card">
            <h3>Chat Sentiment</h3>
            <p>Chat sentiment data not available.</p>
          </div>
        )}
      </div>

      {/* Twitch Chat Sentiment Section */}
      <section className="twitch-sentiment-section">
        <h2>Twitch Chat Sentiment Analysis</h2>
        <div className="twitch-controls">
          <button
            onClick={handleConnectTwitch}
            disabled={twitchConnected || sentimentLoading}
          >
            {sentimentLoading ? 'Connecting...' : twitchConnected ? 'Connected' : 'Connect to Twitch'}
          </button>
          {twitchConnected && (
            <button
              onClick={loadTwitchSentiment}
              disabled={sentimentLoading}
            >
              {sentimentLoading ? 'Loading...' : 'Refresh Sentiment'}
            </button>
          )}
        </div>

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
              <div className="sentiment-stats">
                <p><strong>Total Messages Analyzed:</strong> {sentimentData.stats.totalMessages}</p>
                <div className="emotion-breakdown">
                  {Object.entries(sentimentData.stats.emotionPercentages).map(([emotion, percentage]) => (
                    <div key={emotion} className="emotion-item">
                      <span>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}:</span>
                      <span>{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {twitchConnected && !sentimentData && !sentimentLoading && (
          <p>No sentiment data yet. Messages are being collected in real-time.</p>
        )}

        {!twitchConnected && !sentimentData && (
          <p>Connect to Twitch chat to start analyzing emotions from messages.</p>
        )}
      </section>

      {insights?.sourceInsights?.efficiency && (
        <section className="insights-section">
          <h2>Source Efficiency Analysis</h2>
          <p>{insights.sourceInsights.efficiency}</p>
        </section>
      )}
    </div>
  );
}

