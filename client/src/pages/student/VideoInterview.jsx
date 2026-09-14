import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading';
import API from '../../services/api';
import {
  FaClock,
  FaArrowRight,
  FaArrowLeft,
  FaVolumeUp,
  FaMicrophone,
  FaRobot,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperPlane,
  FaTimes,
  FaRedo,
  FaVideo,
  FaCircle,
  FaStop
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const VideoInterview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Interview / navigation state
  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [savedAnswers, setSavedAnswers] = useState({});
  const [visitedSet, setVisitedSet] = useState(new Set([0]));

  // UI state
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingReady, setRecordingReady] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Continuous interview recording
  const cameraVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingStartRef = useRef(null);
  const recordingStopPromiseRef = useRef(null);
  const recordingBlobRef = useRef(null);
  const isRecordingRef = useRef(false);

  // Speech recognition
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const transcriptRef = useRef('');
  const speechBaseRef = useRef('');
  const speechSupportedRef = useRef(false);

  const autoSubmittedRef = useRef(false);
  const isMountedRef = useRef(true);

  const totalQuestions = interview?.questions?.length || 0;
  const currentQ = interview?.questions?.[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  const formatTimer = (secs) => {
    const safe = Math.max(0, Number(secs) || 0);
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getRecordingMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';

    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];

    return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) || '';
  };

  const stopSpeechRecognition = useCallback(() => {
    shouldListenRef.current = false;

    const recognition = recognitionRef.current;
    if (!recognition) return;

    try {
      recognition.stop();
    } catch (err) {
      // Recognition may already be stopped.
    }

    recognitionRef.current = null;

    if (isMountedRef.current) {
      setIsListening(false);
    }
  }, []);

  const startSpeechRecognition = useCallback((baseText = '') => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      speechSupportedRef.current = false;
      return;
    }

    stopSpeechRecognition();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    speechSupportedRef.current = true;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    const startingBase = baseText.trim();
    speechBaseRef.current = startingBase;
    shouldListenRef.current = true;

    recognition.onstart = () => {
      // Recognition is armed silently. The UI only reports actual detected
      // student speech, not the browser listening state.
    };

    recognition.onresult = (event) => {
      let finalText = speechBaseRef.current;
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript || '';

        if (result.isFinal) {
          finalText = `${finalText} ${text}`.trim();
        } else {
          interimText = `${interimText} ${text}`.trim();
        }
      }

      const combined = `${finalText} ${interimText}`.trim();
      transcriptRef.current = combined;

      if (isMountedRef.current) {
        setTranscript(combined);
        setIsListening(true);

        if (voiceDetectedTimerRef.current) {
          window.clearTimeout(voiceDetectedTimerRef.current);
        }

        voiceDetectedTimerRef.current = window.setTimeout(() => {
          if (isMountedRef.current) setIsListening(false);
        }, 900);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;

      console.warn('[VIDEO INTERVIEW] Speech recognition error:', event.error);

      if (isMountedRef.current) {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;

      if (isMountedRef.current) {
        setIsListening(false);
      }

      // Chrome/Safari can end recognition automatically. Restart it while
      // the candidate is still answering, but never while AI is speaking.
      if (
        shouldListenRef.current &&
        !isAiSpeakingRef.current &&
        !evaluating &&
        !isSaving
      ) {
        window.setTimeout(() => {
          if (
            shouldListenRef.current &&
            !isAiSpeakingRef.current &&
            isMountedRef.current
          ) {
            startSpeechRecognition(transcriptRef.current);
          }
        }, 250);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.warn('[VIDEO INTERVIEW] Could not start speech recognition:', err);
      recognitionRef.current = null;
      shouldListenRef.current = false;
      setIsListening(false);
    }
  }, [evaluating, isSaving, stopSpeechRecognition]);

  const speakQuestion = useCallback((text) => {
    if (!text || !('speechSynthesis' in window)) {
      setIsAiSpeaking(false);

      if (!isRecordingRef.current) {
        startSpeechRecognition(transcriptRef.current);
      }

      return;
    }

    stopSpeechRecognition();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      isAiSpeakingRef.current = true;
      setIsAiSpeaking(true);
    };

    utterance.onend = () => {
      isAiSpeakingRef.current = false;
      setIsAiSpeaking(false);

      if (isRecordingRef.current && !evaluating && !isSaving) {
        startSpeechRecognition(transcriptRef.current);
      }
    };

    utterance.onerror = () => {
      isAiSpeakingRef.current = false;
      setIsAiSpeaking(false);

      if (isRecordingRef.current && !evaluating && !isSaving) {
        startSpeechRecognition(transcriptRef.current);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [evaluating, isSaving, startSpeechRecognition, stopSpeechRecognition]);

  const startContinuousRecording = useCallback(async () => {
    if (isRecordingRef.current) return true;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecordingError('Your browser does not support continuous video recording. Please use a current Chrome, Edge, or Safari browser.');
      return false;
    }

    try {
      setRecordingError('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaStreamRef.current = stream;

      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.muted = true;
        await cameraVideoRef.current.play().catch(() => {});
      }

      const mimeType = getRecordingMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recordingChunksRef.current = [];
      recordingBlobRef.current = null;
      recordingStopPromiseRef.current = null;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstart = () => {
        isRecordingRef.current = true;
        recordingStartRef.current = Date.now();

        if (isMountedRef.current) {
          setRecordingReady(true);
        }
      };

      recorder.onerror = (event) => {
        console.error('[VIDEO INTERVIEW] MediaRecorder error:', event.error);
        if (isMountedRef.current) {
          setRecordingError('The browser could not continue recording. Please check camera and microphone permissions.');
        }
      };

      recorder.onstop = () => {
        const actualType = recorder.mimeType || mimeType || 'video/webm';
        const blob = new Blob(recordingChunksRef.current, { type: actualType });

        recordingBlobRef.current = blob;
        isRecordingRef.current = false;
        recordingStopPromiseRef.current = null;

        if (isMountedRef.current) {
          setRecordingReady(true);
        }
      };

      mediaRecorderRef.current = recorder;

      // Small timeslices keep the recording data flowing instead of waiting
      // until the entire interview finishes.
      recorder.start(1000);

      return true;
    } catch (err) {
      console.error('[VIDEO INTERVIEW] Camera/microphone initialization failed:', err);

      if (isMountedRef.current) {
        setRecordingReady(false);
        setRecordingError(
          err?.name === 'NotAllowedError'
            ? 'Camera and microphone permission was denied. Please allow access and try again.'
            : 'Could not start the camera and microphone. Please check your devices and try again.'
        );
      }

      return false;
    }
  }, []);

  const stopContinuousRecording = useCallback(() => {
    if (!mediaRecorderRef.current) {
      return Promise.resolve(recordingBlobRef.current);
    }

    if (recordingStopPromiseRef.current) {
      return recordingStopPromiseRef.current;
    }

    const recorder = mediaRecorderRef.current;

    if (recorder.state === 'inactive') {
      isRecordingRef.current = false;
      return Promise.resolve(recordingBlobRef.current);
    }

    recordingStopPromiseRef.current = new Promise((resolve) => {
      const finish = () => {
        const actualType = recorder.mimeType || 'video/webm';
        const blob = new Blob(recordingChunksRef.current, { type: actualType });

        recordingBlobRef.current = blob;
        isRecordingRef.current = false;

        if (isMountedRef.current) {
          setRecordingReady(true);
        }

        resolve(blob);
      };

      recorder.addEventListener('stop', finish, { once: true });

      try {
        recorder.stop();
      } catch (err) {
        finish();
      }
    });

    return recordingStopPromiseRef.current;
  }, []);

  const releaseMediaResources = useCallback(() => {
    stopSpeechRecognition();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const stream = mediaStreamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    isRecordingRef.current = false;

    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  }, [stopSpeechRecognition]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await API.get(`/interviews/${id}`);

      if (!res.data.interview) {
        throw new Error('Interview was not found.');
      }

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

      if (!activeInterview.questions?.length) {
        setErrorMessage('No interview questions are available for this session.');
      }
    } catch (err) {
      console.error('Failed to load video interview:', err);
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Could not load interview session. Please check your network connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Load interview once.
  useEffect(() => {
    fetchInterviewDetails();

    return () => {
      releaseMediaResources();
    };
  }, [id]);

  // Start one continuous recording for the complete interview.
  useEffect(() => {
    if (!interview || !interview.questions?.length) return;

    let cancelled = false;

    const initializeRecording = async () => {
      const started = await startContinuousRecording();

      if (cancelled && started) {
        await stopContinuousRecording();
      }
    };

    initializeRecording();

    return () => {
      cancelled = true;
    };
  }, [interview, startContinuousRecording, stopContinuousRecording]);

  // Interview timer comes from the server-side interview start time.
  useEffect(() => {
    if (!interview?.startedAt) return;

    const updateTimer = () => {
      const startTime = new Date(interview.startedAt).getTime();
      const elapsed = Math.max(
        0,
        Math.floor((Date.now() - startTime) / 1000)
      );

      setTimerSeconds(elapsed);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [interview?.startedAt]);

  // Recording timer is independent from the interview timer.
  useEffect(() => {
    if (!recordingReady) return;

    const interval = setInterval(() => {
      if (recordingStartRef.current && isRecordingRef.current) {
        setRecordingSeconds(
          Math.max(0, Math.floor((Date.now() - recordingStartRef.current) / 1000))
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [recordingReady]);

  // Speak each server-generated question. Question generation itself is not
  // changed here; this page only consumes interview.questions[].
  useEffect(() => {
    if (!currentQ || !recordingReady) return;

    const qText = currentQ.questionText || currentQ.question;

    transcriptRef.current = savedAnswers[currentIndex] || '';
    speechBaseRef.current = savedAnswers[currentIndex] || '';

    setTranscript(savedAnswers[currentIndex] || '');
    stopSpeechRecognition();

    const timeout = window.setTimeout(() => {
      speakQuestion(qText);
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      stopSpeechRecognition();

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [
    currentIndex,
    currentQ,
    recordingReady,
    speakQuestion,
    stopSpeechRecognition
  ]);

  // Auto-submit at the configured interview duration.
  useEffect(() => {
    if (
      !interview ||
      evaluating ||
      isSaving ||
      autoSubmittedRef.current
    ) {
      return;
    }

    const maxSeconds = (interview.duration || 30) * 60;

    if (timerSeconds >= maxSeconds) {
      autoSubmittedRef.current = true;

      toast.error(
        `⏰ ${interview.duration || 30}-minute time limit reached. Finalizing your interview...`,
        { duration: 6000 }
      );

      handleTriggerSubmit(true);
    }
  }, [timerSeconds, interview, evaluating, isSaving]);

  const saveCurrentAnswer = () => {
    const value = transcriptRef.current.trim();

    const updatedAnswers = {
      ...savedAnswers,
      [currentIndexRef.current]: value
    };

    setSavedAnswers(updatedAnswers);
    return updatedAnswers;
  };

  const handleJumpToQuestion = (targetIndex) => {
    if (
      targetIndex === currentIndex ||
      evaluating ||
      isSaving
    ) {
      return;
    }

    saveCurrentAnswer();

    setVisitedSet((prev) => new Set(prev).add(currentIndex));

    setCurrentIndex(targetIndex);
  };

  const handlePrevious = () => {
    if (currentIndex === 0 || evaluating || isSaving) return;

    saveCurrentAnswer();

    setVisitedSet((prev) => new Set(prev).add(currentIndex));
    setCurrentIndex((prev) => prev - 1);
  };

  const handleResetCurrentAnswer = () => {
    if (evaluating || isSaving) return;

    stopSpeechRecognition();

    const updated = { ...savedAnswers };
    delete updated[currentIndex];

    setSavedAnswers(updated);
    setTranscript('');
    transcriptRef.current = '';
    speechBaseRef.current = '';

    toast.success(
      'Current response cleared. The interview recording continues.'
    );

    if (isRecordingRef.current && !isAiSpeakingRef.current) {
      startSpeechRecognition('');
    }
  };

  const handleSaveAndNext = async () => {
    if (evaluating || isSaving) return;

    setIsSaving(true);
    stopSpeechRecognition();

    try {
      const updatedAnswers = saveCurrentAnswer();

      setVisitedSet((prev) => new Set(prev).add(currentIndex));

      if (isLastQuestion) {
        toast.success('Final response captured. Finalizing your interview...');
        await executeFinalSubmission(updatedAnswers);
        return;
      }

      const nextIndex = currentIndex + 1;

      setVisitedSet((prev) => new Set(prev).add(nextIndex));
      setCurrentIndex(nextIndex);

      toast.success(`Question ${currentIndex + 1} saved.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerSubmit = async (fromAutoSubmit = false) => {
    if (evaluating) return;

    const updatedAnswers = saveCurrentAnswer();
    setSavedAnswers(updatedAnswers);

    const answeredCount = Object.values(updatedAnswers).filter(
      (answer) => answer && answer.trim().length > 0
    ).length;

    const unansweredCount = totalQuestions - answeredCount;

    if (fromAutoSubmit || unansweredCount === 0) {
      await executeFinalSubmission(updatedAnswers);
      return;
    }

    setShowConfirmModal(true);
  };

  const executeFinalSubmission = async (finalAnswersMap) => {
    if (evaluating) return;

    setShowConfirmModal(false);
    stopSpeechRecognition();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      setEvaluating(true);

      // IMPORTANT:
      // Stop the one continuous recording first and wait for MediaRecorder's
      // final Blob. The Blob is kept in memory for this page-only phase.
      // No backend recording upload is performed yet.
      await stopContinuousRecording();

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
        releaseMediaResources();
        navigate(`/student/result/${id}`);
      }
    } catch (err) {
      console.error('Video interview submission error:', err);

      toast.error(
        err.response?.data?.message ||
          'Failed to submit interview. Please try again.'
      );

      setEvaluating(false);
    }
  };

  const handleStopInterview = async () => {
    try {
      setShowStopModal(false);

      stopSpeechRecognition();

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      await stopContinuousRecording();
      releaseMediaResources();

      await API.post(`/interviews/${id}/stop`);

      toast.success('Interview session stopped.');
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Error stopping video interview:', err);
      navigate('/student/dashboard');
    }
  };

  const handleRetryRecording = async () => {
    const started = await startContinuousRecording();

    if (started) {
      toast.success('Camera and microphone are ready. Interview recording resumed.');
    }
  };

  if (loading || !interview) {
    return <Loading message="Preparing your interview..." />;
  }

  if (errorMessage) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center p-4 text-white"
        style={{ background: '#080a0f' }}
      >
        <div
          className="p-5 text-center rounded-4 border"
          style={{
            maxWidth: 620,
            background: '#10131a',
            borderColor: 'rgba(255,255,255,.09)'
          }}
        >
          <FaExclamationTriangle className="text-warning mb-3" size={36} />
          <h4 className="fw-bold mb-2">We couldn't start your interview</h4>
          <p className="text-white-50 mb-4">{errorMessage}</p>
          <button
            className="btn btn-light rounded-pill px-4 fw-semibold"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const roleTitle = interview.jobRole || interview.topic || 'Software Engineer';
  const difficulty = interview.difficulty || 'Intermediate';
  const remainingSecs = Math.max(
    0,
    (interview.duration || 30) * 60 - timerSeconds
  );
  const isTimeLow = remainingSecs <= 60;
  const hasCurrentAnswer = Boolean(transcript.trim());
  const answeredCount = Object.values(savedAnswers).filter(
    (answer) => answer && answer.trim().length > 0
  ).length;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div
      className="min-vh-100 text-white"
      style={{
        background:
          'radial-gradient(circle at 50% -20%, rgba(61,67,88,.22), transparent 35%), #080a0f',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      <style>{`
        @keyframes aiOrbPulse {
          0%, 100% { transform: scale(0.94); opacity: 0.86; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
      {/* TOP BAR — intentionally restrained, not dashboard-like */}
      <header
        className="sticky-top border-bottom"
        style={{
          zIndex: 1040,
          background: 'rgba(8,10,15,.92)',
          backdropFilter: 'blur(18px)',
          borderColor: 'rgba(255,255,255,.07)'
        }}
      >
        <div className="container-fluid px-4 py-3">
          <div className="d-flex align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 38,
                  height: 38,
                  background: '#171a22',
                  border: '1px solid rgba(255,255,255,.08)'
                }}
              >
                <FaRobot size={18} className="text-white-50" />
              </div>

              <div>
                <div className="small fw-semibold">{roleTitle}</div>
                <div className="text-white-50" style={{ fontSize: 11 }}>
                  AI interview · {difficulty}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                style={{
                  background: 'rgba(255,255,255,.035)',
                  border: '1px solid rgba(255,255,255,.07)'
                }}
              >
                <FaCircle
                  size={7}
                  className={recordingReady ? 'text-danger' : 'text-secondary'}
                />
                <span className="small fw-semibold">
                  {recordingReady ? 'Recording' : 'Connecting'}
                </span>
                <span className="text-white-50 small font-monospace">
                  {formatTimer(recordingSeconds)}
                </span>
              </div>

              <div className="text-end d-none d-sm-block">
                <div
                  className={`small fw-bold font-monospace ${
                    isTimeLow ? 'text-danger' : 'text-white'
                  }`}
                >
                  {formatTimer(remainingSecs)}
                </div>
                <div className="text-white-50" style={{ fontSize: 10 }}>
                  remaining
                </div>
              </div>

              <button
                onClick={() => setShowStopModal(true)}
                disabled={evaluating}
                className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 36,
                  height: 36,
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)',
                  color: '#aeb4c0'
                }}
                title="Exit interview"
              >
                <FaTimes size={13} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CAMERA / PERMISSION STATUS */}
      {(!recordingReady || recordingError) && (
        <div className="container-fluid px-4 pt-3">
          <div
            className={`d-flex align-items-center justify-content-between gap-3 px-3 py-2 rounded-3 ${
              recordingError ? 'text-danger' : 'text-white-50'
            }`}
            style={{
              background: recordingError
                ? 'rgba(220,53,69,.08)'
                : 'rgba(255,255,255,.035)',
              border: `1px solid ${
                recordingError
                  ? 'rgba(220,53,69,.22)'
                  : 'rgba(255,255,255,.07)'
              }`
            }}
          >
            <div className="d-flex align-items-center gap-2 small">
              <FaVideo size={12} />
              <span>
                {recordingError ||
                  'Checking your camera and microphone. Your interview will be recorded continuously.'}
              </span>
            </div>

            {recordingError && (
              <button
                className="btn btn-sm btn-outline-light rounded-pill px-3"
                onClick={handleRetryRecording}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      <main className="container-fluid px-4 py-4 pb-5">
        <div className="row g-4">
          {/* LEFT COLUMN — CAMERA */}
          <div className="col-xl-5">
            <div className="position-sticky" style={{ top: 92 }}>
              <div
                className="rounded-4 overflow-hidden"
                style={{
                  background: '#10131a',
                  border: '1px solid rgba(255,255,255,.08)',
                  boxShadow: '0 24px 70px rgba(0,0,0,.28)'
                }}
              >
                <div className="position-relative" style={{ aspectRatio: '4 / 3' }}>
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-100 h-100"
                    style={{
                      objectFit: 'cover',
                      transform: 'scaleX(-1)',
                      background: '#050609'
                    }}
                  />

                  {/* subtle cinematic overlay */}
                  <div
                    className="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between"
                    style={{
                      background:
                        'linear-gradient(rgba(0,0,0,.42), transparent)'
                    }}
                  >
                    <div
                      className="px-2 py-1 rounded-pill d-flex align-items-center gap-2"
                      style={{
                        background: 'rgba(0,0,0,.48)',
                        backdropFilter: 'blur(10px)',
                        fontSize: 11
                      }}
                    >
                      <FaCircle
                        size={7}
                        className={
                          recordingReady ? 'text-danger' : 'text-secondary'
                        }
                      />
                      {recordingReady ? 'REC' : 'READYING'}
                    </div>

                    <div
                      className="px-2 py-1 rounded-pill text-white-50"
                      style={{
                        background: 'rgba(0,0,0,.48)',
                        backdropFilter: 'blur(10px)',
                        fontSize: 11
                      }}
                    >
                      Camera
                    </div>
                  </div>

                </div>

                <div className="px-3 py-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="small fw-semibold">Your interview</div>
                      <div className="text-white-50" style={{ fontSize: 11 }}>
                        Stay natural. The recording continues between questions.
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="small fw-bold font-monospace">
                        {formatTimer(recordingSeconds)}
                      </div>
                      <div className="text-white-50" style={{ fontSize: 10 }}>
                        session
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* compact progress — no badge soup */}
              <div className="mt-3 px-1">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-white-50" style={{ fontSize: 11 }}>
                    Interview progress
                  </span>
                  <span className="small fw-semibold">
                    {answeredCount}/{totalQuestions}
                  </span>
                </div>

                <div
                  className="progress"
                  style={{
                    height: 3,
                    background: 'rgba(255,255,255,.08)'
                  }}
                >
                  <div
                    className="progress-bar"
                    style={{
                      width: `${progressPercent}%`,
                      background: '#e9ecef'
                    }}
                  />
                </div>

                <div className="d-flex gap-1 mt-3">
                  {interview.questions.map((_, idx) => {
                    const isCurrent = idx === currentIndex;
                    const isSaved = Boolean(
                      savedAnswers[idx] && savedAnswers[idx].trim()
                    );

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleJumpToQuestion(idx)}
                        disabled={evaluating || isSaving}
                        className="border-0 p-0 flex-grow-1"
                        style={{
                          height: 4,
                          borderRadius: 20,
                          background: isCurrent
                            ? '#f1f3f5'
                            : isSaved
                              ? '#6c757d'
                              : 'rgba(255,255,255,.08)',
                          opacity: isCurrent || isSaved ? 1 : .7
                        }}
                        title={`Question ${idx + 1}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — INTERVIEW */}
          <div className="col-xl-7">
            <div
              className="mb-3 text-uppercase fw-semibold text-white-50"
              style={{ fontSize: 10, letterSpacing: '.14em' }}
            >
              Question {currentIndex + 1} of {totalQuestions}
            </div>

            {/* QUESTION CARD — editorial, spacious */}
            <section
              className="rounded-4 p-4 p-md-5 mb-3"
              style={{
                minHeight: 300,
                background: '#10131a',
                border: '1px solid rgba(255,255,255,.08)'
              }}
            >
              <div className="d-flex align-items-start justify-content-between gap-3 mb-5">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: 34,
                    height: 34,
                    background: 'rgba(255,255,255,.06)',
                    color: '#cbd0d8',
                    flexShrink: 0
                  }}
                >
                  <span className="small fw-bold">
                    {String(currentIndex + 1).padStart(2, '0')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    speakQuestion(currentQ?.questionText || currentQ?.question)
                  }
                  disabled={evaluating || isSaving}
                  className="btn btn-sm rounded-pill px-3"
                  style={{
                    background: 'rgba(255,255,255,.05)',
                    border: '1px solid rgba(255,255,255,.08)',
                    color: '#d7dbe1'
                  }}
                >
                  <FaVolumeUp size={11} className="me-2" />
                  Replay
                </button>
              </div>

              <div
                className="mb-4"
                style={{
                  fontSize: 'clamp(1.45rem, 2.5vw, 2.35rem)',
                  lineHeight: 1.22,
                  letterSpacing: '-.025em',
                  fontWeight: 650,
                  maxWidth: 850
                }}
              >
                {currentQ?.questionText || currentQ?.question}
              </div>

              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2 text-white-50">
                  <span
                    className="rounded-circle"
                    style={{
                      width: 6,
                      height: 6,
                      background: isAiSpeaking ? '#6ea8fe' : '#6c757d'
                    }}
                  />
                  <span style={{ fontSize: 12 }}>
                    {isAiSpeaking ? 'AI is asking the question' : 'Take your time and answer naturally'}
                  </span>
                </div>

                {isAiSpeaking && (
                  <div
                    className="ai-speaking-orb"
                    aria-label="AI is speaking"
                    title="AI is speaking"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: 'radial-gradient(circle at 35% 30%, #dcecff 0%, #8db9ff 18%, #4f7cff 42%, #202b59 70%, #0d1224 100%)',
                      boxShadow: '0 0 0 1px rgba(120,170,255,.28), 0 0 28px rgba(91,139,255,.48), inset 0 0 18px rgba(255,255,255,.22)',
                      animation: 'aiOrbPulse 1.35s ease-in-out infinite'
                    }}
                  >
                    <FaRobot size={16} style={{ color: '#fff', filter: 'drop-shadow(0 0 7px rgba(255,255,255,.65))' }} />
                  </div>
                )}
              </div>
            </section>

            {/* RESPONSE CARD */}
            <section
              className="rounded-4 p-3 p-md-4"
              style={{
                background: '#0e1117',
                border: '1px solid rgba(255,255,255,.08)'
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <div className="small fw-semibold">Your response</div>
                  <div className="text-white-50" style={{ fontSize: 11 }}>
                    {isListening
                      ? 'Student voice detected'
                      : hasCurrentAnswer
                        ? 'Response captured'
                        : 'Speak naturally when you are ready'}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {isListening && (
                    <span
                      className="d-flex align-items-center gap-2 text-danger fw-semibold"
                      style={{ fontSize: 11 }}
                    >
                      <FaMicrophone size={10} />
                      Voice detected
                    </span>
                  )}

                  {hasCurrentAnswer && (
                    <span
                      className="text-success"
                      style={{ fontSize: 11 }}
                    >
                      <FaCheckCircle className="me-1" size={10} />
                      captured
                    </span>
                  )}
                </div>
              </div>

              <textarea
                className="form-control border-0 rounded-3"
                rows="7"
                placeholder={
                  isAiSpeaking
                    ? 'Listen to the question…'
                    : 'Your spoken answer will appear here. You can edit the transcript if needed.'
                }
                value={transcript}
                onChange={(e) => {
                  const value = e.target.value;
                  setTranscript(value);
                  transcriptRef.current = value;
                  speechBaseRef.current = value;
                }}
                disabled={evaluating || isSaving}
                style={{
                  resize: 'vertical',
                  color: '#eef1f5',
                  background: '#080a0f',
                  fontSize: 14,
                  lineHeight: 1.7,
                  boxShadow: 'none',
                  outline: 'none'
                }}
              />

              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <div className="d-flex align-items-center gap-3">
                  <span className="text-white-50" style={{ fontSize: 11 }}>
                    {hasCurrentAnswer
                      ? `${transcript.trim().split(/\s+/).filter(Boolean).length} words`
                      : '0 words'}
                  </span>

                  {hasCurrentAnswer && (
                    <button
                      type="button"
                      onClick={handleResetCurrentAnswer}
                      disabled={evaluating || isSaving}
                      className="btn btn-sm border-0 text-white-50 p-0"
                      style={{ fontSize: 11 }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 || evaluating || isSaving}
                    className="btn btn-sm rounded-pill px-3"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,.1)',
                      color: '#b9bec7'
                    }}
                  >
                    <FaArrowLeft size={10} className="me-2" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAndNext}
                    disabled={evaluating || isSaving}
                    className="btn btn-sm rounded-pill px-4 fw-semibold"
                    style={{
                      background: '#f1f3f5',
                      color: '#090b10',
                      border: 'none',
                      minWidth: 145
                    }}
                  >
                    {evaluating ? (
                      'Finalizing…'
                    ) : isLastQuestion ? (
                      <>
                        Finish interview <FaPaperPlane size={10} className="ms-2" />
                      </>
                    ) : (
                      <>
                        Continue <FaArrowRight size={10} className="ms-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* tiny reassurance — avoids marketing copy */}
            <div className="d-flex align-items-center justify-content-center gap-2 mt-4 text-white-50">
              <FaMicrophone size={9} />
              <span style={{ fontSize: 10 }}>
                Camera and microphone remain active throughout the interview
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* STOP MODAL */}
      {showStopModal && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: 'rgba(0,0,0,.82)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content p-4 rounded-4 text-white"
              style={{
                background: '#11141b',
                border: '1px solid rgba(255,255,255,.1)'
              }}
            >
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 42,
                    height: 42,
                    background: 'rgba(220,53,69,.1)'
                  }}
                >
                  <FaExclamationTriangle className="text-danger" size={17} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Leave this interview?</h6>
                  <div className="text-white-50" style={{ fontSize: 11 }}>
                    Your current session will be stopped.
                  </div>
                </div>
              </div>

              <p className="text-white-50 small mb-4">
                The continuous recording will stop. Any answers already saved
                through the interview flow remain subject to the existing
                server-side behavior.
              </p>

              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-sm rounded-pill px-4"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,.1)',
                    color: '#d8dce2'
                  }}
                  onClick={() => setShowStopModal(false)}
                >
                  Continue
                </button>

                <button
                  className="btn btn-danger btn-sm rounded-pill px-4 fw-semibold"
                  onClick={handleStopInterview}
                >
                  Leave interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT MODAL */}
      {showConfirmModal && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: 'rgba(0,0,0,.82)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content p-4 rounded-4 text-white"
              style={{
                background: '#11141b',
                border: '1px solid rgba(255,255,255,.1)'
              }}
            >
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 42,
                    height: 42,
                    background: 'rgba(255,255,255,.06)'
                  }}
                >
                  <FaPaperPlane size={15} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Finish interview?</h6>
                  <div className="text-white-50" style={{ fontSize: 11 }}>
                    Review your answers before submitting.
                  </div>
                </div>
              </div>

              <p className="text-white-50 small mb-4">
                Your continuous recording will be finalized and the existing
                AI evaluation flow will evaluate the submitted answers.
              </p>

              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-sm rounded-pill px-4"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,.1)',
                    color: '#d8dce2'
                  }}
                  onClick={() => setShowConfirmModal(false)}
                >
                  Review
                </button>

                <button
                  className="btn btn-light btn-sm rounded-pill px-4 fw-semibold"
                  onClick={() => executeFinalSubmission(savedAnswers)}
                >
                  Submit interview
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