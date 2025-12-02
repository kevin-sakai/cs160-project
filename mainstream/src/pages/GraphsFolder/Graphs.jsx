import { useEffect, useState } from 'react';
import { getInsights } from '../../api/obs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './Graphs.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function Graphs() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [chartData, setChartData] = useState(null);
  const [insights, setInsights] = useState(null);

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

  if (errorMsg) {
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

  return (
    <div id="graphs-page">
      <h1>Graphs & Insights</h1>

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

      {insights?.sourceInsights?.efficiency && (
        <section className="insights-section">
          <h2>Source Efficiency Analysis</h2>
          <p>{insights.sourceInsights.efficiency}</p>
        </section>
      )}
    </div>
  );
}

