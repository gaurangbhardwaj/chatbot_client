// ChatInput.js

import React, { useState } from "react";
import "./chat-input.styled.scss";
import { CiLocationArrow1, CiMicrophoneOn } from "react-icons/ci";

const ChatInput = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="chat-input-container flex items-center">
      <div className="chat-input bg-white rounded-full p-2 ">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-grow outline-none ml-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="flex">
<CiLocationArrow1 size={40} style={{padding:'5px'}} />
<CiMicrophoneOn size={40} style={{padding:'5px'}}/>
      </div>
    </div>
  );
};

export default ChatInput;
