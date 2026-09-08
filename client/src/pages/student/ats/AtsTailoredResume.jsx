import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaDownload,
  FaMagic,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLock,
  FaTimes,
  FaEdit,
  FaSave,
  FaEye,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import StudentLayout from '../../../components/StudentLayout';
import { atsApi, errorMessage, normalizeScan } from './atsApi';

const AtsTailoredResume = () => {
  const { id } = useParams();

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState('tailored');
  const [draft, setDraft] = useState(null);
  const [originalPdfUrl, setOriginalPdfUrl] = useState('');
  const [tailoredPdfUrl, setTailoredPdfUrl] = useState('');

  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    atsApi
      .getScan(id)
      .then((response) => {
        setScan(normalizeScan(response.data?.scan));
      })
      .catch((error) => {
        toast.error(
          errorMessage(error, 'Unable to load ATS analysis.')
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!scan?.tailoredResume) return;
    setDraft(JSON.parse(JSON.stringify(scan.tailoredResume)));
  }, [scan?.tailoredResume]);

  useEffect(() => {
    if (!generating) return undefined;
    const timer = window.setInterval(() => setGenerationStage((current) => Math.min(current + 1, 4)), 1200);
    return () => window.clearInterval(timer);
  }, [generating]);

  useEffect(() => () => {
    if (originalPdfUrl) URL.revokeObjectURL(originalPdfUrl);
    if (tailoredPdfUrl) URL.revokeObjectURL(tailoredPdfUrl);
  }, [originalPdfUrl, tailoredPdfUrl]);

  const handleUnlock = () => {
    setShowUnlockModal(true);
  };

  const continueWithDemo = () => {
    setPremiumUnlocked(true);
    setShowUnlockModal(false);

    toast.success('Premium preview unlocked for this demo.');
  };

  const generate = async () => {
    if (!premiumUnlocked) {
      handleUnlock();
      return;
    }

    try {
      setGenerating(true);
      setGenerationStage(0);

      const response = await atsApi.optimize(id);

      setScan(normalizeScan(response.data?.scan));
      await loadTailoredPreview();

      toast.success(
        response.data?.cached
          ? 'Existing tailored resume loaded.'
          : 'Tailored resume generated.'
      );
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          'Unable to generate tailored resume.'
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  const download = async () => {
    if (!premiumUnlocked) {
      handleUnlock();
      return;
    }

    try {
      const response = await atsApi.downloadOptimized(id);

      const url = URL.createObjectURL(
        new Blob([response.data], {
          type: 'application/pdf',
        })
      );

      const link = document.createElement('a');
      link.href = url;
      link.download = 'ATS-Tailored-Resume.pdf';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          'Unable to download tailored resume.'
        )
      );
    }
  };

  const loadOriginalPreview = async () => {
    if (originalPdfUrl || !scan?.resumeId) return;
    try {
      const response = await atsApi.downloadOriginal(scan.resumeId);
      setOriginalPdfUrl(URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' })));
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to preview the original resume.'));
    }
  };

  const loadTailoredPreview = async () => {
    if (tailoredPdfUrl || !premiumUnlocked) return;
    try {
      const response = await atsApi.downloadOptimized(id);
      setTailoredPdfUrl(URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' })));
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to preview the tailored resume.'));
    }
  };

  const saveEdits = async () => {
    if (!premiumUnlocked || !draft) return handleUnlock();
    try {
      setSaving(true);
      const response = await atsApi.updateTailoredResume(id, draft);
      setScan(normalizeScan(response.data?.scan));
      setEditing(false);
      toast.success('Tailored resume saved and re-scored.');
    } catch (error) {
      toast.error(errorMessage(error, 'Unable to save tailored resume edits.'));
    } finally {
      setSaving(false);
    }
  };

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const updateExperienceBullet = (experienceIndex, bulletIndex, value) => {
    setDraft((current) => ({
      ...current,
      experience: current.experience.map((item, index) => index !== experienceIndex ? item : {
        ...item,
        bullets: item.bullets.map((bullet, currentBulletIndex) => currentBulletIndex === bulletIndex ? value : bullet)
      })
    }));
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="text-center">
            <div
              className="spinner-border text-primary mb-3"
              style={{
                width: '2.25rem',
                height: '2.25rem',
              }}
            />

            <p className="text-secondary mb-0">
              Loading tailored resume...
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!scan) {
    return (
      <StudentLayout>
        <div className="container-fluid px-0">
          <div className="alert alert-danger border-0 rounded-4 shadow-sm">
            This analysis is unavailable.
          </div>
        </div>
      </StudentLayout>
    );
  }

  const resume = scan.tailoredResume;
  const target = scan.targetJob || {};
  const projection = scan.optimization || {};
  const hasProjectedScore = Number.isFinite(projection.projectedScore);
  const scoreIncrease = Number.isFinite(projection.scoreIncrease)
    ? projection.scoreIncrease
    : hasProjectedScore
      ? projection.projectedScore - scan.overallScore
      : null;

  return (
    <StudentLayout>
      <div
        className="container-fluid px-0"
        style={{
          maxWidth: '1380px',
          margin: '0 auto',
        }}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <Link
              to={`/student/ats-scanner/analysis/${id}`}
              className="text-decoration-none text-secondary small fw-medium"
            >
              <FaArrowLeft className="me-2" />
              Back to Analysis
            </Link>

            <div className="d-flex align-items-center mt-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 me-3"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#f2f2f7',
                }}
              >
                <FaFileAlt
                  className="text-primary"
                  size={20}
                />
              </div>

              <div>
                <h2
                  className="fw-bold mb-1"
                  style={{
                    letterSpacing: '-0.8px',
                  }}
                >
                  Tailored Resume
                </h2>

                <p className="text-secondary mb-0">
                  Optimized for{' '}
                  <span className="fw-medium text-dark">
                    {target.target_job_role ||
                      'your target job'}
                  </span>

                  {target.target_company
                    ? ` · ${target.target_company}`
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {resume && (
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={download}
            >
              <FaDownload className="me-2" />
              Download PDF
            </button>
          )}
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <div className="card-body p-4 p-lg-5">
            <div className="small text-uppercase text-secondary fw-semibold mb-3">Score outlook for this target job</div>
            <div className="row align-items-center g-4">
              <div className="col-md-4">
                <div className="text-secondary small mb-1">Current ATS Score</div>
                <div className="display-5 fw-bold text-dark">{scan.overallScore}<small className="fs-6 text-secondary"> / 100</small></div>
              </div>
              <div className="col-md-1 text-center text-secondary fs-3">&#8594;</div>
              <div className="col-md-4">
                <div className="text-secondary small mb-1">Projected ATS Score</div>
                {hasProjectedScore ? <><div className="display-5 fw-bold text-primary">{projection.projectedScore}<small className="fs-6 text-secondary"> / 100</small></div><div className="small fw-semibold text-success">+{scoreIncrease} points projected</div></> : <div className="text-secondary">{projection.validation === 'no-reliable-improvement' ? 'No reliable score improvement was validated. The tailored version focuses on readability and job alignment.' : 'Generate the tailored resume to calculate a projection.'}</div>}
              </div>
              <div className="col-md-3"><div className="border-start ps-3"><div className="small text-secondary mb-1">Confidence</div><div className="fw-semibold text-capitalize">{projection.confidence || 'Not available yet'}</div><small className="text-secondary">Prediction, not a guarantee.</small></div></div>
            </div>
            {hasProjectedScore && <p className="small text-secondary mt-4 mb-0">Based on the changes made to your resume and its alignment with this target job, your tailored resume is projected to score {projection.projectedScore}/100. This is a prediction, not a guarantee.</p>}
          </div>
        </div>

        {!resume ? (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-5">
              <div
                className="mx-auto text-center"
                style={{
                  maxWidth: '620px',
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                  style={{
                    width: '82px',
                    height: '82px',
                    backgroundColor: '#edf3ff',
                  }}
                >
                  <FaMagic
                    className="text-primary"
                    size={30}
                  />
                </div>

                <h3
                  className="fw-bold mb-3"
                  style={{
                    letterSpacing: '-0.5px',
                  }}
                >
                  Create your tailored resume
                </h3>

                <p className="text-secondary lh-lg mb-4">
                  Your existing experience will be preserved
                  while the wording and presentation are aligned
                  with the requirements of your selected target
                  job.
                </p>

                <button
                  type="button"
                  className="btn btn-primary btn-lg px-4"
                  onClick={generate}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Generating Resume...
                    </>
                  ) : (
                    <>
                      <FaMagic className="me-2" />
                      Generate Resume
                    </>
                  )}
                </button>

                {generating && (
                  <div className="text-start bg-light rounded-4 p-3 mt-4 small">
                    <div className="fw-semibold mb-2">Preparing your tailored resume</div>
                    {['Parsing your original resume', 'Analyzing the target job', 'Optimizing supported content', 'Re-scoring ATS compatibility', 'Preparing resume preview'].map((stage, index) => <div className={index <= generationStage ? 'text-success mb-1' : 'text-secondary mb-1'} key={stage}>{index <= generationStage ? '✓' : '○'} <span className="ms-2">{stage}</span></div>)}
                  </div>
                )}

                <div className="row g-3 mt-5 text-start">
                  <div className="col-md-4">
                    <div
                      className="p-3 rounded-4 h-100"
                      style={{
                        backgroundColor: '#f7f7f8',
                      }}
                    >
                      <div className="fw-semibold mb-1">
                        Preserve
                      </div>

                      <small className="text-secondary">
                        Your real experience and achievements
                        remain intact.
                      </small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      className="p-3 rounded-4 h-100"
                      style={{
                        backgroundColor: '#f7f7f8',
                      }}
                    >
                      <div className="fw-semibold mb-1">
                        Improve
                      </div>

                      <small className="text-secondary">
                        Wording is adjusted to better match the
                        target position.
                      </small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div
                      className="p-3 rounded-4 h-100"
                      style={{
                        backgroundColor: '#f7f7f8',
                      }}
                    >
                      <div className="fw-semibold mb-1">
                        Verify
                      </div>

                      <small className="text-secondary">
                        You remain in control of every final
                        change.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {(projection.explanation?.length > 0 || resume.tailoringChanges?.length > 0) && (
              <div className="row g-4 mb-4">
                {projection.explanation?.length > 0 && (
                  <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                      <div className="card-body p-4">
                        <h5 className="fw-bold mb-3">Why your score may improve</h5>
                        {projection.explanation.map((item, index) => (
                          <div className="border-bottom py-3" key={index}>
                            <div className="d-flex justify-content-between gap-3">
                              <strong>{item.category}</strong>
                              {item.scoreBefore != null && item.scoreAfter != null && <span className="small text-success">{item.scoreBefore} &#8594; {item.scoreAfter}</span>}
                            </div>
                            <p className="small text-secondary mb-0 mt-1">{item.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {resume.tailoringChanges?.length > 0 && (
                  <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                      <div className="card-body p-4">
                        <h5 className="fw-bold mb-3">What we improved</h5>
                        {resume.tailoringChanges.map((item, index) => (
                          <div className="border-bottom py-3" key={index}>
                            <div className="fw-semibold">{item.section}</div>
                            <p className="small text-secondary mb-1">{item.change}</p>
                            {item.reason && <small className="text-muted">{item.reason}</small>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {projection.projectedScores && (
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">Original vs tailored outlook</h5>
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead><tr><th>Metric</th><th>Original</th><th>Projected</th></tr></thead>
                      <tbody>{Object.entries(scan.scores).map(([key, value]) => <tr key={key}><td>{key.replace(/([A-Z])/g, ' $1')}</td><td>{value}/100</td><td>{projection.projectedScores[key] == null ? 'Not available' : `${projection.projectedScores[key]}/100`}</td></tr>)}</tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
              <div>
                <h4 className="fw-bold mb-1">Your resume, two ways</h4>
                <p className="small text-secondary mb-0">Review the original document or the tailored version before downloading.</p>
              </div>
              <div className="btn-group" role="group" aria-label="Resume preview mode">
                <button type="button" className={`btn ${previewMode === 'original' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => { setPreviewMode('original'); loadOriginalPreview(); }}><FaEye className="me-2" />Original</button>
                <button type="button" className={`btn ${previewMode === 'tailored' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => { if (!premiumUnlocked) { handleUnlock(); return; } setPreviewMode('tailored'); loadTailoredPreview(); }}><FaMagic className="me-2" />Tailored</button>
              </div>
            </div>

            {/* {previewMode === 'tailored' && (
              <div className="d-flex justify-content-end mb-3">
                <button type="button" className="btn btn-outline-primary" onClick={() => setEditing((current) => !current)}><FaEdit className="me-2" />{editing ? 'Close Editor' : 'Edit Resume'}</button>
              </div>
            )} */}

            {/* {editing && draft && previewMode === 'tailored' && (
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="fw-bold mb-0">Edit Resume</h5><button type="button" className="btn btn-primary" onClick={saveEdits} disabled={saving}>{saving ? <span className="spinner-border spinner-border-sm me-2" /> : <FaSave className="me-2" />}{saving ? 'Saving...' : 'Save and Re-score'}</button></div>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label fw-semibold" htmlFor="tailored-headline">Headline</label><input id="tailored-headline" className="form-control" value={draft.headline || ''} onChange={(event) => updateDraft('headline', event.target.value)} /></div>
                    <div className="col-12"><label className="form-label fw-semibold" htmlFor="tailored-summary">Professional Summary</label><textarea id="tailored-summary" className="form-control" rows="4" value={draft.professionalSummary || ''} onChange={(event) => updateDraft('professionalSummary', event.target.value)} /></div>
                    <div className="col-12"><label className="form-label fw-semibold" htmlFor="tailored-skills">Skills</label><input id="tailored-skills" className="form-control" value={(draft.skills || []).join(', ')} onChange={(event) => updateDraft('skills', event.target.value.split(',').map((skill) => skill.trim()).filter(Boolean))} /><small className="text-muted">Separate skills with commas. Only keep skills you can verify.</small></div>
                    {(draft.experience || []).map((item, experienceIndex) => <div className="col-12" key={experienceIndex}><label className="form-label fw-semibold">Experience: {[item.jobTitle, item.company].filter(Boolean).join(' | ') || `Entry ${experienceIndex + 1}`}</label>{(item.bullets || []).map((bullet, bulletIndex) => <textarea className="form-control mb-2" rows="2" key={bulletIndex} value={bullet} onChange={(event) => updateExperienceBullet(experienceIndex, bulletIndex, event.target.value)} aria-label={`Experience bullet ${bulletIndex + 1}`} />)}</div>)}
                  </div>
                  <div className="alert alert-info mt-3 mb-0 small">Your original uploaded resume remains unchanged. Saving creates a revised tailored artifact for this ATS scan.</div>
                </div>
              </div>
            )} */}

            {previewMode === 'original' ? (
              <>
                <div className="alert alert-success small mb-3">ATS format review: the original file is shown unchanged for comparison.</div>
                <div className="resume-document mb-4">
                  <div className="resume-document-body p-0">
                  {originalPdfUrl ? <iframe title="Original resume preview" src={originalPdfUrl} className="resume-original-frame w-100 border-0" /> : <div className="text-center py-5"><div className="spinner-border text-primary mb-3" /><p className="text-muted mb-0">Preparing original resume preview...</p></div>}
                  </div>
                </div>
              </>
            ) : (
              <>
                {tailoredPdfUrl ? (
                  <div className="resume-document mb-4">
                    <iframe title="Tailored resume preview" src={tailoredPdfUrl} className="resume-original-frame w-100 border-0" />
                  </div>
                ) : (
                  <div className="resume-document resume-preview-placeholder mb-4">
                    <div className="resume-document-body text-center">
                      <FaFileAlt className="text-primary mb-3" size={28} />
                      <h5 className="fw-bold">Tailored document preview</h5>
                      <p className="text-secondary small mb-3">Generate or unlock the tailored PDF to view it in the same document viewer as the original resume.</p>
                      <button type="button" className="btn btn-primary" onClick={generate} disabled={generating}>{generating ? 'Generating...' : resume ? 'Prepare Preview' : 'Generate Resume'}</button>
                    </div>
                  </div>
                )}

                <div className="d-none">
            <div className="alert alert-success border-0 shadow-sm rounded-4 d-flex align-items-start gap-2 mb-4 small">
              <FaCheckCircle className="mt-1 flex-shrink-0" />
              <span><strong>ATS-friendly format</strong> · standard headings and a single-column structure are used for clean parsing. This is a format assessment, not a guarantee of any employer's parser.</span>
            </div>

            <div className="row g-4 align-items-start">
              <div className="col-xl-8">
                <div className="resume-document">
                  <div className="resume-document-body">
                    <div className="border-bottom pb-4 mb-4">
                      <h1
                        className="fw-bold mb-2"
                        style={{
                          fontSize: '2rem',
                          letterSpacing: '-1px',
                        }}
                      >
                        {resume.headline ||
                          'Targeted Resume'}
                      </h1>

                      {resume.contact && (
                        <div className="small text-secondary mb-2">
                          {[resume.contact.name, resume.contact.email, resume.contact.phone, resume.contact.location, ...(resume.contact.links || [])].filter(Boolean).join(' · ')}
                        </div>
                      )}

                      {/* <div className="small text-secondary">
                        Tailored for{' '}
                        {target.target_job_role ||
                          'your target position'}

                        {target.target_company
                          ? ` · ${target.target_company}`
                          : ''}
                      </div> */}
                    </div>

                    <section className="mb-5">
                      <h5 className="fw-bold mb-3">
                        Professional Summary
                      </h5>

                      <p className="text-secondary lh-lg mb-0">
                        {resume.professionalSummary ||
                          'No summary generated.'}
                      </p>
                    </section>

                    <section className="mb-5">
                      <h5 className="fw-bold mb-3">
                        Skills
                      </h5>

                      <div className="resume-skills">
                        {resume.skillCategories?.length ? (
                          resume.skillCategories.map((category, index) => (
                            <div className="small mb-2" key={index}><strong>{category.category}:</strong> <span className="text-secondary">{category.skills.join(', ')}</span></div>
                          ))
                        ) : resume.skills?.length ? (
                          resume.skills.map(
                            (skill, index) => (
                              <span
                                key={index}
                                className="small text-secondary"
                              >
                                {skill}{index < resume.skills.length - 1 ? ', ' : ''}
                              </span>
                            )
                          )
                        ) : (
                          <span className="text-secondary">
                            No skills listed.
                          </span>
                        )}
                      </div>
                    </section>

                    <div
                      className={
                        !premiumUnlocked
                          ? 'premium-resume-wrapper'
                          : ''
                      }
                    >
                      <div
                        className={
                          !premiumUnlocked
                            ? 'premium-resume-content'
                            : ''
                        }
                      >
                        <section className="mb-5">
                          <h5 className="fw-bold mb-4">
                            Experience
                          </h5>

                          {(resume.experience || []).length ? (
                            resume.experience.map(
                              (item, index) => (
                                <div
                                  className="pb-4 mb-4 border-bottom"
                                  key={index}
                                >
                                  <div className="d-flex justify-content-between align-items-start gap-3">
                                    <div>
                                      <div className="fw-semibold fs-6">
                                        {[
                                          item.jobTitle,
                                          item.company,
                                        ]
                                          .filter(Boolean)
                                          .join(' | ')}
                                      </div>

                                      <div className="small text-secondary mt-1">
                                        {[
                                          item.location,
                                          item.dates,
                                        ]
                                          .filter(Boolean)
                                          .join(' · ')}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-3">
                                    {(item.bullets || []).map(
                                      (
                                        bullet,
                                        bulletIndex
                                      ) => (
                                        <div
                                          className="d-flex align-items-start mb-2"
                                          key={bulletIndex}
                                        >
                                          <span
                                            className="me-2 text-secondary"
                                            style={{
                                              marginTop: '2px',
                                            }}
                                          >
                                            •
                                          </span>

                                          <span className="text-secondary lh-lg">
                                            {bullet}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-secondary">
                              No experience listed.
                            </p>
                          )}
                        </section>

                        <section className="mb-5">
                          <h5 className="fw-bold mb-4">
                            Projects
                          </h5>

                          {(resume.projects || []).length ? (
                            resume.projects.map(
                              (item, index) => (
                                <div
                                  className="pb-4 mb-4 border-bottom"
                                  key={index}
                                >
                                  <div className="fw-semibold">
                                    {item.name || 'Project'}
                                  </div>

                                  {item.description && (
                                    <p className="text-secondary lh-lg mt-2 mb-2">
                                      {item.description}
                                    </p>
                                  )}

                                  {(item.bullets || []).map(
                                    (
                                      bullet,
                                      bulletIndex
                                    ) => (
                                      <div
                                        className="d-flex align-items-start mb-2"
                                        key={bulletIndex}
                                      >
                                        <span className="me-2 text-secondary">
                                          •
                                        </span>

                                        <span className="text-secondary lh-lg">
                                          {bullet}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-secondary">
                              No projects listed.
                            </p>
                          )}
                        </section>

                        <section className="mb-5">
                          <h5 className="fw-bold mb-4">
                            Education
                          </h5>

                          {(resume.education || []).length ? (
                            resume.education.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="mb-3"
                                >
                                  <div className="fw-medium">
                                    {[
                                      item.degree,
                                      item.institution,
                                    ]
                                      .filter(Boolean)
                                      .join(' | ')}
                                  </div>

                                  <div className="small text-secondary mt-1">
                                    {[
                                      item.dates,
                                      item.details,
                                    ]
                                      .filter(Boolean)
                                      .join(' · ')}
                                  </div>
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-secondary">
                              No education information listed.
                            </p>
                          )}
                        </section>

                        <section className="mb-5">
                          <h5 className="fw-bold mb-4">
                            Certifications
                          </h5>

                          {(resume.certifications || [])
                            .length ? (
                            resume.certifications.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="mb-3"
                                >
                                  <div className="fw-medium">
                                    {[
                                      item.name,
                                      item.issuer,
                                    ]
                                      .filter(Boolean)
                                      .join(' | ')}
                                  </div>

                                  {item.date && (
                                    <div className="small text-secondary mt-1">
                                      {item.date}
                                    </div>
                                  )}
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-secondary">
                              No certifications listed.
                            </p>
                          )}
                        </section>

                        {resume.additionalSections?.map(
                          (item, index) => (
                            <section
                              key={index}
                              className="mb-5"
                            >
                              <h5 className="fw-bold mb-3">
                                {item.title}
                              </h5>

                              <p className="text-secondary lh-lg mb-0">
                                {item.content}
                              </p>
                            </section>
                          )
                        )}
                      </div>

                      {!premiumUnlocked && (
                        <div className="premium-resume-fade">
                          <button
                            type="button"
                            className="btn btn-primary rounded-pill px-4 py-2 shadow-sm"
                            onClick={handleUnlock}
                          >
                            <FaLock
                              className="me-2"
                              size={12}
                            />
                            Unlock Full Resume
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-top">
                      <button
                        type="button"
                        className="btn btn-primary px-4"
                        onClick={download}
                      >
                        <FaDownload className="me-2" />
                        Download Tailored PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-4">
                <div
                  className="card border-0 shadow-sm rounded-4 mb-4"
                  style={{
                    position: 'sticky',
                    top: '20px',
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3 me-3"
                        style={{
                          width: '42px',
                          height: '42px',
                          backgroundColor: '#edf3ff',
                        }}
                      >
                        <FaMagic className="text-primary" />
                      </div>

                      <div>
                        <h5 className="fw-bold mb-1">
                          Resume Optimization
                        </h5>

                        <small className="text-secondary">
                          Changes made for this role
                        </small>
                      </div>
                    </div>

                    <div
                      className={
                        !premiumUnlocked
                          ? 'premium-sidebar-wrapper'
                          : ''
                      }
                    >
                      <div
                        className={
                          !premiumUnlocked
                            ? 'premium-sidebar-content'
                            : ''
                        }
                      >
                        {resume.tailoringNotes?.length > 0 ? (
                          resume.tailoringNotes.map(
                            (note, index) => (
                              <div
                                key={index}
                                className="d-flex align-items-start py-3 border-bottom"
                              >
                                <FaCheckCircle
                                  className="text-success me-3 mt-1 flex-shrink-0"
                                  size={14}
                                />

                                <span className="small text-secondary lh-lg">
                                  {note}
                                </span>
                              </div>
                            )
                          )
                        ) : (
                          <p className="small text-secondary mb-0">
                            No tailoring notes were returned.
                          </p>
                        )}
                      </div>

                      {!premiumUnlocked && (
                        <div className="premium-sidebar-fade">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm rounded-pill px-3"
                            onClick={handleUnlock}
                          >
                            <FaLock
                              className="me-2"
                              size={10}
                            />
                            Unlock
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {resume.unsupportedClaimWarnings?.length >
                  0 && (
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 me-3 flex-shrink-0"
                          style={{
                            width: '42px',
                            height: '42px',
                            backgroundColor: '#fff8e7',
                          }}
                        >
                          <FaExclamationTriangle className="text-warning" />
                        </div>

                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start gap-2">
                            <h6 className="fw-bold mb-2">
                              Review Before Using
                            </h6>

                            {!premiumUnlocked && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm rounded-pill px-3"
                                onClick={handleUnlock}
                              >
                                <FaLock
                                  className="me-1"
                                  size={9}
                                />
                                Unlock
                              </button>
                            )}
                          </div>

                          <div
                            className={
                              !premiumUnlocked
                                ? 'claim-warning-wrapper'
                                : ''
                            }
                          >
                            <p
                              className={
                                !premiumUnlocked
                                  ? 'small text-secondary lh-lg mb-0 claim-warning-content'
                                  : 'small text-secondary lh-lg mb-0'
                              }
                            >
                              {resume.unsupportedClaimWarnings.join(
                                ' '
                              )}
                            </p>

                            {!premiumUnlocked && (
                              <div className="claim-warning-fade" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showUnlockModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.35)',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setShowUnlockModal(false)}
        >
          <div
            className="card border-0 shadow-lg rounded-4"
            style={{
              width: '100%',
              maxWidth: '430px',
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="card-body p-4 p-lg-5">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#edf3ff',
                  }}
                >
                  <FaLock
                    className="text-primary"
                    size={19}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: '34px',
                    height: '34px',
                  }}
                  onClick={() =>
                    setShowUnlockModal(false)
                  }
                >
                  <FaTimes size={13} />
                </button>
              </div>

              <div className="small fw-semibold text-primary mb-2">
                PREMIUM PREVIEW
              </div>

              <h4
                className="fw-bold mb-2"
                style={{
                  letterSpacing: '-0.5px',
                }}
              >
                Unlock your tailored resume
              </h4>

              <p className="text-secondary lh-lg mb-4">
                Get access to the complete AI-optimized resume
                and all the improvements made specifically for
                your target position.
              </p>

              <div className="mb-4">
                <div className="d-flex align-items-center py-3 border-bottom">
                  <FaCheckCircle
                    className="text-success me-3"
                    size={15}
                  />

                  <span className="small">
                    Fully optimized resume content
                  </span>
                </div>

                <div className="d-flex align-items-center py-3 border-bottom">
                  <FaCheckCircle
                    className="text-success me-3"
                    size={15}
                  />

                  <span className="small">
                    Detailed role-specific improvements
                  </span>
                </div>

                <div className="d-flex align-items-center py-3">
                  <FaCheckCircle
                    className="text-success me-3"
                    size={15}
                  />

                  <span className="small">
                    Download your tailored PDF
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary w-100 py-2 rounded-3 fw-semibold"
                onClick={continueWithDemo}
              >
                Continue
              </button>

              <div className="text-center mt-3">
                <small className="text-secondary">
                  Demo mode · No payment required
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .resume-document {
            width: 100%;
            max-width: 850px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid #e3e6eb;
            box-shadow: 0 4px 16px rgba(31, 41, 55, 0.06);
          }

          .resume-document-body {
            background: #fff;
            padding: 58px 64px;
          }

          .resume-original-frame {
            display: block;
            min-height: 980px;
            background: #fff;
          }

          .resume-document h1,
          .resume-document h5,
          .resume-document .fw-semibold,
          .resume-document .fw-medium {
            color: #172033;
          }

          .resume-document section {
            max-width: 100%;
          }

          .premium-resume-wrapper {
            position: relative;
            max-height: 760px;
            overflow: hidden;
          }

          .premium-resume-content {
            filter: blur(1.7px);
            opacity: 0.58;
            user-select: none;
            pointer-events: none;
          }

          .premium-resume-fade {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 230px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 25px;
            background: linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0),
              rgba(255, 255, 255, 0.55) 30%,
              rgba(255, 255, 255, 0.88) 62%,
              rgba(255, 255, 255, 0.98) 82%,
              rgba(255, 255, 255, 1)
            );
            z-index: 5;
          }

          .premium-resume-fade button {
            position: relative;
            z-index: 6;
          }

          .premium-sidebar-wrapper {
            position: relative;
            max-height: 270px;
            overflow: hidden;
          }

          .premium-sidebar-content {
            filter: blur(1.5px);
            opacity: 0.55;
            user-select: none;
            pointer-events: none;
          }

          .premium-sidebar-fade {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 130px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 12px;
            background: linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0),
              rgba(255, 255, 255, 0.78) 48%,
              rgba(255, 255, 255, 1) 82%
            );
            z-index: 5;
          }

          .premium-sidebar-fade button {
            position: relative;
            z-index: 6;
          }

          .claim-warning-wrapper {
            position: relative;
            max-height: 145px;
            overflow: hidden;
          }

          .claim-warning-content {
            filter: blur(1.5px);
            opacity: 0.55;
            user-select: none;
            pointer-events: none;
          }

          .claim-warning-fade {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 90px;
            background: linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0),
              rgba(255, 255, 255, 0.9) 65%,
              rgba(255, 255, 255, 1)
            );
          }

          @media (max-width: 767px) {
            .resume-document-body {
              padding: 34px 24px;
            }

            .resume-original-frame {
              min-height: 760px;
            }

            .premium-resume-wrapper {
              max-height: 650px;
            }

            .premium-resume-fade {
              height: 200px;
            }

            .premium-sidebar-wrapper {
              max-height: 240px;
            }
          }
        `}
      </style>
    </StudentLayout>
  );
};

export default AtsTailoredResume;