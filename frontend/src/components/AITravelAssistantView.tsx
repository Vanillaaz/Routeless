import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  HelpCircle, 
  RotateCw,
  Bus
} from 'lucide-react';
import type { ChatMessage, OptimizationResult } from '../types';
import { sendChatMessage } from '../api';

interface AssistantProps {
  optimization: OptimizationResult | null;
  scenarioName: string;
}

export const AITravelAssistantView: React.FC<AssistantProps> = ({
  optimization,
  scenarioName
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Namaskara! 👋 I am your **GRAMMOVE Student Travel Copilot**.\n\nWhether you need to find which bus to take, check if your bus is running on time, or find an alternative ride when a bus is delayed, I am here to help you get to college safely!\n\nWhere are you traveling from today?`,
      timestamp: '07:30 AM',
      suggested_actions: [
        'Which bus goes to Ramanagara Govt Polytechnic?',
        'Is bus KA-42-F-1024 on time?',
        'What is the best route from Byramangala?',
        'My bus broke down. How can I reach college?'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(textToSend);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        suggested_actions: response.suggested_actions
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry! I had trouble reaching the bus dispatch system. Please try again or check the Live Bus Tracker tab.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const sampleChips = [
    'Which bus goes to Ramanagara Govt Polytechnic?',
    'Is bus KA-42-F-1024 on time?',
    'What is the best route from Byramangala?',
    'My bus broke down. How can I reach college?'
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
      {/* Friendly Chat Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-white to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">GRAMMOVE Student AI Assistant</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                Online & Ready
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ask about bus timings, stops, seat availability, or how to reach your college campus.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Bus className="w-3.5 h-3.5" />
          <span>Live Fleet Connected</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                isUser ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed ${
                isUser 
                  ? 'bg-emerald-600 text-white font-medium rounded-tr-none shadow-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none'
              }`}>
                {/* Text Content */}
                <div className="whitespace-pre-line space-y-2 text-xs leading-relaxed">
                  {msg.text}
                </div>

                {/* Suggested Follow-up Actions */}
                {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {msg.suggested_actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(act)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold transition text-left"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 w-fit shadow-sm">
            <RotateCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            <span>Checking live bus positions & timetables...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions Bar */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>Ask:</span>
        </span>
        {sampleChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1 rounded-full text-xs bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition whitespace-nowrap shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask anything (e.g., 'What time does the bus leave Byramangala?')..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-40 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
