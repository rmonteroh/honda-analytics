import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { AnalyticsData } from "../types/analytics";
import { AnalyticsService } from "../services/analyticsApi";
import "./Dashboard.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Dashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // const analyticsData = await AnalyticsService.fetchAnalyticsData();
        const analyticsData = {
          general: {
            accepted: {
              total: 5641,
              percentage: "20.51",
            },
            declined: {
              total: 3619,
              percentage: "13.16",
            },
            followUp: {
              total: 13576,
              percentage: "49.37",
            },
            undelivered: {
              total: 4654,
              percentage: "16.92",
            },
          },
          conversion: {
            sentToDealerWhatsapp: {
              total: 1686,
              percentage: "6.13",
            },
            acceptedOutBusinessHours: {
              total: 333,
              percentage: "1.21",
            },
          },
          followUp: {
            acceptedFirstContact: {
              total: 4551,
              percentage: "16.55",
            },
            acceptedSecondContact: {
              total: 720,
              percentage: "2.62",
            },
          },
          totalTrackedUsers: 27490,
          totalHondaConversations: 27500,
        };
        setData(analyticsData);
        setError(null);
      } catch (err) {
        setError("Failed to load analytics data");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="loading">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!data) {
    return <div className="error">No data available</div>;
  }

  const mainDistributionData = {
    labels: ["Follow-up", "Accepted", "Declined", "Undelivered"],
    datasets: [
      {
        data: [
          data.general.followUp.total,
          data.general.accepted.total,
          data.general.declined.total,
          data.general.undelivered.total,
        ],
        backgroundColor: [
          "#FFA726", // Orange for Follow-up (waiting status)
          "#4CAF50", // Green for Accepted (success)
          "#F44336", // Red for Declined (error/rejection)
          "#9E9E9E", // Grey for Undelivered (inactive)
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const conversionBreakdownData = {
    labels: [
      "Sent to Dealer WhatsApp",
      "Accepted Whatsapp Out of Business Hours",
    ],
    datasets: [
      {
        label: "Count",
        data: [
          data.conversion.sentToDealerWhatsapp.total,
          data.conversion.acceptedOutBusinessHours.total,
        ],
        backgroundColor: ["#96CEB4", "#FECA57"],
        borderColor: ["#96CEB4", "#FECA57"],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label;
            const value = context.raw;
            let percentage = "0";
            if (data) {
              switch (context.dataIndex) {
                case 0:
                  percentage = data.general.followUp.percentage;
                  break;
                case 1:
                  percentage = data.general.accepted.percentage;
                  break;
                case 2:
                  percentage = data.general.declined.percentage;
                  break;
                case 3:
                  percentage = data.general.undelivered.percentage;
                  break;
              }
            }
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            let percentage = "";
            switch (context.dataIndex) {
              case 0:
                percentage = data.conversion.sentToDealerWhatsapp.percentage;
                break;
              case 1:
                percentage =
                  data.conversion.acceptedOutBusinessHours.percentage;
                break;
            }
            return `${percentage}% of total conversations`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Honda Analytics Dashboard</h1>
        <div className="summary-stats">
          <div className="stat-card">
            <h3>Total Tracked Conversations</h3>
            <p className="stat-number">
              {data.totalTrackedUsers.toLocaleString()}
            </p>
          </div>
          <div className="stat-card">
            <h3>Total Conversations</h3>
            <p className="stat-number">
              {data.totalHondaConversations.toLocaleString()}
            </p>
          </div>
        </div>
      </header>

      <div className="charts-container">
        <div className="chart-section">
          <h2>Lead Distribution</h2>
          <div className="chart-wrapper">
            <Pie data={mainDistributionData} options={pieOptions} />
          </div>
        </div>

        <div className="chart-section">
          <h2>Conversion Breakdown</h2>
          <div className="chart-wrapper">
            <Bar data={conversionBreakdownData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="details-section">
        <div className="detail-card">
          <h3>General Statistics</h3>
          <ul>
            <li>
              Accepted: {data.general.accepted.total.toLocaleString()} (
              {data.general.accepted.percentage}%)
            </li>
            <li>
              Declined: {data.general.declined.total.toLocaleString()} (
              {data.general.declined.percentage}%)
            </li>
            <li>
              Follow-up: {data.general.followUp.total.toLocaleString()} (
              {data.general.followUp.percentage}%)
            </li>
            <li>
              Undelivered: {data.general.undelivered.total.toLocaleString()} (
              {data.general.undelivered.percentage}%)
            </li>
          </ul>
        </div>

        <div className="detail-card">
          <h3>Conversion Details</h3>
          <ul>
            <li>
              Sent to Dealer WhatsApp:{" "}
              {data.conversion.sentToDealerWhatsapp.total.toLocaleString()} (
              {data.conversion.sentToDealerWhatsapp.percentage}%)
            </li>
            <li>
              Accepted Whatsapp Out of Business Hours:{" "}
              {data.conversion.acceptedOutBusinessHours.total.toLocaleString()}{" "}
              ({data.conversion.acceptedOutBusinessHours.percentage}%)
            </li>
          </ul>
        </div>

        <div className="detail-card">
          <h3>Follow-up Statistics</h3>
          <ul>
            <li>
              Accepted First Contact:{" "}
              {data.followUp.acceptedFirstContact.total.toLocaleString()} (
              {data.followUp.acceptedFirstContact.percentage}%)
            </li>
            <li>
              Accepted Second Contact:{" "}
              {data.followUp.acceptedSecondContact.total.toLocaleString()} (
              {data.followUp.acceptedSecondContact.percentage}%)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
