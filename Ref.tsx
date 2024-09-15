import * as React from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function AIChatHistory({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col space-y-4 p-4 md:p-6 max-w-full overflow-x-hidden">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] sm:max-w-[70%] p-3 rounded-lg ${
              message.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            <p className="text-sm sm:text-base leading-relaxed break-words">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AIChatHistory;