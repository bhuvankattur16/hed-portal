import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, Settings, Target, Clock, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function AdminSettingsPanel() {
    const [settings, setSettings] = useState({
        impact: {
            profile_complete_pct: 75,
            docs_saved_target: 12
        },
        deadlines: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/settings/dashboard`);
                setSettings(res.data);
            } catch (err) {
                console.error("Failed to load dashboard settings:", err);
                setMessage({ type: 'error', text: 'Failed to load settings.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleImpactChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            impact: { ...prev.impact, [field]: parseInt(value) || 0 }
        }));
    };

    const handleDeadlineChange = (index, field, value) => {
        const newDeadlines = [...settings.deadlines];
        newDeadlines[index][field] = value;
        setSettings(prev => ({ ...prev, deadlines: newDeadlines }));
    };

    const addDeadline = () => {
        setSettings(prev => ({
            ...prev,
            deadlines: [...prev.deadlines, { title: 'New Deadline', date: 'Jan 01, 2026', type: 'info' }]
        }));
    };

    const removeDeadline = (index) => {
        const newDeadlines = [...settings.deadlines];
        newDeadlines.splice(index, 1);
        setSettings(prev => ({ ...prev, deadlines: newDeadlines }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            await axios.post(`${API_BASE_URL}/settings/dashboard`, settings);
            setMessage({ type: 'success', text: 'Settings saved successfully! Users will now see these metric updates.' });
        } catch (err) {
            console.error("Failed to save dashboard settings:", err);
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-pink-500" /> Dashboard Configuration
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Manage the dynamic values shown on the User Dashboard.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium text-sm">{message.text}</span>
                </div>
            )}

            {/* Impact Metrics Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                    <Target className="w-5 h-5 text-indigo-500" /> "Your Impact" Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Profile Completion Benchmark (%)</label>
                        <input
                            type="number"
                            value={settings.impact.profile_complete_pct}
                            onChange={(e) => handleImpactChange('profile_complete_pct', e.target.value)}
                            max="100" min="0"
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-1">Updates the completion ring on the User Dashboard.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Global Docs Saved Target</label>
                        <input
                            type="number"
                            value={settings.impact.docs_saved_target}
                            onChange={(e) => handleImpactChange('docs_saved_target', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-1">Updates the total community docs saved metric.</p>
                    </div>
                </div>
            </div>

            {/* Upcoming Deadlines Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-500" /> Upcoming Deadlines
                    </h3>
                    <button onClick={addDeadline} className="text-sm font-semibold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-pink-100 transition-colors">
                        <Plus className="w-4 h-4" /> Add Deadline
                    </button>
                </div>

                <div className="space-y-4">
                    {settings.deadlines.map((deadline, idx) => (
                        <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={deadline.title}
                                        onChange={(e) => handleDeadlineChange(idx, 'title', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Date</label>
                                    <input
                                        type="text"
                                        value={deadline.date}
                                        onChange={(e) => handleDeadlineChange(idx, 'date', e.target.value)}
                                        placeholder="e.g. Mar 15, 2026"
                                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Severity / Color</label>
                                    <select
                                        value={deadline.type}
                                        onChange={(e) => handleDeadlineChange(idx, 'type', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/20 outline-none"
                                    >
                                        <option value="info">Info (Blue)</option>
                                        <option value="warning">Warning (Amber)</option>
                                        <option value="critical">Critical (Red)</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={() => removeDeadline(idx)} className="mt-6 text-slate-400 hover:text-red-500 transition-colors p-1.5 bg-white border border-slate-200 rounded-md shadow-sm">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {settings.deadlines.length === 0 && (
                        <p className="text-sm text-slate-500 italic text-center py-6">No deadlines configured. Add one to show on User Dashboards.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
