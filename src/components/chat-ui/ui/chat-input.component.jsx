// ChatInput.js

import React, { useState } from "react";
import './chat-input.styled.scss';

const ChatInput = () => {
  const [message, setMessage] = useState('');

  return (
    <div className="chat-input bg-white rounded-full p-2 flex items-center">
      <input 
        type="text" 
        placeholder="Type a message" 
        className="flex-grow outline-none ml-2"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      {/* <div className="flex">
        <button>
          <i className="fas fa-microphone"></i> 
        </button>
        <button>
          <i className="fas fa-paper-plane"></i>
        </button>
      </div> */}
    </div>
  );
};

export default ChatInput;
