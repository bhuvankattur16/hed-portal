import React, { useState } from 'react';
import axios from 'axios';
import { Search, Filter, Loader2, FileText, ChevronRight, Hash, Calendar, Tag } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function SmartSearch() {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({
        year: 'All',
        category: 'All',
        is_scheme: 'All'
    });
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setHasSearched(true);

        try {
            // Prepare payload
            const payload = {
                query: query,
                year: filters.year === 'All' ? null : filters.year,
                category: filters.category === 'All' ? null : filters.category,
                is_scheme: filters.is_scheme === 'All' ? null : filters.is_scheme === 'Yes'
            };

            const response = await axios.post(`${API_BASE_URL}/search`, payload);
            setResults(response.data.results || []);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">

            {/* Header / Search Bar Area */}
            <div className="bg-white border-b border-slate-200 p-6 z-10 shrink-0 shadow-sm">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Search className="w-6 h-6 text-blue-600" />
                        Smart Document Search
                    </h2>

                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        {/* Main Search Input */}
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm font-medium text-slate-700"
                                placeholder="Search policies, schemes, and guidelines..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3">
                            {/* Year Filter */}
                            <div className="relative bg-slate-50 border border-slate-200 rounded-xl flex items-center px-3 shadow-sm">
                                <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                                <select
                                    className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none appearance-none py-3 pr-4"
                                    value={filters.year}
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                >
                                    <option value="All">All Years</option>
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                    <option value="Unknown">Unknown</option>
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div className="relative bg-slate-50 border border-slate-200 rounded-xl flex items-center px-3 shadow-sm">
                                <Tag className="w-4 h-4 text-slate-400 mr-2" />
                                <select
                                    className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none appearance-none py-3 pr-4"
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="All">All Categories</option>
                                    <option value="Policy">Policy</option>
                                    <option value="Regulation">Regulation</option>
                                    <option value="Scholarship">Scholarship</option>
                                    <option value="General">General</option>
                                </select>
                            </div>

                            {/* Is Scheme Filter */}
                            <div className="relative bg-slate-50 border border-slate-200 rounded-xl flex items-center px-3 shadow-sm">
                                <Hash className="w-4 h-4 text-slate-400 mr-2" />
                                <select
                                    className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none appearance-none py-3 pr-4"
                                    value={filters.is_scheme}
                                    onChange={(e) => setFilters({ ...filters, is_scheme: e.target.value })}
                                >
                                    <option value="All">All Types</option>
                                    <option value="Yes">Schemes Only</option>
                                    <option value="No">Non-Schemes</option>
                                </select>
                            </div>

                            {/* Search Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !query.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-5xl mx-auto">

                    {!hasSearched ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                            <Filter className="w-16 h-16 mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-slate-600 mb-2">Advanced Filtering</h3>
                            <p className="max-w-md text-sm">Enter a search query and apply smart filters to find ranked results and LLM-highlighted snippets across the knowledge base.</p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                            <p className="text-sm font-bold text-slate-600 animate-pulse">Running Semantic Search & Generating Highlights...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                            <FileText className="w-16 h-16 mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-slate-600 mb-2">No Results Found</h3>
                            <p className="max-w-md text-sm">Try adjusting your filters or using different keywords.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-sm font-bold text-slate-500 mb-6 flex justify-between items-center bg-slate-100 py-2 px-4 rounded-lg inline-flex">
                                Found {results.length} highly relevant snippets
                            </div>

                            {results.map((result, idx) => (
                                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                    {/* Result Meta */}
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                                            Result #{idx + 1}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {result.metadata?.category || 'General'}
                                        </span>
                                        {result.metadata?.year && result.metadata?.year !== 'Unknown' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {result.metadata.year}
                                            </span>
                                        )}
                                        {result.metadata?.is_scheme && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                                <Hash className="w-3 h-3 mr-1" />
                                                Scheme
                                            </span>
                                        )}
                                        <span className="ml-auto text-xs text-slate-400 flex items-center gap-1 font-medium">
                                            <FileText className="w-3 h-3" />
                                            {result.metadata?.source || 'Unknown Source'}
                                        </span>
                                    </div>

                                    {/* AI Highlight */}
                                    <div className="mb-5 bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                        <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider mb-2 flex items-center">
                                            <Loader2 className="w-3 h-3 mr-1 text-blue-500" />
                                            AI Highlight
                                        </h4>
                                        <p className="text-slate-800 font-medium leading-relaxed">
                                            {result.highlight}
                                        </p>
                                    </div>

                                    {/* Raw Context Snippet (Collapsible/Preview) */}
                                    <div className="relative">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Raw Document Text</h4>
                                        <div className="text-sm text-slate-500 leading-relaxed max-h-24 overflow-hidden relative">
                                            {result.content}
                                            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
