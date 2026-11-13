import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Home, Search, Star, MapPin, Bell, Settings, Bus, ShieldAlert } from 'lucide-react';
export const Sidebar = ({ activeTab, setActiveTab, unreadNotificationsCount = 3, isCrisisActive = false }) => {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'search', label: 'Search', icon: Search },
        { id: 'tracker', label: 'Live Bus Tracker', icon: Bus },
        { id: 'saved', label: 'Saved Routes', icon: Star },
        { id: 'nearby', label: 'Nearby Stops', icon: MapPin },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined
        },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    return (_jsxs("aside", { className: "w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none", children: [_jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { onClick: () => setActiveTab('home'), className: "flex items-center gap-3 px-6 py-5 cursor-pointer border-b border-slate-100 transition hover:opacity-90", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20", children: _jsx(Bus, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "font-extrabold text-lg tracking-tight text-slate-900", children: "RouteFlow" }), _jsx("span", { className: "text-[9px] px-1.5 py-0.2 rounded font-black bg-blue-50 text-blue-700 border border-blue-200", children: "AI" })] }), _jsx("p", { className: "text-[11px] font-medium text-slate-400 -mt-0.5", children: "Your Journey, Simplified" })] })] }), _jsxs("nav", { className: "p-3 space-y-1", children: [navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (_jsxs("button", { onClick: () => setActiveTab(item.id), className: `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${isActive
                                        ? 'bg-blue-50 text-blue-700 font-bold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Icon, { className: `w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}` }), _jsx("span", { children: item.label })] }), item.badge !== undefined && (_jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-blue-600 text-white", children: item.badge }))] }, item.id));
                            }), _jsx("div", { className: "pt-2", children: _jsxs("button", { onClick: () => setActiveTab('exam_crisis'), className: `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition border ${activeTab === 'exam_crisis'
                                        ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80'}`, children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsxs("span", { className: "relative flex h-2 w-2", children: [_jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" }), _jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-rose-600" })] }), _jsx(ShieldAlert, { className: "w-4 h-4" }), _jsx("span", { children: "Exam Crisis Mode" })] }), _jsx("span", { className: `text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${activeTab === 'exam_crisis' ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-800'}`, children: "AI OR" })] }) })] })] }), _jsx("div", { className: "p-3", children: _jsxs("div", { className: "p-4 rounded-2xl bg-gradient-to-b from-blue-50/80 to-blue-100/50 border border-blue-100 flex flex-col items-center text-center", children: [_jsx("div", { className: "w-12 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-2.5 shadow-md shadow-blue-500/20", children: _jsx(Bus, { className: "w-6 h-6 text-white" }) }), _jsx("h4", { className: "text-xs font-bold text-slate-800", children: "Track your bus in real-time" }), _jsx("p", { className: "text-[11px] text-slate-500 mt-0.5", children: "Stay updated. Reach on time." })] }) })] }));
};
