import React, { useState } from 'react';
import {
  User,
  Bell,
  MapPin,
  Sun,
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
  Check
} from 'lucide-react';

interface SettingsViewProps {
  onOpenAssistant: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenAssistant }) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

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
        {/* Left Column (Settings & Support Options matching Image 5 Bottom) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-slate-50/60 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Settings
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Profile Information</h4>
                  <p className="text-[11px] text-slate-400">View and update your student details</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Notification Preferences</h4>
                  <p className="text-[11px] text-slate-400">Manage what notifications you receive</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Preferred Stop</h4>
                  <p className="text-[11px] text-slate-400">Set your default stop for faster access</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Ramanagara Hub</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Theme</h4>
                  <p className="text-[11px] text-slate-400">Choose your preferred theme</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Light</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Language</h4>
                  <p className="text-[11px] text-slate-400">Select your preferred language</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">English (Kannada available)</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">About RouteFlow & GRAMMOVE AI</h4>
                  <p className="text-[11px] text-slate-400">Smart rural student transit optimization engine</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">v2.4.0</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Section B: Help / Support */}
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-slate-50/60 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Help / Support
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Frequently Asked Questions</h4>
                  <p className="text-[11px] text-slate-400">Find answers to common student transit questions</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

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
                  <p className="text-[11px] text-slate-400">Chat with AI for instant route help & breakdown advice</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Right Column: Contact Cards matching Image 5 Bottom */}
        <div className="space-y-5">
          {/* Need Help Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Need Help?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">We're here to help rural students 24/7</p>
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
                    <span className="text-[10px] text-slate-400">Chat with student assistant</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                  Available
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">Email Support</span>
                    <span className="text-[10px] text-slate-400">help@grammove.org.in</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Reply in 2h</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">Call Helpline</span>
                    <span className="text-[10px] text-slate-400">1800-425-KSRTC</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">24x7 Free</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <div>
                    <span className="font-bold text-slate-800 block">Report an Issue</span>
                    <span className="text-[10px] text-slate-400">Let us know what went wrong</span>
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
    </div>
  );
};
