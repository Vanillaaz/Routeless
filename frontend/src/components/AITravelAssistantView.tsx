import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  HelpCircle, 
  Compass, 
  ShieldCheck,
  CheckCircle,
  RotateCw
} from 'lucide-react';
import { ChatMessage, OptimizationResult } from '../types';
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
      text: `Namaskara! I am **GRAMMOVE AI Assistant**, powered by Gemini and our real-time OR-Tools optimization engine.\n\nThe network is currently operating under **${scenarioName}** with **${optimization?.coverage_percentage || 100}% student transit coverage**.\n\nHow can I help you reach your college or examine rural fleet telemetry today?`,
      timestamp: '07:45 AM',
      suggested_actions: [
        'My bus broke down. How can I reach college?',
        'Which alternative vehicle can I take?',
        'Which village has the highest transportation shortage?',
        'How many students are affected by this disruption?'
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
        text: 'Sorry, I encountered an issue retrieving real-time telemetry. Please check the backend connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const sampleChips = [
    'My bus broke down. How can I reach college?',
    'Which alternative vehicle can I take?',
    'Which village has the highest transportation shortage?',
    'How many students are affected by this disruption?'
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">GRAMMOVE AI Travel Assistant</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Gemini + Solver State Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live transit guidance for rural students, panchayats, and fleet operators.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Real-time Telemetry Connected</span>
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isUser ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white shadow-md'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                isUser 
                  ? 'bg-slate-900 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none'
              }`}>
                {/* Text Content */}
                <div className="whitespace-pre-line space-y-2">
                  {msg.text}
                </div>

                {/* Sources if present */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-500">Grounded in:</span>
                    {msg.sources.map((src, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {src}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-up Actions */}
                {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {msg.suggested_actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(act)}
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-medium transition text-left"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-slate-400' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 w-fit">
            <RotateCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            <span>Analyzing network state & formulating guidance with Gemini...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips Bar */}
      <div className="px-4 py-2 bg-white border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>Suggested:</span>
        </span>
        {sampleChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-2.5 py-1 rounded-full text-xs bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition whitespace-nowrap shrink-0"
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
          placeholder="Ask anything (e.g., 'My bus broke down at Byramangala, how can I reach?')..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask Assistant</span>
        </button>
      </form>
    </div>
  );
};
