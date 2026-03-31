import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard,
    Bot,
    Search,
    LogOut,
    Bell,
    Settings,
    User,
    ChevronDown,
    MoreVertical,
    CheckCircle2,
    Clock,
    Play,
    Pause,
    CalendarDays,
    BookOpen,
    TrendingUp,
    FileText,
    Activity,
    AlertCircle,
    Zap,
    BrainCircuit,
    Mic,
    Network,
    MessageSquare,
    Building2,
    Tags,
    ShieldCheck,
    GraduationCap,
    Bookmark,
    BookmarkCheck,
    History,
    PlusCircle,
    X,
    Sparkles,
    Target,
    Award,
    Sun,
    Moon,
    StickyNote,
    Share2,
    Users,
    MessageCircle,
    Link as LinkIcon,
    Mail,
    Send,
    MessageSquareMore
} from 'lucide-react';
import ChatInterface from './ChatInterface';
import SmartSearch from './SmartSearch';
import BackgroundParticles from './BackgroundParticles';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function UserDashboard({ user, handleLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isTrackerActive, setIsTrackerActive] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [theme, setTheme] = useState('aurora'); // 'aurora' | 'cyberpunk' | 'darkAcademia'

    // Advanced Features states
    const [persona, setPersona] = useState('Student');
    const [libraryTab, setLibraryTab] = useState('discover');
    const [savedDocs, setSavedDocs] = useState([]);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [docRequestTitle, setDocRequestTitle] = useState('');
    const [docRequestDesc, setDocRequestDesc] = useState('');
    const [docRequestSubmitting, setDocRequestSubmitting] = useState(false);
    const [pendingPrompt, setPendingPrompt] = useState(null);
    const [isListening, setIsListening] = useState(false); // Voice assistant visualizer state

    // Gamification Mock State
    const [userLevel, setUserLevel] = useState({ current: 4, title: "Policy Scholar", nextXP: 850, currentXP: 680 });

    // Liquid Swipe / Flashlight effect reference
    const mousePos = React.useRef({ x: 0, y: 0 });

    // Dynamic data states
    const [trendingDocs, setTrendingDocs] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Dynamic Settings State
    const [dashboardSettings, setDashboardSettings] = useState({
        impact: { profile_complete_pct: 75, docs_saved_target: 12 },
        deadlines: [
            { title: 'Merit Scholarship Forms', date: 'Mar 15, 2026', type: 'warning' },
            { title: 'Semester Registration', date: 'Mar 22, 2026', type: 'info' }
        ]
    });

    // My Document Requests state
    const [myRequests, setMyRequests] = useState([]);

    // Collaboration & Social States
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isForumOpen, setIsForumOpen] = useState(false);
    const [isStudyRoomOpen, setIsStudyRoomOpen] = useState(false);

    // AI Radar State
    const [isRadarScanning, setIsRadarScanning] = useState(true);
    const [scholarshipMatches, setScholarshipMatches] = useState([
        { id: 1, title: 'National Merit Scholarship', match: 94, reason: 'Matched: Academic Excellence & Income < 2.5L', color: 'emerald' },
        { id: 2, title: 'STEM Innovation Grant', match: 82, reason: 'Matched: Engineering Major & Gender Neutral', color: 'indigo' },
        { id: 3, title: 'HED Research Fellowship', match: 76, reason: 'Matched: PhD Research Proposal & High Impact', color: 'purple' }
    ]);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        // Mocking a scanning effect that finishes after 3 seconds
        const timer = setTimeout(() => setIsRadarScanning(false), 3500);
        return () => clearTimeout(timer);
    }, []);
    const [activeSocialDoc, setActiveSocialDoc] = useState(null);
    const [forumMessages, setForumMessages] = useState([]);
    const [newForumMessage, setNewForumMessage] = useState('');
    const [shareEmail, setShareEmail] = useState('');
    const [shareLoading, setShareLoading] = useState(false);
    const [socialToast, setSocialToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setSocialToast({ message, type });
        setTimeout(() => setSocialToast(null), 3000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText('http://hedportal.ac.in/docs/nep-2024-compliance');
        showToast('Link copied to clipboard!');
    };

    const handleSendInvitation = async (e) => {
        e.preventDefault();
        if (!shareEmail || !shareEmail.includes('@')) {
            showToast('Please enter a valid email', 'error');
            return;
        }

        setShareLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/docs/share`, {
                to_email: shareEmail,
                doc_title: "National Education Policy Compliance 2024", // Hardcoded for this mockup link
                share_link: "http://hedportal.ac.in/docs/nep-2024-compliance",
                sender_name: user?.identifier?.split('@')[0] || "A colleague"
            });

            if (response.data.status === 'success') {
                showToast(`Invitation sent to ${shareEmail}!`);
                setShareEmail('');
                setIsShareModalOpen(false);
            }
        } catch (error) {
            console.error("Sharing error:", error);
            showToast(error.response?.data?.detail || 'Failed to send invitation. Please check SMTP.', 'error');
        } finally {
            setShareLoading(false);
        }
    };

    const fetchForumMessages = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/forum/messages`);
            if (response.data && response.data.messages) {
                setForumMessages(response.data.messages);
            }
        } catch (error) {
            console.error("Failed to fetch forum messages:", error);
        }
    };

    useEffect(() => {
        let interval;
        if (isForumOpen) {
            fetchForumMessages();
            interval = setInterval(fetchForumMessages, 5000); // Polling every 5s while open
        }
        return () => clearInterval(interval);
    }, [isForumOpen]);

    // Presence & Heartbeat logic
    const fetchOnlineUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/online-users?role=user`);
            if (response.data && response.data.users) {
                setOnlineUsers(response.data.users);
            }
        } catch (error) {
            console.error("Failed to fetch online users:", error);
        }
    };

    const sendHeartbeat = async () => {
        if (!user?.identifier) return;
        try {
            await axios.post(`${API_BASE_URL}/auth/heartbeat`, {
                identifier: user.identifier,
                role: "user",
            });
        } catch (error) {
            console.error("Heartbeat failed:", error);
        }
    };

    useEffect(() => {
        if (!user?.identifier) return;
        
        // Initial actions
        sendHeartbeat();
        fetchOnlineUsers();

        // Intervals
        const heartbeatInterval = setInterval(sendHeartbeat, 30000); // Every 30s
        const presenceInterval = setInterval(fetchOnlineUsers, 5000); // Every 5s (Immediate sync)

        return () => {
            clearInterval(heartbeatInterval);
            clearInterval(presenceInterval);
        };
    }, [user?.identifier]);

    const handleForumSend = async () => {
        if (!newForumMessage.trim()) return;
        
        const msgData = {
            user: user?.identifier?.split('@')[0] || 'Me',
            text: newForumMessage,
            time: 'Just now'
        };

        try {
            await axios.post(`${API_BASE_URL}/forum/messages`, msgData);
            setNewForumMessage('');
            fetchForumMessages(); // Immediate refresh
        } catch (error) {
            console.error("Failed to send forum message:", error);
            showToast('Failed to send message', 'error');
        }
    };

    const handleJoinRoom = (roomName) => {
        showToast(`Joined ${roomName}! Redirecting...`);
        setTimeout(() => setIsStudyRoomOpen(false), 1000);
    };

    // Smart Bookmarks with Notes
    const [bookmarks, setBookmarks] = useState(() => {
        try { return JSON.parse(localStorage.getItem('hed_bookmarks') || '[]'); } catch { return []; }
    });
    const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
    const [activeBookmark, setActiveBookmark] = useState(null); // {title, category} of doc being annotated
    const [bookmarkNote, setBookmarkNote] = useState('');

    // Personal Usage Stats (tracked in localStorage per session)
    const [usageStats, setUsageStats] = useState(() => {
        const stored = localStorage.getItem('hed_usage_stats');
        const today = new Date().toDateString();
        const def = { aiQueries: 0, docsSaved: 0, searches: 0, lastReset: today };
        if (!stored) return def;
        const parsed = JSON.parse(stored);
        // Reset weekly stats every Monday
        const daysSinceReset = Math.floor((new Date() - new Date(parsed.lastReset)) / (1000 * 60 * 60 * 24));
        return daysSinceReset >= 7 ? def : parsed;
    });

    // Persist usage stats on change
    React.useEffect(() => {
        localStorage.setItem('hed_usage_stats', JSON.stringify(usageStats));
    }, [usageStats]);

    // Persist dark mode
    React.useEffect(() => {
        localStorage.setItem('hed_dark_mode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    const addBookmark = (doc, note) => {
        const newBookmarks = [
            { id: Date.now(), title: doc.title, category: doc.category || 'General', note, savedAt: new Date().toISOString() },
            ...bookmarks.filter(b => b.title !== doc.title)
        ];
        setBookmarks(newBookmarks);
        localStorage.setItem('hed_bookmarks', JSON.stringify(newBookmarks));
    };

    const removeBookmark = (id) => {
        const updated = bookmarks.filter(b => b.id !== id);
        setBookmarks(updated);
        localStorage.setItem('hed_bookmarks', JSON.stringify(updated));
    };

    const toggleSaveDoc = (doc) => {
        setSavedDocs(prev => {
            const isSaved = prev.find(d => d.title === doc.title);
            if (isSaved) return prev.filter(d => d.title !== doc.title);
            return [...prev, doc];
        });
    };

    useEffect(() => {
        // Fetch dashboard data
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                // Fetch dynamic settings
                const settingsRes = await axios.get(`${API_BASE_URL}/settings/dashboard`);
                if (settingsRes.data && settingsRes.data.impact && settingsRes.data.deadlines) {
                    setDashboardSettings(settingsRes.data);
                }

                // Fetch recent uploads for activity timeline
                const recentRes = await axios.get(`${API_BASE_URL}/documents/recent?limit=5`);
                if (recentRes.data && recentRes.data.documents) {
                    // Map generic documents to "activity" format
                    const formattedActivity = recentRes.data.documents.map((doc, idx) => {
                        const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-yellow-500', 'bg-gray-400'];

                        // Format time relatively
                        const uploadDate = new Date(doc.uploaded_at);
                        const today = new Date();
                        const diffTime = Math.abs(today - uploadDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        let timeStr = `${diffDays} days ago`;
                        if (diffDays === 1) timeStr = 'Yesterday';
                        if (diffDays === 0 || diffDays < 1) timeStr = 'Today';

                        return {
                            action: 'New Document Uploaded',
                            target: doc.filename,
                            time: timeStr,
                            type: 'upload',
                            color: colors[idx % colors.length]
                        };
                    });

                    // Prepend standard login action to make it look like "Your Activity"
                    formattedActivity.push({ action: 'System Login', target: 'Device verified', time: 'Mar 01', type: 'login', color: 'bg-gray-400' });
                    setRecentActivity(formattedActivity.slice(0, 5));
                }

                // Temporary fetch block - just returning static trending docs in UI for now
                setTimeout(() => {
                    setTrendingDocs([
                        { id: 1, title: 'NEP 2024 Implementation Guidelines', category: 'Policy', views: 1245, saved: true },
                        { id: 2, title: 'Revised UGC Scholarship Scheme', category: 'Finance', views: 890, saved: false },
                        { id: 3, title: 'AICTE Research Grant Procedures', category: 'Research', views: 654, saved: true },
                        { id: 4, title: 'National Innovation Fellowship 2025', category: 'Grant', views: 512, saved: false },
                        { id: 5, title: 'Guidelines for PhD Admissions', category: 'Admissions', views: 420, saved: false },
                        { id: 6, title: 'Student Welfare Code of Conduct', category: 'Policy', views: 330, saved: false }
                    ]);
                    setSavedDocs([
                        { id: 1, title: 'NEP 2024 Implementation Guidelines', category: 'Policy', views: 1245 },
                        { id: 3, title: 'AICTE Research Grant Procedures', category: 'Research', views: 654 }
                    ])
                    setIsLoadingData(false);
                }, 800);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setIsLoadingData(false);
                // Fallback data
                setTrendingDocs([
                    { title: 'National Education Policy 2024 Updates', category: 'Policy', views: '2.4k', icon: <FileText className="w-5 h-5 text-blue-500" /> },
                    { title: 'State Merit Scholarship Eligibility Criteria', category: 'Scholarship', views: '1.8k', icon: <GraduationCap className="w-5 h-5 text-emerald-500" /> },
                    { title: 'Research Grant Application Guidelines', category: 'Grant', views: '950', icon: <Building2 className="w-5 h-5 text-purple-500" /> },
                    { title: 'University Affiliation Standards V2', category: 'Standard', views: '620', icon: <CheckCircle2 className="w-5 h-5 text-amber-500" /> }
                ]);
                setRecentActivity([
                    { action: 'Smart Search', target: 'Research Grants 2025', time: 'Just now', type: 'search', color: 'bg-indigo-500' },
                    { action: 'AI Interaction', target: 'Asked about fellowship eligibility', time: '2 hours ago', type: 'ai', color: 'bg-purple-500' },
                    { action: 'Viewed Document', target: 'NEP Implementation Guide', time: 'Yesterday', type: 'view', color: 'bg-emerald-500' },
                    { action: 'Saved to profile', target: 'Merit Scholarship Form', time: 'Mar 03', type: 'save', color: 'bg-yellow-500' },
                    { action: 'System Login', target: 'Device verified', time: 'Mar 01', type: 'login', color: 'bg-gray-400' }
                ]);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();

        // Also load user's own doc requests
        const loadMyRequests = async () => {
            if (!user?.identifier) return;
            try {
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                const res = await axios.get(`${apiBase}/doc-requests/user/${encodeURIComponent(user.identifier)}`);
                setMyRequests(res.data.requests || []);
            } catch (e) {
                console.warn('Could not load user requests', e);
            }
        };
        loadMyRequests();
    }, []);

    // Notification: track which resolved requests the user has seen
    const [seenRequestIds, setSeenRequestIds] = useState(() => {
        try { return JSON.parse(localStorage.getItem('seen_req_ids') || '[]'); }
        catch { return []; }
    });

    // Compute notifications: resolved doc requests (unseen) + static system ones
    const resolvedRequests = myRequests.filter(r => r.status === 'approved' || r.status === 'rejected');
    const unseenResolved = resolvedRequests.filter(r => !seenRequestIds.includes(r._id));

    const requestNotifications = resolvedRequests.map(r => ({
        id: r._id,
        icon: r.status === 'approved' ? '✅' : '❌',
        title: r.status === 'approved'
            ? `Your request "${r.title}" was APPROVED by admin`
            : `Your request "${r.title}" was REJECTED by admin`,
        time: r.resolved_at ? new Date(r.resolved_at).toLocaleString() : '',
        unread: !seenRequestIds.includes(r._id),
        color: r.status === 'approved' ? 'bg-emerald-50/60' : 'bg-red-50/40',
        comment: r.admin_comment || ''
    }));

    const staticNotifications = [
        { id: 'sys1', icon: '📄', title: 'New policy document uploaded', time: '2 min ago', unread: false, color: '' },
        { id: 'sys2', icon: '🔍', title: 'Search index updated', time: '1 hr ago', unread: false, color: '' },
    ];

    const allNotifications = [...requestNotifications, ...staticNotifications];
    const unreadNotifCount = unseenResolved.length;

    // Mock quick static data suitable for HED system
    const systemStats = [
        { label: 'Documents', value: '15%', color: 'bg-[#2d2d2d]' },
        { label: 'Queries', value: '15%', color: 'bg-yellow-400 text-black' },
        { label: 'Accuracy', value: '60%', color: 'bg-white/40', pattern: true },
        { label: 'Uptime', value: '10%', color: 'bg-transparent border border-gray-400' },
    ];

    const largeStats = [
        { number: '1,240', label: 'Indexed', icon: <BookOpen className="w-5 h-5" /> },
        { number: '485', label: 'AI Queries', icon: <TrendingUp className="w-5 h-5" /> },
        { number: '98%', label: 'Accuracy', icon: <Activity className="w-5 h-5" /> },
    ];

    const renderTopNav = () => (
        <nav className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <span className="font-semibold text-lg text-gray-800">HE</span>
                </div>
                <h1 className="text-2xl font-medium tracking-tight text-gray-800">HED Portal</h1>
            </div>

            <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md rounded-full p-1 shadow-sm border border-white">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-[#2d2d2d] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => { setActiveTab('chat'); setUsageStats(p => ({ ...p, aiQueries: p.aiQueries + 1 })); }}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-[#2d2d2d] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    AI Assistant
                </button>
                <button
                    onClick={() => { setActiveTab('search'); setUsageStats(p => ({ ...p, searches: p.searches + 1 })); }}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'search' ? 'bg-[#2d2d2d] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    Smart Search
                </button>
                {/* Visual mock tabs to match design */}
                <span className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-400 cursor-not-allowed">Documents</span>
            </div>

            <div className="flex items-center gap-3 relative">
                {/* Persona Selector */}
                <select
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    className="bg-white/60 backdrop-blur-md border border-white text-gray-700 text-sm font-medium rounded-full px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                    <option value="Student">Student Explorer</option>
                    <option value="Faculty">Faculty Member</option>
                    <option value="Admin">University Admin</option>
                </select>

                {/* Settings Button */}
                <button
                    onClick={() => { setIsSettingsOpen(v => !v); setIsNotifOpen(false); }}
                    className={`flex items-center gap-2 px-4 py-2.5 backdrop-blur-md border rounded-full text-sm font-medium transition shadow-sm ${isSettingsOpen ? 'bg-[#2d2d2d] text-white border-transparent' : 'bg-white/60 border-white text-gray-600 hover:bg-white/80'
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    Setting
                </button>

                {/* Notification Button */}
                <div className="relative">
                    <button
                        onClick={() => { setIsNotifOpen(v => !v); setIsSettingsOpen(false); }}
                        className={`w-10 h-10 backdrop-blur-md border rounded-full flex items-center justify-center transition shadow-sm relative ${isNotifOpen ? 'bg-[#2d2d2d] text-white border-transparent' : 'bg-white/60 border-white text-gray-600 hover:bg-white/80'
                            }`}
                    >
                        <Bell className="w-4 h-4" />
                        {unreadNotifCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full border border-white flex items-center justify-center text-[9px] font-extrabold text-white px-0.5 leading-none">
                                {unreadNotifCount}
                            </span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 top-14 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                                {unreadNotifCount > 0 && (
                                    <button
                                        onClick={() => {
                                            const ids = [...seenRequestIds, ...unseenResolved.map(r => r._id)];
                                            setSeenRequestIds(ids);
                                            localStorage.setItem('seen_req_ids', JSON.stringify(ids));
                                        }}
                                        className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                                {allNotifications.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-sm">No notifications</div>
                                ) : (
                                    allNotifications.map(n => (
                                        <div
                                            key={n.id}
                                            onClick={() => {
                                                if (n.unread && !seenRequestIds.includes(n.id)) {
                                                    const updated = [...seenRequestIds, n.id];
                                                    setSeenRequestIds(updated);
                                                    localStorage.setItem('seen_req_ids', JSON.stringify(updated));
                                                }
                                            }}
                                            className={`flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${n.unread ? n.color || 'bg-blue-50/40' : ''}`}
                                        >
                                            <span className="text-xl mt-0.5 shrink-0">{n.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-snug ${n.unread ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                                                {n.comment && (
                                                    <p className="text-xs italic text-slate-400 mt-0.5">Admin: "{n.comment}"</p>
                                                )}
                                                <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                                            </div>
                                            {n.unread && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                                <span className="text-xs text-slate-400 font-medium">
                                    {allNotifications.length} notification{allNotifications.length !== 1 ? 's' : ''} total
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dark Mode Toggle — quick access */}
                <button
                    onClick={() => setIsDarkMode(v => !v)}
                    className={`w-10 h-10 backdrop-blur-md border rounded-full flex items-center justify-center transition shadow-sm ${isDarkMode ? 'bg-indigo-700 text-yellow-300 border-indigo-500' : 'bg-white/60 border-white text-gray-600 hover:bg-white/80'
                        }`}
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Logout */}
                <button onClick={handleLogout} className="w-10 h-10 bg-white/60 backdrop-blur-md border border-white rounded-full flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 transition shadow-sm" title="Logout">
                    <LogOut className="w-4 h-4" />
                </button>
            </div>

            {/* Settings Slide-out Drawer */}
            {isSettingsOpen && (
                <div className="absolute top-20 right-8 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-700 px-5 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                            {(user?.identifier || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">{user?.identifier?.split('@')[0] || 'User'}</p>
                            <p className="text-slate-300 text-xs">{user?.identifier || ''}</p>
                        </div>
                    </div>

                    {/* Settings Sections */}
                    <div className="p-4 space-y-4">
                        {/* Preferences */}
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preferences</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer">
                                    <span className="text-sm font-medium text-slate-700">🌐 Language</span>
                                    <select className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg px-2 py-1 border-0 focus:outline-none cursor-pointer">
                                        <option>English</option>
                                        <option>Tamil</option>
                                        <option>Hindi</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer">
                                    <span className="text-sm font-medium text-slate-700">🔔 Notifications</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer" onClick={() => setIsDarkMode(!isDarkMode)}>
                                    <span className="text-sm font-medium text-slate-700">🌙 Dark Mode</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={isDarkMode} readOnly />
                                        <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Account */}
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account</p>
                            <div className="space-y-1">
                                <button onClick={() => { setIsProfileModalOpen(true); setIsSettingsOpen(false); }} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors text-left">
                                    <User className="w-4 h-4 text-slate-400" /> View Profile
                                </button>
                                <button className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors text-left">
                                    <ShieldCheck className="w-4 h-4 text-slate-400" /> Change Password
                                </button>
                            </div>
                        </div>

                        {/* Theme Vibe Selector */}
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Dashboard Vibe</p>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setTheme('aurora')}
                                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${theme === 'aurora' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-inner' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Aurora
                                </button>
                                <button
                                    onClick={() => setTheme('cyberpunk')}
                                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${theme === 'cyberpunk' ? 'bg-pink-50 border-pink-200 text-pink-700 shadow-inner' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Cyberpunk
                                </button>
                                <button
                                    onClick={() => setTheme('darkAcademia')}
                                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${theme === 'darkAcademia' ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-inner' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Academia
                                </button>
                            </div>
                        </div>

                        {/* Sign Out */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );

    // Apply global CSS variables based on theme
    const getThemeStyles = () => {
        if (theme === 'cyberpunk') {
            return {
                background: 'bg-slate-900',
                text: 'text-slate-100',
                accent: 'bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]',
                accentHover: 'hover:bg-pink-500',
                glass: 'bg-slate-800/60 border-slate-700/50',
                textSecondary: 'text-slate-400',
                cardText: 'text-slate-200'
            };
        } else if (theme === 'darkAcademia') {
            return {
                background: 'bg-[#f4efe6]', // Parchment feel
                text: 'text-[#3e2723]',
                accent: 'bg-[#5d4037] text-white shadow-md',
                accentHover: 'hover:bg-[#4e342e]',
                glass: 'bg-white/50 border-[#d7ccc8]/50',
                textSecondary: 'text-[#795548]',
                cardText: 'text-[#4e342e]'
            };
        }
        // default aurora
        return {
            background: 'bg-gradient-to-br from-indigo-50 via-white to-purple-50',
            text: 'text-gray-800',
            accent: 'bg-indigo-600 text-white shadow-md',
            accentHover: 'hover:bg-indigo-700',
            glass: 'bg-white/70 border-white',
            textSecondary: 'text-gray-500',
            cardText: 'text-gray-800'
        };
    };

    const themeStyles = getThemeStyles();

    const renderDashboardSummary = () => (
        <div className="max-w-[1400px] mx-auto w-full px-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out z-10 relative">
            {/* Immersive Hero Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-10 md:p-14 shadow-2xl border border-indigo-400/20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-4xl md::text-5xl font-light text-indigo-50 tracking-tight mb-4">
                            Welcome back, <br />
                            <span className="font-semibold text-white">{user?.identifier?.split('@')[0] || "Scholar"}</span>
                        </h2>
                        <p className="text-indigo-200/80 text-lg mb-8 max-w-md">
                            {persona === 'Student' && "Your personalized gateway to scholarships, study guidelines, and intelligent search."}
                            {persona === 'Faculty' && "Access curriculum standards, research grants, and university policies seamlessly."}
                            {persona === 'Admin' && "Rapidly retrieve compliance documents, official circulars, and system insights."}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <button
                                onClick={() => setActiveTab('search')}
                                className="px-6 py-3 bg-white text-indigo-900 rounded-full font-semibold outline-none hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2"
                            >
                                <Search className="w-4 h-4" /> Global Search
                            </button>
                            <button
                                onClick={() => setIsListening(prev => !prev)}
                                className={`px-6 py-3 rounded-full font-medium border transition-all flex items-center gap-2 backdrop-blur-md relative overflow-hidden ${isListening
                                    ? 'bg-pink-500/80 text-white border-pink-400/50 shadow-[0_0_20px_rgba(236,72,153,0.6)] animate-pulse'
                                    : 'bg-indigo-800/50 text-white border-indigo-400/30 hover:bg-indigo-700/50'
                                    }`}
                            >
                                {isListening ? (
                                    <>
                                        {/* Audio Wave Bars */}
                                        <div className="flex items-end gap-0.5 h-4 w-5 mr-1 overflow-hidden">
                                            <div className="bg-white w-1 rounded-t-sm animate-[wave_1.2s_ease-in-out_infinite] [animation-delay:-0.2s]"></div>
                                            <div className="bg-white w-1 rounded-t-sm animate-[wave_1.2s_ease-in-out_infinite] [animation-delay:-0.4s]"></div>
                                            <div className="bg-white w-1 rounded-t-sm animate-[wave_1.2s_ease-in-out_infinite] [animation-delay:-0.6s]"></div>
                                            <div className="bg-white w-1 rounded-t-sm animate-[wave_1.2s_ease-in-out_infinite]"></div>
                                        </div>
                                        Listening...
                                    </>
                                ) : (
                                    <><Mic className="w-4 h-4" /> Voice Command</>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('chat')}
                                className="px-6 py-3 bg-indigo-800/50 text-white rounded-full font-medium border border-indigo-400/30 w-12 flex justify-center hover:bg-indigo-700/50 transition-colors backdrop-blur-md"
                                title="Open AI Chat"
                            >
                                <Bot className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsRequestModalOpen(true)}
                                className="px-6 py-3 bg-white/10 text-white rounded-full font-medium border border-white/20 hover:bg-white/20 transition-colors flex items-center gap-2 backdrop-blur-md shadow-lg"
                            >
                                <PlusCircle className="w-4 h-4" /> Request Doc
                            </button>
                        </div>
                    </div>

                    <div className="hidden md:flex justify-end gap-6 text-white">
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center w-36 h-40 transform hover:-translate-y-2 transition-transform shadow-lg">
                            <BookOpen className="w-8 h-8 text-indigo-300 mb-3" />
                            <span className="text-3xl font-light">145</span>
                            <span className="text-xs text-indigo-200 font-medium mt-1 uppercase tracking-wider">Active<br />Schemes</span>
                        </div>
                        <div className="bg-black/20 backdrop-blur-md rounded-3xl p-6 border border-white/5 flex flex-col items-center justify-center w-36 h-40 transform hover:-translate-y-2 transition-transform mt-8 shadow-lg">
                            <Tags className="w-8 h-8 text-purple-300 mb-3" />
                            <span className="text-3xl font-light">3</span>
                            <span className="text-xs text-indigo-200 font-medium mt-1 uppercase tracking-wider">Saved<br />Searches</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Resume AI Conversations */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-4 px-1">
                    <History className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Recent AI Conversations</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                    {[
                        { title: 'Discussion on NEP 2024 compliance', time: '2 hrs ago', category: 'Policy' },
                        { title: 'Scholarship eligibility criteria', time: 'Yesterday', category: 'Admissions' },
                        { title: 'Comparing 2023 vs 2024 syllabus', time: 'Mar 03', category: 'Curriculum' }
                    ].map((chat, idx) => (
                        <div key={idx} onClick={() => { setPendingPrompt(chat.title); setActiveTab('chat'); }} className="snap-start shrink-0 w-72 bg-white/70 backdrop-blur-xl border border-white p-5 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-medium text-gray-400">{chat.time}</span>
                            </div>
                            <h4 className="font-semibold text-gray-800 line-clamp-2">{chat.title}</h4>
                            <p className="text-xs text-indigo-600 font-medium mt-2">Resume Session →</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Trending Policies & Activities */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Pro Feature: AI Quick Actions */}
                    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-sm animate-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Quick Prompts for {persona}s</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                persona === 'Student' && { title: 'Find Scholarships', desc: 'Matching my profile', icon: <Award className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700' },
                                persona === 'Student' && { title: 'Exam Guidelines', desc: 'Latest updates', icon: <FileText className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700' },
                                persona === 'Student' && { title: 'Syllabus Changes', desc: 'NEP 2024 mapping', icon: <BookOpen className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },

                                persona === 'Faculty' && { title: 'Grant Proposals', desc: 'Draft AI outline', icon: <Target className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
                                persona === 'Faculty' && { title: 'Lesson Plan', desc: 'Generate template', icon: <FileText className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700' },
                                persona === 'Faculty' && { title: 'Leave Rules', desc: 'View policy', icon: <BookOpen className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-700' },

                                persona === 'Admin' && { title: 'Compliance Report', desc: 'Generate summary', icon: <ShieldCheck className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700' },
                                persona === 'Admin' && { title: 'System Analytics', desc: 'View usage data', icon: <Activity className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
                                persona === 'Admin' && { title: 'New Circular', desc: 'Draft template', icon: <FileText className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700' },
                            ].filter(Boolean).map((prompt, idx) => (
                                <div key={idx} onClick={() => { setPendingPrompt(prompt.title); setActiveTab('chat'); }} className="flashlight-card bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 cursor-pointer transition-all flex flex-col gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${prompt.color} hover:scale-110 transition-transform`}>
                                        {prompt.icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{prompt.title}</p>
                                        <p className="text-xs text-slate-500">{prompt.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trending Policies / My Library */}
                    <div>
                        <div className="flex items-center justify-between mb-6 px-1">
                            <div className="flex items-center gap-4 bg-gray-100 p-1 rounded-full border border-gray-200/50 shadow-inner">
                                <button
                                    onClick={() => setLibraryTab('discover')}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${libraryTab === 'discover' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <TrendingUp className="w-4 h-4" /> Discover
                                </button>
                                <button
                                    onClick={() => setLibraryTab('saved')}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${libraryTab === 'saved' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Bookmark className="w-4 h-4" /> My Library ({savedDocs.length})
                                </button>
                            </div>
                            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">View All</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {libraryTab === 'saved' && savedDocs.length === 0 ? (
                                <div className="col-span-1 md:col-span-2 py-12 flex flex-col justify-center items-center text-gray-400 gap-3 bg-white/40 rounded-3xl border border-dashed border-gray-300">
                                    <Bookmark className="w-8 h-8 text-gray-300" />
                                    <p>Your library is empty. Save documents to access them quickly.</p>
                                </div>
                            ) : isLoadingData && libraryTab === 'discover' ? (
                                <div className="col-span-1 md:col-span-2 py-10 flex justify-center items-center text-gray-400 gap-2">
                                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    Loading guidelines...
                                </div>
                            ) : (
                                (libraryTab === 'discover' ? trendingDocs : savedDocs).map((doc, idx) => {
                                    const views = doc.views || `${doc.access_count || 0} views this week`;
                                    const icon = doc.icon || <FileText className="w-5 h-5 text-indigo-500" />;

                                    // Generate Random Avatars for Social Proof
                                    const randomAvatars = [
                                        `https://i.pravatar.cc/150?img=${doc.id * 3 + 1}`,
                                        `https://i.pravatar.cc/150?img=${doc.id * 3 + 2}`,
                                        `https://i.pravatar.cc/150?img=${doc.id * 3 + 3}`
                                    ];
                                    const readersCount = Math.floor(Math.random() * 15) + 3;
                                    const isSaved = savedDocs.some(d => d.title === doc.title);

                                    return (
                                        <div key={idx} className="flashlight-card bg-white/50 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative">
                                            {/* Bookmark Toggle */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleSaveDoc(doc); if (!savedDocs.some(d => d.title === doc.title)) { setUsageStats(p => ({ ...p, docsSaved: p.docsSaved + 1 })); } }}
                                                className={`absolute top-4 right-12 p-2 rounded-full transition-all duration-200 z-10 ${isSaved ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100'}`}
                                            >
                                                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                            </button>

                                            {/* Bookmark Note Button */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveBookmark(doc); setBookmarkNote(bookmarks.find(b => b.title === doc.title)?.note || ''); setIsBookmarkModalOpen(true); }}
                                                className="absolute top-4 right-4 p-2 rounded-full bg-amber-50 text-amber-400 opacity-0 group-hover:opacity-100 hover:bg-amber-100 transition-all duration-200 z-10"
                                                title="Add Note"
                                            >
                                                <StickyNote className="w-4 h-4" />
                                            </button>

                                            <div className="flex items-start justify-between gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:scale-110 transition-transform">
                                                    {icon}
                                                </div>
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100/80 text-gray-600 backdrop-blur-sm border border-gray-200 mr-8">
                                                    {doc.category || 'Document'}
                                                </span>
                                            </div>
                                            <div className="mt-4">
                                                <h4 className="font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors pr-2">{doc.title || doc.filename}</h4>
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                                        <Activity className="w-3.5 h-3.5" /> {views}
                                                    </div>

                                                    {/* Social Proof Avatars */}
                                                    <div className="flex items-center">
                                                        <div className="flex -space-x-2 mr-2">
                                                            {randomAvatars.map((src, i) => (
                                                                <img key={i} src={src} className="w-6 h-6 rounded-full border border-white shrink-0 shadow-sm" alt="Reader" />
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-live"></div>
                                                            <span className="text-[10px] font-semibold text-gray-400 leading-tight">
                                                                {readersCount} students<br />reading
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── AI Knowledge Constellation ───────────────── */}
                    {renderKnowledgeConstellation()}

                </div>

                {/* Right Column: Premium Interactive Widgets */}
                <div className="space-y-8">

                    {/* ── Usage Pulse: Glassmorphic Progress ───────────────── */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Usage Pulse</h3>
                                <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Scholarship Readiness</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                <Activity className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                {/* SVG Circular Progress */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="96" cy="96" r="80"
                                        stroke="currentColor" strokeWidth="12" fill="transparent"
                                        className="text-slate-100/50"
                                    />
                                    <circle
                                        cx="96" cy="96" r="80"
                                        stroke="currentColor" strokeWidth="12" fill="transparent"
                                        strokeDasharray={2 * Math.PI * 80}
                                        strokeDashoffset={2 * Math.PI * 80 * (1 - 0.72)}
                                        strokeLinecap="round"
                                        className="text-indigo-600 drop-shadow-[0_0_8px_rgba(79,70,229,0.4)] transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-5xl font-black text-slate-800 tracking-tighter">72<span className="text-2xl">%</span></span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Profile Strength</span>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                                <div className="bg-white/50 p-4 rounded-2xl border border-white/60 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Docs Read</p>
                                    <p className="text-lg font-black text-slate-800 mt-1">12/15</p>
                                </div>
                                <div className="bg-white/50 p-4 rounded-2xl border border-white/60 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Streak</p>
                                    <p className="text-lg font-black text-emerald-600 mt-1">5 Days</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── AI Scholarship Radar: Realistic Matcher ─────────── */}
                    {renderScholarshipRadar()}

                    {/* ── Social Hub: Live Activity ───────────────── */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-xl flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Social Hub</h3>
                                <p className="text-xs text-purple-600 font-bold uppercase tracking-widest mt-0.5">Live Community</p>
                            </div>
                             <div className="flex -space-x-3">
                                {onlineUsers.slice(0, 4).map((email, idx) => (
                                    <div key={idx} className="relative group/avatar">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-white font-bold text-xs ring-2 ring-purple-500/20">
                                            {email[0].toUpperCase()}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                            {email}
                                        </div>
                                    </div>
                                ))}
                                {onlineUsers.length > 4 && (
                                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                                        +{onlineUsers.length - 4}
                                    </div>
                                )}
                                {onlineUsers.length === 0 && (
                                     <div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-white font-bold text-xs">
                                        ?
                                     </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            {/* Forum Snippet */}
                            <div className="relative">
                                <span className="absolute -left-2 top-0 bottom-0 w-1 bg-purple-500 rounded-full"></span>
                                <div className="pl-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Recent Discussion</p>
                                        <button onClick={() => setIsForumOpen(true)} className="text-[10px] font-bold text-slate-400 hover:text-purple-600 transition-colors">Open Forum →</button>
                                    </div>
                                    <div className="bg-white/60 rounded-2xl p-4 border border-white shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setIsForumOpen(true)}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 rounded-lg bg-slate-200 flex items-center justify-center text-[8px] font-bold">R</div>
                                            <span className="text-xs font-bold text-slate-700">Rahul Sharma</span>
                                            <span className="text-[10px] text-slate-400 font-medium">2m ago</span>
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed italic">"Has anyone checked the new NEP guidelines for the 2026 semester registration?"</p>
                                    </div>
                                </div>
                            </div>

                            {/* Study Room Snippet */}
                            <div className="relative">
                                <span className="absolute -left-2 top-0 bottom-0 w-1 bg-emerald-500 rounded-full"></span>
                                <div className="pl-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Active Study Room</p>
                                        <button onClick={() => setIsStudyRoomOpen(true)} className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors">Join Room →</button>
                                    </div>
                                    <div className="bg-white/60 rounded-2xl p-4 border border-white shadow-sm group/room hover:shadow-md transition-all cursor-pointer" onClick={() => setIsStudyRoomOpen(true)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 group-hover/room:bg-emerald-500 group-hover/room:text-white transition-colors">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Policy Analysis Lab</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{onlineUsers.length} {onlineUsers.length === 1 ? 'student' : 'students'} collaborating</p>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] border border-slate-700 flex items-center justify-center gap-2 group"
                        >
                            <Share2 className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                            Invite Collaborator
                        </button>
                    </div>

                    {/* ── Smart Calendar: Dynamic Timeline ───────────────── */}
                    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-indigo-400/20">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl mix-blend-overlay"></div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Smart Calendar</h3>
                                <p className="text-xs text-indigo-200 font-bold uppercase tracking-widest mt-0.5">Upcoming Deadlines</p>
                            </div>
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                <CalendarDays className="w-5 h-5 text-indigo-300" />
                            </div>
                        </div>

                        <div className="relative z-10 space-y-5">
                            {(dashboardSettings?.deadlines || []).map((deadline, idx) => (
                                <div key={idx} className="relative pl-6 group cursor-pointer">
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-white/20"></div>
                                    <div className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border-2 border-indigo-900 shadow-lg group-hover:scale-150 transition-transform ${deadline.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                                        }`}></div>

                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 group-hover:bg-white/20 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-bold text-white leading-tight">{deadline.title}</p>
                                            <span className="text-[10px] font-black text-white/50 bg-black/20 px-2 py-1 rounded-lg shrink-0 border border-white/5">{deadline.date.split(',')[0]}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className={`w-2 h-2 rounded-full ${deadline.type === 'warning' ? 'bg-amber-400 animate-pulse' : 'bg-blue-400'}`}></div>
                                            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">
                                                {deadline.type === 'warning' ? 'Action Required' : 'On Track'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );

    // ── AI Scholarship Radar Widget ─────────────────────────────────────────
    const renderScholarshipRadar = () => (
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
            {/* Background Radar Rings */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-64 h-64 border-2 border-slate-900 rounded-full"></div>
                <div className="absolute w-48 h-48 border border-slate-900 rounded-full"></div>
                <div className="absolute w-32 h-32 border border-slate-900 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Eligibility Radar</h3>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-0.5">AI-Powered Matching</p>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border transition-all duration-1000 ${isRadarScanning ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    {isRadarScanning ? <Sparkles className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
            </div>

            <div className="relative h-48 flex items-center justify-center mb-8">
                {/* Sonar Ping Effect */}
                {isRadarScanning && (
                    <>
                        <div className="absolute w-12 h-12 bg-emerald-400/30 rounded-full animate-radar-ping"></div>
                        <div className="absolute w-12 h-12 bg-emerald-400/20 rounded-full animate-radar-ping [animation-delay:1s]"></div>
                        <div className="absolute w-full h-full border-t-2 border-emerald-400/40 rounded-full animate-radar-sweep"></div>
                    </>
                )}

                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 shadow-inner group-hover:scale-110 transition-transform">
                        <GraduationCap className={`w-10 h-10 ${isRadarScanning ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {isRadarScanning ? 'Scanning Policies...' : '3 Matches Found'}
                    </p>
                </div>

                {/* Match "Blips" (Dots on radar) */}
                {!isRadarScanning && scholarshipMatches.map((m, i) => {
                    const angles = [45, 135, 270];
                    const radii = [70, 85, 95];
                    const x = Math.cos(angles[i] * Math.PI / 180) * radii[i];
                    const y = Math.sin(angles[i] * Math.PI / 180) * radii[i];
                    return (
                        <div key={m.id} 
                             className="absolute w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse"
                             style={{ transform: `translate(${x}px, ${y}px)` }}
                             title={`${m.match}% Match`}>
                        </div>
                    );
                })}
            </div>

            <div className="space-y-3">
                {scholarshipMatches.map(m => (
                    <div key={m.id} className="group/item relative bg-white/60 hover:bg-white p-4 rounded-2xl border border-white hover:shadow-md transition-all cursor-help">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-slate-800">{m.title}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-${m.color}-50 text-${m.color}-600 border border-${m.color}-100`}>
                                {m.match}% MATCH
                            </span>
                        </div>
                        <div className="w-full bg-slate-100/50 h-1 rounded-full overflow-hidden">
                            <div className={`bg-${m.color}-500 h-full transition-all duration-1000 delay-500`} style={{ width: isRadarScanning ? '0%' : `${m.match}%` }}></div>
                        </div>

                        {/* Tooltip Content on Hover */}
                        <div className="absolute left-0 right-0 -top-12 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-20">
                            <div className="bg-slate-900 text-white text-[10px] font-bold py-2 px-4 rounded-xl shadow-xl flex items-center gap-2 max-w-[200px] mx-auto text-center border border-slate-700">
                                <Search className="w-3 h-3 text-emerald-400" />
                                {m.reason}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!isRadarScanning && (
                <button 
                    onClick={() => {
                        setIsRadarScanning(true);
                        setTimeout(() => setIsRadarScanning(false), 3500);
                    }}
                    className="w-full mt-6 py-3 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    Start Precise AI Scan <Target className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );

    // ── AI Knowledge Constellation Widget ───────────────────────────────────
    const renderKnowledgeConstellation = () => {
        const nodes = [
            { id: 1, label: 'Scholarships', x: 20, y: 30, color: 'emerald', size: 'w-12 h-12', icon: <Award className="w-5 h-5 text-emerald-300" /> },
            { id: 2, label: 'NEP 2024', x: 70, y: 20, color: 'blue', size: 'w-16 h-16', icon: <BookOpen className="w-6 h-6 text-blue-300" /> },
            { id: 3, label: 'Grants', x: 80, y: 70, color: 'purple', size: 'w-10 h-10', icon: <Target className="w-4 h-4 text-purple-300" /> },
            { id: 4, label: 'Admissions', x: 30, y: 80, color: 'amber', size: 'w-14 h-14', icon: <GraduationCap className="w-6 h-6 text-amber-300" /> },
            { id: 5, label: 'AI Search', x: 50, y: 50, color: 'pink', size: 'w-20 h-20', icon: <BrainCircuit className="w-8 h-8 text-pink-300" /> }, // Center Node
        ];

        return (
            <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group mb-8">
                {/* Background ambient light */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900 z-0"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-1000 z-0"></div>

                <div className="flex items-center justify-between mb-2 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            <Network className="w-5 h-5 text-indigo-400" />
                            Knowledge Orbit
                        </h3>
                        <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mt-1">Your Neural Profile</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center">
                        Live Sync <span className="inline-block w-2 h-2 ml-2 bg-emerald-500 animate-pulse rounded-full"></span>
                    </div>
                </div>

                <p className="text-sm text-slate-400 mb-8 max-w-sm relative z-10">
                    Your reading patterns actively shape this neural network. Hover over nodes to interact.
                </p>

                {/* Constellation Canvas */}
                <div className="relative h-64 w-full rounded-3xl border border-slate-700/50 bg-slate-800/30 overflow-hidden z-10">
                    
                    {/* SVG Connections (Lasers) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <linearGradient id="laser" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#34d399" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>
                        {/* Connecting lines between nodes */}
                        <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="url(#laser)" strokeWidth="1.5" className="animate-pulse" />
                        <line x1="70%" y1="20%" x2="50%" y2="50%" stroke="url(#laser)" strokeWidth="2" />
                        <line x1="80%" y1="70%" x2="50%" y2="50%" stroke="url(#laser)" strokeWidth="1" />
                        <line x1="30%" y1="80%" x2="50%" y2="50%" stroke="url(#laser)" strokeWidth="1.5" />
                        <line x1="20%" y1="30%" x2="30%" y2="80%" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        <line x1="70%" y1="20%" x2="80%" y2="70%" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    </svg>

                    {/* Nodes Container (Slow orbit) */}
                    <div className="absolute inset-0 w-full h-full animate-orbit-slow" style={{ '--radius': '10px' }}> 
                        {nodes.map(node => (
                            <div 
                                key={node.id}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 group/node cursor-pointer`}
                                style={{ 
                                    left: `${node.x}%`, 
                                    top: `${node.y}%`,
                                }}
                                onClick={() => { setPendingPrompt(`Tell me more about ${node.label}`); setActiveTab('chat'); }}
                            >
                                {/* Glowing Aura */}
                                <div className={`absolute inset-0 bg-${node.color}-500/20 rounded-full blur-xl group-hover/node:bg-${node.color}-500/40 transition-colors duration-500`}></div>
                                
                                {/* Core Node */}
                                <div className={`relative ${node.size} rounded-full bg-slate-900 border-2 border-${node.color}-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover/node:border-${node.color}-400 group-hover/node:shadow-[0_0_30px_rgba(255,255,255,0.3)] group-hover/node:scale-110 transition-all duration-300 z-10 animate-pulse-glow hover:[animation-play-state:paused]`}>
                                    {node.icon}
                                </div>

                                {/* Label Tooltip */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 opacity-0 group-hover/node:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20 pointer-events-none">
                                    <div className={`px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold border border-slate-600 shadow-xl flex items-center gap-2`}>
                                        <span className={`w-2 h-2 rounded-full bg-${node.color}-500 animate-pulse`}></span>
                                        {node.label}
                                    </div>
                                    {/* Small arrow */}
                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-t border-slate-600"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };



    // ── Bookmark Note Modal ─────────────────────────────────────────────────
    const renderBookmarkModal = () => !isBookmarkModalOpen ? null : (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-300">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-amber-50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Bookmark className="w-5 h-5 text-amber-500" /> Bookmark Note
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{activeBookmark?.title}</p>
                    </div>
                    <button onClick={() => setIsBookmarkModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Your Note</label>
                    <textarea
                        rows="5"
                        value={bookmarkNote}
                        onChange={e => setBookmarkNote(e.target.value)}
                        placeholder="Write your thoughts, key takeaways, or reminders about this document…"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all resize-none"
                    />
                    <div className="mt-5 flex gap-3">
                        <button onClick={() => setIsBookmarkModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                addBookmark(activeBookmark, bookmarkNote);
                                setIsBookmarkModalOpen(false);
                            }}
                            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                            <BookmarkCheck className="w-4 h-4" /> Save Note
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── Collaboration Modals ────────────────────────────────────────────────

    const renderShareModal = () => !isShareModalOpen ? null : (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-blue-500" /> Share Document
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Share with colleague</p>
                    </div>
                    <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white/80 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Direct Link</label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-xs text-slate-500 font-medium truncate ring-1 ring-slate-200 border-0 text-left">
                                http://hedportal.ac.in/docs/nep-2024-compliance
                            </div>
                            <button onClick={handleCopyLink} className="bg-blue-600 text-white px-4 py-3 rounded-2xl hover:bg-blue-700 transition-all font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95">
                                <LinkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Send via Email</label>
                        <form onSubmit={handleSendInvitation} className="space-y-3">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={shareEmail}
                                    onChange={(e) => setShareEmail(e.target.value)}
                                    placeholder="colleague@university.edu"
                                    className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={shareLoading}
                                className={`w-full bg-slate-900 text-white py-4 rounded-[1.25rem] font-bold text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 ${shareLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {shareLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                {shareLoading ? 'Sending...' : 'Send Invitation'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderForumModal = () => !isForumOpen ? null : (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl h-[80vh] shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-purple-50/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm border border-purple-200">
                            <MessageSquareMore className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Policy Discussion Forum</h3>
                            <p className="text-xs text-purple-600 font-bold uppercase tracking-widest mt-0.5">Active Community</p>
                        </div>
                    </div>
                    <button onClick={() => setIsForumOpen(false)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/30">
                    {forumMessages.map((msg) => (
                        <div key={msg.id} className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 shrink-0 flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm border border-white">
                                {msg.user[0]}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-sm font-bold text-slate-800">{msg.user}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm inline-block max-w-[90%]">
                                    <p className="text-sm text-slate-600 leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                    <div className="flex gap-2">
                        <input
                            value={newForumMessage}
                            onChange={(e) => setNewForumMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                            onKeyPress={(e) => e.key === 'Enter' && handleForumSend()}
                        />
                        <button
                            onClick={handleForumSend}
                            className="bg-purple-600 text-white w-14 rounded-2xl hover:bg-purple-700 transition-all flex items-center justify-center active:scale-95 shadow-lg shadow-purple-500/20"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStudyRoomModal = () => !isStudyRoomOpen ? null : (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Group Study Rooms</h3>
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-0.5">Live Collaboration</p>
                        </div>
                    </div>
                    <button onClick={() => setIsStudyRoomOpen(false)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { name: 'Policy Analysis Lab', active: 4, docs: 12 },
                            { name: 'Scholarship Sync', active: 2, docs: 5 },
                            { name: 'Admin Guidelines Review', active: 7, docs: 21 }
                        ].map((room, i) => (
                            <div key={i} className="group flex items-center justify-between p-5 rounded-[1.5rem] border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-xl font-bold text-emerald-500 shadow-sm">
                                        {room.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{room.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-white border border-slate-100">
                                                <Users className="w-2.5 h-2.5" /> {room.active} active
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-white border border-slate-100">
                                                <FileText className="w-2.5 h-2.5" /> {room.docs} docs
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleJoinRoom(room.name)}
                                    className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 active:scale-95 shadow-lg shadow-emerald-500/20"
                                >
                                    Join
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 bg-slate-900 text-white py-4 rounded-[1.25rem] font-bold text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] border border-slate-700">
                        Create New Room
                    </button>
                </div>
            </div>
        </div>
    );

    const mainBg = isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-[#f8f5e6] via-[#f9ebd0] to-[#f4e2b8]';
    const textTheme = isDarkMode ? 'text-white' : 'text-gray-800';

    const renderContent = () => {
        if (activeTab === 'dashboard') {
            return renderDashboardSummary();
        } else if (activeTab === 'chat') {
            return (
                <div className="max-w-6xl w-full mx-auto px-8 flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden flex flex-col min-h-0">
                        <ChatInterface user={user} pendingPrompt={pendingPrompt} setPendingPrompt={setPendingPrompt} />
                    </div>
                </div>
            );
        } else if (activeTab === 'search') {
            return (
                <div className="max-w-6xl w-full mx-auto px-8 flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden flex flex-col min-h-0">
                        <SmartSearch />
                    </div>
                </div>
            );
        }
        return null; // Should not happen
    };

    const handleMouseMove = (e) => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            className={`flex flex-col h-screen font-sans overflow-hidden selection:bg-yellow-200 selection:text-black ${themeStyles.background} ${themeStyles.text} transition-colors duration-700 relative ${isDarkMode ? 'bg-slate-900 text-white' : ''}`}
        >
            {renderTopNav()}

            <main className={`w-full flex-1 flex flex-col pb-10 min-h-0 ${activeTab === 'dashboard' ? 'overflow-y-auto' : ''}`}>
                {renderContent()}
            </main>

            {/* Bookmark Note Modal */}
            {renderBookmarkModal()}

            {/* Collaboration Modals */}
            {renderShareModal()}
            {renderForumModal()}
            {renderStudyRoomModal()}

            {/* Social Feedback Toast */}
            {socialToast && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${socialToast.type === 'error' ? 'bg-red-600' : 'bg-slate-900'
                    } text-white`}>
                    {socialToast.type === 'error' ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-yellow-400" />}
                    <span className="text-sm font-bold tracking-tight">{socialToast.message}</span>
                </div>
            )}

            {/* Profile Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200">
                        <div className="bg-slate-800 p-6 text-center relative">
                            <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white pb-1 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-xl font-light">&times;</button>
                            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-white font-bold shadow-lg border-4 border-slate-700">
                                {user?.identifier ? user.identifier.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{user?.identifier?.split('@')[0]}</h3>
                            <p className="text-sm text-slate-300">{user?.identifier}</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase">Role</p>
                                            <p className="text-sm font-bold text-slate-800 capitalize">{user?.role || 'User'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase">Department</p>
                                            <p className="text-sm font-bold text-slate-800">Higher Education Dept.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="mt-6 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors flex items-center justify-center gap-2">
                                <LogOut className="w-4 h-4" /> Sign Out from Device
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Document Modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-indigo-600" /> Request Document
                            </h3>
                            <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200 shadow-sm">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-500 mb-6">Can't find a specific policy or circular? Send a request to the administration to have it indexed by our AI.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Document Title / Subject *</label>
                                    <input
                                        type="text"
                                        value={docRequestTitle}
                                        onChange={(e) => setDocRequestTitle(e.target.value)}
                                        placeholder="e.g. UGC Ph.D. Guidelines 2025"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description / Context</label>
                                    <textarea
                                        rows="3"
                                        value={docRequestDesc}
                                        onChange={(e) => setDocRequestDesc(e.target.value)}
                                        placeholder="Where did you hear about this? Do you have an issue number?"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none custom-scrollbar"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button onClick={() => setIsRequestModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors">
                                    Cancel
                                </button>
                                <button
                                    disabled={!docRequestTitle || docRequestSubmitting}
                                    onClick={async () => {
                                        if (!docRequestTitle) return;
                                        setDocRequestSubmitting(true);
                                        try {
                                            await axios.post(`${API_BASE_URL}/doc-requests`, {
                                                title: docRequestTitle,
                                                description: docRequestDesc,
                                                requested_by: user?.identifier || 'Anonymous'
                                            });
                                            setDocRequestTitle('');
                                            setDocRequestDesc('');
                                            setIsRequestModalOpen(false);
                                            alert('✅ Request sent! The admin will be notified.');
                                        } catch (err) {
                                            console.error(err);
                                            alert('❌ Failed to submit. Please try again.');
                                        } finally {
                                            setDocRequestSubmitting(false);
                                        }
                                    }}
                                    className={`flex-1 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${docRequestTitle && !docRequestSubmitting
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        : 'bg-indigo-300 text-white/80 cursor-not-allowed'
                                        }`}
                                >
                                    {docRequestSubmitting ? (
                                        <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> Sending...</>
                                    ) : 'Submit Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Pro Feature: Floating AI Pulse Orb */}
            {
                activeTab !== 'chat' && (
                    <div
                        onClick={() => setActiveTab('chat')}
                        className="fixed bottom-8 right-8 z-40 group cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 animate-pulse transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-purple-500 rounded-full blur-md opacity-20 transform scale-150 animate-pulse transition-opacity duration-500 delay-75"></div>

                        <div className="relative w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-full shadow-2xl flex items-center justify-center border border-white/20 transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">
                            <Sparkles className="w-7 h-7 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300" />
                            <Bot className="w-7 h-7 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:opacity-0 transition-opacity duration-300" />

                            {/* Notification Dot */}
                            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                        </div>
                    </div>
                )
            }

            {/* Embedded styles for the custom scrollbar in the dark card */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}} />
        </div >
    );
}
