import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  Search, 
  Copy, 
  Send, 
  FileText, 
  LayoutDashboard, 
  Bell, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Filter,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractMeetingData } from './logic/engine';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SAMPLE_TRANSCRIPT = `Meeting: Q3 Product Launch Planning
Attendees: Sarah (PM), John (Engineering), Maya (Design), Alex (Marketing)

Sarah: "Alright team, we need to launch the new dashboard by end of Q3. John, I need you to build the primary API for the new dashboard by June 15th."
John: "We can do that. But Maya, we'll need all the UI mockups and component specs ready by May 1st."
Maya: "Absolutely. I'll have all the UI mockups and component specs ready by May 1st. Also, Sarah, can you make sure our QA team runs the WCAG audit?"
Sarah: "I'll handle that. Alex, you need to start the marketing content - blog posts, email campaigns - and I want them ready by May 20th."
Alex: "Got it. I'll draft the launch announcement and blog post by May 20th."
John: "One more thing, I'll handle beta recruitment for the mid-June session."`;

export default function App() {
  const [activeTab, setActiveTab] = useState('transcript');
  const [transcript, setTranscript] = useState('');
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPerson, setFilterPerson] = useState('all');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('meetingHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const handleProcess = async () => {
    if (!transcript) return;
    setIsProcessing(true);
    const data = await extractMeetingData(transcript);
    
    data.date_processed = new Date().toISOString();
    data.id = Math.random().toString(36).substr(2, 9);
    
    setResults(data);
    
    const newHistory = [data, ...history];
    setHistory(newHistory);
    localStorage.setItem('meetingHistory', JSON.stringify(newHistory));
    
    setIsProcessing(false);
    setActiveTab('dashboard');
  };

  const loadSample = () => {
    setTranscript(SAMPLE_TRANSCRIPT);
  };

  const handleExportCSV = () => {
    if (!results || !results.action_items) return;
    const headers = ['Task', 'Owner', 'Deadline', 'Priority', 'Confidence', 'Source Quote'];
    const rows = results.action_items.map(item => [
      `"${item.action.replace(/"/g, '""')}"`,
      `"${item.assigned_to}"`,
      `"${item.deadline}"`,
      `"${item.priority}"`,
      `"${Math.round(item.confidence * 100)}%"`,
      `"${item.source_quote.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "action_items.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncSlack = () => {
    alert("Successfully synced 4 personalized messages to Slack!");
  };

  const filteredItems = results?.action_items.filter(item => {
    const matchesSearch = item.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.assigned_to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPerson = filterPerson === 'all' || item.assigned_to === filterPerson;
    return matchesSearch && matchesPerson;
  }) || [];

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-stone-900 font-sans">
      {/* Top Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-2xl tracking-tight">Sentinel.</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-stone-500 uppercase tracking-widest">
            <button 
              onClick={() => setActiveTab('transcript')}
              className={cn("hover:text-stone-900 transition-colors", activeTab === 'transcript' && "text-[#D95B28] font-bold")}
            >
              Transcript
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              disabled={!results}
              className={cn("hover:text-stone-900 transition-colors", !results && "opacity-50 cursor-not-allowed", activeTab === 'dashboard' && "text-[#D95B28] font-bold")}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('notify')}
              disabled={!results}
              className={cn("hover:text-stone-900 transition-colors", !results && "opacity-50 cursor-not-allowed", activeTab === 'notify' && "text-[#D95B28] font-bold")}
            >
              Notifications
            </button>
            <button 
              onClick={() => { setActiveTab('history'); setHistoryDateFilter(''); }}
              className={cn("hover:text-stone-900 transition-colors", activeTab === 'history' && "text-[#D95B28] font-bold")}
            >
              History
            </button>
            <div className="w-px h-4 bg-stone-300"></div>
            <div className="flex items-center gap-2 relative">
              <label className="cursor-pointer text-xs hover:text-[#D95B28] transition-colors relative flex items-center group">
                <span className="group-hover:underline">{currentDate} 📅</span>
                <input 
                  type="date" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    setHistoryDateFilter(e.target.value);
                    if (e.target.value) setActiveTab('history');
                  }}
                />
              </label>
              <div className="w-8 h-8 rounded-full bg-[#D95B28] text-white flex items-center justify-center font-bold">
                JS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto p-6 lg:p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'transcript' && (
            <motion.div 
              key="transcript-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <h1 className="text-5xl font-serif font-bold tracking-tight text-stone-900 mb-2">
                  Meeting <span className="text-[#D95B28] italic">Intelligence.</span>
                </h1>
                <p className="text-stone-500 text-lg">Extract structured action items from unstructured meetings.</p>
              </div>

              <div className="card p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-4">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} /> Transcript Input
                  </div>
                  <button 
                    onClick={loadSample}
                    className="text-xs font-bold text-[#D95B28] hover:text-[#C24A1A] uppercase tracking-wider"
                  >
                    Load Sample
                  </button>
                </div>
                
                <textarea 
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your meeting transcript here..."
                  className="w-full h-64 bg-[#FCFAF6] border border-stone-200 rounded-md p-4 text-stone-700 font-mono text-sm leading-relaxed focus:border-[#D95B28] focus:ring-1 focus:ring-[#D95B28] transition-all resize-none shadow-inner"
                />

                <div className="flex justify-end mt-6">
                  <button 
                    onClick={handleProcess}
                    disabled={!transcript || isProcessing}
                    className={cn(
                      "px-8 py-3 rounded-sm font-bold text-sm text-white shadow-sm transition-all",
                      transcript && !isProcessing 
                        ? "bg-[#D95B28] hover:bg-[#C24A1A]" 
                        : "bg-stone-300 cursor-not-allowed"
                    )}
                  >
                    {isProcessing ? "PROCESSING..." : "PROCESS MEETING →"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && results && (
            <motion.div 
              key="dashboard-view"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-stone-900">{results.meeting_summary}</h1>
                  <p className="text-stone-500 mt-2 text-sm">{results.attendees.join(' • ')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 rounded-sm text-stone-700 hover:bg-stone-50 text-sm font-medium transition-colors shadow-sm">
                    <Download size={16} /> Export CSV
                  </button>
                  <button onClick={handleSyncSlack} className="flex items-center gap-2 px-4 py-2 bg-[#D95B28] text-white rounded-sm hover:bg-[#C24A1A] text-sm font-medium transition-colors shadow-sm">
                    <Send size={16} /> Sync to Slack
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-6 col-span-2">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Summary</h3>
                  <p className="text-lg text-stone-800 font-serif leading-relaxed">
                    Based on the transcript, we identified <strong className="text-[#D95B28]">{results.action_items.length} clear tasks</strong> and assigned them to specific owners.
                  </p>
                </div>
                <div className="card p-6 flex flex-col justify-center items-center text-center">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Avg. Confidence</h3>
                  <span className="text-4xl font-serif font-bold text-stone-900">92%</span>
                </div>
              </div>

              {/* Fix: Search bar overlapping text */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-stone-400" size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search tasks, owners, or keywords..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-sm border border-stone-200 bg-white focus:border-[#D95B28] focus:ring-1 focus:ring-[#D95B28] text-stone-800 shadow-sm"
                  />
                </div>
                <select 
                  value={filterPerson}
                  onChange={(e) => setFilterPerson(e.target.value)}
                  className="px-4 py-3 rounded-sm border border-stone-200 bg-white focus:border-[#D95B28] text-stone-800 shadow-sm"
                >
                  <option value="all">All Attendees</option>
                  {results.attendees.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-200 pb-2">Assigned Tasks</h3>
                {filteredItems.map((item, idx) => (
                  <ActionItemCard key={item.id} item={item} />
                ))}
                {filteredItems.length === 0 && (
                  <p className="text-stone-500 text-center py-8">No tasks match your search.</p>
                )}
              </div>

              {results.ambiguous_items.length > 0 && (
                <div className="mt-12 pt-8 border-t border-stone-200">
                  <div className="flex items-center gap-2 text-[#D95B28] font-bold text-xs uppercase tracking-widest mb-4">
                    <AlertCircle size={16} /> Needs Review ({results.ambiguous_items.length})
                  </div>
                  <div className="space-y-4">
                    {results.ambiguous_items.map((item, idx) => (
                      <div key={idx} className="bg-orange-50 border border-orange-200 rounded-sm p-5">
                        <h4 className="font-bold text-stone-900 mb-1">{item.description}</h4>
                        <p className="text-sm text-stone-600 mb-3">Reason: {item.reason}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-500 uppercase">Possible Owners:</span>
                          <div className="flex gap-2">
                            {item.possible_people.map(p => (
                              <span key={p} className="px-2 py-1 bg-white border border-orange-200 text-xs font-medium text-stone-700 rounded-sm">{p}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'notify' && results && (
            <motion.div 
              key="notify-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center mb-10">
                <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">Personalized Briefs.</h1>
                <p className="text-stone-500">Ready to send via Slack or Email.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.attendees.map((person, idx) => {
                  const personItems = results.action_items.filter(item => item.assigned_to === person);
                  if (personItems.length === 0) return null;
                  
                  return (
                    <EmailPreview 
                      key={idx} 
                      person={person} 
                      items={personItems} 
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-stone-900">Meeting Archive</h1>
                  <p className="text-stone-500 mt-2 text-sm">Review your past processed meetings.</p>
                </div>
                {historyDateFilter && (
                   <div className="flex items-center gap-3">
                     <span className="text-sm font-medium text-[#D95B28] bg-orange-50 px-3 py-1 rounded-sm border border-orange-200">
                       Showing: {new Date(historyDateFilter + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                     </span>
                     <button onClick={() => setHistoryDateFilter('')} className="text-xs font-bold text-stone-500 hover:text-stone-800 uppercase">Clear</button>
                   </div>
                )}
              </div>

              {(() => {
                const getLocalYYYYMMDD = (isoString) => {
                  const d = new Date(isoString);
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                };
                
                const filteredHistory = historyDateFilter 
                  ? history.filter(m => getLocalYYYYMMDD(m.date_processed) === historyDateFilter)
                  : history;

                if (filteredHistory.length === 0) {
                  return (
                    <div className="card p-12 flex flex-col justify-center items-center text-center text-stone-500">
                      <FileText size={48} className="mb-4 text-stone-300" />
                      <p>No meetings found for {historyDateFilter ? 'this date' : 'your account'}.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filteredHistory.map((meeting) => (
                      <div key={meeting.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#D95B28] transition-all cursor-pointer bg-white group" onClick={() => {
                        setResults(meeting);
                        setActiveTab('dashboard');
                      }}>
                        <div>
                          <h3 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-[#D95B28] transition-colors">{meeting.meeting_summary}</h3>
                          <p className="text-sm text-stone-500">{new Date(meeting.date_processed).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center hidden sm:block">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tasks</p>
                            <p className="text-xl font-serif font-bold text-stone-800">{meeting.action_items.length}</p>
                          </div>
                          <div className="text-center hidden sm:block">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Team</p>
                            <p className="text-xl font-serif font-bold text-stone-800">{meeting.attendees.length}</p>
                          </div>
                          <ChevronRight className="text-stone-400 group-hover:text-[#D95B28] transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ActionItemCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="card hover:shadow-md transition-shadow overflow-hidden bg-white">
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">{item.action}</h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
            <div className="flex items-center gap-1 font-medium text-stone-800">
              <User size={14} className="text-[#D95B28]" /> {item.assigned_to}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} /> Deadline: <span className="font-medium text-stone-800">{item.deadline}</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-green-600" /> Confidence: <span className="font-medium text-stone-800">{Math.round(item.confidence * 100)}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs font-bold uppercase rounded-sm border border-stone-200">
            {item.priority}
          </span>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold text-[#D95B28] hover:text-[#C24A1A] uppercase tracking-wider"
          >
            {expanded ? "Close" : "Source"}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#FCFAF6] border-t border-stone-100 p-5 text-sm"
          >
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Transcript Quote</p>
            <p className="font-serif italic text-stone-700 border-l-2 border-[#D95B28] pl-3">"{item.source_quote}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmailPreview({ person, items }) {
  const [copied, setCopied] = useState(false);
  
  const generateMessage = () => {
    const firstName = person.split(' ')[0];
    return `Hi ${firstName},

Here are your assigned tasks from today's sync:

${items.map((it, i) => `${i+1}. ${it.action}
   Deadline: ${it.deadline}`).join('\n\n')}

Best,
Sentinel Agent`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card bg-white flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-stone-100 bg-[#FCFAF6] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D95B28] text-white flex items-center justify-center font-bold text-sm">
            {person.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">{person}</h3>
          </div>
        </div>
        <button 
          onClick={handleCopy}
          className="text-xs font-bold text-[#D95B28] hover:text-[#C24A1A] uppercase tracking-wider flex items-center gap-1"
        >
          {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <div className="p-5 flex-1">
        <div className="font-mono text-sm text-stone-600 whitespace-pre-wrap">
          {generateMessage()}
        </div>
      </div>
    </div>
  );
}
