import React from 'react';

const ScoreCard = ({ title, score, criteriaScores = {} }) => {
  const getBadgeClass = (s) => {
    if (s >= 80) return 'bg-success';
    if (s >= 65) return 'bg-info text-dark';
    if (s >= 50) return 'bg-warning text-dark';
    return 'bg-danger';
  };

  const scoresMap = criteriaScores instanceof Map ? Object.fromEntries(criteriaScores) : criteriaScores;

  return (
    <div className="card card-custom p-4 text-center">
      <h6 className="text-muted text-uppercase fw-semibold mb-3">{title || 'Interview Score'}</h6>
      
      <div className="display-4 fw-extrabold text-primary mb-2">
        {score}%
      </div>

      <div className="mb-4">
        <span className={`badge ${getBadgeClass(score)} fs-6 px-3 py-2 rounded-pill`}>
          {score >= 80 ? 'Excellent Performance' : score >= 65 ? 'Good Understanding' : score >= 50 ? 'Needs Practice' : 'Requires Preparation'}
        </span>
      </div>

      {Object.keys(scoresMap).length > 0 && (
        <div className="text-start border-top pt-3">
          <h6 className="fw-bold mb-3 text-dark small text-uppercase">Role Evaluation Breakdown</h6>
          {Object.entries(scoresMap).map(([crit, val]) => (
            <div key={crit} className="mb-2">
              <div className="d-flex justify-content-between small mb-1">
                <span className="fw-semibold text-secondary">{crit}</span>
                <span className="fw-bold text-dark">{val}%</span>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div
                  className={`progress-bar ${val >= 75 ? 'bg-success' : val >= 60 ? 'bg-primary' : 'bg-warning'}`}
                  role="progressbar"
                  style={{ width: `${val}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScoreCard;
