import React, { useState, useRef, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/chatbot`;

// Sugerencias rápidas para el usuario
const QUICK_REPLIES = [
  '¿Qué materiales venden?',
  '¿Cómo puedo hacer un pedido?',
  '¿Cuáles son los métodos de pago?',
  '¿Hacen envíos a domicilio?',
  '¿Tienen cemento disponible?',
];

function TypingDots() {
  return (
    <div className="chat-typing-dots" aria-label="El asistente está escribiendo">
      <span></span><span></span><span></span>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isBot = msg.role === 'bot';
  return (
    <div className={`chat-message ${isBot ? 'chat-message--bot' : 'chat-message--user'}`}>
      {isBot && (
        <div className="chat-avatar" aria-hidden="true">
          <span>🤖</span>
        </div>
      )}
      <div className="chat-bubble">
        {/* Render simple: preserve line breaks */}
        {msg.content.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < msg.content.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
        <span className="chat-timestamp">{msg.time}</span>
      </div>
    </div>
  );
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      content: '¡Hola! 👋 Soy **FES Asistente**, tu ayudante virtual de F.E.S. Construcción.\n\n¿En qué puedo ayudarte hoy? Puedo orientarte sobre productos, pedidos, envíos y más.',
      time: formatTime()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setHasUnread(false);
    }
  }, [isOpen]);

  // Mostrar badge de no leído cuando llega mensaje y está cerrado
  useEffect(() => {
    if (!isOpen && messages.length > 1 && messages[messages.length - 1].role === 'bot') {
      setHasUnread(true);
    }
  }, [messages, isOpen]);

  function formatTime() {
    return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  const sendMessage = useCallback(async (texto) => {
    const textoFinal = (texto || inputValue).trim();
    if (!textoFinal || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', content: textoFinal, time: formatTime() };
    const historialActual = [...messages];

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      // Construir historial para el backend (sin el mensaje de bienvenida inicial)
      const historialParaAPI = historialActual
        .filter(m => m.id !== 1) // excluir bienvenida fija
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: textoFinal, historial: historialParaAPI })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error del servidor');
      }

      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: data.respuesta || 'No pude obtener una respuesta. Intenta de nuevo.',
        time: formatTime()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: `⚠️ ${err.message || 'Hubo un error de conexión. Por favor intenta nuevamente.'}`,
        time: formatTime()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, messages, isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: Date.now(),
      role: 'bot',
      content: '¡Chat reiniciado! 🔄 ¿En qué puedo ayudarte?',
      time: formatTime()
    }]);
    setShowSuggestions(true);
  };

  return (
    <>
      {/* ── Ventana del Chat ── */}
      <div
        className={`chatbot-window ${isOpen ? 'chatbot-window--open' : ''}`}
        role="dialog"
        aria-label="Asistente virtual FES"
        aria-expanded={isOpen}
        ref={chatWindowRef}
      >
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-status-dot" aria-hidden="true"></div>
            <div>
              <p className="chatbot-name">FES Asistente</p>
              <p className="chatbot-status">En línea · IA Gemini</p>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button
              className="chatbot-action-btn"
              onClick={handleClearChat}
              title="Reiniciar conversación"
              aria-label="Reiniciar conversación"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
            <button
              className="chatbot-action-btn"
              onClick={() => setIsOpen(false)}
              title="Cerrar chat"
              aria-label="Cerrar chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="chatbot-messages" role="log" aria-live="polite">
          {messages.map(msg => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="chat-message chat-message--bot">
              <div className="chat-avatar" aria-hidden="true"><span>🤖</span></div>
              <div className="chat-bubble">
                <TypingDots />
              </div>
            </div>
          )}

          {/* Quick Replies */}
          {showSuggestions && !isLoading && messages.length <= 2 && (
            <div className="chatbot-suggestions" aria-label="Preguntas frecuentes">
              {QUICK_REPLIES.map((q, i) => (
                <button
                  key={i}
                  className="chatbot-suggestion-btn"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chatbot-input-area">
          <textarea
            ref={inputRef}
            id="chatbot-input"
            className="chatbot-textarea"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
            rows={1}
            maxLength={1000}
            disabled={isLoading}
            aria-label="Escribe tu mensaje"
          />
          <button
            className="chatbot-send-btn"
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Enviar mensaje"
            title="Enviar (Enter)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="chatbot-footer-note">
          Powered by Google Gemini · Respuestas generadas por IA
        </p>
      </div>

      {/* ── Botón Flotante ── */}
      <button
        className={`chatbot-fab ${isOpen ? 'chatbot-fab--open' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Cerrar asistente virtual' : 'Abrir asistente virtual'}
        title="Asistente Virtual IA"
        id="chatbot-fab-btn"
      >
        {/* Badge no leído */}
        {hasUnread && !isOpen && (
          <span className="chatbot-unread-badge" aria-label="Nuevo mensaje">1</span>
        )}
        {/* Ícono animado */}
        <span className="chatbot-fab-icon chatbot-fab-icon--chat" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <circle cx="9" cy="10" r="1" fill="currentColor"/>
            <circle cx="12" cy="10" r="1" fill="currentColor"/>
            <circle cx="15" cy="10" r="1" fill="currentColor"/>
          </svg>
        </span>
        <span className="chatbot-fab-icon chatbot-fab-icon--close" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </span>
      </button>
    </>
  );
}
