import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, HelpCircle, ShieldCheck, RotateCw } from 'lucide-react';
import { sendChatMessage } from '../api';
export const AITravelAssistantView = ({ optimization, scenarioName }) => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            sender: 'assistant',
            text: `Namaskara! I am **GRAMMOVE AI Assistant**, powered by Gemini and our real-time Google OR-Tools optimization engine.\n\nThe network is currently operating under **${scenarioName}** with **${optimization?.coverage_percentage || 100}% student transit coverage**.\n\nHow can I help you reach your college or examine rural fleet telemetry today?`,
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
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);
    const handleSendMessage = async (textToSend) => {
        if (!textToSend.trim() || isTyping)
            return;
        const userMsg = {
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
            const aiMsg = {
                id: (Date.now() + 1).toString(),
                sender: 'assistant',
                text: response.reply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sources: response.sources,
                suggested_actions: response.suggested_actions
            };
            setMessages(prev => [...prev, aiMsg]);
        }
        catch (error) {
            console.error('Chat error:', error);
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                sender: 'assistant',
                text: 'Sorry, I encountered an issue retrieving real-time telemetry. Please check the backend connection or try again.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        }
        finally {
            setIsTyping(false);
        }
    };
    const sampleChips = [
        'My bus broke down. How can I reach college?',
        'Which alternative vehicle can I take?',
        'Which village has the highest transportation shortage?',
        'How many students are affected by this disruption?'
    ];
    return (_jsxs("div", { className: "h-[calc(100vh-140px)] flex flex-col bg-[#111c38] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-slate-100 animate-in fade-in duration-200", children: [_jsxs("div", { className: "p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20", children: _jsx(Sparkles, { className: "w-5 h-5 text-slate-950" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-extrabold text-sm text-white", children: "GRAMMOVE AI Travel Assistant & Copilot" }), _jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-400 border border-emerald-800", children: "Gemini 2.5 + OR-Tools Grounded" })] }), _jsx("p", { className: "text-xs text-slate-400", children: "Live transit guidance for rural students, panchayats, and fleet dispatchers." })] })] }), _jsxs("div", { className: "hidden sm:flex items-center gap-2 text-xs text-slate-400", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-emerald-400" }), _jsx("span", { children: "Real-time Telemetry Connected" })] })] }), _jsxs("div", { className: "flex-1 p-5 overflow-y-auto space-y-4 bg-slate-900/60 dark-scrollbar", children: [messages.map((msg) => {
                        const isUser = msg.sender === 'user';
                        return (_jsxs("div", { className: `flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`, children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-md ${isUser ? 'bg-slate-800 text-white' : 'bg-emerald-500 text-slate-950 font-black'}`, children: isUser ? _jsx(User, { className: "w-4 h-4" }) : _jsx(Bot, { className: "w-4 h-4" }) }), _jsxs("div", { className: `max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${isUser
                                        ? 'bg-emerald-600 text-slate-950 font-medium rounded-tr-none shadow-md shadow-emerald-600/10'
                                        : 'bg-[#111c38] border border-slate-700/80 text-slate-200 shadow-xl rounded-tl-none'}`, children: [_jsx("div", { className: "whitespace-pre-line space-y-2", children: msg.text }), msg.sources && msg.sources.length > 0 && (_jsxs("div", { className: "mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400", children: [_jsx("span", { className: "font-semibold text-slate-400", children: "Grounded in:" }), msg.sources.map((src, i) => (_jsx("span", { className: "px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono", children: src }, i)))] })), msg.suggested_actions && msg.suggested_actions.length > 0 && (_jsx("div", { className: "mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5", children: msg.suggested_actions.map((act, i) => (_jsx("button", { onClick: () => handleSendMessage(act), className: "px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-[11px] font-medium transition text-left", children: act }, i))) })), _jsx("div", { className: `text-[10px] mt-1.5 text-right ${isUser ? 'text-slate-950/70 font-mono' : 'text-slate-400 font-mono'}`, children: msg.timestamp })] })] }, msg.id));
                    }), isTyping && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-300 bg-[#111c38] p-3 rounded-xl border border-slate-700 w-fit", children: [_jsx(RotateCw, { className: "w-3.5 h-3.5 text-emerald-400 animate-spin" }), _jsx("span", { children: "Analyzing network state & formulating guidance with Gemini..." })] })), _jsx("div", { ref: messagesEndRef })] }), _jsxs("div", { className: "px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto dark-scrollbar", children: [_jsxs("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1", children: [_jsx(HelpCircle, { className: "w-3 h-3 text-slate-400" }), _jsx("span", { children: "Suggested:" })] }), sampleChips.map((chip, idx) => (_jsx("button", { onClick: () => handleSendMessage(chip), className: "px-2.5 py-1 rounded-full text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/40 transition whitespace-nowrap shrink-0", children: chip }, idx)))] }), _jsxs("form", { onSubmit: (e) => {
                    e.preventDefault();
                    handleSendMessage(inputText);
                }, className: "p-3 bg-[#111c38] border-t border-slate-800 flex items-center gap-2", children: [_jsx("input", { type: "text", placeholder: "Ask anything (e.g., 'My bus broke down at Byramangala, how can I reach?')...", value: inputText, onChange: (e) => setInputText(e.target.value), disabled: isTyping, className: "flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50" }), _jsxs("button", { type: "submit", disabled: !inputText.trim() || isTyping, className: "px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition disabled:opacity-40 shadow-md shadow-emerald-500/20", children: [_jsx(Send, { className: "w-3.5 h-3.5" }), _jsx("span", { className: "hidden sm:inline", children: "Ask Assistant" })] })] })] }));
};
