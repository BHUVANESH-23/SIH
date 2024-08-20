import React, { useState } from 'react';

const Chatbot = () => {
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage = {
      text: input,
      type: 'user',
      sentTime: currentTime
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
        sentTime: currentTime
      };

      setConversation((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching chatbot response:', error);

      const errorMessage = {
        text: 'Sorry, there was an error processing your request.',
        type: 'error',
        sentTime: currentTime
      };

      setConversation((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-blue-500 p-4 text-white text-center">
        <h1 className="text-2xl font-bold">Chatbot</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div id="conversation" className="space-y-4">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-xs ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white ml-auto'
                  : message.type === 'bot'
                  ? 'bg-gray-300 text-black mr-auto'
                  : 'bg-red-500 text-white mr-auto'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="block text-xs text-gray-500 mt-1">{message.sentTime}</span>
            </div>
          ))}
        </div>
      </div>
      <form
        id="input-form"
        className="bg-white p-4 flex border-t border-gray-300"
        onSubmit={handleSubmit}
      >
        <input
          id="input-field"
          type="text"
          placeholder="Type your message here"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />
        <button
          id="submit-button"
          type="submit"
          className="ml-2 p-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <img className="w-6 h-6" src="/static/send-message.png" alt="Send" />
        </button>
      </form>
      <div className="text-center p-2 text-gray-500">
        <p>Copyright © 2023 All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Chatbot;
