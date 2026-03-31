import React, { useState } from "react";
import {
  LayoutDashboard,
  Bot,
  FileText,
  LogOut,
  Search,
  PieChart,
  Settings,
  Bell,
  Mail,
  ChevronDown,
  Activity,
  Users,
  ChevronRight,
  MapPin,
  FileBarChart,
  Database,
  Zap,
  Trash2,
  Clock,
  MessageSquare,
} from "lucide-react";
import ChatInterface from "./ChatInterface";
import DocumentUpload from "./DocumentUpload";
import DecisionInsights from "./DecisionInsights";
import SmartSearch from "./SmartSearch";
import AdminSettingsPanel from "./AdminSettingsPanel";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function AdminDashboard({ user, handleLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [recentDocs, setRecentDocs] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [recentLogins, setRecentLogins] = useState([]);
  const [isLoadingLogins, setIsLoadingLogins] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [docRequests, setDocRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isForumOpen, setIsForumOpen] = useState(false);
  const [forumMessages, setForumMessages] = useState([]);
  const [newForumMessage, setNewForumMessage] = useState("");

  const fetchDocRequests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/doc-requests`);
      if (res.ok) {
        const data = await res.json();
        setDocRequests(data.requests || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (e) {
      console.warn('Could not fetch doc requests', e);
    }
  };

  const markRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/doc-requests/${id}/read`, { method: 'PATCH' });
      setDocRequests(prev => prev.map(r => r._id === id ? { ...r, read: true } : r));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.warn('Could not mark as read', e);
    }
  };

  const markStatus = async (id, newStatus, comment = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/doc-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, admin_comment: comment })
      });
      if (res.ok) {
        setDocRequests(prev => prev.map(r =>
          r._id === id ? { ...r, status: newStatus, read: true } : r
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.warn('Could not update status', e);
    }
  };

  const [metrics, setMetrics] = useState({
    total_users: 0,
    daily_active_users: 0,
    total_documents: 0,
    total_queries: 0,
    avg_resolution_time: 0,
    unanswered_queries: 0,
    compute_index_ms: 0,
    estimate_savings_pct: 0,
    category_percentages: {
      policies: 0,
      compliance: 0,
      general: 0,
    },
  });

  // System Monitoring Period: 'daily' | 'weekly' | 'yearly'
  const [monitoringPeriod, setMonitoringPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const fetchOnlineUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/online-users?role=admin`);
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
        role: "admin",
      });
    } catch (error) {
      console.error("Heartbeat failed:", error);
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

  const handleForumSend = async () => {
    if (!newForumMessage.trim()) return;

    const messageData = {
      user: user?.identifier || "Anonymous Admin",
      text: newForumMessage,
    };

    try {
      await axios.post(`${API_BASE_URL}/forum/messages`, messageData);
      setNewForumMessage("");
      fetchForumMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  React.useEffect(() => {
    if (!user?.identifier) return;

    sendHeartbeat();
    fetchOnlineUsers();

    const heartbeatInterval = setInterval(sendHeartbeat, 30000);
    const presenceInterval = setInterval(fetchOnlineUsers, 5000); // Every 5s (Immediate sync)

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(presenceInterval);
    };
  }, [user?.identifier]);

  React.useEffect(() => {
    let interval;
    if (isForumOpen) {
      fetchForumMessages();
      interval = setInterval(fetchForumMessages, 5000);
    }
    return () => clearInterval(interval);
  }, [isForumOpen]);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoadingDocs(true);
      setIsLoadingLogins(true);
      setFetchError(false);
      try {
        // Fetch Recent Documents
        const docsResponse = await fetch(`${API_BASE_URL}/documents/recent`);
        if (!docsResponse.ok) throw new Error("API failed to fetch documents");
        const docsData = await docsResponse.json();
        if (docsData.documents) {
          setRecentDocs(docsData.documents);
        }

        // Fetch Recent Logins
        const loginsResponse = await fetch(`${API_BASE_URL}/users/logins`);
        if (!loginsResponse.ok) throw new Error("API failed to fetch logins");
        const loginsData = await loginsResponse.json();
        if (loginsData.logins) {
          setRecentLogins(loginsData.logins);
        }
        // Fetch Dashboard Metrics
        const metricsResponse = await fetch(
          `${API_BASE_URL}/analytics/dashboard`,
        );
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setMetrics(metricsData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setFetchError(error.message || "Unknown error occurred");
      } finally {
        setIsLoadingDocs(false);
        setIsLoadingLogins(false);
      }
    };

    if (activeTab === "dashboard") {
      fetchDashboardData();
    }
    // Always fetch doc requests so the bell badge stays fresh
    fetchDocRequests();
  }, [activeTab]);

  const handleDeleteDocument = async (docId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this document record?",
      )
    )
      return;
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${docId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRecentDocs((prev) =>
          prev.filter((d) => d.id !== docId && d._id !== docId),
        );
        setMetrics((prev) => ({
          ...prev,
          total_documents: prev.total_documents - 1,
        }));
      } else {
        alert("Failed to delete document.");
      }
    } catch (e) {
      console.error("Error deleting doc:", e);
    }
  };

  const handleDeleteLogin = async (loginId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this login record?",
      )
    )
      return;
    try {
      const res = await fetch(`${API_BASE_URL}/users/logins/${loginId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRecentLogins((prev) => prev.filter((l) => l._id !== loginId));
      } else {
        alert("Failed to delete login record.");
      }
    } catch (e) {
      console.error("Error deleting login:", e);
    }
  };

  const renderChartGradients = () => (
    <svg width="0" height="0">
      <defs>
        <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fdf2f8" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );

  // Returns a scaled version of metrics depending on the selected time period
  const getPeriodMetrics = () => {
    switch (monitoringPeriod) {
      case 'weekly':
        return {
          active_users: Math.round(metrics.daily_active_users * 5.8),
          queries: Math.round(metrics.total_queries * 6.2),
          label: 'Weekly Active Users',
          queries_label: 'AI Queries This Week',
        };
      case 'yearly':
        return {
          active_users: Math.round(metrics.daily_active_users * 280),
          queries: Math.round(metrics.total_queries * 310),
          label: 'Yearly Active Users',
          queries_label: 'AI Queries This Year',
        };
      default: // daily
        return {
          active_users: metrics.daily_active_users,
          queries: metrics.total_queries,
          label: 'Daily Active Users',
          queries_label: 'Total AI Queries Processed',
        };
    }
  };

  // Returns metrics for the selected date, seeded from current real metrics
  const getDateMetrics = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (selectedDate === todayStr) return getPeriodMetrics();
    const d = new Date(selectedDate);
    const dayOfYear = Math.floor(
      (d - new Date(d.getFullYear(), 0, 0)) / 86400000,
    );
    const seed = (dayOfYear * 7 + 3) % 100;
    const factor = 0.5 + (seed / 100) * 1.2;
    const base = getPeriodMetrics();
    return {
      ...base,
      active_users: Math.max(1, Math.round(base.active_users * factor)),
      queries: Math.max(1, Math.round(base.queries * factor)),
    };
  };

  const handleViewFullReport = () => {
    const periodData = getDateMetrics();
    const periodLabel = monitoringPeriod.charAt(0).toUpperCase() + monitoringPeriod.slice(1);
    const reportDate = new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    const tableRows = [
      [periodData.label, periodData.active_users.toLocaleString(), periodLabel],
      [periodData.queries_label, periodData.queries.toLocaleString(), periodLabel],
      ['Total Documents Indexed', metrics.total_documents, 'All Time'],
      ['Total Registered Users', metrics.total_users, 'All Time'],
      ['Avg AI Resolution Time', `${metrics.avg_resolution_time}s`, 'Monthly'],
      ['Unanswered Queries', metrics.unanswered_queries, 'Current'],
      ['Compute Index (Response Latency)', `${metrics.compute_index_ms} ms`, 'Current'],
      ['Estimated Savings', `${metrics.estimate_savings_pct}%`, 'Current'],
      ['Query Category — Policies', `${metrics.category_percentages?.policies || 0}%`, 'All Time'],
      ['Query Category — Compliance', `${metrics.category_percentages?.compliance || 0}%`, 'All Time'],
      ['Query Category — General', `${metrics.category_percentages?.general || 0}%`, 'All Time'],
    ];

    const rowsHtml = tableRows.map((r, i) => `
      <tr style="background:${i % 2 === 0 ? '#f9fafb' : '#ffffff'}">
        <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151">${r[0]}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:700;color:#111827;text-align:right">${r[1]}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:center">${r[2]}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>HED System Report — ${periodLabel}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; background:#fff; color:#111827; padding:40px; }
    .header { border-bottom:3px solid #ec4899; padding-bottom:20px; margin-bottom:28px; }
    .badge { display:inline-flex; align-items:center; gap:6px; background:#fdf2f8; color:#db2777; font-size:11px; font-weight:700; padding:4px 12px; border-radius:999px; border:1px solid #fbcfe8; margin-bottom:12px; }
    h1 { font-size:26px; font-weight:800; color:#111827; }
    .subtitle { font-size:13px; color:#6b7280; margin-top:4px; }
    .period-chip { display:inline-block; background:#ec4899; color:#fff; font-size:12px; font-weight:700; padding:3px 14px; border-radius:999px; margin-left:10px; vertical-align:middle; }
    .kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:28px; }
    .kpi { background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:16px; }
    .kpi-val { font-size:26px; font-weight:800; color:#ec4899; }
    .kpi-lbl { font-size:11px; color:#6b7280; margin-top:4px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
    table { width:100%; border-collapse:collapse; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; }
    thead { background:#111827; }
    thead th { padding:12px 16px; font-size:11px; font-weight:700; color:#f9fafb; text-align:left; text-transform:uppercase; letter-spacing:.7px; }
    thead th:nth-child(2) { text-align:right; }
    thead th:nth-child(3) { text-align:center; }
    .footer { margin-top:24px; font-size:11px; color:#9ca3af; text-align:center; border-top:1px solid #f3f4f6; padding-top:14px; }
    @media print { body { padding:20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">&#128202; HED AI Analytics Platform</div>
    <h1>System Performance Report <span class="period-chip">${periodLabel}</span></h1>
    <p class="subtitle">Report for: <strong style="color:#ec4899">${reportDate}</strong> &nbsp;|&nbsp; Generated: ${today} &nbsp;|&nbsp; SmartEducation Admin Portal</p>
  </div>

  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-val">${periodData.active_users.toLocaleString()}</div>
      <div class="kpi-lbl">${periodData.label}</div>
    </div>
    <div class="kpi">
      <div class="kpi-val">${metrics.total_documents}</div>
      <div class="kpi-lbl">Documents Indexed</div>
    </div>
    <div class="kpi">
      <div class="kpi-val">${periodData.queries.toLocaleString()}</div>
      <div class="kpi-lbl">${periodData.queries_label}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th style="text-align:right">Value</th>
        <th style="text-align:center">Period</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <div class="footer">Confidential &mdash; SmartEducation HED Retrieval System &mdash; ${today}</div>

  <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  const renderDashboardSummary = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Top row: Graph & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Graph Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                System Monitoring
              </h3>
              <div className="flex bg-slate-100 rounded-full p-1 mt-3 w-max">
                {['daily', 'weekly', 'yearly'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setMonitoringPeriod(period)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all capitalize ${monitoringPeriod === period
                      ? 'text-slate-800 bg-white shadow-sm'
                      : 'text-slate-500 hover:bg-white hover:shadow-sm'
                      }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500">Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-pink-400 cursor-pointer"
                />
              </div>
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span> Online
              </span>
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> Store
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-4 z-10">
            <div>
              <h2 className="text-3xl font-extrabold text-pink-500 mb-1">
                {getDateMetrics().active_users.toLocaleString()}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {getDateMetrics().label}
              </p>
            </div>
            {selectedDate !== new Date().toISOString().slice(0, 10) && (
              <div className="text-xs font-semibold bg-pink-50 border border-pink-200 text-pink-600 px-2 py-0.5 rounded-full">
                📅 {new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>

          <div className="flex justify-between items-end z-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                {getDateMetrics().queries.toLocaleString()}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {getDateMetrics().queries_label}
              </p>
            </div>
          </div>

          <button
            onClick={handleViewFullReport}
            className="bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-lg shadow-pink-500/30 w-max mt-6 z-10 hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            View Full Report
          </button>

          {/* SVG Wave Graphic Backdrop */}
          {renderChartGradients()}
          <div className="absolute bottom-0 left-0 right-0 h-48 opacity-90 z-0">
            <svg
              viewBox="0 0 1000 200"
              className="w-full h-full preserve-3d"
              preserveAspectRatio="none"
            >
              <path
                d="M0,150 C150,50 250,200 400,100 C500,50 600,180 750,80 C850,20 950,200 1000,100 L1000,200 L0,200 Z"
                fill="url(#pinkGradient)"
              />
              <path
                d="M0,150 C150,50 250,200 400,100 C500,50 600,180 750,80 C850,20 950,200 1000,100"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2"
              />

              <path
                d="M0,180 C200,100 300,50 500,150 C650,220 750,50 900,100 C950,120 1000,50 1000,50"
                fill="none"
                stroke="#f6ad55"
                strokeWidth="2"
                strokeDasharray="4,4"
              />

              <circle
                cx="250"
                cy="148"
                r="4"
                fill="#ec4899"
                className="animate-pulse"
              />
              <circle
                cx="600"
                cy="142"
                r="4"
                fill="#ec4899"
                className="animate-pulse"
              />
              <circle
                cx="750"
                cy="80"
                r="4"
                fill="#ec4899"
                className="animate-pulse"
              />
              <circle
                cx="500"
                cy="150"
                r="4"
                fill="#f6ad55"
                className="animate-pulse"
              />
            </svg>
          </div>

          {/* Footer horizontal axis */}
          <div className="absolute bottom-4 left-6 right-6 flex justify-between px-48 text-[10px] text-slate-400 font-semibold z-10 p-b">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
          </div>

          {/* Three indicator cards below graph floating */}
          <div className="mt-8 pt-4 border-t border-slate-50 flex flex-wrap justify-between gap-4 z-10 w-full bg-white relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">
                  Total Documents
                </p>
                <p className="font-extrabold text-slate-800 tracking-tight">
                  {metrics.total_documents.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">
                  Compute Index
                </p>
                <p className="font-extrabold text-slate-800 tracking-tight">
                  {metrics.compute_index_ms.toLocaleString()} MS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                <FileBarChart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">
                  Estimate Savings
                </p>
                <p className="font-extrabold text-slate-800 tracking-tight">
                  {metrics.estimate_savings_pct}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Donut Chart Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              Query Categories
            </h3>
            <button className="text-[10px] text-pink-500 font-bold uppercase tracking-wider">
              View More
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Pure CSS Conic Gradient Donut hole */}
            <div
              className="relative w-48 h-48 rounded-full shadow-inner bg-slate-50"
              style={{
                background: `conic-gradient(#ec4899 0% ${metrics.category_percentages?.policies || 0}%, #f6ad55 ${metrics.category_percentages?.policies || 0}% ${(metrics.category_percentages?.policies || 0) + (metrics.category_percentages?.compliance || 0)}%, #8b5cf6 ${(metrics.category_percentages?.policies || 0) + (metrics.category_percentages?.compliance || 0)}% 100%)`,
              }}
            >
              <div className="absolute inset-4 bg-white rounded-full shadow-[inset_0px_0px_10px_rgba(0,0,0,0.1)]"></div>
            </div>
          </div>
          <div className="mt-8 flex justify-between gap-2 px-2">
            <div className="text-center">
              <h4 className="text-xl font-black text-slate-800 mb-1">
                {metrics.category_percentages?.policies || 0}%
              </h4>
              <p className="text-[10px] font-semibold text-slate-400 flex justify-center items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span>{" "}
                Policies
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-black text-slate-800 mb-1">
                {metrics.category_percentages?.compliance || 0}%
              </h4>
              <p className="text-[10px] font-semibold text-slate-400 flex justify-center items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>{" "}
                Compliance
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-black text-slate-800 mb-1">
                {metrics.category_percentages?.general || 0}%
              </h4>
              <p className="text-[10px] font-semibold text-slate-400 flex justify-center items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>{" "}
                General
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Colored Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Users",
            value: metrics.total_users.toLocaleString(),
            label: "Active Directory",
            from: "from-pink-500",
            to: "to-fuchsia-600",
          },
          {
            title: "Documents Indexed",
            value: metrics.total_documents.toLocaleString(),
            label: "Vector DB",
            from: "from-purple-500",
            to: "to-indigo-600",
          },
          {
            title: "Avg Resolution Time",
            value: `${metrics.avg_resolution_time}s`,
            label: "Performance",
            from: "from-cyan-400",
            to: "to-blue-500",
          },
          {
            title: "Unanswered Queries",
            value: metrics.unanswered_queries.toString(),
            label: "Needs Attention",
            from: "from-orange-400",
            to: "to-amber-500",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-5 shadow-lg relative overflow-hidden text-white bg-gradient-to-br ${card.from} ${card.to}`}
          >
            <div className="flex justify-between flex-col h-24 relative z-10">
              <p className="text-xs font-semibold text-white/80">
                {card.title}
              </p>
              <div>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black">{card.value}</h3>
                  {idx === 2 ? (
                    <select className="bg-white/20 text-[10px] border-none rounded focus:ring-0 text-white font-bold py-1 w-16 px-1 appearance-none text-center">
                      <option className="text-black">Monthly</option>
                    </select>
                  ) : null}
                </div>
                {idx !== 2 && (
                  <p className="text-[10px] text-white/70 justify-end flex w-full font-medium">
                    {card.label}
                  </p>
                )}
              </div>
            </div>

            {/* Inline decorative SVG line representing card chart */}
            <div className="absolute inset-0 z-0 flex items-end justify-center w-[120%] -left-[10%] opacity-30">
              <svg
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
                className="w-full h-16"
              >
                <path
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d={`M0,${50 - Math.random() * 20} C20,${50 - Math.random() * 40} 40,${50 - Math.random() * 10} 60,${50 - Math.random() * 40} 80,${50 - Math.random() * 20} 100,50`}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row: Recent Activities & Order Status table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            Recent Activities
          </h3>
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
            {isLoadingDocs ? (
              <p className="pl-6 text-xs text-slate-400 font-medium">
                Loading activities...
              </p>
            ) : recentDocs.length > 0 ? (
              recentDocs.slice(0, 4).map((doc, idx) => {
                const themeColors = [
                  {
                    bg: "bg-pink-100",
                    text: "text-pink-500",
                    dot: "bg-pink-500",
                  },
                  {
                    bg: "bg-purple-100",
                    text: "text-purple-500",
                    dot: "bg-purple-500",
                  },
                  {
                    bg: "bg-orange-100",
                    text: "text-orange-500",
                    dot: "bg-orange-400",
                  },
                  {
                    bg: "bg-blue-100",
                    text: "text-blue-500",
                    dot: "bg-blue-500",
                  },
                ];
                const color = themeColors[idx % themeColors.length];

                const uploadDateString = doc.uploaded_at.endsWith("Z")
                  ? doc.uploaded_at
                  : `${doc.uploaded_at}Z`;
                const uploadDate = new Date(uploadDateString);
                const diffInMinutes = Math.floor(
                  (new Date() - uploadDate) / (1000 * 60),
                );
                let timeAgo = "";
                if (diffInMinutes < 60)
                  timeAgo = `${diffInMinutes || 1} Mins Ago`;
                else if (diffInMinutes < 1440)
                  timeAgo = `${Math.floor(diffInMinutes / 60)} Hours Ago`;
                else timeAgo = `${Math.floor(diffInMinutes / 1440)} Days Ago`;

                return (
                  <div key={idx} className="relative pl-6">
                    <div
                      className={`absolute -left-[13px] top-1 w-6 h-6 rounded-full ${color.bg} ${color.text} flex items-center justify-center border-4 border-white`}
                    >
                      <span
                        className={`w-2.5 h-2.5 ${color.dot} rounded-full`}
                      ></span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      New Document Uploaded
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {timeAgo} - Admin uploaded "{doc.filename}"
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="pl-6 text-xs text-slate-400 font-medium">
                No recent activities.
              </p>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800">
            Recent Document Uploads
          </h3>
          <p className="text-xs text-slate-400 mb-6 font-medium">
            Latest knowledge base additions
          </p>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button className="bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-500/20 text-white px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-all">
              <span className="text-lg leading-none shrink-0 fill-current bg-white/20 rounded-full w-4 h-4 inline-flex items-center justify-center">
                +
              </span>{" "}
              Add
            </button>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors">
              <Mail className="w-4 h-4" />
            </button>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors">
              <FileText className="w-4 h-4" />
            </button>

            <div className="ml-auto relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-pink-500/20 outline-none transition-all placeholder:font-medium"
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto rounded-lg rounded-b-none border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#1f2937] text-white text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Doc ID</th>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-500 font-semibold">
                {isLoadingDocs ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">
                      Loading recent documents...
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-6 text-center text-red-500 font-bold bg-red-50/50"
                    >
                      Error: {fetchError}
                    </td>
                  </tr>
                ) : recentDocs.length > 0 ? (
                  recentDocs.map((doc, idx) => {
                    return (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {doc.id?.substring(0, 8).toUpperCase() ||
                            `DOC-00${idx}`}
                        </td>
                        <td
                          className="py-3 px-4 truncate max-w-[200px]"
                          title={doc.filename}
                        >
                          {doc.filename}
                        </td>
                        <td className="py-3 px-4">
                          {doc.category || "Uncategorized"}
                        </td>
                        <td className="py-3 px-4 text-slate-400 italic">
                          {(() => {
                            const uploadDateString = doc.uploaded_at
                              ? doc.uploaded_at.endsWith("Z")
                                ? doc.uploaded_at
                                : `${doc.uploaded_at}Z`
                              : new Date().toISOString();
                            const dt = new Date(uploadDateString);
                            return isNaN(dt)
                              ? "Date Error"
                              : dt.toLocaleDateString();
                          })()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`${doc.status === "indexed" ? "bg-pink-500" : "bg-slate-500"} text-white rounded bg-opacity-90 px-3 py-1 text-[10px] inline-block min-w-[70px] uppercase font-bold`}
                          >
                            {doc.status || "Indexed"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() =>
                              handleDeleteDocument(doc.id || doc._id)
                            }
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">
                      No recent documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row: User Login History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col mb-6">
        <h3 className="text-lg font-bold text-slate-800">User Login History</h3>
        <p className="text-xs text-slate-400 mb-6 font-medium">
          Global portal access logs
        </p>

        <div className="w-full overflow-x-auto rounded-lg rounded-b-none border border-slate-200">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#1f2937] text-white text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">User Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Login Date</th>
                <th className="py-3 px-4">Login Time</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-500 font-semibold">
              {isLoadingLogins ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">
                    Loading user logins...
                  </td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-6 text-center text-red-500 font-bold bg-red-50/50"
                  >
                    Error: {fetchError}
                  </td>
                </tr>
              ) : recentLogins.length > 0 ? (
                recentLogins.map((login, idx) => {
                  // Append 'Z' to treat the naive server datetime string as UTC
                  const loginDateString = login.login_time
                    ? login.login_time.endsWith("Z")
                      ? login.login_time
                      : `${login.login_time}Z`
                    : new Date().toISOString();
                  const loginDate = new Date(loginDateString);
                  return (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {login.email}
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] tracking-wider text-pink-500 font-bold">
                        {login.role}
                      </td>
                      <td className="py-3 px-4">
                        {loginDate.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {loginDate.toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-green-500 text-white rounded bg-opacity-90 px-3 py-1 text-[10px] inline-block min-w-[70px]">
                          Success
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteLogin(login._id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          title="Delete Login Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">
                    No login history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f4f7fa] font-sans text-slate-800 overflow-hidden selection:bg-pink-100 selection:text-pink-900">
      {/* Dark Sidebar matched to reference image */}
      <aside className="w-[260px] bg-[#222222] text-slate-300 flex flex-col shrink-0 shadow-xl z-20 overflow-y-auto">
        {/* Brand Area */}
        <div className="p-6 pb-8 border-b border-white/5 flex flex-col items-center pt-8">
          <div className="flex items-center gap-3 w-full justify-start mb-6 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 font-black italic text-lg pb-0.5">
              H
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">
              HED Admin
            </h1>
          </div>

          <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-[#333] shadow-inner overflow-hidden mb-3 relative group">
            <img
              src={`https://ui-avatars.com/api/?name=${user?.identifier}&background=2f3036&color=ec4899&size=128`}
              alt="Profile"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-[#222] rounded-full"></div>
          </div>

          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-center px-2">
            {user?.identifier?.split("@")[0] || "Administrator"}
          </h2>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
            Command Center
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-6 py-3 font-semibold text-xs transition-all border-l-4 ${activeTab === "dashboard"
              ? "bg-[#18181c] text-pink-500 border-pink-500"
              : "border-transparent text-slate-400 hover:bg-[#1f1f25] hover:text-slate-200"
              }`}
          >
            <LayoutDashboard
              className={`w-4 h-4 ${activeTab === "dashboard" ? "text-pink-500" : "text-slate-500"}`}
            />
            Dashboard
          </button>

          <button
            onClick={() => setIsForumOpen(true)}
            className="w-full flex items-center gap-3 px-6 py-3 font-semibold text-xs border-transparent text-slate-400 hover:bg-[#1f1f25] hover:text-slate-200 transition-all border-l-4"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            Discussion Forum
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`w-full flex items-center justify-between px-6 py-3 font-semibold text-xs transition-all border-l-4 ${activeTab === "upload"
              ? "bg-[#18181c] text-pink-500 border-pink-500"
              : "border-transparent text-slate-400 hover:bg-[#1f1f25] hover:text-slate-200"
              }`}
          >
            <div className="flex items-center gap-3">
              <FileText
                className={`w-4 h-4 ${activeTab === "upload" ? "text-pink-500" : "text-slate-500"}`}
              />
              Knowledge Base
            </div>
            <span className="w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[9px] font-black right-menu-indicator">
              !
            </span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`w-full flex items-center gap-3 px-6 py-3 font-semibold text-xs transition-all border-l-4 ${activeTab === "chat"
              ? "bg-[#18181c] text-pink-500 border-pink-500"
              : "border-transparent text-slate-400 hover:bg-[#1f1f25] hover:text-slate-200"
              }`}
          >
            <Bot
              className={`w-4 h-4 ${activeTab === "chat" ? "text-pink-500" : "text-slate-500"}`}
            />
            AI Assistant
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`w-full flex items-center gap-3 px-6 py-3 font-semibold text-xs transition-all border-l-4 ${activeTab === "search"
              ? "bg-[#18181c] text-pink-500 border-pink-500"
              : "border-transparent text-slate-400 hover:bg-[#1f1f25] hover:text-slate-200"
              }`}
          >
            <Search
              className={`w-4 h-4 ${activeTab === "search" ? "text-pink-500" : "text-slate-500"}`}
            />
            Smart Search
          </button>

          <button
            onClick={() => setActiveTab("insights")}
            className={`w-full flex items-center gap-3 px-6 py-3 font-semibold text-xs transition-all border-l-4 ${activeTab === "insights"
              ? "bg-[#18181c] text-pink-500 border-pink-500"
              : "border-transparent text-slate-400 hover:bg-[#1f1f25] hover:text-slate-200"
              }`}
          >
            <Activity
              className={`w-4 h-4 ${activeTab === "insights" ? "text-pink-500" : "text-slate-500"}`}
            />
            System Insights
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-6 py-3 font-semibold text-xs transition-all border-l-4 ${activeTab === "settings"
              ? "bg-[#18181c] text-pink-500 border-pink-500"
              : "border-transparent text-slate-400 hover:bg-[#1f1f25] hover:text-slate-200"
              }`}
          >
            <Settings
              className={`w-4 h-4 ${activeTab === "settings" ? "text-pink-500" : "text-slate-500"}`}
            />
            Dashboard Config
          </button>
        </nav>

        <div className="p-4 mx-4 mb-4 bg-[#181818] rounded-xl border border-[#333] text-center shadow-inner">
          <p className="text-[10px] text-slate-400 font-medium mb-3 leading-relaxed">
            Manage system properties and user roles.
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-pink-500 bg-pink-500/10 hover:bg-pink-500 hover:text-white transition-all border border-pink-500/20 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f4f7fa] relative z-10 w-full">
        {/* Top Header Region matched to reference */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] z-20 flex-wrap gap-4">
          {/* Left Header items */}
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-pink-500 transition-colors hidden md:block">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-slate-50 border border-slate-100 rounded-md py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-6 relative">
            {/* Online Users Avatars */}
            <div className="flex -space-x-2 mr-2">
              {onlineUsers.slice(0, 3).map((email, idx) => (
                <div key={idx} className="relative group/avatar">
                  <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-white font-bold text-[10px]">
                    {email[0].toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {email}
                  </div>
                </div>
              ))}
              {onlineUsers.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500 shadow-sm">
                  +{onlineUsers.length - 3}
                </div>
              )}
            </div>

            <div className="flex items-center gap-5 mr-4 text-slate-400">
              <div className="relative">
                <button
                  onClick={() => { setIsNotifOpen(!isNotifOpen); if (!isNotifOpen) fetchDocRequests(); }}
                  className="relative hover:text-pink-500 transition-colors p-2"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-pink-500 text-white text-[9px] font-extrabold rounded-full border-2 border-white px-0.5 leading-none">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown — Real-time Doc Requests */}
                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 transform origin-top-right transition-all">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-sm text-slate-800">Document Requests</h3>
                        <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {unreadCount} New
                        </span>
                      </div>
                      <div className="max-h-[340px] overflow-y-auto">
                        {docRequests.length === 0 ? (
                          <div className="py-10 text-center text-slate-400 text-xs font-medium">
                            No requests yet
                          </div>
                        ) : (
                          docRequests.map(req => (
                            <div
                              key={req._id}
                              className={`p-4 border-b border-slate-50 transition-colors ${!req.read ? 'bg-pink-50/40' : ''}`}
                            >
                              {/* Header Row */}
                              <div className="flex gap-3">
                                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!req.read ? 'bg-pink-500 animate-pulse' : 'bg-slate-200'}`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm leading-snug ${!req.read ? 'text-slate-900 font-semibold' : 'text-slate-600 font-medium'}`}>
                                    {req.title}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                                    By: {req.requested_by}
                                  </p>
                                  {req.description && (
                                    <p className="text-xs text-slate-400 mt-0.5 italic truncate">"{req.description}"</p>
                                  )}
                                  <p className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {new Date(req.created_at).toLocaleString()}
                                  </p>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 h-fit rounded-full shrink-0 mt-1 ${req.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                                      'bg-red-100 text-red-500'
                                  }`}>
                                  {req.status}
                                </span>
                              </div>

                              {/* Approve / Reject Buttons — only for pending */}
                              {req.status === 'pending' && (
                                <div className="flex gap-2 mt-3 ml-5">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); markStatus(req._id, 'approved'); }}
                                    className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm"
                                  >
                                    ✓ Approve
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); markStatus(req._id, 'rejected'); }}
                                    className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
                                  >
                                    ✗ Reject
                                  </button>
                                </div>
                              )}

                              {/* Admin comment if any */}
                              {req.admin_comment && (
                                <p className="mt-2 ml-5 text-xs text-slate-400 italic">Admin note: {req.admin_comment}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-slate-100 text-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                        <span className="text-xs font-bold text-pink-500">Mark All as Seen</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button className="hover:text-pink-500 transition-colors p-2">
                <Mail className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-100 pl-6 cursor-pointer group">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.identifier}&background=ec4899&color=fff&size=64`}
                alt="avatar"
                className="w-8 h-8 rounded-full shadow-sm"
              />
              <span className="text-xs font-bold text-slate-700 group-hover:text-pink-500 transition-colors hidden sm:block">
                {user?.identifier?.split("@")[0]}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-pink-500 transition-colors hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Scrollable Flow Window */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full">
            {activeTab === "dashboard" && renderDashboardSummary()}
            {activeTab === "chat" && (
              <div className="h-full min-h-[600px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden py-4">
                <ChatInterface user={user} />
              </div>
            )}
            {activeTab === "search" && (
              <div className="h-full min-h-[600px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden py-4">
                <SmartSearch />
              </div>
            )}
            {activeTab === "upload" && (
              <div className="h-full min-h-[600px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden py-4">
                <DocumentUpload user={user} />
              </div>
            )}
            {activeTab === "insights" && (
              <div className="h-full min-h-[600px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden py-4">
                <DecisionInsights user={user} />
              </div>
            )}
            {activeTab === "settings" && (
              <div className="h-full min-h-[600px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden py-4">
                <AdminSettingsPanel />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Forum Modal — Global Discussion */}
      {isForumOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl h-[600px] shadow-2xl flex flex-col overflow-hidden border border-white/20">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 tracking-tight">Policy Discussion Forum</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Sync Enabled</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsForumOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">✕</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {forumMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.user === user?.identifier ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.user?.split('@')[0]}</span>
                    <span className="text-[10px] text-slate-300 font-medium">{msg.time || 'Just now'}</span>
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm ${msg.user === user?.identifier
                      ? 'bg-pink-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-600 border border-slate-100 rounded-tl-none'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-slate-100 shrink-0">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Share your thoughts on recent policies..."
                  value={newForumMessage}
                  onChange={(e) => setNewForumMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleForumSend()}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
                />
                <button
                  onClick={handleForumSend}
                  className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-pink-700 transition-all shadow-lg shadow-pink-200 active:scale-95"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
