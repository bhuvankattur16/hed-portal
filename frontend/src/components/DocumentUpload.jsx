import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function DocumentUpload() {
    const [uploadStatus, setUploadStatus] = useState({ text: '', type: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        setUploadProgress(0);
        setUploadStatus({ text: `Uploading ${file.name}...`, type: 'info' });

        try {
            const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            setUploadStatus({
                text: `Success: ${response.data.filename} has been uploaded! The AI system is now processing it in the background. It will be indexed and available for queries within a few minutes.`,
                type: 'success'
            });
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadStatus({
                text: 'Failed to upload document. Please ensure the backend is running and the file is valid.',
                type: 'error'
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            e.target.value = null; // reset input
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Knowledge Base Management</h2>
                <p className="text-slate-500 mt-2">Upload official policies, regulations, and schemes to train the AI assistant.</p>
            </div>

            {uploadStatus.text && (
                <div className={`mb-8 p-4 rounded-xl text-sm font-medium border flex flex-col gap-3 ${uploadStatus.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' :
                    uploadStatus.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                    <div className="flex items-start gap-3">
                        {uploadStatus.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
                        {uploadStatus.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                        {uploadStatus.type === 'info' && <Loader2 className="w-5 h-5 shrink-0 animate-spin" />}
                        <p className="pt-0.5">{uploadStatus.text}</p>
                    </div>

                    {isUploading && uploadProgress > 0 && (
                        <div className="w-full pl-8 mt-1">
                            <div className="flex justify-between mb-1">
                                <span className="text-[10px] uppercase tracking-wider opacity-70">Uploading...</span>
                                <span className="text-[10px] font-bold">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-blue-200/30 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center hover:bg-slate-50 transition-colors flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Upload New Document</h3>
                <p className="text-slate-500 max-w-sm mb-8">Supported formats: PDF, DOCX, TXT. The document will be automatically chunked and stored in the secure Vector Database.</p>

                <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    {isUploading ? 'Processing...' : 'Select File to Upload'}
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".txt,.pdf,.doc,.docx"
                        disabled={isUploading}
                    />
                </label>
            </div>
        </div>
    );
}
