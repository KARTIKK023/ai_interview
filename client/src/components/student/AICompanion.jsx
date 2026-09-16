import React, {
  useEffect,
  useRef,
  useState,
  useContext
} from 'react';

import {
  FaRobot,
  FaTimes,
  FaRedo,
  FaPaperPlane,
  FaChevronRight
} from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

import { processCompanionMessage } from '../student/companion/companionEngine.js';
import { loadCompanionState } from '../student/companion/companionApi.js';

// ============================================================
// HIRE SMART AI COMPANION
// ============================================================
//
// IMPORTANT:
// The visual design below intentionally stays the same as the
// previous companion. The only meaningful additions are:
//   1. deterministic companion engine
//   2. application/user state loading
//   3. navigation actions returned by the engine
//   4. action buttons rendered inside AI messages
//
// There is NO LLM/API call for generating answers.
// ============================================================

const AICompanion = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);

  const [companionState, setCompanionState] = useState({
    user: null,
    resume: null,
    targetJobs: [],
    interviews: [],
    achievements: []
  });

  const [stateLoaded, setStateLoaded] = useState(false);

  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);
  const responseTimerRef = useRef(null);

  // ============================================================
  // DISPLAY NAME
  // ============================================================

  const getDisplayName = () => {
    return (
      user?.fullName ||
      user?.name ||
      'there'
    );
  };

  // ============================================================
  // TIME
  // ============================================================

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================================================
  // LOAD CURRENT APPLICATION STATE
  // ============================================================
  //
  // This is deliberately separate from the conversation UI.
  // The companion does not need to ask the user things the
  // application already knows.
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadState = async () => {
      try {
        const data = await loadCompanionState();

        if (cancelled) return;

        setCompanionState({
          user: user || data?.user || null,
          resume: data?.resume || null,
          targetJobs: Array.isArray(data?.targetJobs)
            ? data.targetJobs
            : [],
          interviews: Array.isArray(data?.interviews)
            ? data.interviews
            : [],
          achievements: Array.isArray(data?.achievements)
            ? data.achievements
            : []
        });
      } catch (error) {
        console.error(
          'HireSmart AI Companion: failed to load state',
          error
        );

        if (!cancelled) {
          setCompanionState((previous) => ({
            ...previous,
            user: user || previous.user
          }));
        }
      } finally {
        if (!cancelled) {
          setStateLoaded(true);
        }
      }
    };

    loadState();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ============================================================
  // WELCOME MESSAGE
  // ============================================================

  const createWelcomeMessage = () => ({
    id: `welcome-${Date.now()}`,
    sender: 'ai',
    text:
      `Hi ${getDisplayName()}! 👋 I’m HireSmart AI. ` +
      `How can I help you today?`,
    time: getCurrentTime()
  });

  // ============================================================
  // INITIALIZE CHAT
  // ============================================================

  useEffect(() => {
    if (!stateLoaded && !user) return;

    setMessages([createWelcomeMessage()]);
  }, [
    stateLoaded,
    user?.fullName,
    user?.name
  ]);

  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop =
        chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ============================================================
  // FOCUS INPUT
  // ============================================================

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // ============================================================
  // CLEANUP TIMER
  // ============================================================

  useEffect(() => {
    return () => {
      if (responseTimerRef.current) {
        clearTimeout(responseTimerRef.current);
      }
    };
  }, []);

  // ============================================================
  // REFRESH APPLICATION STATE
  // ============================================================
  //
  // Useful after navigation or when the user has changed their
  // resume/target jobs elsewhere in the application.
  // ============================================================

  const refreshCompanionState = async () => {
    try {
      const data = await loadCompanionState();

      setCompanionState({
        user: user || data?.user || null,
        resume: data?.resume || null,
        targetJobs: Array.isArray(data?.targetJobs)
          ? data.targetJobs
          : [],
        interviews: Array.isArray(data?.interviews)
          ? data.interviews
          : [],
        achievements: Array.isArray(data?.achievements)
          ? data.achievements
          : []
      });
    } catch (error) {
      console.error(
        'HireSmart AI Companion: state refresh failed',
        error
      );
    }
  };

  // ============================================================
  // HANDLE ENGINE ACTION
  // ============================================================

  const handleAction = async (action) => {
    if (!action) return;

    if (action.type === 'navigate' && action.route) {
      await refreshCompanionState();
      navigate(action.route);
      setIsOpen(false);
    }
  };

  // ============================================================
  // GET ENGINE RESPONSE
  // ============================================================

  const getCompanionResponse = async (message) => {
    const currentState = {
      ...companionState,
      user: user || companionState.user
    };

    return processCompanionMessage(
      message,
      currentState
    );
  };

  // ============================================================
  // NORMALIZE ENGINE RESULT
  // ============================================================
  //
  // The UI accepts either:
  //   "plain string"
  // or:
  //   { text: "...", actions: [...] }
  //
  // This keeps the UI resilient if the engine implementation is
  // changed later.
  // ============================================================

  const normalizeEngineResult = (result) => {
    if (typeof result === 'string') {
      return {
        text: result,
        actions: []
      };
    }

    if (!result || typeof result !== 'object') {
      return {
        text:
          'I can help you with your HireSmart AI profile, resume, target jobs, ATS, interviews, practice, achievements, and other platform features.',
        actions: []
      };
    }

    return {
      text:
        typeof result.text === 'string' && result.text.trim()
          ? result.text
          : 'I can help you navigate HireSmart AI and work with the information already available in your account.',
      actions: Array.isArray(result.actions)
        ? result.actions.filter(
            (action) =>
              action &&
              action.type === 'navigate' &&
              typeof action.route === 'string' &&
              typeof action.label === 'string'
          )
        : []
    };
  };

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const sendMessage = (messageToSend = input) => {
    const message = String(messageToSend || '').trim();

    if (!message || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: message,
      time: getCurrentTime()
    };

    setMessages((previous) => [
      ...previous,
      userMessage
    ]);

    setInput('');
    setIsTyping(true);

    // Preserve the original companion's small natural delay.
    responseTimerRef.current = setTimeout(async () => {
      try {
        const rawResult = await getCompanionResponse(message);
        const result = normalizeEngineResult(rawResult);

        const aiMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: result.text,
          actions: result.actions,
          time: getCurrentTime()
        };

        setMessages((previous) => [
          ...previous,
          aiMessage
        ]);
      } catch (error) {
        console.error(
          'HireSmart AI Companion response error:',
          error
        );

        setMessages((previous) => [
          ...previous,
          {
            id: `ai-error-${Date.now()}`,
            sender: 'ai',
            text:
              'I ran into a small problem while checking your HireSmart AI information. Please try again.',
            time: getCurrentTime()
          }
        ]);
      } finally {
        setIsTyping(false);
        responseTimerRef.current = null;
      }
    }, 400);
  };

  // ============================================================
  // ENTER KEY
  // ============================================================

  const handleKeyDown = (e) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ============================================================
  // RESET CHAT
  // ============================================================

  const resetChat = () => {
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }

    setMessages([createWelcomeMessage()]);
    setInput('');
    setIsTyping(false);
  };

  // ============================================================
  // SUGGESTED QUESTIONS
  // ============================================================

  const suggestedQuestions = [
    'How does AI evaluate my interview?',
    'Do I have a resume?',
    'What should I do next?',
    'Run an ATS check'
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {!isOpen && (
        <button type="button" className="hs-companion-button" onClick={() => setIsOpen(true)} aria-label="Open HireSmart AI">
          <span className="hs-ripple hs-ripple-1" />
          <span className="hs-ripple hs-ripple-2" />
          <span className="hs-ripple hs-ripple-3" />
          <span className="hs-companion-icon"><FaRobot /></span>
        </button>
      )}

      {isOpen && (
        <div className="hs-companion-chat">
          <div className="hs-companion-header">
            <div className="hs-companion-header-left">
              <div className="hs-companion-header-icon"><FaRobot /></div>
              <div>
                <div className="hs-companion-title">HireSmart AI</div>
                <div className="hs-companion-status"><span />Online · Ready to help</div>
              </div>
            </div>

            <div className="hs-companion-actions">
              <button type="button" onClick={resetChat} title="Reset chat" aria-label="Reset chat"><FaRedo /></button>
              <button type="button" onClick={() => setIsOpen(false)} title="Close" aria-label="Close"><FaTimes /></button>
            </div>
          </div>

          <div className="hs-companion-body" ref={chatBodyRef}>
            {messages.length === 1 && (
              <div className="hs-companion-welcome">
                <div className="hs-welcome-icon"><FaRobot /></div>
                <h5>What can I help you with?</h5>
                <p>Ask me anything about HireSmart AI.</p>
                <div className="hs-suggestions">
                  {suggestedQuestions.map((question) => (
                    <button key={question} type="button" onClick={() => sendMessage(question)} disabled={isTyping}>
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`hs-message-row ${message.sender === 'user' ? 'user' : ''}`}>
                {message.sender === 'ai' && <div className="hs-mini-avatar"><FaRobot /></div>}
                <div className={`hs-message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                  <div className="hs-message-text">{message.text}</div>

                  {message.sender === 'ai' && Array.isArray(message.actions) && message.actions.length > 0 && (
                    <div className="hs-message-actions">
                      {message.actions.map((action, index) => (
                        <button key={`${message.id}-${action.label}-${index}`} type="button" onClick={() => handleAction(action)}>
                          <span>{action.label}</span>
                          <FaChevronRight />
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="hs-message-time">{message.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="hs-message-row">
                <div className="hs-mini-avatar"><FaRobot /></div>
                <div className="hs-typing"><span /><span /><span /></div>
              </div>
            )}
          </div>

          <div className="hs-companion-input">
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask anything..." rows="1" disabled={isTyping} />
            <button type="button" onClick={() => sendMessage()} disabled={!input.trim() || isTyping} aria-label="Send message">
              <FaPaperPlane />
            </button>
          </div>

          <div className="hs-companion-footer">
            <FaRobot />
            HireSmart AI · Platform Assistant
          </div>
        </div>
      )}

      <style>{`

        /* ====================================================

        FLOATING COMPANION

        \==================================================== */

        .hs-companion-button {

        position: fixed;

        right: 22px;

        bottom: 22px;

        z-index: 99999;

        width: 58px;

        height: 58px;

        display: flex;

        align-items: center;

        justify-content: center;

        border: none;

        border-radius: 50%;

        background: #0BDA51;

        cursor: pointer;

        box-shadow:

            0 10px 30px rgba(11, 218, 81, 0.30);

        transition:

            transform 0.2s ease,

            box-shadow 0.2s ease;

        }

        .hs-companion-button:hover {

        transform: translateY(-3px) scale(1.04);

        box-shadow:

            0 15px 38px rgba(11, 218, 81, 0.38);

        }



        /* ====================================================

        RIPPLE EFFECT

        \==================================================== */

        .hs-ripple {

        position: absolute;

        width: 58px;

        height: 58px;

        border-radius: 50%;

        border: 2px solid rgba(11, 218, 81, 0.45);

        pointer-events: none;

        animation:

            hsRipple 2.4s ease-out infinite;

        }



        /* First ripple */

        .hs-ripple-1 {

        animation-delay: 0s;

        }



        /* Second ripple */

        .hs-ripple-2 {

        animation-delay: 0.8s;

        }



        /* Third ripple */

        .hs-ripple-3 {

        animation-delay: 1.6s;

        }



        @keyframes hsRipple {

        0% {

            width: 58px;

            height: 58px;

            opacity: 0.75;

            transform: scale(1);

        }

        70% {

            opacity: 0.15;

        }

        100% {

            width: 105px;

            height: 105px;

            opacity: 0;

            transform: scale(1);

        }

        }



        /* ====================================================

        ROBOT ICON

        \==================================================== */

        .hs-companion-icon {

        position: relative;

        z-index: 2;

        width: 44px;

        height: 44px;

        display: flex;

        align-items: center;

        justify-content: center;

        border-radius: 50%;

        color: #FFFFFF;

        background: #0BDA51;

        font-size: 28px;

        animation:

            hsRobotFloat 2.7s ease-in-out infinite;

        }



        @keyframes hsRobotFloat {

        0%,

        100% {

            transform:

            translateY(0)

            rotate(0deg);

        }

        25% {

            transform:

            translateY(-2px)

            rotate(-3deg);

        }

        50% {

            transform:

            translateY(-4px)

            rotate(0deg);

        }

        75% {

            transform:

            translateY(-2px)

            rotate(3deg);

        }

        }

        /* ====================================================

           CHAT WINDOW

        \==================================================== */

        .hs-companion-chat {

          position: fixed;

          right: 22px;

          bottom: 22px;

          z-index: 100000;

          width: 350px;

          height: 500px;

          max-width:

            calc(100vw - 28px);

          max-height:

            calc(100vh - 35px);

          display: flex;

          flex-direction: column;

          overflow: hidden;

          border:

            1px solid #E1E5EC;

          border-radius: 18px;

          background: #FFFFFF;

          box-shadow:

            0 25px 70px

            rgba(15,23,42,.25);

          animation:

            hsChatOpen .2s ease-out;

        }



        @keyframes hsChatOpen {

          from {

            opacity: 0;

            transform:

              translateY(10px)

              scale(.97);

          }

          to {

            opacity: 1;

            transform:

              translateY(0)

              scale(1);

          }

        }



        /* ====================================================

           HEADER

        \==================================================== */

        .hs-companion-header {

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding: 12px 13px;

          color: #FFFFFF;

          background: #111827;

        }



        .hs-companion-header-left {

          display: flex;

          align-items: center;

          gap: 10px;

        }



        .hs-companion-header-icon {

          width: 39px;

          height: 39px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          color: #FFFFFF;

          background:

            linear-gradient(

              145deg,

              #5B4FE8,

              #4F46E5

            );

          font-size: 17px;

        }



        .hs-companion-title {

          color: #FFFFFF;

          font-size: 13px;

          font-weight: 800;

        }



        .hs-companion-status {

          display: flex;

          align-items: center;

          gap: 5px;

          margin-top: 2px;

          color: #AAB2C0;

          font-size: 8px;

        }



        .hs-companion-status span {

          width: 5px;

          height: 5px;

          border-radius: 50%;

          background: #35D399;

        }



        .hs-companion-actions {

          display: flex;

          gap: 4px;

        }



        .hs-companion-actions button {

          width: 29px;

          height: 29px;

          display: flex;

          align-items: center;

          justify-content: center;

          border: none;

          border-radius: 8px;

          color: #AAB2C0;

          background:

            rgba(255,255,255,.08);

          cursor: pointer;

        }



        .hs-companion-actions button:hover {

          color: #FFFFFF;

          background:

            rgba(255,255,255,.15);

        }



        /* ====================================================

           BODY

        \==================================================== */

        .hs-companion-body {

          flex: 1;

          overflow-y: auto;

          padding: 13px;

          background: #F8F9FC;

        }



        .hs-companion-body::-webkit-scrollbar {

          width: 4px;

        }



        .hs-companion-body::-webkit-scrollbar-thumb {

          background: #D4D8E1;

          border-radius: 10px;

        }



        /* ====================================================

           WELCOME

        \==================================================== */

        .hs-companion-welcome {

          padding: 14px;

          margin-bottom: 14px;

          text-align: center;

          border:

            1px solid #E5E8EF;

          border-radius: 13px;

          background: #FFFFFF;

        }



        .hs-welcome-icon {

          width: 39px;

          height: 39px;

          display: flex;

          align-items: center;

          justify-content: center;

          margin:

            0 auto 8px;

          border-radius: 11px;

          color: #5146E5;

          background: #EEF0FF;

          font-size: 15px;

        }



        .hs-companion-welcome h5 {

          margin:

            0 0 4px;

          color: #20293A;

          font-size: 12px;

          font-weight: 800;

        }



        .hs-companion-welcome p {

          margin:

            0 0 11px;

          color: #8A91A0;

          font-size: 9px;

        }



        /* ====================================================

           SUGGESTIONS

        \==================================================== */

        .hs-suggestions {

          display: flex;

          flex-wrap: wrap;

          justify-content: center;

          gap: 5px;

        }



        .hs-suggestions button {

          padding:

            6px 8px;

          border:

            1px solid #E0E4F8;

          border-radius: 999px;

          color: #4D45BE;

          background: #F5F6FF;

          font-size: 8px;

          font-weight: 600;

          cursor: pointer;

          transition:

            background .15s ease;

        }



        .hs-suggestions button:hover {

          background: #ECEEFF;

        }



        /* ====================================================

           MESSAGE ROW

        \==================================================== */

        .hs-message-row {

          display: flex;

          align-items: flex-end;

          gap: 6px;

          margin-bottom: 9px;

        }



        .hs-message-row\.user {

          justify-content: flex-end;

        }



        /* ====================================================

           MINI ROBOT

        \==================================================== */

        .hs-mini-avatar {

          width: 22px;

          height: 22px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 7px;

          color: #5146E5;

          background: #E7E9FF;

          font-size: 9px;

        }



        /* ====================================================

           MESSAGE

        \==================================================== */

        .hs-message {

          max-width: 79%;

          padding:

            8px 10px;

          border-radius: 11px;

          font-size: 10px;

          line-height: 1.55;

        }



        .ai-message {

          color: #374151;

          background: #FFFFFF;

          border:

            1px solid #E3E6ED;

          border-bottom-left-radius: 3px;

        }



        .user-message {

          color: #FFFFFF;

          background: #4F46E5;

          border-bottom-right-radius: 3px;

        }



        .hs-message-time {

          display: block;

          margin-top: 3px;

          text-align: right;

          font-size: 6px;

          opacity: .5;

        }



        /* ====================================================

           TYPING

        \==================================================== */

        .hs-typing {

          display: flex;

          align-items: center;

          gap: 4px;

          padding:

            9px 11px;

          border:

            1px solid #E3E6ED;

          border-radius: 11px;

          border-bottom-left-radius: 3px;

          background: #FFFFFF;

        }



        .hs-typing span {

          width: 4px;

          height: 4px;

          border-radius: 50%;

          background: #9299A7;

          animation:

            hsTyping 1.1s infinite;

        }



        .hs-typing span:nth-child(2) {

          animation-delay: .15s;

        }



        .hs-typing span:nth-child(3) {

          animation-delay: .3s;

        }



        @keyframes hsTyping {

          0%,

          60%,

          100% {

            transform: translateY(0);

            opacity: .35;

          }

          30% {

            transform: translateY(-3px);

            opacity: 1;

          }

        }



        /* ====================================================

           INPUT

        \==================================================== */

        .hs-companion-input {

          display: flex;

          align-items: flex-end;

          gap: 6px;

          padding: 9px;

          border-top:

            1px solid #E7E9EE;

          background: #FFFFFF;

        }



        .hs-companion-input textarea {

          flex: 1;

          min-height: 37px;

          max-height: 80px;

          resize: none;

          padding:

            9px 10px;

          border:

            1px solid #DDE1E8;

          border-radius: 9px;

          outline: none;

          color: #273142;

          background: #FAFBFC;

          font-family: inherit;

          font-size: 10px;

        }



        .hs-companion-input textarea:focus {

          border-color: #9EA5F8;

          background: #FFFFFF;

          box-shadow:

            0 0 0 3px

            rgba(79,70,229,.06);

        }



        .hs-companion-input button {

          width: 37px;

          height: 37px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border: none;

          border-radius: 9px;

          color: #FFFFFF;

          background: #4F46E5;

          cursor: pointer;

        }



        .hs-companion-input button:hover:not(:disabled) {

          background: #4338CA;

        }



        .hs-companion-input button:disabled {

          opacity: .4;

          cursor: not-allowed;

        }



        /* ====================================================

           FOOTER

        \==================================================== */

        .hs-companion-footer {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 4px;

          padding: 5px;

          border-top:

            1px solid #F0F1F4;

          color: #9AA1AE;

          background: #FFFFFF;

          font-size: 7px;

        }



        /* ====================================================

           MOBILE

        \==================================================== */



        @media (max-width: 575px) {

        .hs-companion-button {

            right: 15px;

            bottom: 15px;

            width: 52px;

            height: 52px;

        }

        .hs-companion-icon {

            width: 40px;

            height: 40px;

            font-size: 18px;

        }

        .hs-ripple {

            width: 52px;

            height: 52px;

        }

        @keyframes hsRipple {

            0% {

            width: 52px;

            height: 52px;

            opacity: 0.75;

            }

            70% {

            opacity: 0.15;

            }

            100% {

            width: 92px;

            height: 92px;

            opacity: 0;

            }

        }

        .hs-companion-chat {

            right: 10px;

            bottom: 10px;

            width: calc(100vw - 20px);

            height: calc(100vh - 20px);

            max-height: none;

            border-radius: 16px;

        }

        }


        /* Navigation actions — same visual language as the original UI */
        .hs-message-actions {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-top: 9px;
          padding-top: 7px;
          border-top: 1px solid #EEF0F5;
        }

        .hs-message-actions button {
          width: 100%;
          min-height: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 6px 9px;
          border: 1px solid #E1E4F2;
          border-radius: 8px;
          color: #4F46E5;
          background: #F8F8FF;
          font-size: 9px;
          font-weight: 600;
          cursor: pointer;
          transition: background .18s ease, border-color .18s ease;
        }

        .hs-message-actions button:hover {
          background: #F0EFFF;
          border-color: #CFCBF9;
        }

        .hs-message-actions button span {
          flex: 1;
          text-align: left;
        }

        .hs-message-actions button svg {
          flex-shrink: 0;
          font-size: 8px;
        }
      `}</style>
    </>
  );
};

export default AICompanion;