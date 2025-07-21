import React from 'react';
import './StickyMessage.css';

const StickyMessage = ({ message }) => (
  <div className="sticky-message">
    <div className="sticky-message__text">
      {message}
    </div>
  </div>
);

export default StickyMessage;
