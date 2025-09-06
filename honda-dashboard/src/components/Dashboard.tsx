import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { AnalyticsData } from "../types/analytics";
import { AnalyticsService } from "../services/analyticsApi";
import "./Dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

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
              total: 6100,
              percentage: "20.82",
            },
            declined: {
              total: 3875,
              percentage: "13.23",
            },
            followUp: {
              total: 14414,
              percentage: "49.21",
            },
            undelivered: {
              total: 4890,
              percentage: "16.69",
            },
          },
          conversion: {
            sentToDealerWhatsapp: {
              total: 1775,
              percentage: "6.06",
            },
            acceptedOutBusinessHours: {
              total: 349,
              percentage: "1.19",
            },
          },
          followUp: {
            acceptedFirstContact: {
              total: 4933,
              percentage: "16.84",
            },
            acceptedSecondContact: {
              total: 787,
              percentage: "2.69",
            },
          },
          totalTrackedUsers: 29279,
          totalHondaConversations: 29293,
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
      "Accepted Whatsapp Contact",
      "Declined Whatsapp Contact",
      "Accepted without Whatsapp Contact",
    ],
    datasets: [
      {
        data: [
          data.conversion.sentToDealerWhatsapp.total,
          data.conversion.acceptedOutBusinessHours.total,
          data.general.accepted.total -
            data.conversion.sentToDealerWhatsapp.total -
            data.conversion.acceptedOutBusinessHours.total,
        ],
        backgroundColor: ["#4CAF50", "#F44336", "#9E9E9E"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const followUpBreakdownData = {
    labels: [
      "Accepted In First Contact",
      "Accepted In Second Contact",
      "Call Center Contact",
    ],
    datasets: [
      {
        data: [
          data.followUp.acceptedFirstContact.total,
          data.followUp.acceptedSecondContact.total,
          data.general.accepted.total -
            data.followUp.acceptedFirstContact.total -
            data.followUp.acceptedSecondContact.total,
        ],
        backgroundColor: ["#4CAF50", "#FF9800", "#9E9E9E"],
        borderWidth: 2,
        borderColor: "#fff",
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
            return `  ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const conversionPieOptions = {
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
              const totalAccepted = data.general.accepted.total;
              switch (context.dataIndex) {
                case 0:
                  percentage = (
                    (data.conversion.sentToDealerWhatsapp.total /
                      totalAccepted) *
                    100
                  ).toFixed(2);
                  break;
                case 1:
                  percentage = (
                    (data.conversion.acceptedOutBusinessHours.total /
                      totalAccepted) *
                    100
                  ).toFixed(2);
                  break;
                case 2:
                  const otherAccepted =
                    totalAccepted -
                    data.conversion.sentToDealerWhatsapp.total -
                    data.conversion.acceptedOutBusinessHours.total;
                  percentage = ((otherAccepted / totalAccepted) * 100).toFixed(
                    2
                  );
                  break;
              }
            }
            return ` ${value} (${percentage}% of accepted)`;
          },
        },
      },
    },
  };

  const followUpPieOptions = {
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
              const totalAccepted = data.general.accepted.total;
              switch (context.dataIndex) {
                case 0:
                  percentage = (
                    (data.followUp.acceptedFirstContact.total / totalAccepted) *
                    100
                  ).toFixed(2);
                  break;
                case 1:
                  percentage = (
                    (data.followUp.acceptedSecondContact.total /
                      totalAccepted) *
                    100
                  ).toFixed(2);
                  break;
                case 2:
                  const otherAcceptedFollowUp =
                    totalAccepted -
                    data.followUp.acceptedFirstContact.total -
                    data.followUp.acceptedSecondContact.total;
                  percentage = (
                    (otherAcceptedFollowUp / totalAccepted) *
                    100
                  ).toFixed(2);
                  break;
              }
            }
            return ` ${value} (${percentage}% of accepted)`;
          },
        },
      },
    },
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Honda Analytics Dashboard</h1>
        <div className="summary-stats">
          <div className="stat-card">
            <h3>Total Client Conversations</h3>
            <p className="stat-number">
              {data.totalTrackedUsers.toLocaleString()}
            </p>
          </div>
          {/* <div className="stat-card">
            <h3>Total Conversations</h3>
            <p className="stat-number">
              {data.totalHondaConversations.toLocaleString()}
            </p>
          </div> */}
        </div>
      </header>

      <div className="charts-container">
        <div className="chart-section">
          <h2>Lead Distribution</h2>
          <p className="chart-description">Distribution based on status</p>
          <div className="chart-wrapper">
            <Pie data={mainDistributionData} options={pieOptions} />
          </div>
        </div>

        <div className="chart-section">
          <h2>Whatsapp Conversion</h2>
          <p className="chart-description">
            Based on total accepted leads (
            {data.general.accepted.total.toLocaleString()})
          </p>
          <div className="chart-wrapper">
            <Pie
              data={conversionBreakdownData}
              options={conversionPieOptions}
            />
          </div>
        </div>

        <div className="chart-section">
          <h2>Accepted Conversion</h2>
          <p className="chart-description">
            Based on total accepted leads (
            {data.general.accepted.total.toLocaleString()})
          </p>
          <div className="chart-wrapper">
            <Pie data={followUpBreakdownData} options={followUpPieOptions} />
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
          <h3>Whatsapp Conversion Details</h3>
          <p style={{ fontSize: "0.8em", color: "#7f8c8d", fontWeight: "400" }}>
            Percentage base on total conversations
          </p>
          <ul>
            <li>
              Accepted Whatsapp Contact:{" "}
              {data.conversion.sentToDealerWhatsapp.total.toLocaleString()} (
              {data.conversion.sentToDealerWhatsapp.percentage}%)
            </li>
            <li>
              Declined Whatsapp Contact:{" "}
              {data.conversion.acceptedOutBusinessHours.total.toLocaleString()}{" "}
              ({data.conversion.acceptedOutBusinessHours.percentage}%)
            </li>
          </ul>
        </div>

        <div className="detail-card">
          <h3>Accepted Conversion</h3>
          <p style={{ fontSize: "0.8em", color: "#7f8c8d", fontWeight: "400" }}>
            Percentage base on total conversations
          </p>
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
            <li>
              Call Center Contact:{" "}
              {(data.general.accepted.total - data.followUp.acceptedFirstContact.total - data.followUp.acceptedSecondContact.total).toLocaleString()} (
              {(((data.general.accepted.total - data.followUp.acceptedFirstContact.total - data.followUp.acceptedSecondContact.total) / data.totalHondaConversations) * 100).toFixed(2)}%)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
