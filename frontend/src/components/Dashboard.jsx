import React, { useState } from 'react';
import { Bot, FileText, LogOut, ShieldCheck, User, PieChart, Search } from 'lucide-react';
import ChatInterface from './ChatInterface';
import DocumentUpload from './DocumentUpload';
import DecisionInsights from './DecisionInsights';
import SmartSearch from './SmartSearch';

export default function Dashboard({ user, handleLogout }) {
    const [activeTab, setActiveTab] = useState('chat');

    return (
        <div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden">

            {/* Sidebar Navigation */}
            <aside className="w-64 sm:w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0 shadow-2xl z-20">
                {/* Branding */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3 text-white mb-1">
                        <ShieldCheck className="w-8 h-8 text-blue-500" />
                        <h1 className="text-xl font-bold tracking-tight">HED System</h1>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-11">Secure Terminal</p>
                </div>

                {/* User Profile Snippet */}
                <div className="p-6 border-b border-slate-800 bg-slate-800/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{user.identifier}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mt-0.5">
                                {user.role === 'admin' ? 'Administrator' : 'User'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'chat'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <Bot className="w-5 h-5" />
                        AI Assistant
                    </button>

                    {user.role === 'admin' && (
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'upload'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            Knowledge Base
                        </button>
                    )}

                    {user.role === 'admin' && (
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'insights'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <PieChart className="w-5 h-5" />
                            Decision Insights
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('search')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'search'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <Search className="w-5 h-5" />
                        Smart Search
                    </button>
                </nav>

                {/* Footer/Logout */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Secure Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
                {/* Mobile Header (Hidden on large screens, purely decorative here since sidebar is forced w-72 for now) */}
                <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shrink-0 shadow-sm z-10 sm:hidden">
                    <span className="font-bold text-slate-800 tracking-tight">
                        {activeTab === 'chat' ? 'AI Assistant' : activeTab === 'upload' ? 'Knowledge Base' : activeTab === 'search' ? 'Smart Search' : 'Decision Insights'}
                    </span>
                </div>

                {/* Render corresponding component */}
                <div className="flex-1 overflow-hidden relative">
                    {activeTab === 'chat' ? <ChatInterface user={user} /> : activeTab === 'upload' ? <DocumentUpload user={user} /> : activeTab === 'search' ? <SmartSearch /> : <DecisionInsights />}
                </div>
            </main>

        </div>
    );
}
