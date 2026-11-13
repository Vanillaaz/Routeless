import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Bell, Bus, AlertTriangle, Clock, Radio, Star, Check } from 'lucide-react';
export const NotificationsView = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [markedAllRead, setMarkedAllRead] = useState(false);
    // Toggle preferences state
    const [prefArrival, setPrefArrival] = useState(true);
    const [prefDelay, setPrefDelay] = useState(true);
    const [prefSchedule, setPrefSchedule] = useState(true);
    const [prefReminders, setPrefReminders] = useState(true);
    const notifications = [
        {
            id: 1,
            type: 'arrival',
            category: 'updates',
            title: 'Bus Arriving Soon',
            message: 'Your bus KA-42-F-1024 is arriving at Ramanagara Bus Stand in 3 min. Byramangala → Bidadi Engineering.',
            time: '2 min ago',
            icon: Bell,
            color: 'blue',
            read: markedAllRead
        },
        {
            id: 2,
            type: 'on_time',
            category: 'updates',
            title: 'Bus On Time',
            message: 'Good news! Bus KA-42-F-3011 is running exactly on schedule. Doddamallur → Channapatna ITI.',
            time: '15 min ago',
            icon: Bus,
            color: 'emerald',
            read: markedAllRead
        },
        {
            id: 3,
            type: 'delay',
            category: 'alerts',
            title: 'Delay Alert',
            message: 'Bus KA-42-F-4105 is delayed by 8 minutes due to freight rail crossing at Vibhutikere. Kailancha → Ramanagara.',
            time: '32 min ago',
            icon: AlertTriangle,
            color: 'amber',
            read: markedAllRead
        },
        {
            id: 4,
            type: 'reminder',
            category: 'reminders',
            title: 'Commute Reminder',
            message: "You'll be notified when your bus is 5 min away. Byramangala → Bidadi Engineering.",
            time: '1 hr ago',
            icon: Clock,
            color: 'purple',
            read: markedAllRead
        },
        {
            id: 5,
            type: 'diversion',
            category: 'alerts',
            title: 'Route Diversion: Flooded Road R6',
            message: 'SH-17 Kailancha Bridge closed due to seasonal waterlogging. Buses rerouted via state highway bypass.',
            time: '2 hrs ago',
            icon: Radio,
            color: 'rose',
            read: markedAllRead
        },
        {
            id: 6,
            type: 'saved',
            category: 'updates',
            title: 'Saved Route Updated',
            message: 'New peak morning departure added at 07:45 AM for Sugganahalli → Govt First Grade College.',
            time: 'Yesterday',
            icon: Star,
            color: 'emerald',
            read: markedAllRead
        }
    ];
    const filtered = notifications.filter(n => {
        if (activeFilter === 'all')
            return true;
        return n.category === activeFilter;
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl sm:text-2xl font-black text-slate-900 tracking-tight", children: "Notifications" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Stay informed about your buses, road status, and schedule changes." })] }), _jsxs("button", { onClick: () => setMarkedAllRead(true), className: "text-xs font-semibold text-blue-600 hover:text-blue-700 transition self-start sm:self-auto flex items-center gap-1", children: [markedAllRead ? _jsx(Check, { className: "w-3.5 h-3.5 text-emerald-600" }) : null, _jsx("span", { children: markedAllRead ? 'All marked as read' : 'Mark all as read' })] })] }), _jsxs("div", { className: "flex items-center gap-2 overflow-x-auto pb-1", children: [_jsxs("button", { onClick: () => setActiveFilter('all'), className: `px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${activeFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`, children: ["All (", notifications.length, ")"] }), _jsx("button", { onClick: () => setActiveFilter('alerts'), className: `px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${activeFilter === 'alerts'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`, children: "Alerts (2)" }), _jsx("button", { onClick: () => setActiveFilter('updates'), className: `px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${activeFilter === 'updates'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`, children: "Updates (3)" }), _jsx("button", { onClick: () => setActiveFilter('reminders'), className: `px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${activeFilter === 'reminders'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`, children: "Reminders (1)" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2 space-y-3", children: filtered.map((item) => {
                            const Icon = item.icon;
                            const colorClass = item.color === 'emerald'
                                ? 'bg-emerald-50 text-emerald-600'
                                : item.color === 'amber'
                                    ? 'bg-amber-50 text-amber-600'
                                    : item.color === 'rose'
                                        ? 'bg-rose-50 text-rose-600'
                                        : item.color === 'purple'
                                            ? 'bg-purple-50 text-purple-600'
                                            : 'bg-blue-50 text-blue-600';
                            return (_jsxs("div", { className: "p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-200 transition flex items-start gap-3.5 shadow-2xs", children: [_jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`, children: _jsx(Icon, { className: "w-5 h-5" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-xs font-extrabold text-slate-900", children: item.title }), _jsx("span", { className: "text-[11px] text-slate-400", children: item.time })] }), _jsx("p", { className: "text-xs text-slate-600 mt-1 leading-relaxed", children: item.message })] })] }, item.id));
                        }) }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4", children: [_jsx("h3", { className: "text-xs font-bold text-slate-900 uppercase tracking-wider", children: "Notification Preferences" }), _jsxs("div", { className: "space-y-3.5 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-slate-800 block", children: "Bus arrival alerts" }), _jsx("span", { className: "text-[11px] text-slate-400", children: "Notify when bus is near stop" })] }), _jsx("input", { type: "checkbox", checked: prefArrival, onChange: (e) => setPrefArrival(e.target.checked), className: "w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-slate-800 block", children: "Delay alerts" }), _jsx("span", { className: "text-[11px] text-slate-400", children: "Receive road traffic alerts" })] }), _jsx("input", { type: "checkbox", checked: prefDelay, onChange: (e) => setPrefDelay(e.target.checked), className: "w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-slate-800 block", children: "Schedule updates" }), _jsx("span", { className: "text-[11px] text-slate-400", children: "Changes in timing or route" })] }), _jsx("input", { type: "checkbox", checked: prefSchedule, onChange: (e) => setPrefSchedule(e.target.checked), className: "w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-slate-800 block", children: "Reminders" }), _jsx("span", { className: "text-[11px] text-slate-400", children: "Set reminders for trips" })] }), _jsx("input", { type: "checkbox", checked: prefReminders, onChange: (e) => setPrefReminders(e.target.checked), className: "w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" })] })] })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2", children: [_jsx("h4", { className: "text-xs font-bold text-slate-900", children: "Notification Tips" }), _jsx("p", { className: "text-xs text-slate-500 leading-relaxed", children: "Enable arrival alerts to never miss your college bus. Set custom buffer times in settings to account for walking distances from home." })] })] })] })] }));
};
