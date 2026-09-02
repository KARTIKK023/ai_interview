import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Loading from '../../components/Loading';
import InterviewReportContent from '../../components/InterviewReportContent';
import API from '../../services/api';
import { FaHistory } from 'react-icons/fa';

const InterviewReport = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/interviews/${id}`);
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load interview report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <Loading message="Generating comprehensive AI Interview Report..." />;
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <div className="container py-4">
        {/* TOP NAVIGATION ACTIONS */}
        <div className="d-flex justify-content-end gap-2 mb-3">
          <Link to="/student/interviews" className="btn btn-outline-secondary btn-sm fw-semibold">
            <FaHistory className="me-1" /> All Interviews
          </Link>
          <Link to="/student/interview-preparation/ai-mock" className="btn btn-primary btn-sm fw-bold">
            Practice Again
          </Link>
        </div>

        {/* SHARED REPORT CONTENT */}
        <InterviewReportContent data={data} isModal={false} />
      </div>
    </div>
  );
};

export default InterviewReport;
