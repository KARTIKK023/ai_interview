import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoRecorder from '../../components/VideoRecorder';
import Loading from '../../components/Loading';
import API from '../../services/api';
import {
  FaClock,
  FaArrowRight,
  FaArrowLeft,
  FaVolumeUp,
  FaMicrophone,
  FaStop,
  FaRedo,
  FaRobot,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperPlane,
  FaTimes,
  FaPlay,
  FaSave
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const VideoInterview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const recorderRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [visitedSet, setVisitedSet] = useState(new Set([0]));
  const [evaluating, setEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  useEffect(() => {
    if (!interview || !interview.startedAt) return;

    const updateTimer = () => {
      const startTime = new Date(interview.startedAt).getTime();
      const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setTimerSeconds(elapsed);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [interview?.startedAt]);

  // Auto-submit when video interview duration is reached
  useEffect(() => {
    if (!interview || evaluating || isSaving || autoSubmittedRef.current) return;

    const maxSeconds = (interview.duration || 30) * 60;
    if (timerSeconds >= maxSeconds) {
      autoSubmittedRef.current = true;
      if (recorderRef.current?.isRecording) {
        recorderRef.current.stopRecording();
      }
      toast.error(`⏰ ${interview.duration || 30}-minute time limit reached! Auto-submitting your video interview...`, { duration: 6000 });
      executeFinalSubmission(savedAnswers);
    }
  }, [timerSeconds, interview, evaluating, isSaving]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await API.get(`/interviews/${id}`);
      if (res.data.interview) {
        let activeInterview = res.data.interview;
        if (activeInterview.status === 'Completed') {
          navigate(`/student/result/${id}`, { replace: true });
          return;
        }
        if (activeInterview.status === 'Pending') {
          const startRes = await API.post(`/interviews/${id}/start`);
          if (startRes.data?.interview) {
            activeInterview = startRes.data.interview;
          }
        }
        setInterview(activeInterview);
      }
    } catch (err) {
      console.error('Failed to load video interview:', err);
      setErrorMessage(err.response?.data?.message || 'Could not load interview session. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const currentQ = interview?.questions?.[currentIndex];
  const totalQuestions = interview?.questions?.length || 0;

  // Speak question aloud via browser Speech Synthesis (TTS)
  const speakQuestion = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        setIsAiSpeaking(true);
      };

      utterance.onend = () => {
        setIsAiSpeaking(false);
      };

      utterance.onerror = () => {
        setIsAiSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-speak question whenever current question changes
  useEffect(() => {
    if (currentQ) {
      const qText = currentQ.questionText || currentQ.question;
      speakQuestion(qText);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex, currentQ]);

  const handleJumpToQuestion = (targetIndex) => {
    if (targetIndex === currentIndex) return;

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    setErrorMessage(null);
    setCurrentIndex(targetIndex);
    setTranscript(savedAnswers[targetIndex] || '');
    setRecordedVideo(null);
  };

  const handleReRecordAnswer = () => {
    if (recorderRef.current?.resetRecording) {
      recorderRef.current.resetRecording();
    }
    setTranscript('');
    setRecordedVideo(null);
    setSavedAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentIndex];
      return updated;
    });
    setErrorMessage(null);
    toast.success('Response reset. Ready to start fresh recording.');
  };

  const handlePrevious = () => {
    if (currentIndex === 0) return;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    setTranscript(savedAnswers[prevIndex] || '');
    setRecordedVideo(null);
  };

  // Save & Next CTA Handler
  const handleSaveAndNext = async () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const textToSave = transcript.trim();

    try {
      setIsSaving(true);
      setErrorMessage(null);

      // Store in savedAnswers map
      const updatedAnswers = { ...savedAnswers, [currentIndex]: textToSave };
      setSavedAnswers(updatedAnswers);
      setVisitedSet((prev) => new Set(prev).add(currentIndex));

      const nextIndex = currentIndex + 1;
      if (nextIndex < totalQuestions) {
        if (recorderRef.current?.resetRecording) {
          recorderRef.current.resetRecording();
        }
        setTranscript(updatedAnswers[nextIndex] || '');
        setRecordedVideo(null);
        setCurrentIndex(nextIndex);
        setVisitedSet((prev) => new Set(prev).add(nextIndex));
        toast.success(`Question ${currentIndex + 1} saved!`);
      } else {
        // Last question -> Execute submission & evaluation
        toast.success('Final question saved! Evaluating interview...');
        await executeFinalSubmission(updatedAnswers);
      }
    } catch (err) {
      console.error('Error saving answer:', err);
      toast.error('Unable to save your answer. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const executeFinalSubmission = async (finalAnswersMap) => {
    setShowConfirmModal(false);
    try {
      setEvaluating(true);

      const formattedAnswersPayload = interview.questions.map((q, idx) => ({
        questionIndex: idx,
        questionText: q.questionText || q.question,
        answerText: (finalAnswersMap[idx] || '').trim()
      }));

      const res = await API.post(`/interviews/${id}/submit`, {
        answers: formattedAnswersPayload
      });

      if (res.data.success) {
        toast.success('Interview submitted and evaluated successfully!');
        navigate(`/student/result/${id}`);
      }
    } catch (err) {
      console.error('Video interview submission error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit interview.');
      setEvaluating(false);
    }
  };

  const handleStopInterview = async () => {
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setShowStopModal(false);
      await API.post(`/interviews/${id}/stop`);
      toast.success('Interview session stopped');
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Error stopping video interview:', err);
      navigate('/student/dashboard');
    }
  };

  const handlePlayVoiceAnswer = async () => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.muted = false;
        audioPlayerRef.current.volume = 1.0;
        if (typeof audioPlayerRef.current.setSinkId === 'function') {
          try {
            await audioPlayerRef.current.setSinkId('');
          } catch (e) {
            console.warn('[AUDIO] Default output device sinkId note:', e);
          }
        }
        const playPromise = audioPlayerRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[AUDIO] Voice answer playback error/interrupted:', err);
          });
        }
      } catch (err) {
        console.warn('[AUDIO] Error playing voice answer:', err);
      }
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || !interview) {
    return <Loading message="Preparing Conversational AI Video Interview..." />;
  }

  const roleTitle = interview.jobRole || interview.topic || 'Software Engineer';
  const difficulty = interview.difficulty || 'Intermediate';
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const isRecordingState = recorderRef.current?.isRecording || false;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasCapturedAnswer = Boolean(transcript.trim() || recordedVideo);

  return (
    <div className="bg-futuristic-dark text-white min-vh-100 d-flex flex-column" style={{ backgroundColor: '#060817' }}>
      {/* TOP HEADER BAR */}
      <header className="px-4 py-3 border-bottom border-secondary border-opacity-25 glass-card position-sticky top-0" style={{ zIndex: 1040, background: 'rgba(13, 18, 38, 0.85)' }}>
        <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Left Metadata & Role Badges */}
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-25 border border-primary text-primary p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
              <FaRobot size={22} className="text-info" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-25 extra-small fw-bold">
                  Technical
                </span>
                <span className="badge bg-purple bg-opacity-25 text-primary border border-primary border-opacity-25 extra-small fw-bold" style={{ color: '#a855f7' }}>
                  {roleTitle}
                </span>
                <span className="badge bg-secondary bg-opacity-25 text-white-50 extra-small">
                  {difficulty}
                </span>
              </div>
              <h5 className="fw-bold mb-0 text-white fs-6">
                AI Mock Interview — <span className="text-gradient-purple-blue">{roleTitle}</span>
              </h5>
            </div>
          </div>

          {/* Center Timer & Question Counter */}
          <div className="d-flex align-items-center gap-4">
            {(() => {
              const maxSecs = (interview?.duration || 30) * 60;
              const remainingSecs = Math.max(0, maxSecs - timerSeconds);
              const isTimeLow = remainingSecs <= 60;
              return (
                <div className={`d-flex align-items-center gap-2 px-3 py-1 bg-black bg-opacity-50 border ${isTimeLow ? 'border-danger' : 'border-secondary border-opacity-25'} rounded-pill`}>
                  <FaClock className={isTimeLow ? 'text-danger extra-small' : 'text-info extra-small'} />
                  <span className={`fw-mono fw-bold small ${isTimeLow ? 'text-danger' : 'text-info'}`}>
                    {formatTimer(remainingSecs)}
                  </span>
                  <span className="extra-small text-white-50">/ {interview?.duration || 30}m</span>
                </div>
              );
            })()}

            <div className="d-flex align-items-center gap-2">
              <span className="extra-small text-white-50 fw-bold">Question {currentIndex + 1} / {totalQuestions}</span>
              <div className="progress" style={{ width: '120px', height: '6px', backgroundColor: '#1e293b' }}>
                <div className="progress-bar bg-gradient-primary" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* Right Exit Action */}
          <button
            onClick={() => setShowStopModal(true)}
            className="btn btn-outline-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-2 extra-small fw-bold"
          >
            <FaTimes size={12} /> Stop Interview
          </button>
        </div>
      </header>

      {/* MAIN TWO-COLUMN CONVERSATIONAL LAYOUT */}
      <main className="container-fluid flex-grow-1 p-4">
        <div className="row g-4">
          {/* LEFT COLUMN: STACKED VIDEO PANELS (38% Desktop) */}
          <div className="col-lg-4 d-flex flex-column gap-3">
            {/* AI INTERVIEWER AVATAR PANEL */}
            <div className="glass-card p-3 position-relative overflow-hidden border border-primary border-opacity-25" style={{ background: 'rgba(13, 18, 38, 0.9)' }}>
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-2">
                <span className="extra-small text-uppercase fw-bold text-info tracking-wider d-flex align-items-center gap-2">
                  <FaRobot /> AI INTERVIEWER
                </span>
                {isAiSpeaking ? (
                  <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-50 extra-small fw-bold d-flex align-items-center gap-1">
                    <span className="spinner-grow spinner-grow-sm" style={{ width: '8px', height: '8px' }}></span>
                    ● AI IS SPEAKING
                  </span>
                ) : (
                  <span className="badge bg-success bg-opacity-25 text-success extra-small fw-bold">
                    ✓ READY FOR YOUR ANSWER
                  </span>
                )}
              </div>

              {/* Holographic Visualizer */}
              <div className="d-flex flex-column align-items-center justify-content-center py-4 position-relative rounded-3 bg-black bg-opacity-50 border border-secondary border-opacity-25">
                <div
                  className="rounded-circle p-3 mb-3 d-flex align-items-center justify-content-center position-relative"
                  style={{
                    width: '90px',
                    height: '90px',
                    background: isAiSpeaking
                      ? 'radial-gradient(circle, rgba(124, 58, 237, 0.6) 0%, rgba(37, 99, 235, 0.2) 70%)'
                      : 'radial-gradient(circle, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.4) 70%)',
                    boxShadow: isAiSpeaking ? '0 0 25px rgba(124, 58, 237, 0.5)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FaRobot size={44} className={isAiSpeaking ? 'text-info' : 'text-white-50'} />
                </div>

                <h6 className="fw-bold text-white small mb-1">HireSmart AI Evaluator</h6>
                <span className="extra-small text-white-50 mb-3">Conversational Audio & Video Intelligence</span>

                {/* Animated Waveform Visualizer */}
                <div className="d-flex align-items-center justify-content-center gap-1" style={{ height: '24px' }}>
                  <div className="waveform-bar" style={{ animationPlayState: isAiSpeaking ? 'running' : 'paused' }}></div>
                  <div className="waveform-bar" style={{ animationPlayState: isAiSpeaking ? 'running' : 'paused', animationDelay: '0.2s' }}></div>
                  <div className="waveform-bar" style={{ animationPlayState: isAiSpeaking ? 'running' : 'paused', animationDelay: '0.4s' }}></div>
                  <div className="waveform-bar" style={{ animationPlayState: isAiSpeaking ? 'running' : 'paused', animationDelay: '0.1s' }}></div>
                  <div className="waveform-bar" style={{ animationPlayState: isAiSpeaking ? 'running' : 'paused', animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>

            {/* CANDIDATE WEBCAM PANEL */}
            <div className="glass-card p-3 border border-secondary border-opacity-25" style={{ background: 'rgba(13, 18, 38, 0.9)' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="extra-small text-uppercase fw-bold text-white-50 tracking-wider">
                  YOU (CANDIDATE)
                </span>
                <span className="extra-small text-success fw-bold d-flex align-items-center gap-1">
                  <FaCheckCircle size={10} /> Live Webcam Stream
                </span>
              </div>

              {/* Embedded Candidate Camera Preview */}
              <VideoRecorder
                ref={recorderRef}
                questionIndex={currentIndex}
                isSubmitting={evaluating || isSaving}
                isAiSpeaking={isAiSpeaking}
                onTranscriptChange={(txt) => setTranscript(txt)}
                onVideoRecorded={(rec) => setRecordedVideo(rec)}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: QUESTION + LIVE TRANSCRIPT + ANSWER REVIEW + SAVE & NEXT (62% Desktop) */}
          <div className="col-lg-8 d-flex flex-column gap-3">
            {/* CURRENT QUESTION CARD */}
            <div className="glass-card p-4 border border-secondary border-opacity-25" style={{ background: 'rgba(13, 18, 38, 0.95)' }}>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <span className="extra-small text-uppercase fw-bold text-info tracking-wider">
                  CURRENT QUESTION • QUESTION {currentIndex + 1} OF {totalQuestions}
                </span>

                <div className="d-flex align-items-center gap-2">
                  <button
                    onClick={() => speakQuestion(currentQ?.questionText || currentQ?.question)}
                    className="btn btn-outline-info btn-xs py-1 px-3 rounded-pill extra-small fw-bold d-flex align-items-center gap-2"
                  >
                    <FaVolumeUp /> Replay Question
                  </button>

                  {isAiSpeaking ? (
                    <span className="extra-small text-info fw-bold">🔊 Speaking...</span>
                  ) : (
                    <span className="extra-small text-success fw-bold">✓ Question Ready</span>
                  )}
                </div>
              </div>

              <h4 className="fw-bold text-white mb-4 lh-base">
                "{currentQ?.questionText || currentQ?.question}"
              </h4>

              {/* ANSWER STRUCTURE GUIDANCE BAR */}
              <div className="p-2 px-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-25 d-flex flex-wrap align-items-center gap-2 extra-small text-white-50">
                <span className="fw-bold text-info">ANSWER STRUCTURE GUIDANCE:</span>
                <span>Problem</span>
                <span>→</span>
                <span>Approach</span>
                <span>→</span>
                <span>Reasoning</span>
                <span>→</span>
                <span>Conclusion</span>
              </div>
            </div>

            {/* LIVE TRANSCRIPT & ANSWER REVIEW PANEL */}
            <div className="glass-card p-4 flex-grow-1 border border-secondary border-opacity-25" style={{ background: 'rgba(13, 18, 38, 0.95)' }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="extra-small text-uppercase fw-bold text-white-50 tracking-wider">
                  {hasCapturedAnswer && !isRecordingState ? '✓ ANSWER RECORDED — YOUR RESPONSE' : 'LIVE TRANSCRIPT & RESPONSE TEXT'}
                </span>
                {isRecordingState ? (
                  <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 extra-small fw-bold d-flex align-items-center gap-1">
                    <span className="spinner-grow spinner-grow-sm" style={{ width: '8px', height: '8px' }}></span>
                    ● LISTENING & TRANSCRIBING...
                  </span>
                ) : hasCapturedAnswer ? (
                  <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 extra-small fw-bold d-flex align-items-center gap-1">
                    <FaCheckCircle size={10} /> Answer Captured & Ready for Review
                  </span>
                ) : (
                  <span className="extra-small text-muted">Microphone Ready</span>
                )}
              </div>

              {/* Recorded Voice Audio Player */}
              {recordedVideo?.audioUrl && !isRecordingState && (
                <div className="p-2 px-3 mb-3 bg-black bg-opacity-50 border border-info border-opacity-30 rounded-3 d-flex align-items-center justify-content-between gap-3">
                  <button
                    type="button"
                    onClick={handlePlayVoiceAnswer}
                    className="btn btn-outline-info btn-xs py-1 px-2 rounded-pill extra-small fw-bold d-flex align-items-center gap-1 border-0 bg-transparent text-info p-0"
                    title="Click to play recorded voice answer"
                  >
                    <FaPlay size={10} /> PLAY VOICE ANSWER:
                  </button>
                  <audio
                    ref={audioPlayerRef}
                    src={recordedVideo.audioUrl}
                    controls
                    preload="auto"
                    className="flex-grow-1"
                    style={{ height: '32px' }}
                    onPlay={(e) => {
                      e.target.muted = false;
                      e.target.volume = 1.0;
                    }}
                  />
                </div>
              )}

              <textarea
                className="form-control text-white rounded-3 mb-2 p-3 extra-small shadow-sm"
                rows="5"
                placeholder={
                  isAiSpeaking
                    ? "AI is speaking question aloud... Microphone speech recognition will start automatically when AI finishes."
                    : "Click 'Start Answer' and speak naturally. Your spoken response will appear here automatically in real time, or you can type directly."
                }
                value={transcript}
                onChange={(e) => {
                  const val = e.target.value;
                  setTranscript(val);
                  if (recorderRef.current?.syncManualTranscript) {
                    recorderRef.current.syncManualTranscript(val);
                  }
                }}
                disabled={evaluating || isSaving}
                style={{
                  resize: 'vertical',
                  fontSize: '0.95rem',
                  color: '#f8fafc',
                  backgroundColor: '#090d1f',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.5)'
                }}
              ></textarea>
            </div>

            {/* VOICE INTERACTION & SAVE & NEXT CONTROL BAR */}
            <div className="glass-card p-3 border border-secondary border-opacity-25 d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ background: 'rgba(13, 18, 38, 0.95)' }}>
              {/* Left Voice Status indicator */}
              <div>
                {isAiSpeaking ? (
                  <span className="extra-small text-info fw-bold d-flex align-items-center gap-2">
                    <FaVolumeUp className="spinner-grow spinner-grow-sm" /> AI is speaking question...
                  </span>
                ) : isRecordingState ? (
                  <span className="extra-small text-danger fw-bold d-flex align-items-center gap-2">
                    <span className="spinner-grow spinner-grow-sm text-danger"></span> Recording Candidate Response...
                  </span>
                ) : isSaving ? (
                  <span className="extra-small text-info fw-bold d-flex align-items-center gap-2">
                    <span className="spinner-border spinner-border-sm text-info"></span> Saving Answer...
                  </span>
                ) : hasCapturedAnswer ? (
                  <span className="extra-small text-success fw-bold d-flex align-items-center gap-2">
                    <FaCheckCircle /> Answer recorded. Click Save & Next to proceed.
                  </span>
                ) : (
                  <span className="extra-small text-white-50 d-flex align-items-center gap-2">
                    <FaMicrophone className="text-info" /> Click Start Answer when ready
                  </span>
                )}
              </div>

              {/* Center / Right Control Buttons */}
              <div className="d-flex flex-wrap align-items-center gap-2 ms-auto">
                {/* Back / Prev Button */}
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0 || evaluating || isSaving || isRecordingState}
                  className="btn btn-outline-secondary btn-sm px-3 rounded-pill extra-small fw-bold"
                >
                  <FaArrowLeft /> Prev
                </button>

                {/* State 1: AI Speaking -> Locked */}
                {isAiSpeaking && (
                  <button disabled className="btn btn-secondary btn-sm px-4 rounded-pill extra-small fw-bold">
                    Listening to Question...
                  </button>
                )}

                {/* State 2: Ready -> Start Recording */}
                {!isAiSpeaking && !isRecordingState && !hasCapturedAnswer && (
                  <button
                    onClick={() => recorderRef.current?.startRecording(transcript)}
                    disabled={evaluating || isSaving}
                    className="btn btn-glow-primary btn-sm px-4 rounded-pill extra-small fw-bold d-flex align-items-center gap-2"
                  >
                    <FaMicrophone /> Start Answer
                  </button>
                )}

                {/* State 3: Recording -> Stop Recording */}
                {!isAiSpeaking && isRecordingState && (
                  <button
                    onClick={() => recorderRef.current?.stopRecording()}
                    className="btn btn-warning btn-sm px-4 rounded-pill extra-small fw-bold d-flex align-items-center gap-2"
                  >
                    <FaStop /> Stop Recording
                  </button>
                )}

                {/* State 4 & 5: Answer Recorded / Last Question -> Re-record & Save & Next / Submit Interview */}
                {!isAiSpeaking && !isRecordingState && (hasCapturedAnswer || isLastQuestion) && (
                  <>
                    {hasCapturedAnswer && (
                      <button
                        onClick={handleReRecordAnswer}
                        disabled={evaluating || isSaving}
                        className="btn btn-outline-light btn-sm px-3 rounded-pill extra-small fw-bold"
                      >
                        <FaRedo /> Re-record
                      </button>
                    )}

                    <button
                      onClick={handleSaveAndNext}
                      disabled={evaluating || isSaving}
                      className={`btn ${isLastQuestion ? 'btn-success bg-gradient-success text-white' : 'btn-glow-primary'} btn-sm px-4 rounded-pill extra-small fw-bold d-flex align-items-center gap-2 shadow`}
                    >
                      {evaluating ? (
                        <>Evaluating Interview...</>
                      ) : isSaving ? (
                        <>Saving Answer...</>
                      ) : isLastQuestion ? (
                        <>Submit Interview <FaPaperPlane size={12} /></>
                      ) : (
                        <>Save & Next <FaArrowRight size={12} /></>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* COMPACT QUESTION PROGRESS GRID */}
            <div className="glass-card p-3 border border-secondary border-opacity-25" style={{ background: 'rgba(13, 18, 38, 0.95)' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="extra-small text-uppercase fw-bold text-white-50 tracking-wider">
                  QUESTION PROGRESS
                </span>
                <div className="d-flex align-items-center gap-3">
                  <span className="extra-small text-info fw-bold">
                    {Object.keys(savedAnswers).length} / {totalQuestions} Saved
                  </span>
                  {isLastQuestion && (
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      disabled={evaluating || isSaving || isRecordingState}
                      className="btn btn-success btn-xs rounded-pill extra-small px-3 py-1 fw-bold shadow-sm d-flex align-items-center gap-1"
                    >
                      <FaPaperPlane size={10} /> Submit Interview
                    </button>
                  )}
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {interview.questions.map((_, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isSaved = Boolean(savedAnswers[idx] && savedAnswers[idx].trim().length > 0);

                  let badgeClass = 'bg-secondary bg-opacity-25 text-white-50 border-secondary';
                  if (isCurrent) {
                    badgeClass = 'bg-primary border-primary text-white shadow-sm';
                  } else if (isSaved) {
                    badgeClass = 'bg-success bg-opacity-25 border-success text-success';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleJumpToQuestion(idx)}
                      disabled={isSaving || isRecordingState}
                      className={`btn btn-xs rounded-3 border extra-small px-3 py-1 fw-bold transition-all ${badgeClass}`}
                    >
                      Q{idx + 1} {isSaved && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* STOP INTERVIEW MODAL */}
      {showStopModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card border border-danger border-opacity-50 text-white p-4" style={{ background: '#0d1226' }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="p-3 bg-danger bg-opacity-25 rounded-circle text-danger">
                  <FaExclamationTriangle size={24} />
                </div>
                <h5 className="fw-bold mb-0 text-white">Stop AI Interview Session?</h5>
              </div>
              <p className="text-white-50 small mb-4">
                Are you sure you want to stop this AI mock interview? Progress will be saved up to your last saved question.
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-outline-light btn-sm rounded-pill px-4" onClick={() => setShowStopModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger btn-sm rounded-pill px-4 fw-bold" onClick={handleStopInterview}>
                  Yes, Stop Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM SUBMISSION MODAL */}
      {showConfirmModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card border border-primary border-opacity-50 text-white p-4" style={{ background: '#0d1226' }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="p-3 bg-primary bg-opacity-25 rounded-circle text-primary">
                  <FaPaperPlane size={24} />
                </div>
                <h5 className="fw-bold mb-0 text-white">Submit Interview & Evaluate?</h5>
              </div>
              <p className="text-white-50 small mb-4">
                You have saved {Object.keys(savedAnswers).length} out of {totalQuestions} questions. Would you like to proceed with AI evaluation?
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-outline-light btn-sm rounded-pill px-4" onClick={() => setShowConfirmModal(false)}>
                  Review Answers
                </button>
                <button className="btn btn-glow-primary btn-sm rounded-pill px-4 fw-bold" onClick={() => executeFinalSubmission(savedAnswers)}>
                  Submit Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoInterview;
