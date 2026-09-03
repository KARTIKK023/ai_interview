import React, { useState, useEffect } from 'react';

import StudentLayout from '../../components/StudentLayout';
import StatCard from '../../components/StatCard';
import API from '../../services/api';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import {
  FaChartLine,
  FaCheckCircle,
  FaStar,
  FaArrowUp,
  FaBullseye,
  FaLightbulb,
  FaTrophy,
} from 'react-icons/fa';

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

  if (loading) {
    return (
      <StudentLayout>
        <div className="container-fluid py-5">
          <div className="d-flex flex-column align-items-center justify-content-center">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
              style={{
                width: '2.5rem',
                height: '2.5rem',
              }}
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <h6 className="fw-bold text-dark mb-1">
              Loading your analytics
            </h6>

            <p className="text-muted small mb-0">
              Preparing your interview performance insights...
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!data) {
    return (
      <StudentLayout>
        <div className="container-fluid py-5">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body text-center py-5">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
                style={{
                  width: '70px',
                  height: '70px',
                }}
              >
                <FaChartLine
                  className="text-muted"
                  size={28}
                />
              </div>

              <h5 className="fw-bold text-dark mb-2">
                Analytics unavailable
              </h5>

              <p className="text-muted mb-0">
                We couldn't load your performance analytics right
                now. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const scoreTrend = Array.isArray(data.scoreTrend)
    ? data.scoreTrend
    : [];

  const strongAreas =
    data.strongAreas && data.strongAreas.length > 0
      ? data.strongAreas
      : ['Technical Knowledge', 'Problem Solving'];

  const weakAreas =
    data.weakAreas && data.weakAreas.length > 0
      ? data.weakAreas
      : [
          'Situational Negotiation',
          'Quantitative Metrics Examples',
        ];

  const averageScore = Number(data.averageScore || 0);
  const bestScore = Number(data.bestScore || 0);
  const totalInterviews = Number(data.totalInterviews || 0);

  /*
   * Modern chart tooltip
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    return (
      <div
        className="bg-white border-0 rounded-4 shadow-lg px-3 py-3"
        style={{
          minWidth: '155px',
        }}
      >
        <div
          className="small text-muted mb-1"
          style={{ fontSize: '11px' }}
        >
          {label}
        </div>

        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
            }}
          />

          <span className="small text-muted">
            Score
          </span>

          <span className="fw-bold text-dark ms-auto">
            {payload[0].value}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <StudentLayout>
      <div className="container-fluid px-0">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">

            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10"
                  style={{
                    width: '40px',
                    height: '40px',
                  }}
                >
                  <FaChartLine
                    className="text-primary"
                    size={18}
                  />
                </div>

                <span className="text-primary fw-semibold small">
                  PERFORMANCE CENTER
                </span>
              </div>

              <h3 className="fw-bold text-dark mb-1">
                Performance Analytics
              </h3>

              <p className="text-muted mb-0">
                Track your interview performance and identify
                areas where you can improve.
              </p>
            </div>

          </div>
        </div>


        {/* =====================================================
            STAT CARDS
        ====================================================== */}

        <div className="row g-3 mb-4">

          <div className="col-xl-4 col-md-6">
            <StatCard
              title="Total Completed interviews"
              value={totalInterviews}
              icon={FaChartLine}
              color="primary"
            />
          </div>

          <div className="col-xl-4 col-md-6">
            <StatCard
              title="Best Score"
              value={`${bestScore}%`}
              icon={FaTrophy}
              color="success"
            />
          </div>

          {/* OVERALL AVERAGE */}

          <div className="col-xl-4 col-md-12">

            <div
              className="card border-0 shadow-sm rounded-4 h-100"
              style={{
                minHeight: '100px',
              }}
            >
              <div className="card-body px-4 py-3">

                <div className="d-flex align-items-center justify-content-between h-100">

                  <div>
                    <div className="text-muted small mb-1">
                      Overall Average
                    </div>

                    <div className="d-flex align-items-end gap-2">
                      <span
                        className="fw-bold text-dark"
                        style={{
                          fontSize: '30px',
                          lineHeight: 1,
                        }}
                      >
                        {averageScore}%
                      </span>

                      <span className="text-success small fw-semibold mb-1">
                        <FaArrowUp
                          size={10}
                          className="me-1"
                        />
                        Overall
                      </span>
                    </div>
                  </div>

                  <div
                    className="d-flex align-items-center justify-content-center rounded-4 bg-warning bg-opacity-10"
                    style={{
                      width: '52px',
                      height: '52px',
                    }}
                  >
                    <FaStar
                      className="text-warning"
                      size={23}
                    />
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>


        {/* =====================================================
            SCORE TREND
        ====================================================== */}

        <div className="card border-0 shadow-sm rounded-4 mb-4">

          <div className="card-body p-4">

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

              <div>
                <div className="d-flex align-items-center gap-2 mb-1">

                  <h5 className="fw-bold text-dark mb-0">
                    Score Progression
                  </h5>

                  <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1">
                    Performance
                  </span>

                </div>

                <p className="text-muted small mb-0">
                  See how your interview scores have changed
                  over time.
                </p>
              </div>


              {/* Current average */}

              <div
                className="text-md-end px-3 py-2 rounded-3"
                style={{
                  background: '#f8f9fc',
                }}
              >
                <div
                  className="text-muted"
                  style={{
                    fontSize: '11px',
                  }}
                >
                  CURRENT AVERAGE
                </div>

                <div className="fw-bold text-primary fs-5">
                  {averageScore}%
                </div>
              </div>

            </div>


            {scoreTrend.length > 0 ? (

              <div
                style={{
                  width: '100%',
                  height: 350,
                }}
              >

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={scoreTrend}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -15,
                      bottom: 5,
                    }}
                  >

                    <defs>

                      <linearGradient
                        id="scoreGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#4f46e5"
                          stopOpacity={0.22}
                        />

                        <stop
                          offset="100%"
                          stopColor="#4f46e5"
                          stopOpacity={0.01}
                        />
                      </linearGradient>

                    </defs>


                    <CartesianGrid
                      strokeDasharray="4 6"
                      vertical={false}
                      stroke="#e9ecef"
                    />


                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 12,
                        fill: '#6c757d',
                      }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />


                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fontSize: 12,
                        fill: '#6c757d',
                      }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        `${value}%`
                      }
                    />


                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: '#4f46e5',
                        strokeWidth: 1,
                        strokeDasharray: '4 4',
                      }}
                    />


                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      fill="url(#scoreGradient)"
                      dot={{
                        r: 4,
                        fill: '#ffffff',
                        stroke: '#4f46e5',
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 7,
                        fill: '#4f46e5',
                        stroke: '#ffffff',
                        strokeWidth: 3,
                      }}
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            ) : (

              <div
                className="d-flex flex-column align-items-center justify-content-center bg-light rounded-4"
                style={{
                  height: '350px',
                }}
              >

                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm mb-3"
                  style={{
                    width: '64px',
                    height: '64px',
                  }}
                >
                  <FaChartLine
                    size={25}
                    className="text-muted"
                  />
                </div>

                <h6 className="fw-bold text-dark mb-1">
                  Not enough data yet
                </h6>

                <p
                  className="text-muted small mb-0 text-center"
                  style={{
                    maxWidth: '360px',
                  }}
                >
                  Complete more mock interviews to see your
                  score progression here.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* =====================================================
            PERFORMANCE SUMMARY
        ====================================================== */}

        <div className="row g-3 mb-3">

          <div className="col-lg-4">

            <div className="card border-0 shadow-sm rounded-4 h-100">

              <div className="card-body p-4">

                <div className="d-flex align-items-center gap-3 mb-4">

                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 bg-warning bg-opacity-10"
                    style={{
                      width: '44px',
                      height: '44px',
                    }}
                  >
                    <FaStar
                      className="text-warning"
                      size={19}
                    />
                  </div>

                  <div>
                    <h6 className="fw-bold text-dark mb-1">
                      Performance Summary
                    </h6>

                    <span className="text-muted small">
                      Your current performance
                    </span>
                  </div>

                </div>


                {/* Average */}

                <div className="mb-4">

                  <div className="d-flex justify-content-between mb-2">

                    <span className="text-muted small">
                      Overall Average
                    </span>

                    <span className="fw-bold text-dark">
                      {averageScore}%
                    </span>

                  </div>

                  <div
                    className="progress"
                    style={{
                      height: '8px',
                      backgroundColor: '#eef0f4',
                    }}
                  >
                    <div
                      className="progress-bar bg-primary rounded-pill"
                      style={{
                        width: `${Math.min(
                          Math.max(averageScore, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                </div>


                {/* Best Score */}

                <div>

                  <div className="d-flex justify-content-between mb-2">

                    <span className="text-muted small">
                      Best Score
                    </span>

                    <span className="fw-bold text-success">
                      {bestScore}%
                    </span>

                  </div>

                  <div
                    className="progress"
                    style={{
                      height: '8px',
                      backgroundColor: '#eef0f4',
                    }}
                  >
                    <div
                      className="progress-bar bg-success rounded-pill"
                      style={{
                        width: `${Math.min(
                          Math.max(bestScore, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              STRONG AREAS
          ================================================== */}

          <div className="col-lg-4">

            <div className="card border-0 shadow-sm rounded-4 h-100">

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-start mb-4">

                  <div className="d-flex align-items-center gap-3">

                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 bg-success bg-opacity-10"
                      style={{
                        width: '44px',
                        height: '44px',
                      }}
                    >
                      <FaCheckCircle
                        className="text-success"
                        size={19}
                      />
                    </div>

                    <div>
                      <h6 className="fw-bold text-dark mb-1">
                        Strong Areas
                      </h6>

                      <p className="text-muted small mb-0">
                        Where you're performing well.
                      </p>
                    </div>

                  </div>

                </div>


                <div className="d-flex flex-column gap-2">

                  {strongAreas.map((item, index) => (

                    <div
                      key={index}
                      className="d-flex align-items-center gap-3 border rounded-3 px-3 py-2"
                    >

                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10"
                        style={{
                          width: '30px',
                          height: '30px',
                          minWidth: '30px',
                        }}
                      >
                        <FaCheckCircle
                          className="text-success"
                          size={13}
                        />
                      </div>

                      <span className="fw-semibold text-dark small">
                        {item}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              PRACTICE RECOMMENDATIONS
          ================================================== */}

          <div className="col-lg-4">

            <div className="card border-0 shadow-sm rounded-4 h-100">

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-start mb-4">

                  <div className="d-flex align-items-center gap-3">

                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 bg-warning bg-opacity-10"
                      style={{
                        width: '44px',
                        height: '44px',
                      }}
                    >
                      <FaLightbulb
                        className="text-warning"
                        size={19}
                      />
                    </div>

                    <div>
                      <h6 className="fw-bold text-dark mb-1">
                        Practice Recommendations
                      </h6>

                      <p className="text-muted small mb-0">
                        Areas worth improving.
                      </p>
                    </div>

                  </div>

                </div>


                <div className="d-flex flex-column gap-2">

                  {weakAreas.map((item, index) => (

                    <div
                      key={index}
                      className="d-flex align-items-center gap-3 border rounded-3 px-3 py-2"
                    >

                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10"
                        style={{
                          width: '30px',
                          height: '30px',
                          minWidth: '30px',
                        }}
                      >
                        <FaLightbulb
                          className="text-warning"
                          size={13}
                        />
                      </div>

                      <span className="fw-semibold text-dark small">
                        {item}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            FINAL INSIGHT
        ====================================================== */}

        <div className="card border-0 shadow-sm rounded-4">

          <div className="card-body p-4">

            <div className="d-flex align-items-start gap-3">

              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0"
                style={{
                  width: '44px',
                  height: '44px',
                }}
              >
                <FaBullseye
                  className="text-primary"
                  size={19}
                />
              </div>

              <div>

                <h6 className="fw-bold text-dark mb-1">
                  Focus on consistent improvement
                </h6>

                <p className="text-muted small mb-0">
                  Use your strong areas as a foundation and spend
                  additional practice time on the recommended
                  areas. Regular mock interviews will make your
                  performance trend more meaningful.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </StudentLayout>
  );
};

export default StudentAnalytics;