import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import StatCard from '../../components/StatCard';
import API from '../../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { FaChartLine, FaCheckCircle, FaExclamationTriangle, FaStar } from 'react-icons/fa';

const StudentAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get('/analytics/student');
      if (res.data.analytics) {
        setData(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load student analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <StudentLayout>
        <div className="text-center py-5 text-muted">Loading performance analytics...</div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="mb-4">
        <h3 className="fw-extrabold mb-1">Performance Analytics</h3>
        <p className="text-muted small mb-0">Deep dive insights into your AI mock practice performance over time</p>
      </div>

      {/* STAT CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <StatCard title="Total Completed" value={data.totalInterviews || 0} icon={FaChartLine} color="primary" />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard title="Average Score" value={`${data.averageScore || 0}%`} icon={FaStar} color="warning" />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard title="Best Score" value={`${data.bestScore || 0}%`} icon={FaCheckCircle} color="success" />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard title="HR Recruitment Interviews" value={data.hrCount || 0} icon={FaChartLine} color="info" />
        </div>
      </div>

      {/* SCORE TREND CHART */}
      <div className="card card-custom p-4 mb-4 shadow-sm">
        <h5 className="fw-bold text-dark mb-3">Score Progression Trend</h5>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data.scoreTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* STRENGTHS & RECOMMENDATIONS */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card card-custom p-4 shadow-sm h-100">
            <h5 className="fw-bold text-success mb-3 d-flex align-items-center gap-2">
              <FaCheckCircle /> Identified Strong Areas
            </h5>
            <div className="d-flex flex-wrap gap-2">
              {(data.strongAreas && data.strongAreas.length > 0 ? data.strongAreas : ["Technical Knowledge", "Problem Solving"]).map((item, i) => (
                <span key={i} className="badge bg-success bg-opacity-15 text-success border border-success px-3 py-2 fs-6">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card card-custom p-4 shadow-sm h-100">
            <h5 className="fw-bold text-warning mb-3 d-flex align-items-center gap-2">
              <FaExclamationTriangle /> Practice Recommendations
            </h5>
            <div className="d-flex flex-wrap gap-2">
              {(data.weakAreas && data.weakAreas.length > 0 ? data.weakAreas : ["Situational Negotiation", "Quantitative Metrics Examples"]).map((item, i) => (
                <span key={i} className="badge bg-warning bg-opacity-15 text-dark border border-warning px-3 py-2 fs-6">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentAnalytics;
