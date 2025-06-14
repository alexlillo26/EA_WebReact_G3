import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (!typingTimeout) {
      onTyping(true);
    } else {
      clearTimeout(typingTimeout);
    }
    
    const newTimeout = setTimeout(() => {
        onTyping(false);
        setTypingTimeout(null);
    }, 2000);

    setTypingTimeout(newTimeout);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      onTyping(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        placeholder="Escribe un mensaje..."
        className="message-input-field"
        autoComplete="off"
      />
      <button type="submit" className="send-message-button" disabled={!message.trim()} title="Enviar">
        {/* 👇 CAMBIO AQUÍ: Usamos un icono de Font Awesome en lugar de texto */}
        <i className="fas fa-paper-plane"></i>
      </button>
    </form>
  );
};

export default MessageInput;