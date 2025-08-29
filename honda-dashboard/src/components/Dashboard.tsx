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
              total: 5637,
              percentage: "20.50",
            },
            declined: {
              total: 3619,
              percentage: "13.16",
            },
            followUp: {
              total: 13578,
              percentage: "49.39",
            },
            undelivered: {
              total: 4648,
              percentage: "16.91",
            },
          },
          conversion: {
            sentToDealerWhatsapp: {
              total: 1685,
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
              total: 716,
              percentage: "2.60",
            },
          },
          totalTrackedUsers: 22834,
          totalHondaConversations: 27494,
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
    labels: [
      "Non-Qualified (Follow-up)",
      "Qualified Accept",
      "Qualified Reject",
    ],
    datasets: [
      {
        data: [
          data.nonQualifiedInFollowUpUsers.total,
          data.qualifiedAcceptUsers.total,
          data.qualifiedRejectUsers.total,
        ],
        backgroundColor: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const acceptedUsersBreakdownData = {
    labels: [
      "Offered WhatsApp",
      "Accept in First Contact",
      "Out of Business Hours",
    ],
    datasets: [
      {
        label: "Count",
        data: [
          data.qualifiedAcceptUsers.customCases?.offeredWhatsappNumber.total ||
            0,
          data.qualifiedAcceptUsers.customCases?.acceptInFirstContactStep
            .total || 0,
          data.qualifiedAcceptUsers.customCases?.outOfBusinessHours.total || 0,
        ],
        backgroundColor: ["#96CEB4", "#FECA57", "#FF9FF3"],
        borderColor: ["#96CEB4", "#FECA57", "#FF9FF3"],
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
            const percentage = data
              ? context.dataIndex === 0
                ? data.nonQualifiedInFollowUpUsers.percentage
                : context.dataIndex === 1
                ? data.qualifiedAcceptUsers.percentage
                : data.qualifiedRejectUsers.percentage
              : "0";
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
            const customCases = data.qualifiedAcceptUsers.customCases;
            if (!customCases) return "";

            let percentage = "";
            switch (context.dataIndex) {
              case 0:
                percentage =
                  customCases.offeredWhatsappNumber.percentageBasedOnAccepts;
                break;
              case 1:
                percentage =
                  customCases.acceptInFirstContactStep.percentageBasedOnAccepts;
                break;
              case 2:
                percentage =
                  customCases.outOfBusinessHours.percentageBasedOnAccepts;
                break;
            }
            return `${percentage}% of accepted users`;
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
            <h3>Total Tracked Users</h3>
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
          <h2>Qualified Accept Users Breakdown</h2>
          <div className="chart-wrapper">
            <Bar data={acceptedUsersBreakdownData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="details-section">
        <div className="detail-card">
          <h3>Non-Qualified Follow-up Users</h3>
          <p>
            {data.nonQualifiedInFollowUpUsers.total.toLocaleString()} (
            {data.nonQualifiedInFollowUpUsers.percentage}%)
          </p>
        </div>

        <div className="detail-card">
          <h3>Qualified Accept Users</h3>
          <p>
            {data.qualifiedAcceptUsers.total.toLocaleString()} (
            {data.qualifiedAcceptUsers.percentage}%)
          </p>
          {data.qualifiedAcceptUsers.customCases && (
            <ul>
              <li>
                Offered WhatsApp:{" "}
                {data.qualifiedAcceptUsers.customCases.offeredWhatsappNumber.total.toLocaleString()}{" "}
                (
                {
                  data.qualifiedAcceptUsers.customCases.offeredWhatsappNumber
                    .percentageBasedOnAccepts
                }
                %)
              </li>
              <li>
                Accept in First Contact:{" "}
                {data.qualifiedAcceptUsers.customCases.acceptInFirstContactStep.total.toLocaleString()}{" "}
                (
                {
                  data.qualifiedAcceptUsers.customCases.acceptInFirstContactStep
                    .percentageBasedOnAccepts
                }
                %)
              </li>
              <li>
                Out of Business Hours:{" "}
                {data.qualifiedAcceptUsers.customCases.outOfBusinessHours.total.toLocaleString()}{" "}
                (
                {
                  data.qualifiedAcceptUsers.customCases.outOfBusinessHours
                    .percentageBasedOnAccepts
                }
                %)
              </li>
            </ul>
          )}
        </div>

        <div className="detail-card">
          <h3>Qualified Reject Users</h3>
          <p>
            {data.qualifiedRejectUsers.total.toLocaleString()} (
            {data.qualifiedRejectUsers.percentage}%)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
