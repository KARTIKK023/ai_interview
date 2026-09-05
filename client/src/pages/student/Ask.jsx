import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  FaPlus,
  FaPaperPlane,
  FaTrash,
  FaStop,
  FaRobot,
  FaUser,
  FaCopy,
  FaCheck,
  FaBars,
  FaTimes,
  FaChevronRight,
} from 'react-icons/fa';

import StudentLayout from '../../components/StudentLayout';

import API from '../../services/api';

import toast from 'react-hot-toast';

const Ask = () => {
  const [chats, setChats] = useState([]);

  const [activeChat, setActiveChat] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [input, setInput] = useState('');

  const [loadingChats, setLoadingChats] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [streaming, setStreaming] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [copiedMessage, setCopiedMessage] =
    useState(null);

  const textareaRef = useRef(null);

  const messagesEndRef = useRef(null);

  const abortControllerRef =
    useRef(null);

  /**
   * =========================================================
   * LOAD CHATS
   * =========================================================
   */

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoadingChats(true);

      const response =
        await API.get('/ask/chats');

      const chatList =
        response.data?.chats || [];

      setChats(chatList);

      if (chatList.length > 0) {
        await openChat(chatList[0]._id);
      } else {
        await createNewChat();
      }
    } catch (error) {
      console.error(
        'Failed to load Ask chats:',
        error
      );

      toast.error(
        error.response?.data?.message ||
          'Failed to load chats.'
      );
    } finally {
      setLoadingChats(false);
    }
  };

  /**
   * =========================================================
   * CREATE CHAT
   * =========================================================
   */

  const createNewChat = async () => {
    if (streaming) {
      return;
    }

    try {
      const response =
        await API.post('/ask/chats');

      const newChat =
        response.data?.chat;

      if (!newChat) {
        throw new Error(
          'Chat was not created.'
        );
      }

      setChats((previous) => [
        newChat,
        ...previous,
      ]);

      setActiveChat(newChat);

      setMessages([]);

      setInput('');

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error(
        'Failed to create chat:',
        error
      );

      toast.error(
        error.response?.data?.message ||
          'Failed to create new chat.'
      );
    }
  };

  /**
   * =========================================================
   * OPEN CHAT
   * =========================================================
   */

  const openChat = async (chatId) => {
    if (streaming) {
      return;
    }

    try {
      setLoadingMessages(true);

      const response =
        await API.get(
          `/ask/chats/${chatId}/messages`
        );

      const chat =
        response.data?.chat;

      const chatMessages =
        response.data?.messages || [];

      setActiveChat(chat);

      setMessages(
        chatMessages.map((message) => ({
          id: message._id,
          role: message.role,
          content: message.content,
        }))
      );

      if (
        window.innerWidth < 992
      ) {
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error(
        'Failed to open chat:',
        error
      );

      toast.error(
        error.response?.data?.message ||
          'Failed to load conversation.'
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  /**
   * =========================================================
   * DELETE CHAT
   * =========================================================
   */

  const deleteChat = async (
    event,
    chatId
  ) => {
    event.stopPropagation();

    if (streaming) {
      return;
    }

    const confirmed =
      window.confirm(
        'Delete this chat permanently?'
      );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(
        `/ask/chats/${chatId}`
      );

      const remainingChats =
        chats.filter(
          (chat) =>
            chat._id !== chatId
        );

      setChats(remainingChats);

      if (
        activeChat?._id === chatId
      ) {
        if (remainingChats.length > 0) {
          await openChat(
            remainingChats[0]._id
          );
        } else {
          await createNewChat();
        }
      }

      toast.success(
        'Chat deleted.'
      );
    } catch (error) {
      console.error(
        'Failed to delete chat:',
        error
      );

      toast.error(
        error.response?.data?.message ||
          'Failed to delete chat.'
      );
    }
  };

  /**
   * =========================================================
   * AUTO SCROLL
   * =========================================================
   */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: streaming
        ? 'auto'
        : 'smooth',
    });
  }, [messages, streaming]);

  /**
   * =========================================================
   * INPUT
   * =========================================================
   */

  const handleInputChange = (event) => {
    setInput(event.target.value);

    autoResizeTextarea(event.target);
  };

  const autoResizeTextarea = (
    textarea
  ) => {
    textarea.style.height = 'auto';

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      180
    )}px`;
  };

  /**
   * =========================================================
   * SEND MESSAGE
   * =========================================================
   */

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || streaming) {
      return;
    }

    if (!activeChat?._id) {
      toast.error(
        'Please create a chat first.'
      );

      return;
    }

    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height =
        'auto';
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    const assistantId =
      `assistant-${Date.now()}`;

    const assistantMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
      assistantMessage,
    ]);

    setStreaming(true);

    abortControllerRef.current =
      new AbortController();

    try {
      const token =
        localStorage.getItem('studentToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('superAdminToken');

        if (!token) {
        throw new Error('Authentication token not found. Please login again.');
        }

        const baseURL =
        API.defaults?.baseURL ||
        import.meta.env.VITE_API_URL ||
        'http://localhost:5001/api';

        const response = await fetch(
        `${baseURL}/ask/chats/${activeChat._id}/stream`,
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
            message: text,
            }),
            signal: abortControllerRef.current.signal,
        }
        );

      if (!response.ok) {
        let errorMessage =
          'Failed to generate response.';

        try {
          const errorData =
            await response.json();

          errorMessage =
            errorData?.message ||
            errorMessage;
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(
          errorMessage
        );
      }

      if (!response.body) {
        throw new Error(
          'Streaming is not supported by this response.'
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let buffer = '';

      while (true) {
        const {
          done,
          value,
        } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        const events =
          buffer.split('\n\n');

        buffer =
          events.pop() || '';

        for (const event of events) {
          const dataLine =
            event
              .split('\n')
              .find((line) =>
                line.startsWith(
                  'data:'
                )
              );

          if (!dataLine) {
            continue;
          }

          const jsonText =
            dataLine
              .replace(
                /^data:\s*/,
                ''
              )
              .trim();

          if (!jsonText) {
            continue;
          }

          let data;

          try {
            data =
              JSON.parse(
                jsonText
              );
          } catch {
            continue;
          }

          if (
            data.type ===
            'token'
          ) {
            setMessages(
              (previous) =>
                previous.map(
                  (message) =>
                    message.id ===
                    assistantId
                      ? {
                          ...message,
                          content:
                            message.content +
                            data.content,
                        }
                      : message
                )
            );
          }

          if (
            data.type ===
            'done'
          ) {
            setMessages(
              (previous) =>
                previous.map(
                  (message) =>
                    message.id ===
                    assistantId
                      ? {
                          ...message,
                          content:
                            data.message
                              ?.content ||
                            message.content,
                          streaming:
                            false,
                        }
                      : message
                )
            );
          }

          if (
            data.type ===
            'complete'
          ) {
            setMessages(
              (previous) =>
                previous.map(
                  (message) =>
                    message.id ===
                    assistantId
                      ? {
                          ...message,
                          streaming:
                            false,
                        }
                      : message
                )
            );
          }

          if (
            data.type ===
            'error'
          ) {
            throw new Error(
              data.message ||
                'AI generation failed.'
            );
          }
        }
      }

      /**
       * Refresh chat metadata/title.
       */
      setChats(
        (previous) =>
          previous.map(
            (chat) =>
              chat._id ===
              activeChat._id
                ? {
                    ...chat,
                    title:
                      chat.title ===
                      'New Chat'
                        ? text.length >
                          55
                          ? `${text.substring(
                              0,
                              55
                            )}...`
                          : text
                        : chat.title,
                    lastMessageAt:
                      new Date(),
                  }
                : chat
          )
      );
    } catch (error) {
      if (
        error.name ===
        'AbortError'
      ) {
        setMessages(
          (previous) =>
            previous.map(
              (message) =>
                message.id ===
                assistantId
                  ? {
                      ...message,
                      streaming:
                        false,
                      content:
                        message.content ||
                        'Generation stopped.',
                    }
                  : message
            )
        );
      } else {
        console.error(
          'Ask streaming error:',
          error
        );

        setMessages(
          (previous) =>
            previous.map(
              (message) =>
                message.id ===
                assistantId
                  ? {
                      ...message,
                      streaming:
                        false,
                      error: true,
                      content:
                        message.content ||
                        'Sorry, I could not generate a response.',
                    }
                  : message
            )
        );

        toast.error(
          error.message ||
            'Failed to generate AI response.'
        );
      }
    } finally {
      setStreaming(false);

      abortControllerRef.current =
        null;
    }
  };

  /**
   * =========================================================
   * STOP
   * =========================================================
   */

  const stopGeneration = () => {
    if (
      abortControllerRef.current
    ) {
      abortControllerRef.current.abort();
    }
  };

  /**
   * =========================================================
   * KEYBOARD
   * =========================================================
   */

  const handleKeyDown = (event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  /**
   * =========================================================
   * COPY
   * =========================================================
   */

  const copyMessage = async (
    messageId,
    content
  ) => {
    try {
      await navigator.clipboard.writeText(
        content
      );

      setCopiedMessage(messageId);

      setTimeout(() => {
        setCopiedMessage(null);
      }, 1800);
    } catch {
      toast.error(
        'Unable to copy message.'
      );
    }
  };

  /**
   * =========================================================
   * SIMPLE MARKDOWN RENDERER
   * =========================================================
   */

  const renderMarkdown = (
    content
  ) => {
    if (!content) {
      return null;
    }

    const blocks =
      content.split(
        /(```[\s\S]*?```)/g
      );

    return blocks.map(
      (block, index) => {
        if (
          block.startsWith('```')
        ) {
          const lines =
            block.split('\n');

          let language =
            lines[0]
              .replace(
                '```',
                ''
              )
              .trim();

          const code =
            lines
              .slice(1, -1)
              .join('\n');

          return (
            <CodeBlock
              key={index}
              language={language}
              code={code}
            />
          );
        }

        return (
          <MarkdownText
            key={index}
            text={block}
          />
        );
      }
    );
  };

  /**
   * =========================================================
   * EMPTY STATE
   * =========================================================
   */

  const suggestions = [
    'Explain React hooks with examples',
    'Help me prepare for a technical interview',
    'How does JWT authentication work?',
    'Review this JavaScript concept for me',
  ];

  const useSuggestion = (
    suggestion
  ) => {
    setInput(suggestion);

    setTimeout(() => {
      textareaRef.current?.focus();

      if (textareaRef.current) {
        autoResizeTextarea(
          textareaRef.current
        );
      }
    }, 50);
  };

  /**
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <StudentLayout>
      <div className="ask-page">

        {/* =====================================================
            CHAT SIDEBAR
        ====================================================== */}

        <aside
          className={`ask-sidebar ${
            sidebarOpen
              ? 'ask-sidebar-open'
              : 'ask-sidebar-closed'
          }`}
        >
          <div className="ask-sidebar-header">

            <div className="ask-brand">
              <div className="ask-brand-icon">
                <FaRobot />
              </div>

              <div>
                <div className="ask-brand-title">
                  Ask
                </div>

                <div className="ask-brand-subtitle">
                  HireSmart AI
                </div>
              </div>
            </div>

            <button
              type="button"
              className="ask-mobile-close"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              <FaTimes />
            </button>

          </div>

          <button
            type="button"
            className="ask-new-chat"
            onClick={
              createNewChat
            }
            disabled={streaming}
          >
            <FaPlus />

            <span>
              New Chat
            </span>
          </button>

          <div className="ask-history-label">
            Recent chats
          </div>

          <div className="ask-chat-list">

            {loadingChats ? (
              <div className="ask-sidebar-loading">
                <span className="ask-small-spinner" />
                Loading chats...
              </div>
            ) : chats.length === 0 ? (
              <div className="ask-empty-history">
                Your conversations
                will appear here.
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  type="button"
                  key={chat._id}
                  className={`ask-chat-item ${
                    activeChat?._id ===
                    chat._id
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    openChat(
                      chat._id
                    )
                  }
                >
                  <div className="ask-chat-item-content">

                    <span className="ask-chat-title">
                      {chat.title ||
                        'New Chat'}
                    </span>

                    <span className="ask-chat-arrow">
                      <FaChevronRight />
                    </span>

                  </div>

                  <span
                    className="ask-delete-chat"
                    role="button"
                    tabIndex={0}
                    onClick={(event) =>
                      deleteChat(
                        event,
                        chat._id
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        'Enter'
                      ) {
                        deleteChat(
                          event,
                          chat._id
                        );
                      }
                    }}
                  >
                    <FaTrash />
                  </span>
                </button>
              ))
            )}

          </div>

          <div className="ask-sidebar-footer">
            <div className="ask-model-status">
              <span className="ask-status-dot" />

              <div>
                <div className="ask-status-title">
                  Local AI
                </div>

                <div className="ask-status-model">
                  llama3.1 · 8B
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* =====================================================
            MAIN CHAT
        ====================================================== */}

        <main className="ask-main">

          {/* HEADER */}

          <header className="ask-header">

            <button
              type="button"
              className="ask-sidebar-toggle"
              onClick={() =>
                setSidebarOpen(
                  (value) => !value
                )
              }
            >
              <FaBars />
            </button>

            <div className="ask-header-title">

              <div className="ask-header-icon">
                <FaRobot />
              </div>

              <div>
                <h1>
                  {activeChat?.title ||
                    'Ask'}
                </h1>

                <span>
                  Powered by local AI
                </span>
              </div>

            </div>

            <div className="ask-header-model">
              <span className="ask-live-dot" />
              Llama 3.1 8B
            </div>

          </header>

          {/* MESSAGES */}

          <div className="ask-messages">

            {loadingMessages ? (
              <div className="ask-loading-messages">
                <div className="ask-loading-logo">
                  <FaRobot />
                </div>

                <div className="ask-loading-spinner" />

                <p>
                  Loading conversation...
                </p>
              </div>
            ) : messages.length ===
              0 ? (
              <div className="ask-welcome">

                <div className="ask-welcome-icon">
                  <FaRobot />
                </div>

                <h2>
                  How can I help you?
                </h2>

                <p>
                  Ask anything about
                  programming, interviews,
                  careers, or learning.
                </p>

                <div className="ask-suggestions">

                  {suggestions.map(
                    (suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        onClick={() =>
                          useSuggestion(
                            suggestion
                          )
                        }
                      >
                        <span>
                          {suggestion}
                        </span>

                        <FaChevronRight />
                      </button>
                    )
                  )}

                </div>

              </div>
            ) : (
              <div className="ask-message-container">

                {messages.map(
                  (message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onCopy={
                        copyMessage
                      }
                      copiedMessage={
                        copiedMessage
                      }
                      renderMarkdown={
                        renderMarkdown
                      }
                    />
                  )
                )}

                <div
                  ref={messagesEndRef}
                />

              </div>
            )}

          </div>

          {/* INPUT */}

          <div className="ask-composer-wrapper">

            <div className="ask-composer">

              <textarea
                ref={textareaRef}
                value={input}
                onChange={
                  handleInputChange
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Message Ask..."
                rows={1}
                disabled={
                  streaming ||
                  loadingMessages
                }
              />

              {streaming ? (
                <button
                  type="button"
                  className="ask-stop-button"
                  onClick={
                    stopGeneration
                  }
                  title="Stop generating"
                >
                  <FaStop />
                </button>
              ) : (
                <button
                  type="button"
                  className="ask-send-button"
                  onClick={
                    sendMessage
                  }
                  disabled={
                    !input.trim()
                  }
                  title="Send message"
                >
                  <FaPaperPlane />
                </button>
              )}

            </div>

            <div className="ask-composer-hint">
              <span>
                Enter to send
              </span>

              <span>
                Shift + Enter for new line
              </span>

              <span className="ask-security-note">
                Your chats are stored securely
              </span>
            </div>

          </div>

        </main>

      </div>

      <style>{`
        /* ======================================================
           ASK PAGE
        ====================================================== */

        .ask-page {
          display: flex;
          height: calc(100vh - 70px);
          min-height: 650px;
          background: #f7f9fc;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(15, 23, 42, 0.07);
          box-shadow: 0 8px 35px rgba(15, 23, 42, 0.05);
        }

        /* ======================================================
           SIDEBAR
        ====================================================== */

        .ask-sidebar {
          width: 275px;
          flex: 0 0 275px;
          background: #ffffff;
          border-right: 1px solid #e8ecf2;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .ask-sidebar-header {
          height: 72px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #eef1f5;
        }

        .ask-brand {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .ask-brand-icon {
          width: 39px;
          height: 39px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #0d6efd,
            #4f8cff
          );
          color: white;
          box-shadow: 0 7px 18px rgba(
            13,
            110,
            253,
            0.20
          );
        }

        .ask-brand-title {
          font-weight: 800;
          font-size: 15px;
          color: #172033;
          line-height: 1.1;
        }

        .ask-brand-subtitle {
          font-size: 10px;
          color: #8b95a7;
          margin-top: 3px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .ask-mobile-close {
          display: none;
          border: 0;
          background: transparent;
          color: #64748b;
        }

        .ask-new-chat {
          margin: 16px 14px 12px;
          border: 1px solid #dfe6f0;
          background: #fff;
          border-radius: 10px;
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #1e293b;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.18s ease;
        }

        .ask-new-chat:hover:not(:disabled) {
          border-color: #0d6efd;
          color: #0d6efd;
          background: #f7faff;
        }

        .ask-new-chat:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .ask-history-label {
          padding: 8px 18px 8px;
          color: #98a1b2;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ask-chat-list {
          flex: 1;
          overflow-y: auto;
          padding: 4px 9px;
        }

        .ask-chat-list::-webkit-scrollbar {
          width: 5px;
        }

        .ask-chat-list::-webkit-scrollbar-thumb {
          background: #dce2eb;
          border-radius: 10px;
        }

        .ask-chat-item {
          width: 100%;
          border: 0;
          background: transparent;
          border-radius: 9px;
          padding: 10px 9px;
          margin-bottom: 3px;
          display: flex;
          align-items: center;
          gap: 7px;
          text-align: left;
          color: #526075;
          transition: all 0.15s ease;
        }

        .ask-chat-item:hover {
          background: #f4f7fb;
        }

        .ask-chat-item.active {
          background: #eef5ff;
          color: #0d6efd;
        }

        .ask-chat-item-content {
          display: flex;
          align-items: center;
          min-width: 0;
          flex: 1;
        }

        .ask-chat-title {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 12px;
          font-weight: 600;
        }

        .ask-chat-arrow {
          opacity: 0;
          font-size: 8px;
          margin-left: 5px;
        }

        .ask-chat-item:hover
        .ask-chat-arrow,
        .ask-chat-item.active
        .ask-chat-arrow {
          opacity: 1;
        }

        .ask-delete-chat {
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          color: #a3adbd;
          font-size: 10px;
          flex: 0 0 25px;
          transition: all 0.15s ease;
        }

        .ask-delete-chat:hover {
          background: #fff0f1;
          color: #dc3545;
        }

        .ask-sidebar-loading,
        .ask-empty-history {
          padding: 18px 10px;
          text-align: center;
          color: #9aa4b5;
          font-size: 11px;
        }

        .ask-sidebar-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .ask-small-spinner {
          width: 13px;
          height: 13px;
          border: 2px solid #e3e8ef;
          border-top-color: #0d6efd;
          border-radius: 50%;
          animation: askSpin 0.8s linear infinite;
        }

        .ask-sidebar-footer {
          padding: 14px;
          border-top: 1px solid #eef1f5;
        }

        .ask-model-status {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
          background: #f8fafc;
          border: 1px solid #edf0f4;
          border-radius: 9px;
        }

        .ask-status-dot,
        .ask-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 0 3px rgba(
            22,
            163,
            74,
            0.10
          );
          flex: 0 0 7px;
        }

        .ask-status-title {
          font-size: 11px;
          font-weight: 800;
          color: #344054;
        }

        .ask-status-model {
          font-size: 9px;
          color: #98a1b2;
          margin-top: 2px;
        }

        /* ======================================================
           MAIN
        ====================================================== */

        .ask-main {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }

        .ask-header {
          height: 72px;
          flex: 0 0 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 23px;
          border-bottom: 1px solid #eef1f5;
          background: rgba(
            255,
            255,
            255,
            0.96
          );
        }

        .ask-sidebar-toggle {
          display: none;
          border: 0;
          background: transparent;
          color: #475467;
          font-size: 17px;
          margin-right: 10px;
        }

        .ask-header-title {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .ask-header-icon {
          width: 35px;
          height: 35px;
          border-radius: 10px;
          background: #eef5ff;
          color: #0d6efd;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 35px;
        }

        .ask-header-title h1 {
          margin: 0;
          color: #172033;
          font-size: 15px;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ask-header-title span {
          display: block;
          color: #98a1b2;
          font-size: 10px;
          margin-top: 2px;
        }

        .ask-header-model {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border: 1px solid #e6ebf2;
          border-radius: 20px;
          color: #667085;
          font-size: 10px;
          font-weight: 700;
          background: #fbfcfe;
        }

        /* ======================================================
           MESSAGES
        ====================================================== */

        .ask-messages {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          scroll-behavior: smooth;
        }

        .ask-messages::-webkit-scrollbar {
          width: 6px;
        }

        .ask-messages::-webkit-scrollbar-thumb {
          background: #dfe5ed;
          border-radius: 10px;
        }

        .ask-message-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 28px 25px 50px;
        }

        .ask-welcome {
          max-width: 720px;
          margin: 0 auto;
          min-height: 100%;
          padding: 70px 20px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .ask-welcome-icon {
          width: 58px;
          height: 58px;
          border-radius: 17px;
          background: linear-gradient(
            135deg,
            #0d6efd,
            #5c94ff
          );
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 12px 30px rgba(
            13,
            110,
            253,
            0.20
          );
          margin-bottom: 20px;
        }

        .ask-welcome h2 {
          margin: 0;
          color: #172033;
          font-size: 27px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .ask-welcome > p {
          margin: 9px 0 26px;
          color: #7a8699;
          font-size: 13px;
          max-width: 470px;
          line-height: 1.7;
        }

        .ask-suggestions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          width: 100%;
          gap: 10px;
          margin-top: 4px;
        }

        .ask-suggestions button {
          border: 1px solid #e5eaf1;
          background: #fff;
          border-radius: 11px;
          padding: 13px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          gap: 10px;
          color: #4b5870;
          font-size: 11px;
          line-height: 1.45;
          transition: all 0.17s ease;
        }

        .ask-suggestions button:hover {
          border-color: #b9d2fb;
          background: #f7faff;
          color: #0d6efd;
          transform: translateY(-1px);
        }

        .ask-suggestions button svg {
          font-size: 8px;
          flex: 0 0 auto;
          color: #a0aabc;
        }

        /* ======================================================
           MESSAGE BUBBLE
        ====================================================== */

        .ask-message-row {
          display: flex;
          gap: 13px;
          margin-bottom: 28px;
        }

        .ask-message-row.user {
          justify-content: flex-end;
        }

        .ask-message-avatar {
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .ask-message-avatar.assistant {
          background: #eef5ff;
          color: #0d6efd;
        }

        .ask-message-avatar.user {
          background: #edf1f6;
          color: #526075;
          order: 2;
        }

        .ask-message-body {
          max-width: 76%;
          min-width: 0;
        }

        .ask-message-row.user
        .ask-message-body {
          order: 1;
        }

        .ask-message-content {
          color: #273449;
          font-size: 13px;
          line-height: 1.75;
        }

        .ask-message-row.user
        .ask-message-content {
          background: #0d6efd;
          color: white;
          padding: 10px 14px;
          border-radius: 15px 15px 4px 15px;
          line-height: 1.55;
          white-space: pre-wrap;
        }

        .ask-message-row.assistant
        .ask-message-content {
          padding-top: 2px;
        }

        .ask-message-actions {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 7px;
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .ask-message-row:hover
        .ask-message-actions {
          opacity: 1;
        }

        .ask-copy-button {
          border: 0;
          background: transparent;
          color: #98a1b2;
          width: 27px;
          height: 27px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }

        .ask-copy-button:hover {
          background: #f1f4f8;
          color: #526075;
        }

        /* ======================================================
           MARKDOWN
        ====================================================== */

        .ask-markdown p {
          margin: 0 0 11px;
        }

        .ask-markdown p:last-child {
          margin-bottom: 0;
        }

        .ask-markdown strong {
          color: #172033;
          font-weight: 800;
        }

        .ask-markdown ul,
        .ask-markdown ol {
          margin: 8px 0 12px 20px;
          padding: 0;
        }

        .ask-markdown li {
          margin-bottom: 5px;
        }

        .ask-inline-code {
          padding: 2px 5px;
          background: #f0f3f7;
          border-radius: 5px;
          color: #c2410c;
          font-family: monospace;
          font-size: 11px;
        }

        .ask-code-block {
          margin: 12px 0;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #273449;
          background: #111827;
          color: #e5e7eb;
        }

        .ask-code-header {
          height: 34px;
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #182234;
          border-bottom: 1px solid #273449;
        }

        .ask-code-language {
          color: #9aa6ba;
          font-size: 9px;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 0.06em;
        }

        .ask-code-copy {
          border: 0;
          background: transparent;
          color: #a9b4c7;
          font-size: 10px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .ask-code-copy:hover {
          color: white;
        }

        .ask-code-pre {
          margin: 0;
          padding: 14px;
          overflow-x: auto;
          font-family:
            "SFMono-Regular",
            Consolas,
            "Liberation Mono",
            monospace;
          font-size: 11px;
          line-height: 1.65;
        }

        /* ======================================================
           COMPOSER
        ====================================================== */

        .ask-composer-wrapper {
          padding: 8px 24px 15px;
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            #ffffff 22%
          );
        }

        .ask-composer {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          min-height: 50px;
          display: flex;
          align-items: flex-end;
          gap: 9px;
          border: 1px solid #dce3ed;
          border-radius: 14px;
          padding: 8px 8px 8px 14px;
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(
            15,
            23,
            42,
            0.07
          );
          transition: border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .ask-composer:focus-within {
          border-color: #9fc2f8;
          box-shadow: 0 8px 30px rgba(
            13,
            110,
            253,
            0.10
          );
        }

        .ask-composer textarea {
          flex: 1;
          border: 0;
          outline: 0;
          resize: none;
          max-height: 180px;
          min-height: 31px;
          padding: 7px 0;
          background: transparent;
          color: #172033;
          font-size: 13px;
          line-height: 1.55;
          font-family: inherit;
        }

        .ask-composer textarea::placeholder {
          color: #a0a9b8;
        }

        .ask-send-button,
        .ask-stop-button {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          border-radius: 10px;
          border: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .ask-send-button {
          background: #0d6efd;
          color: white;
          font-size: 11px;
        }

        .ask-send-button:hover:not(:disabled) {
          background: #0b5ed7;
          transform: translateY(-1px);
        }

        .ask-send-button:disabled {
          background: #e6ebf2;
          color: #a3adbc;
          cursor: not-allowed;
        }

        .ask-stop-button {
          background: #fff0f1;
          color: #dc3545;
          font-size: 10px;
        }

        .ask-stop-button:hover {
          background: #ffe1e4;
        }

        .ask-composer-hint {
          width: 100%;
          max-width: 900px;
          margin: 7px auto 0;
          display: flex;
          justify-content: center;
          gap: 13px;
          color: #a1a9b7;
          font-size: 9px;
        }

        .ask-security-note {
          color: #98a1b2;
        }

        /* ======================================================
           LOADING
        ====================================================== */

        .ask-loading-messages {
          height: 100%;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #98a1b2;
        }

        .ask-loading-logo {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          background: #eef5ff;
          color: #0d6efd;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .ask-loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #e4e9f0;
          border-top-color: #0d6efd;
          border-radius: 50%;
          animation: askSpin 0.8s linear infinite;
          margin-bottom: 10px;
        }

        .ask-loading-messages p {
          margin: 0;
          font-size: 11px;
        }

        @keyframes askSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ======================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 991.98px) {
          .ask-page {
            height: calc(100vh - 30px);
            min-height: 600px;
            position: relative;
          }

          .ask-sidebar {
            position: absolute;
            z-index: 20;
            left: 0;
            top: 0;
            bottom: 0;
            box-shadow: 15px 0 40px rgba(
              15,
              23,
              42,
              0.14
            );
            transform: translateX(-100%);
            transition: transform 0.2s ease;
          }

          .ask-sidebar.ask-sidebar-open {
            transform: translateX(0);
          }

          .ask-sidebar-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .ask-mobile-close {
            display: block;
          }

          .ask-header {
            padding: 0 15px;
          }

          .ask-message-container {
            padding-left: 16px;
            padding-right: 16px;
          }

          .ask-message-body {
            max-width: 85%;
          }

          .ask-composer-wrapper {
            padding-left: 12px;
            padding-right: 12px;
          }

          .ask-security-note {
            display: none;
          }
        }

        @media (max-width: 575.98px) {
          .ask-page {
            border-radius: 12px;
          }

          .ask-header-model {
            display: none;
          }

          .ask-header-title h1 {
            max-width: 180px;
          }

          .ask-welcome {
            padding-top: 45px;
          }

          .ask-welcome h2 {
            font-size: 23px;
          }

          .ask-suggestions {
            grid-template-columns: 1fr;
          }

          .ask-message-row {
            gap: 8px;
            margin-bottom: 22px;
          }

          .ask-message-avatar {
            width: 29px;
            height: 29px;
            flex-basis: 29px;
          }

          .ask-message-body {
            max-width: 87%;
          }

          .ask-message-content {
            font-size: 12px;
          }

          .ask-composer-hint {
            display: none;
          }
        }
      `}</style>
    </StudentLayout>
  );
};

/**
 * ============================================================
 * MESSAGE BUBBLE
 * ============================================================
 */

const MessageBubble = ({
  message,
  onCopy,
  copiedMessage,
  renderMarkdown,
}) => {
  const isUser =
    message.role === 'user';

  return (
    <div
      className={`ask-message-row ${
        isUser
          ? 'user'
          : 'assistant'
      }`}
    >
      <div
        className={`ask-message-avatar ${
          isUser
            ? 'user'
            : 'assistant'
        }`}
      >
        {isUser ? (
          <FaUser />
        ) : (
          <FaRobot />
        )}
      </div>

      <div className="ask-message-body">

        <div className="ask-message-content">

          {isUser ? (
            message.content
          ) : (
            <div className="ask-markdown">
              {renderMarkdown(
                message.content
              )}

              {message.streaming && (
                <span className="ask-stream-cursor">
                  ▌
                </span>
              )}
            </div>
          )}

        </div>

        {!message.streaming &&
          message.content && (
            <div className="ask-message-actions">

              <button
                type="button"
                className="ask-copy-button"
                onClick={() =>
                  onCopy(
                    message.id,
                    message.content
                  )
                }
                title="Copy"
              >
                {copiedMessage ===
                message.id ? (
                  <FaCheck />
                ) : (
                  <FaCopy />
                )}
              </button>

            </div>
          )}

      </div>

      <style>{`
        .ask-stream-cursor {
          display: inline-block;
          margin-left: 2px;
          color: #0d6efd;
          animation: askCursorBlink 0.9s
            steps(2, start) infinite;
        }

        @keyframes askCursorBlink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * ============================================================
 * MARKDOWN TEXT
 * ============================================================
 */

const MarkdownText = ({
  text,
}) => {
  if (!text) {
    return null;
  }

  const lines =
    text.split('\n');

  return (
    <div className="ask-markdown">
      {lines.map(
        (line, index) => {
          const trimmed =
            line.trim();

          if (!trimmed) {
            return (
              <div
                key={index}
                style={{
                  height: 7,
                }}
              />
            );
          }

          if (
            trimmed.startsWith('### ')
          ) {
            return (
              <h4
                key={index}
                style={{
                  margin:
                    '15px 0 7px',
                  fontSize: 14,
                  fontWeight: 800,
                  color:
                    '#172033',
                }}
              >
                {trimmed.substring(
                  4
                )}
              </h4>
            );
          }

          if (
            trimmed.startsWith('## ')
          ) {
            return (
              <h3
                key={index}
                style={{
                  margin:
                    '15px 0 7px',
                  fontSize: 15,
                  fontWeight: 800,
                  color:
                    '#172033',
                }}
              >
                {trimmed.substring(
                  3
                )}
              </h3>
            );
          }

          if (
            trimmed.startsWith('# ')
          ) {
            return (
              <h2
                key={index}
                style={{
                  margin:
                    '15px 0 7px',
                  fontSize: 17,
                  fontWeight: 800,
                  color:
                    '#172033',
                }}
              >
                {trimmed.substring(
                  2
                )}
              </h2>
            );
          }

          if (
            trimmed.startsWith('- ') ||
            trimmed.startsWith('* ')
          ) {
            return (
              <div
                key={index}
                style={{
                  display:
                    'flex',
                  gap: 8,
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    color:
                      '#0d6efd',
                    fontWeight:
                      800,
                  }}
                >
                  •
                </span>

                <span>
                  {formatInlineMarkdown(
                    trimmed.substring(
                      2
                    )
                  )}
                </span>
              </div>
            );
          }

          if (
            /^\d+\.\s/.test(
              trimmed
            )
          ) {
            const match =
              trimmed.match(
                /^(\d+)\.\s(.*)$/
              );

            return (
              <div
                key={index}
                style={{
                  display:
                    'flex',
                  gap: 8,
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    color:
                      '#0d6efd',
                    fontWeight:
                      800,
                  }}
                >
                  {match[1]}.
                </span>

                <span>
                  {formatInlineMarkdown(
                    match[2]
                  )}
                </span>
              </div>
            );
          }

          return (
            <p key={index}>
              {formatInlineMarkdown(
                line
              )}
            </p>
          );
        }
      )}
    </div>
  );
};

const formatInlineMarkdown = (
  text
) => {
  const parts =
    text.split(
      /(`[^`]+`|\*\*[^*]+\*\*)/g
    );

  return parts.map(
    (part, index) => {
      if (
        part.startsWith('`') &&
        part.endsWith('`')
      ) {
        return (
          <code
            key={index}
            className="ask-inline-code"
          >
            {part.slice(
              1,
              -1
            )}
          </code>
        );
      }

      if (
        part.startsWith('**') &&
        part.endsWith('**')
      ) {
        return (
          <strong key={index}>
            {part.slice(
              2,
              -2
            )}
          </strong>
        );
      }

      return (
        <React.Fragment key={index}>
          {part}
        </React.Fragment>
      );
    }
  );
};

/**
 * ============================================================
 * CODE BLOCK
 * ============================================================
 */

const CodeBlock = ({
  language,
  code,
}) => {
  const [copied, setCopied] =
    useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      toast.error(
        'Unable to copy code.'
      );
    }
  };

  return (
    <div className="ask-code-block">

      <div className="ask-code-header">

        <span className="ask-code-language">
          {language ||
            'code'}
        </span>

        <button
          type="button"
          className="ask-code-copy"
          onClick={
            copyCode
          }
        >
          {copied ? (
            <>
              <FaCheck />
              Copied
            </>
          ) : (
            <>
              <FaCopy />
              Copy
            </>
          )}
        </button>

      </div>

      <pre className="ask-code-pre">
        <code>
          {code}
        </code>
      </pre>

    </div>
  );
};

export default Ask;