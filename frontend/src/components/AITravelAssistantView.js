import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, HelpCircle, RotateCw, Bus } from 'lucide-react';
import { sendChatMessage } from '../api';
export const AITravelAssistantView = ({ optimization, scenarioName }) => {
    const [messages, setMessages] = useState([
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
                text: 'Sorry! I had trouble reaching the bus dispatch system. Please try again or check the Live Bus Tracker tab.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        }
        finally {
            setIsTyping(false);
        }
    };
    const sampleChips = [
        'Which bus goes to Ramanagara Govt Polytechnic?',
        'Is bus KA-42-F-1024 on time?',
        'What is the best route from Byramangala?',
        'My bus broke down. How can I reach college?'
    ];
    return (_jsxs("div", { className: "max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200", children: [_jsxs("div", { className: "p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-white to-white flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20", children: _jsx(Sparkles, { className: "w-5 h-5 text-slate-950" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-extrabold text-sm text-slate-900", children: "GRAMMOVE Student AI Assistant" }), _jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800", children: "Online & Ready" })] }), _jsx("p", { className: "text-xs text-slate-500", children: "Ask about bus timings, stops, seat availability, or how to reach your college campus." })] })] }), _jsxs("div", { className: "hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200", children: [_jsx(Bus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Live Fleet Connected" })] })] }), _jsxs("div", { className: "flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50", children: [messages.map((msg) => {
                        const isUser = msg.sender === 'user';
                        return (_jsxs("div", { className: `flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`, children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${isUser ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'}`, children: isUser ? _jsx(User, { className: "w-4 h-4" }) : _jsx(Bot, { className: "w-4 h-4" }) }), _jsxs("div", { className: `max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed ${isUser
                                        ? 'bg-emerald-600 text-white font-medium rounded-tr-none shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none'}`, children: [_jsx("div", { className: "whitespace-pre-line space-y-2 text-xs leading-relaxed", children: msg.text }), msg.suggested_actions && msg.suggested_actions.length > 0 && (_jsx("div", { className: "mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5", children: msg.suggested_actions.map((act, i) => (_jsx("button", { onClick: () => handleSendMessage(act), className: "px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold transition text-left", children: act }, i))) })), _jsx("div", { className: `text-[10px] mt-1.5 text-right ${isUser ? 'text-emerald-100' : 'text-slate-400'}`, children: msg.timestamp })] })] }, msg.id));
                    }), isTyping && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 w-fit shadow-sm", children: [_jsx(RotateCw, { className: "w-3.5 h-3.5 text-emerald-600 animate-spin" }), _jsx("span", { children: "Checking live bus positions & timetables..." })] })), _jsx("div", { ref: messagesEndRef })] }), _jsxs("div", { className: "px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto", children: [_jsxs("span", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1", children: [_jsx(HelpCircle, { className: "w-3 h-3 text-slate-400" }), _jsx("span", { children: "Ask:" })] }), sampleChips.map((chip, idx) => (_jsx("button", { onClick: () => handleSendMessage(chip), className: "px-3 py-1 rounded-full text-xs bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition whitespace-nowrap shrink-0", children: chip }, idx)))] }), _jsxs("form", { onSubmit: (e) => {
                    e.preventDefault();
                    handleSendMessage(inputText);
                }, className: "p-3 bg-white border-t border-slate-200 flex items-center gap-2", children: [_jsx("input", { type: "text", placeholder: "Ask anything (e.g., 'What time does the bus leave Byramangala?')...", value: inputText, onChange: (e) => setInputText(e.target.value), disabled: isTyping, className: "flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition disabled:opacity-50" }), _jsxs("button", { type: "submit", disabled: !inputText.trim() || isTyping, className: "px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-40 shadow-sm", children: [_jsx(Send, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Ask" })] })] })] }));
};
