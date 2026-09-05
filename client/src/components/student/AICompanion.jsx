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

import { AuthContext } from '/Users/kartikchaudhary/Desktop/Ai-Interview main/client/src/context/AuthContext.jsx';


// ============================================================
// HIRE SMART AI COMPANION
// ============================================================

const AICompanion = () => {

  const { user } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);

  const [input, setInput] = useState('');

  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([]);

  const chatBodyRef = useRef(null);

  const inputRef = useRef(null);


  // ============================================================
  // HIRE SMART AI KNOWLEDGE BASE
  // ============================================================

  const aiKnowledge = [

    {
      keywords: [
        'interview',
        'mock interview',
        'ai interview',
        'evaluation',
        'evaluate',
        'score',
        'scoring',
        'answer',
        'answers',
        'interview score'
      ],

      response:
        'Your AI Mock Interview responses are evaluated against competency criteria for your target role. HireSmart AI looks at relevance, accuracy, technical knowledge, problem solving, logical structure, clarity, and overall answer quality. You receive a score along with strengths, weaknesses, and improvement suggestions.'
    },


    {
      keywords: [
        'resume',
        'cv',
        'upload resume',
        'upload cv',
        'resume upload',
        'pdf',
        'resume format'
      ],

      response:
        'You can upload your resume as a PDF file. The current maximum file size is 16MB. HireSmart AI extracts the resume content for ATS analysis and uses it to help evaluate your career profile.'
    },


    {
      keywords: [
        'ats',
        'ats score',
        'resume score',
        'scanner',
        'resume analysis',
        'ats scanner'
      ],

      response:
        'The ATS scanner analyzes your resume content against important job-related information. It helps identify how well your resume aligns with the skills and requirements relevant to your target career.'
    },


    {
      keywords: [
        'placement',
        'placements',
        'job',
        'jobs',
        'job opportunities',
        'placement opportunities',
        'job matching',
        'job match'
      ],

      response:
        'Placement Opportunities are matched using your saved Target Jobs, core competencies, required skills, and location preferences. This helps surface opportunities that are more relevant to the career path you are targeting.'
    },


    {
      keywords: [
        'target job',
        'target jobs',
        'career target',
        'career goal',
        'target career'
      ],

      response:
        'Your Target Jobs help HireSmart AI understand the career direction you are preparing for. They are used to personalize interview preparation, competency matching, and relevant placement opportunities.'
    },


    {
      keywords: [
        'certificate',
        'certificates',
        'credential',
        'achievement',
        'download certificate',
        'certificate download'
      ],

      response:
        'You can find your certificates under the Certificates & Achievements section in the sidebar. From there, you can view your certificate and download the PDF version when available.'
    },


    {
      keywords: [
        'profile',
        'account',
        'name',
        'phone',
        'profile information',
        'personal information'
      ],

      response:
        'You can manage your personal profile information from the Profile section. Keep your information and professional details updated so your HireSmart AI experience remains personalized.'
    },


    {
      keywords: [
        'question bank',
        'questionbank',
        'questions',
        'practice questions',
        'practice'
      ],

      response:
        'The Question Bank contains interview questions that you can use for preparation and practice. It is useful for improving your confidence before attempting an actual AI Mock Interview.'
    },


    {
      keywords: [
        'help',
        'support',
        'contact',
        'support team',
        'ticket',
        'problem',
        'issue'
      ],

      response:
        'Of course! 😊 You can use the Help & Support section to find answers to common questions or send a support request to the HireSmart AI support team.'
    },


    {
      keywords: [
        'dashboard',
        'student dashboard',
        'home'
      ],

      response:
        'Your Student Dashboard gives you an overview of your HireSmart AI activity. From there you can access your profile, resume, target jobs, question bank, interviews, certificates, placements, and AI assistance.'
    },


    {
      keywords: [
        'hello',
        'hi',
        'hey',
        'good morning',
        'good afternoon',
        'good evening'
      ],

      response:
        'Hey there! 👋 I’m HireSmart AI. I can help you with interviews, resumes, ATS scoring, placement opportunities, Target Jobs, certificates, profiles, and other platform features.'
    }

  ];


  // ============================================================
  // SUGGESTED QUESTIONS
  // ============================================================

  const suggestedQuestions = [
    'How does AI evaluate my interview?',
    'How do I upload my resume?',
    'How are placement jobs matched?',
    'Where can I find my certificates?'
  ];


  // ============================================================
  // GET DISPLAY NAME
  // ============================================================

  const getDisplayName = () => {

    return (
      user?.fullName ||
      user?.name ||
      'there'
    );

  };


  // ============================================================
  // INITIAL MESSAGE
  // ============================================================

  const createWelcomeMessage = () => {

    return {

      id: `welcome-${Date.now()}`,

      sender: 'ai',

      text:
        `Hi ${getDisplayName()}! 👋 I’m HireSmart AI. ` +
        `How can I help you today?`,

      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })

    };

  };


  // ============================================================
  // INITIALIZE CHAT
  // ============================================================

  useEffect(() => {

    setMessages([
      createWelcomeMessage()
    ]);

  }, [
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

  }, [
    messages,
    isTyping
  ]);


  // ============================================================
  // FOCUS INPUT
  // ============================================================

  useEffect(() => {

    if (isOpen) {

      setTimeout(() => {

        inputRef.current?.focus();

      }, 150);

    }

  }, [isOpen]);


  // ============================================================
  // FIND AI RESPONSE
  // ============================================================

  const getAIResponse = (question) => {

    const normalizedQuestion =
      question
        .toLowerCase()
        .trim();


    // ----------------------------------------------------------
    // Direct keyword matching
    // ----------------------------------------------------------

    const matchedTopic =
      aiKnowledge.find((topic) => {

        return topic.keywords.some(
          (keyword) =>
            normalizedQuestion.includes(
              keyword.toLowerCase()
            )
        );

      });


    if (matchedTopic) {

      return matchedTopic.response;

    }


    // ----------------------------------------------------------
    // Additional combined checks
    // ----------------------------------------------------------

    if (
      normalizedQuestion.includes('what') &&
      normalizedQuestion.includes('hire smart')
    ) {

      return (
        'HireSmart AI is an interview and career preparation ' +
        'platform designed to help students prepare for jobs ' +
        'through AI Mock Interviews, resume and ATS analysis, ' +
        'Target Jobs, Question Bank, Certificates, and Placement Opportunities.'
      );

    }


    if (
      normalizedQuestion.includes('how') &&
      normalizedQuestion.includes('prepare')
    ) {

      return (
        'A good way to prepare on HireSmart AI is to first ' +
        'keep your Profile and Resume updated, select your Target Jobs, ' +
        'practice questions from the Question Bank, and then attempt AI Mock Interviews.'
      );

    }


    // ----------------------------------------------------------
    // Default response
    // ----------------------------------------------------------

    return (
      'That’s a great question! 😊 I currently know about ' +
      'HireSmart AI features such as AI Mock Interviews, ' +
      'Resume Uploads, ATS Scoring, Target Jobs, Placement ' +
      'Opportunities, Question Bank, Certificates, Profiles, ' +
      'and platform Support. Try asking me about one of these.'
    );

  };


  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const sendMessage = (
    messageToSend = input
  ) => {

    const message =
      messageToSend.trim();


    if (
      !message ||
      isTyping
    ) {

      return;

    }


    const currentTime =
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });


    // ----------------------------------------------------------
    // USER MESSAGE
    // ----------------------------------------------------------

    const userMessage = {

      id: `user-${Date.now()}`,

      sender: 'user',

      text: message,

      time: currentTime

    };


    setMessages((previous) => [
      ...previous,
      userMessage
    ]);


    setInput('');

    setIsTyping(true);


    // ----------------------------------------------------------
    // Small natural delay
    // ----------------------------------------------------------

    setTimeout(() => {

      const aiMessage = {

        id: `ai-${Date.now()}`,

        sender: 'ai',

        text: getAIResponse(message),

        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })

      };


      setMessages((previous) => [
        ...previous,
        aiMessage
      ]);


      setIsTyping(false);

    }, 650);

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

    setMessages([
      createWelcomeMessage()
    ]);

    setInput('');

    setIsTyping(false);

  };


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <>

      {/* ======================================================
          FLOATING COMPANION
      ======================================================= */}

      {!isOpen && (

        <button
            type="button"
            className="hs-companion-button"
            onClick={() => setIsOpen(true)}
            aria-label="Open HireSmart AI"
            >
            {/* Ripple rings */}
            <span className="hs-ripple hs-ripple-1"></span>
            <span className="hs-ripple hs-ripple-2"></span>
            <span className="hs-ripple hs-ripple-3"></span>

            {/* Robot */}
            <span className="hs-companion-icon">
                <FaRobot />
            </span>
        </button>

      )}


      {/* ======================================================
          CHAT WINDOW
      ======================================================= */}

      {isOpen && (

        <div className="hs-companion-chat">


          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="hs-companion-header">

            <div className="hs-companion-header-left">

              <div className="hs-companion-header-icon">

                <FaRobot />

              </div>


              <div>

                <div className="hs-companion-title">
                  HireSmart AI
                </div>

                <div className="hs-companion-status">

                  <span />

                  Online · Ready to help

                </div>

              </div>

            </div>


            <div className="hs-companion-actions">

              <button
                type="button"
                onClick={resetChat}
                title="Reset chat"
              >

                <FaRedo />

              </button>


              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
              >

                <FaTimes />

              </button>

            </div>

          </div>


          {/* ==================================================
              BODY
          ================================================== */}

          <div
            className="hs-companion-body"
            ref={chatBodyRef}
          >


            {/* ------------------------------------------------
                WELCOME SUGGESTIONS
            ------------------------------------------------- */}

            {messages.length === 1 && (

              <div className="hs-companion-welcome">

                <div className="hs-welcome-icon">

                  <FaRobot />

                </div>


                <h5>
                  What can I help you with?
                </h5>


                <p>
                  Ask me anything about HireSmart AI.
                </p>


                <div className="hs-suggestions">

                  {suggestedQuestions.map(
                    (question) => (

                      <button
                        key={question}
                        type="button"
                        onClick={() =>
                          sendMessage(question)
                        }
                      >

                        {question}

                      </button>

                    )
                  )}

                </div>

              </div>

            )}


            {/* ------------------------------------------------
                MESSAGES
            ------------------------------------------------- */}

            {messages.map((message) => (

              <div
                key={message.id}
                className={`hs-message-row ${
                  message.sender === 'user'
                    ? 'user'
                    : ''
                }`}
              >


                {message.sender === 'ai' && (

                  <div className="hs-mini-avatar">

                    <FaRobot />

                  </div>

                )}


                <div
                  className={`hs-message ${
                    message.sender === 'user'
                      ? 'user-message'
                      : 'ai-message'
                  }`}
                >

                  <div className="hs-message-text">
                    {message.text}
                  </div>


                  <span className="hs-message-time">
                    {message.time}
                  </span>

                </div>

              </div>

            ))}


            {/* ------------------------------------------------
                TYPING
            ------------------------------------------------- */}

            {isTyping && (

              <div className="hs-message-row">

                <div className="hs-mini-avatar">

                  <FaRobot />

                </div>


                <div className="hs-typing">

                  <span />
                  <span />
                  <span />

                </div>

              </div>

            )}

          </div>


          {/* ==================================================
              INPUT
          ================================================== */}

          <div className="hs-companion-input">

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows="1"
              disabled={isTyping}
            />


            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={
                !input.trim() ||
                isTyping
              }
            >

              <FaPaperPlane />

            </button>

          </div>


          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="hs-companion-footer">

            <FaRobot />

            HireSmart AI · Platform Assistant

          </div>

        </div>

      )}


      {/* ======================================================
          STYLES
      ======================================================= */}

      <style>{`
        /* ====================================================
        FLOATING COMPANION
        ==================================================== */

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
        ==================================================== */

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
        ==================================================== */

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
        ==================================================== */

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
        ==================================================== */

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
        ==================================================== */

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
        ==================================================== */

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
        ==================================================== */

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
        ==================================================== */

        .hs-message-row {

          display: flex;

          align-items: flex-end;

          gap: 6px;

          margin-bottom: 9px;

        }


        .hs-message-row.user {

          justify-content: flex-end;

        }


        /* ====================================================
           MINI ROBOT
        ==================================================== */

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
        ==================================================== */

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
        ==================================================== */

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
        ==================================================== */

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
        ==================================================== */

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
        ==================================================== */

       

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

      `}</style>

    </>

  );

};


export default AICompanion;