import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaExclamationTriangle,
  FaRedo,
  FaVolumeUp,
  FaCheckCircle,
  FaTimesCircle,
  FaUserSlash
} from 'react-icons/fa';

const VideoRecorder = forwardRef(({
  onTranscriptChange,
  onVideoRecorded,
  isSubmitting,
  questionIndex = 0,
  isAiSpeaking = false,
  compact = false
}, ref) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const isRecordingRef = useRef(false);
  const baseTextRef = useRef('');
  const sessionFinalRef = useRef('');
  const currentSessionFinalRef = useRef('');

  const [permissionError, setPermissionError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcriptText, setTranscriptText] = useState('');
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isMicReady, setIsMicReady] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [speechStatus, setSpeechStatus] = useState('Idle');
  const [hasRecordedVideo, setHasRecordedVideo] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  // Sync manual transcript updates from parent textarea
  const syncManualTranscript = (newText = '') => {
    baseTextRef.current = newText;
    sessionFinalRef.current = '';
    currentSessionFinalRef.current = '';
    setTranscriptText(newText);
  };

  // Expose recording methods to parent component via ref
  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    toggleCamera,
    toggleMic,
    startCamera,
    resetRecording,
    syncManualTranscript,
    isRecording,
    recordingTime,
    cameraEnabled,
    micEnabled,
    hasRecordedVideo,
    transcriptText,
    audioUrl
  }));

  // Keep isRecordingRef in sync
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Stop speech recognition if AI starts speaking
  useEffect(() => {
    if (isAiSpeaking && isRecording) {
      stopRecording();
    }
  }, [isAiSpeaking]);

  // Reset transcript and recorded chunks when question changes
  useEffect(() => {
    resetRecording();
  }, [questionIndex]);

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    baseTextRef.current = '';
    sessionFinalRef.current = '';
    currentSessionFinalRef.current = '';
    setTranscriptText('');
    setHasRecordedVideo(false);
    setAudioUrl(null);
    recordedChunksRef.current = [];
    if (onTranscriptChange) onTranscriptChange('');
  };

  // Recording Timer
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Initialize Camera on mount
  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
      stopSpeechRecognition();
    };
  }, []);

  // Update video srcObject whenever stream state changes
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraReady, streamRef.current]);

  // Audio Context Mic Volume Meter
  useEffect(() => {
    if (streamRef.current && isMicReady && micEnabled) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const audioCtx = new AudioContext();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(streamRef.current);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          let animationId;

          const checkVolume = () => {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const volume = Math.min(100, Math.round((average / 128) * 100));
            setVolumeLevel(volume);
            animationId = requestAnimationFrame(checkVolume);
          };

          checkVolume();

          return () => {
            if (animationId) cancelAnimationFrame(animationId);
            if (audioCtx && audioCtx.state !== 'closed') {
              audioCtx.close().catch(() => {});
            }
          };
        }
      } catch (e) {
        console.warn('AudioContext volume meter note:', e);
      }
    } else {
      setVolumeLevel(0);
    }
  }, [isMicReady, micEnabled]);

  const createFallbackCameraStream = () => {
    try {
      stopCamera();
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');

      const drawCanvas = () => {
        if (!ctx) return;
        ctx.fillStyle = '#060817';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const time = Date.now() * 0.003;
        const radius = 48 + Math.sin(time) * 4;

        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(320, 150, radius + 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        ctx.arc(320, 150, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#818cf8';
        ctx.beginPath();
        ctx.arc(320, 150, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CANDIDATE STREAM ACTIVE', 320, 245);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.fillText('Speak into your mic to record answer', 320, 270);

        requestAnimationFrame(drawCanvas);
      };
      drawCanvas();

      const canvasStream = canvas.captureStream(30);

      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const osc = audioCtx.createOscillator();
          const dst = audioCtx.createMediaStreamDestination();
          osc.connect(dst);
          osc.start();
          const audioTrack = dst.stream.getAudioTracks()[0];
          if (audioTrack) {
            canvasStream.addTrack(audioTrack);
          }
        }
      } catch (e) {}

      streamRef.current = canvasStream;
      setIsCameraReady(true);
      setIsMicReady(true);
      setCameraEnabled(true);
      setMicEnabled(true);
      setPermissionError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = canvasStream;
      }
    } catch (e) {
      console.error('Error creating fallback stream:', e);
    }
  };

  const startCamera = async () => {
    try {
      setIsInitializing(true);
      setPermissionError(null);
      stopCamera();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        createFallbackCameraStream();
        return;
      }

      let mediaStream = null;

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      } catch (err1) {
        console.warn('Standard video+audio failed, trying video only:', err1);
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err2) {
          console.warn('Video only failed:', err2);
        }
      }

      if (mediaStream) {
        streamRef.current = mediaStream;
        const hasVideo = mediaStream.getVideoTracks().length > 0;
        const hasAudio = mediaStream.getAudioTracks().length > 0;

        setIsCameraReady(hasVideo);
        setIsMicReady(hasAudio || true);
        setCameraEnabled(hasVideo);
        setMicEnabled(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } else {
        createFallbackCameraStream();
      }
    } catch (err) {
      console.warn('Camera initialization error:', err);
      createFallbackCameraStream();
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
    setIsMicReady(false);
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[STT] SpeechRecognition API not supported in this browser.');
      setSpeechStatus('Web Speech API not supported. Type response directly.');
      return null;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-IN'; // Indian English accent optimization for candidate responses

      recognition.onstart = () => {
        console.log('[STT] Speech recognition started successfully (onstart fired)');
        setSpeechStatus('Listening & Transcribing...');
      };

      recognition.onresult = (event) => {
        console.log('[STT] Speech result event received. Total results:', event.results.length);
        let sessionFinal = '';
        let sessionInterim = '';

        for (let i = 0; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          const isFinal = event.results[i].isFinal;

          if (isFinal) {
            sessionFinal += chunk + ' ';
          } else {
            sessionInterim += chunk;
          }
        }

        currentSessionFinalRef.current = sessionFinal;

        const base = baseTextRef.current.trim();
        const prevFinal = sessionFinalRef.current.trim();
        const currFinal = sessionFinal.trim();
        const interim = sessionInterim.trim();

        const speechParts = [prevFinal, currFinal, interim].filter(Boolean).join(' ');
        const fullText = [base, speechParts].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

        console.log('[STT] Live transcript updated (en-IN):', fullText);

        setTranscriptText(fullText);
        if (onTranscriptChange) {
          onTranscriptChange(fullText);
        }
      };

      recognition.onnomatch = () => {
        console.warn('[STT] Speech not recognized (onnomatch fired)');
      };

      recognition.onerror = (event) => {
        console.warn('[STT] Speech recognition error event:', event.error);
        if (event.error === 'not-allowed') {
          console.warn('[STT] Microphone permission denied by browser for SpeechRecognition.');
          setSpeechStatus('Microphone permission denied for Speech Recognition.');
        } else if (event.error === 'no-speech') {
          console.log('[STT] No speech detected for a period. Listener remains active.');
        } else if (event.error === 'aborted') {
          console.log('[STT] Speech recognition aborted.');
        } else {
          setSpeechStatus(`Speech listener notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log('[STT] Speech recognition ended (onend fired). isRecording:', isRecordingRef.current, 'isAiSpeaking:', isAiSpeaking);
        
        if (currentSessionFinalRef.current) {
          sessionFinalRef.current = (sessionFinalRef.current + ' ' + currentSessionFinalRef.current).replace(/\s+/g, ' ').trim();
          currentSessionFinalRef.current = '';
        }

        if (isRecordingRef.current && !isAiSpeaking) {
          try {
            console.log('[STT] Auto-restarting continuous speech recognition for pause continuation...');
            recognition.start();
          } catch (e) {
            console.warn('[STT] Immediate restart failed, retrying after 150ms delay:', e);
            setTimeout(() => {
              if (isRecordingRef.current && !isAiSpeaking && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                  console.log('[STT] Speech recognition successfully restarted via timeout');
                } catch (err) {
                  console.warn('[STT] Delayed restart attempt failed:', err);
                }
              }
            }, 150);
          }
        } else {
          setSpeechStatus('Idle');
          console.log('[STT] Recognition stopped completely (answer ended/stopped)');
        }
      };

      recognitionRef.current = recognition;
      return recognition;
    } catch (e) {
      console.warn('[STT] Exception in initSpeechRecognition:', e);
      return null;
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        console.log('[STT] Stopping speech recognition instance...');
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const toggleMic = () => {
    const nextState = !micEnabled;
    setMicEnabled(nextState);

    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = nextState;
      });
    }

    if (!nextState) {
      stopSpeechRecognition();
    } else if (isRecordingRef.current && !isAiSpeaking) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  const startRecording = async (initialText = '') => {
    console.log('[REC] startRecording called. isAiSpeaking:', isAiSpeaking);
    if (isRecording || isSubmitting || isAiSpeaking) return;

    // Check & request microphone permission explicitly
    try {
      console.log('[MIC] Requesting/verifying microphone permission for interview answer...');
      if (!streamRef.current || streamRef.current.getAudioTracks().length === 0) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('[MIC] Microphone permission granted successfully');
          if (streamRef.current) {
            audioStream.getAudioTracks().forEach((track) => streamRef.current.addTrack(track));
          } else {
            streamRef.current = audioStream;
          }
          setIsMicReady(true);
        }
      } else {
        console.log('[MIC] Active microphone track detected in current media stream');
      }
    } catch (micErr) {
      console.warn('[MIC] Microphone permission error or failed to obtain audio track:', micErr);
      setSpeechStatus('Microphone permission denied or audio input unavailable.');
    }

    if (!streamRef.current) {
      startCamera();
      return;
    }

    recordedChunksRef.current = [];
    setHasRecordedVideo(false);
    setAudioUrl(null);

    // Initialize base text with existing text in candidate's response
    if (typeof initialText === 'string' && initialText.trim().length > 0) {
      baseTextRef.current = initialText;
    } else {
      baseTextRef.current = transcriptText || '';
    }
    sessionFinalRef.current = '';

    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
      'audio/webm',
      'audio/ogg'
    ];

    let selectedMimeType = '';
    if (window.MediaRecorder) {
      selectedMimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || '';
    }

    try {
      const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined;
      const recorder = new MediaRecorder(streamRef.current, options);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        console.log('[REC] MediaRecorder stopped');
        const mimeType = recorder.mimeType || selectedMimeType || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });

        if (blob && blob.size > 0) {
          const generatedUrl = URL.createObjectURL(blob);
          setAudioUrl(generatedUrl);
          setHasRecordedVideo(true);
          if (onVideoRecorded) {
            onVideoRecorded({ blob, mimeType, size: blob.size, audioUrl: generatedUrl });
          }
        }
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      isRecordingRef.current = true;

      // Start Speech Recognition
      const instance = initSpeechRecognition();
      if (instance && !isAiSpeaking) {
        try {
          console.log('[STT] Triggering Speech Recognition start()...');
          instance.start();
        } catch (err) {
          console.warn('[STT] Could not start speech recognition:', err);
        }
      }
    } catch (err) {
      console.error('MediaRecorder start failed:', err);
      setPermissionError('MediaRecorder start failed.');
    }
  };

  const stopRecording = () => {
    console.log('[REC] stopRecording called');
    if (!isRecording) return;

    setIsRecording(false);
    isRecordingRef.current = false;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {}
    }

    stopSpeechRecognition();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-recorder-wrapper">
      {/* CANDIDATE CAMERA PREVIEW CONTAINER */}
      <div className="position-relative overflow-hidden rounded-3 border border-secondary border-opacity-25 bg-dark" style={{ minHeight: '220px', aspectRatio: '16 / 9' }}>
        {/* Loading State */}
        {isInitializing && (
          <div className="p-3 text-center text-white bg-dark d-flex flex-column align-items-center justify-content-center h-100">
            <span className="spinner-border spinner-border-sm text-info mb-2"></span>
            <span className="extra-small text-white-50">Connecting camera...</span>
          </div>
        )}

        {/* WEBCAM VIDEO FEED */}
        {!isInitializing && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-100 h-100"
            style={{
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: isCameraReady && cameraEnabled ? 'block' : 'none',
              backgroundColor: '#060817'
            }}
          />
        )}

        {/* Camera Off / Muted Fallback */}
        {!isInitializing && isCameraReady && !cameraEnabled && (
          <div className="p-4 text-center text-white bg-dark d-flex flex-column align-items-center justify-content-center h-100">
            <FaUserSlash size={36} className="text-danger mb-2" />
            <h6 className="fw-bold text-white small mb-0">Camera Off</h6>
            <span className="extra-small text-white-50">Webcam stream paused</span>
          </div>
        )}

        {/* OVERLAY BADGES */}
        <div className="position-absolute top-0 end-0 m-2 px-2 py-1 bg-black bg-opacity-70 text-white rounded-pill extra-small fw-bold border border-secondary border-opacity-25" style={{ zIndex: 10 }}>
          {isCameraReady && cameraEnabled ? (
            <span className="text-success d-flex align-items-center gap-1">● LIVE CAMERA</span>
          ) : (
            <button onClick={startCamera} className="btn p-0 text-info extra-small border-0 bg-transparent fw-bold d-flex align-items-center gap-1">
              <FaRedo size={10} /> Enable Camera
            </button>
          )}
        </div>

        {isRecording ? (
          <div className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-danger text-white rounded-pill d-flex align-items-center gap-1 extra-small fw-bold shadow" style={{ zIndex: 10 }}>
            <span className="spinner-grow spinner-grow-sm text-white" role="status" style={{ width: '8px', height: '8px' }}></span>
            <span>🔴 REC {formatTime(recordingTime)}</span>
          </div>
        ) : isCameraReady ? (
          <div className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-black bg-opacity-70 text-info rounded-pill extra-small fw-semibold border border-secondary border-opacity-25" style={{ zIndex: 10 }}>
            ● CAMERA READY
          </div>
        ) : null}
      </div>

      {/* DEVICE STATUS & MIC CONTROLS */}
      <div className="p-2 bg-black bg-opacity-40 border border-secondary border-opacity-25 rounded-3 mt-2 d-flex flex-wrap align-items-center justify-content-between gap-2 extra-small">
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className={`btn btn-xs ${micEnabled ? 'btn-outline-success border-success text-success' : 'btn-danger text-white'} py-1 px-2 fw-bold d-flex align-items-center gap-1`}
            onClick={toggleMic}
            disabled={!isMicReady}
            title={micEnabled ? 'Turn Mic Off' : 'Turn Mic On'}
          >
            {micEnabled ? (
              <>
                <FaMicrophone size={12} /> MIC ON
              </>
            ) : (
              <>
                <FaMicrophoneSlash size={12} /> MIC OFF
              </>
            )}
          </button>

          <button
            type="button"
            className={`btn btn-xs ${cameraEnabled ? 'btn-outline-light' : 'btn-danger'} py-1 px-2`}
            onClick={toggleCamera}
            disabled={!isCameraReady}
            title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {cameraEnabled ? <FaVideo size={12} /> : <FaVideoSlash size={12} />}
          </button>

          <span className="text-white-50 extra-small d-flex align-items-center gap-2 ms-1">
            {isCameraReady && cameraEnabled ? (
              <span className="text-success d-flex align-items-center gap-1"><FaCheckCircle size={10} /> Camera On</span>
            ) : (
              <span className="text-danger d-flex align-items-center gap-1"><FaTimesCircle size={10} /> Camera Off</span>
            )}
            <span>•</span>
            {isMicReady && micEnabled ? (
              <span className="text-success d-flex align-items-center gap-1"><FaCheckCircle size={10} /> Mic On</span>
            ) : (
              <span className="text-danger d-flex align-items-center gap-1"><FaTimesCircle size={10} /> Mic Off</span>
            )}
          </span>
        </div>

        {/* VOLUME METER */}
        <div className="d-flex align-items-center gap-1">
          <FaVolumeUp className={volumeLevel > 10 ? 'text-success' : 'text-muted'} size={12} />
          <div className="progress" style={{ width: '60px', height: '6px', backgroundColor: '#1e293b' }}>
            <div
              className={`progress-bar ${volumeLevel > 20 ? 'bg-success' : 'bg-warning'}`}
              role="progressbar"
              style={{ width: `${volumeLevel}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoRecorder;
