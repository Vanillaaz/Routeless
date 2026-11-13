import React, { useState } from 'react';
import {
  User,
  Bell,
  MapPin,
  Sun,
  Moon,
  Globe,
  Shield,
  Info,
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  AlertCircle,
  Share2,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Send,
  Building,
  GraduationCap
} from 'lucide-react';

interface SettingsViewProps {
  onOpenAssistant: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenAssistant }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<'Light' | 'Soft Slate'>('Light');
  const [language, setLanguage] = useState<'English' | 'ಕನ್ನಡ (Kannada)'>('English');
  const [preferredStop, setPreferredStop] = useState('Ramanagara Rural Transit Hub');

  // Issue report form state
  const [issueType, setIssueType] = useState('Bus Delayed');
  const [issueBusNumber, setIssueBusNumber] = useState('KA-42-F-1024');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  // FAQ expanded state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIssueSubmitted(true);
    setTimeout(() => {
      setIssueSubmitted(false);
      setActiveModal(null);
      setIssueDescription('');
    }, 2200);
  };

  const faqs = [
    {
      q: 'How does GRAMMOVE AI track rural buses in real time?',
      a: 'Vehicles transmit GPS satellite coordinates every 15 seconds to our centralized district dispatcher. We interpolate the movement along real-world road networks and calculate live arrival times taking traffic into account.'
    },
    {
      q: 'What happens if a bus breaks down on my rural route?',
      a: 'The system activates the Dynamic Rescue Engine: stranded students are identified immediately, available minibuses and feeder autos are rerouted to pick up the passengers, and all students receive real-time re-allocation alerts.'
    },
    {
      q: 'Is the bus pass accepted on all buses in the app?',
      a: 'Yes, all KSRTC Government Buses (Ordinary and Express) honor the Karnataka State Student Bus Pass with zero fare. Private minibuses and shared autos operate under district subsidized student concession rates.'
    },
    {
      q: 'What is Exam-Day Emergency Crisis Mode?',
      a: 'During district exams, students with upcoming exam deadlines receive elevated priority in our Google OR-Tools optimization engine. It calculates feasible arrival times and alerts authorities if backup feeder units are needed.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Settings & Help / Support
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your student preferences and get assistance 24/7.
        </p>
      </div>

      {/* Main Grid: Left Settings list, Right Help Contact Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Settings & Support Options) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-slate-50/60 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Student Preferences
            </div>

            {/* 1. Profile Information */}
            <div
              onClick={() => setActiveModal('profile')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Student Profile Information</h4>
                  <p className="text-[11px] text-slate-400">View your student pass ID, college & village details</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* 2. Notification Preferences */}
            <div
              onClick={() => setActiveModal('notifications')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Notification Alerts</h4>
                  <p className="text-[11px] text-slate-400">Configure 5-minute arrival buzzers & road obstruction alerts</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* 3. Preferred Stop */}
            <div
              onClick={() => setActiveModal('preferred_stop')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Preferred Boarding Stop</h4>
                  <p className="text-[11px] text-slate-400">Default village pickup location for one-click route planning</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 truncate max-w-[150px]">{preferredStop}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* 4. Theme */}
            <div
              onClick={() => setThemeMode(themeMode === 'Light' ? 'Soft Slate' : 'Light')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  {themeMode === 'Light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Display Theme</h4>
                  <p className="text-[11px] text-slate-400">Toggle between clean daylight & soft eye-comfort contrast</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">{themeMode}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* 5. Language */}
            <div
              onClick={() => setLanguage(language === 'English' ? 'ಕನ್ನಡ (Kannada)' : 'English')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Language / ಭಾಷೆ</h4>
                  <p className="text-[11px] text-slate-400">Select language for interface & route guidance</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">{language}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* 6. About */}
            <div
              onClick={() => setActiveModal('about')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">About GRAMMOVE AI</h4>
                  <p className="text-[11px] text-slate-400">Version, operations research algorithm & taluk coverage</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">v2.5.0</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Section B: Help / Support */}
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-slate-50/60 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Help & Resources
            </div>

            {/* FAQs */}
            <div
              onClick={() => setActiveModal('faq')}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Frequently Asked Questions</h4>
                  <p className="text-[11px] text-slate-400">Answers to bus passes, breakdowns, schedules & tracking</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* AI Assistant */}
            <div
              onClick={onOpenAssistant}
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">AI Student Travel Assistant</h4>
                  <p className="text-[11px] text-slate-400">Instant answers regarding vehicle arrivals, routes & alternatives</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Open AI Chat
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Cards */}
        <div className="space-y-5">
          {/* Need Help Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Need Help?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">We're here for rural students 24/7</p>
            </div>

            <div className="space-y-3 text-xs">
              <div
                onClick={onOpenAssistant}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">Live AI Chat</span>
                    <span className="text-[10px] text-slate-400">Instant answers on routes</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                  Online
                </span>
              </div>

              <a
                href="mailto:help@grammove.org.in"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between block"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">Email Support</span>
                    <span className="text-[10px] text-slate-400">help@grammove.org.in</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Reply in 2h</span>
              </a>

              <a
                href="tel:18004255778"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between block"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">Call Helpline</span>
                    <span className="text-[10px] text-slate-400">1800-425-KSRTC</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">Toll Free</span>
              </a>

              <div
                onClick={() => setActiveModal('report_issue')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-700 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">Report an Issue</span>
                    <span className="text-[10px] text-slate-400">Report delays, breakdowns or overcrowding</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Share RouteFlow Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Share RouteFlow</h4>
            <p className="text-xs text-slate-500">
              Help fellow classmates discover real-time rural bus tracking and emergency transport.
            </p>
            <button
              onClick={handleShare}
              className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
              <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Share Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: STUDENT PROFILE */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Student Profile</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
                  AS
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Ananya Sharma</h4>
                  <p className="text-[11px] text-slate-500">Student ID: STU-2026-RAM-042</p>
                  <p className="text-[11px] text-blue-700 font-semibold">Pass: Karnataka Rural Concession Pass #KSRTC-99120</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Home Village:</span>
                  <span className="font-bold text-slate-800">Byramangala (Bidadi Taluk)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Institution:</span>
                  <span className="font-bold text-slate-800">Bidadi Engineering & Technical Academy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-bold text-slate-800">Computer Science & Data Eng (Semester 4)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Arrival Target:</span>
                  <span className="font-bold text-emerald-600">08:30 AM (Class starts 08:45 AM)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: REPORT AN ISSUE */}
      {activeModal === 'report_issue' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Report Transit Issue</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {issueSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Issue Dispatched to District Control</h4>
                <p className="text-xs text-slate-500">
                  Incident ticket #RAM-{Math.floor(1000 + Math.random() * 9000)} generated. The AI Rescue Engine has been notified of this road condition.
                </p>
              </div>
            ) : (
              <form onSubmit={handleIssueSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Issue Category</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    <option>Bus Breakdown</option>
                    <option>Bus Delayed (&gt; 15 mins)</option>
                    <option>Extreme Overcrowding (Seats Saturated)</option>
                    <option>Flooded or Blocked Road Connection</option>
                    <option>Skipped Designated Student Bus Stop</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bus Number / Route</label>
                  <input
                    type="text"
                    value={issueBusNumber}
                    onChange={(e) => setIssueBusNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                    placeholder="e.g. KA-42-F-1024 or Byramangala route"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description / Location</label>
                  <textarea
                    rows={3}
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    placeholder="Describe what happened and exact location (e.g. stranded near Kailancha bridge due to waterlogging)..."
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Incident</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: FAQS */}
      {activeModal === 'faq' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Frequently Asked Questions</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full p-3.5 text-left font-bold text-slate-800 flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedFaq === i && (
                    <div className="px-3.5 pb-3.5 text-slate-600 leading-relaxed border-t border-slate-100 pt-2 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: ABOUT */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">About GRAMMOVE AI</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-900">GRAMMOVE AI</strong> is an intelligent rural mobility platform engineered to ensure no rural student is left stranded on their way to school, polytechnic or college.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div><strong>Taluks Covered:</strong> Ramanagara, Channapatna, Kanakapura, Bidadi</div>
                <div><strong>Optimization Core:</strong> Google OR-Tools CBC MIP</div>
                <div><strong>Transit Intelligence:</strong> Dijkstra road graph reconfiguration</div>
                <div><strong>Architecture:</strong> FastAPI + React + Tailwind CSS + Leaflet</div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
