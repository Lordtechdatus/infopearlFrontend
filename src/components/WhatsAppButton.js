// src/components/WhatsAppButton.jsx
import React from 'react';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  const phoneNumber = '+917000937390';  // with country code
  const url = `https://wa.me/${phoneNumber.replace(/\D/g, '')}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
      aria-label="Chat on WhatsApp"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        className="whatsapp-icon"
      />
    </a>
  );
};

export default WhatsAppButton;
