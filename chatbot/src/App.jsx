import React, { useState, useEffect, useRef } from 'react';
import { IoSend } from "react-icons/io5";
import image from '../src/assets/img1.jpeg';
import { CiMicrophoneOn } from "react-icons/ci";

function App() {
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const conversationEndRef = useRef(null);

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => {
        document.getElementById("input-form").requestSubmit();
      }, 500);
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error", event.error);
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    setLoading(true);

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage = {
      text: input,
      type: 'user',
      sentTime: currentTime,
    };

    setConversation([...conversation, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: input }),
      }).then((res) => res.json());

      const botMessage = {
        text: response.response,
        type: 'bot',
        sentTime: currentTime,
      };

      setConversation((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching chatbot response:', error);

      const errorMessage = {
        text: 'Sorry, there was an error processing your request.',
        type: 'error',
        sentTime: currentTime,
      };

      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      <div className="bg-[#254336] p-4 text-white text-center z-10 relative">
        <h1 className="text-2xl font-bold">Chatbot</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-[#CCE7C8] w-8/12 mx-auto my-0 shadow-lg z-10 relative">
        <div id="conversation" className="space-y-4">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-xs ${message.type === 'user'
                ? 'bg-[#B7B597] text-black ml-auto'
                : message.type === 'bot'
                  ? 'bg-[#FEF3E2] text-black mr-auto'
                  : 'bg-[#FEF3E2] text-black mr-auto'
                }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="block text-xs text-gray-500 mt-1">{message.sentTime}</span>
            </div>
          ))}
          <div ref={conversationEndRef} />
        </div>
      </div>
      <div className="bg-[#CCE7C8] w-8/12 mx-auto my-0 relative z-10">
        <form
          id="input-form"
          className="flex border-gray-300 mx-60 rounded-xl pb-20"
          onSubmit={handleSubmit}
        >
          <button
            id='voice-recorder'
            type="button"
            className="ml-2 p-2 mr-2 bg-[#6B8A7A] text-white rounded-lg shadow-sm hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={handleVoiceInput}
            disabled={loading}  
          >
            <CiMicrophoneOn className='w-7 h-7 text-[#e4f6e2]' />
          </button>
          <input
            id="input-field"
            type="text"
            placeholder="Type your message here"
            className="bg-[#6B8A7A] flex-1 px-4 py-2  border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            required
          />
          <button
            id="submit-button"
            type="submit"
            className="ml-2 p-2 bg-[#6B8A7A] text-white rounded-lg shadow-sm hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            <IoSend className="w-6 h-6 text-[#e4f6e2]" />
          </button>
        </form>
      </div>

      <img
        src={image}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0 blur-lg"
      />
    </div>
  );
}

export default App;
