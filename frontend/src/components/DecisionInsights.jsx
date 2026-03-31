import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  ChevronRight,
  BarChart2,
  BookOpen,
  Lightbulb,
  Loader2,
  Target,
  Mail,
  Eye,
  User,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function DecisionInsights({ user }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [docData, setDocData] = useState(null);

  const [activeAction, setActiveAction] = useState("summary"); // summary, insights, recommend
  const [actionData, setActionData] = useState({
    summary: null,
    insights: null,
    recommend: null,
  });
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Email Reference List State
  const [isEmailsModalOpen, setIsEmailsModalOpen] = useState(false);
  const [referencedEmails, setReferencedEmails] = useState([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  const fetchReferencedEmails = async (docId) => {
    setIsEmailsModalOpen(true);
    setIsLoadingEmails(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/documents/${docId}/emails`,
      );
      setReferencedEmails(response.data.emails || []);
    } catch (error) {
      console.error("Failed to fetch referenced emails:", error);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  // Document Viewer Tracking State
  const [isViewersModalOpen, setIsViewersModalOpen] = useState(false);
  const [documentViewers, setDocumentViewers] = useState({
    viewers: [],
    total_views: 0,
    tracked_views: 0,
  });
  const [isLoadingViewers, setIsLoadingViewers] = useState(false);

  const fetchDocumentViewers = async (docId) => {
    setIsViewersModalOpen(true);
    setIsLoadingViewers(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/documents/${docId}/viewers`,
      );
      setDocumentViewers(response.data);
    } catch (error) {
      console.error("Failed to fetch document viewers:", error);
    } finally {
      setIsLoadingViewers(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoadingList(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleSelectDoc = async (docId) => {
    setSelectedDoc(docId);
    setDocData(null);
    setActionData({ summary: null, insights: null, recommend: null });
    setActiveAction("summary");

    try {
      // Pass the logged-in user's email so the view is tracked in MongoDB
      const viewerParam = user?.identifier
        ? `?viewer=${encodeURIComponent(user.identifier)}`
        : "";
      const response = await axios.get(
        `${API_BASE_URL}/documents/${docId}${viewerParam}`,
      );
      setDocData(response.data);

      // If the document already has cached summary/insights in DB, pre-fill them
      if (response.data.summary) {
        setActionData((prev) => ({ ...prev, summary: response.data.summary }));
      }
      if (response.data.insights) {
        setActionData((prev) => ({
          ...prev,
          insights: response.data.insights,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch document details:", error);
    }
  };

  const handleRunAction = async (action) => {
    if (!selectedDoc) return;

    // Don't re-fetch if we already have it in state
    if (actionData[action] !== null) return;

    setIsActionLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/documents/${selectedDoc}/${action}`,
      );

      if (action === "summary") {
        setActionData((prev) => ({ ...prev, summary: response.data.summary }));
      } else if (action === "insights") {
        setActionData((prev) => ({
          ...prev,
          insights: response.data.insights,
        }));
      } else if (action === "recommend") {
        setActionData((prev) => ({
          ...prev,
          recommend: response.data.recommendations,
        }));
      }
    } catch (error) {
      console.error(`Failed to run ${action}:`, error);
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoc && activeAction && actionData[activeAction] === null) {
      handleRunAction(activeAction);
    }
  }, [activeAction, selectedDoc]);

  return (
    <div className="h-full flex flex-col lg:flex-row bg-slate-50 relative overflow-hidden">
      {/* Left Sidebar: Document List */}
      <div className="w-full lg:w-1/3 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
            Frequently Accessed
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Top documents for strategic review
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoadingList ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center p-8 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">
                No documents found. Upload a policy to get started.
              </p>
            </div>
          ) : (
            documents.map((doc, idx) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc.id)}
                className={`w-full text-left p-4 rounded-2xl flex items-center justify-between group transition-all ${
                  selectedDoc === doc.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`w-8 h-8 rounded-full flex justify-center items-center text-xs font-bold shrink-0 ${
                      selectedDoc === doc.id
                        ? "bg-white/20"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-semibold truncate">
                      {doc.filename}
                    </h3>
                    <p
                      className={`text-xs mt-0.5 ${selectedDoc === doc.id ? "text-indigo-200" : "text-slate-400"}`}
                    >
                      {doc.access_count} views
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 shrink-0 ${selectedDoc === doc.id ? "text-white" : "text-slate-300 group-hover:text-slate-500"}`}
                />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Insights view */}
      <div className="w-full lg:w-2/3 flex flex-col h-full bg-slate-50">
        {!selectedDoc ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <Target className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              Select a Document
            </h3>
            <p className="max-w-sm text-sm">
              Choose a document from the left to extract strategic insights,
              summaries, and policy recommendations.
            </p>
          </div>
        ) : !docData ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-8 bg-white border-b border-slate-200 shrink-0">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-4">
                Currently Analyzing
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {docData.filename}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Uploaded on{" "}
                  {new window.Date(docData.uploaded_at).toLocaleDateString()}
                </p>
                <div
                  onClick={() => fetchDocumentViewers(docData.id)}
                  className="text-sm font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md flex items-center gap-1.5 border border-indigo-200 cursor-pointer hover:bg-indigo-100 hover:shadow-sm transition-all"
                >
                  <Eye className="w-4 h-4" />
                  {docData.access_count || 0} views — see who
                </div>
                <div
                  onClick={() => fetchReferencedEmails(docData.id)}
                  className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md flex items-center gap-1.5 border border-emerald-200 cursor-pointer hover:bg-emerald-100 hover:shadow-sm transition-all"
                >
                  <Mail className="w-4 h-4" />
                  View {docData.emails_referenced || 0} referenced emails
                </div>
              </div>
            </div>

            {/* Action Tabs */}
            <div className="flex px-8 pt-4 gap-2 border-b border-slate-200 bg-white shrink-0">
              <button
                onClick={() => setActiveAction("summary")}
                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeAction === "summary" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
              >
                <BookOpen className="w-4 h-4" /> Executive Summary
              </button>
              <button
                onClick={() => setActiveAction("insights")}
                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeAction === "insights" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
              >
                <Lightbulb className="w-4 h-4" /> Key Insights
              </button>
              <button
                onClick={() => setActiveAction("recommend")}
                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeAction === "recommend" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
              >
                <Target className="w-4 h-4" /> Policy Recommendations
              </button>
            </div>

            {/* Action Content Area */}
            <div className="flex-1 overflow-y-auto p-8 relative">
              {isActionLoading && !actionData[activeAction] ? (
                <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                  <p className="text-sm font-bold text-slate-600 animate-pulse">
                    Running Generative AI Analysis...
                  </p>
                </div>
              ) : null}

              <div className="prose prose-slate max-w-none">
                {activeAction === "summary" && actionData.summary && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {actionData.summary}
                  </div>
                )}

                {activeAction === "insights" && actionData.insights && (
                  <div className="space-y-4">
                    {actionData.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex justify-center items-center font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-slate-700 leading-relaxed pt-1 font-medium">
                          {insight}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {activeAction === "recommend" && actionData.recommend && (
                  <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 text-slate-700 whitespace-pre-wrap leading-relaxed relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-bl-full opacity-50"></div>
                    <div className="relative z-10">{actionData.recommend}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Email References Modal Overlay */}
        {isEmailsModalOpen && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
            {/* Slide-out Panel */}
            <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    Referenced Emails
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Internal communications citing this document.
                  </p>
                </div>
                <button
                  onClick={() => setIsEmailsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body: Email List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {isLoadingEmails ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
                    <p className="text-sm">Fetching corporate emails...</p>
                  </div>
                ) : referencedEmails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center text-slate-400 px-6">
                    <Mail className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">
                      No specific emails found referencing this document in the
                      archive.
                    </p>
                  </div>
                ) : (
                  referencedEmails.map((email) => (
                    <div
                      key={email.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                      {/* Unread indicator */}
                      {!email.is_read && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                      )}

                      <div className="flex justify-between items-start mb-2">
                        <h4
                          className={`text-sm ${!email.is_read ? "font-bold text-slate-900" : "font-semibold text-slate-700"} truncate pr-4`}
                        >
                          {email.subject}
                        </h4>
                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap pt-0.5">
                          {new window.Date(email.date).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mb-2 truncate">
                        <span className="font-medium">From:</span>{" "}
                        {email.sender}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-50 italic">
                        "{email.snippet}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Viewers Modal Overlay */}
      {isViewersModalOpen && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-indigo-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  Document Viewers
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {documentViewers.tracked_views} tracked /{" "}
                  {documentViewers.total_views} total views
                </p>
              </div>
              <button
                onClick={() => setIsViewersModalOpen(false)}
                className="w-8 h-8 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 flex items-center justify-center transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
              {isLoadingViewers ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                  <p className="text-sm">Loading viewer history...</p>
                </div>
              ) : documentViewers.viewers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center text-slate-400 px-6">
                  <Eye className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-semibold text-slate-600 mb-1">
                    No tracked views yet
                  </p>
                  <p className="text-xs text-slate-400">
                    Viewer tracking is active from now on. The document has{" "}
                    {documentViewers.total_views} total views (old views were
                    counted but not recorded).
                  </p>
                </div>
              ) : (
                documentViewers.viewers.map((view) => {
                  const dt = new window.Date(view.viewed_at + "Z");
                  return (
                    <div
                      key={view.id}
                      className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition-shadow"
                    >
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {view.viewer_email}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {dt.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {" at "}
                          {dt.toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
