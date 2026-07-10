
import React, { useState, useCallback } from 'react';
import { normalizeToSRT } from './services/geminiService';
import { Button } from './components/Button';
import { ProcessingState } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [normalizedSRT, setNormalizedSRT] = useState<string>('');
  const [status, setStatus] = useState<ProcessingState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const handleNormalize = async () => {
    if (!inputText.trim()) {
      setStatus({ isLoading: false, error: 'Please enter some content to normalize.', success: false });
      return;
    }

    setStatus({ isLoading: true, error: null, success: false });
    try {
      const result = await normalizeToSRT(inputText);
      if (!result) {
        throw new Error("No output generated. Try being more specific with timestamps.");
      }
      setNormalizedSRT(result);
      setStatus({ isLoading: false, error: null, success: true });
    } catch (err: any) {
      setStatus({ isLoading: false, error: err.message || 'An unexpected error occurred.', success: false });
    }
  };

  const downloadSRT = useCallback(() => {
    const blob = new Blob([normalizedSRT], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'subtitle.srt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [normalizedSRT]);

  const handleClear = () => {
    setInputText('');
    setNormalizedSRT('');
    setStatus({ isLoading: false, error: null, success: false });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">SRT Master</h1>
          </div>
          <div className="hidden sm:block text-sm text-slate-500 font-medium">
            AI-Powered Subtitle Normalization
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Intro */}
        <section className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Normalize your subtitles</h2>
          <p className="text-slate-600 max-w-2xl">
            Paste raw notes, transcripts, or messy text with timestamps. 
            Our AI will intelligently format it into a perfect, production-ready <span className="font-semibold text-indigo-600">.srt</span> file.
          </p>
        </section>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Input Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Input Content</span>
              <button 
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-rose-500 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
            <textarea
              className="flex-1 p-6 focus:outline-none resize-none text-slate-700 bg-transparent font-mono text-sm leading-relaxed"
              placeholder="Example input:&#10;0:12 Hello everyone&#10;0:15 Welcome to the show&#10;0:22 [Laughs] Let's begin..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
              <Button 
                onClick={handleNormalize} 
                isLoading={status.isLoading} 
                className="w-full"
              >
                Normalize Content
              </Button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[600px] overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SRT Preview</span>
              {status.success && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 uppercase tracking-wider">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Ready
                </span>
              )}
            </div>
            
            <div className="flex-1 overflow-auto bg-slate-900 relative">
              {status.isLoading && (
                <div className="absolute inset-0 z-20 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center flex-col text-white gap-4">
                  <div className="relative">
                     <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                  </div>
                  <p className="text-indigo-200 font-medium animate-pulse">AI is formatting your subtitles...</p>
                </div>
              )}
              
              {!normalizedSRT && !status.isLoading && (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg">Normalized output will appear here</p>
                  <p className="text-sm mt-1">Click normalize to start the process</p>
                </div>
              )}

              {normalizedSRT && (
                <pre className="p-6 text-indigo-100 font-mono text-sm whitespace-pre-wrap selection:bg-indigo-500/30">
                  {normalizedSRT}
                </pre>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
              <Button 
                variant="success" 
                onClick={downloadSRT} 
                disabled={!normalizedSRT || status.isLoading}
                className="w-full py-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download .SRT File
              </Button>
            </div>
          </div>
        </div>

        {/* Error Feedback */}
        {status.error && (
          <div className="mt-8 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{status.error}</p>
          </div>
        )}

        {/* Tips Section */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Smart Timestamps</h3>
            <p className="text-slate-600 text-sm">We handle 0:12, 12s, or [00:12:05]. The AI intelligently converts them to standard SRT timing.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Auto-Cleanup</h3>
            <p className="text-slate-600 text-sm">Messy formatting? Random symbols? The AI cleans up the text while preserving the speaker's intent.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Ready to Use</h3>
            <p className="text-slate-600 text-sm">Download as a standard .srt file compatible with YouTube, VLC, Premiere Pro, and more.</p>
          </div>
        </section>
      </main>

      {/* Sticky Footer for CTA on Mobile */}
      {!status.isLoading && !normalizedSRT && (
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-20">
           <Button 
            onClick={handleNormalize} 
            className="w-full py-4 shadow-xl"
          >
            Normalize Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default App;
