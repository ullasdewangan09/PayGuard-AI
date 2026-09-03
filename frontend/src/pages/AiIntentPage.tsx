import React, { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit, Send, Loader2, Code, Zap, AlertTriangle, Bot, User,
  Trash2, Sparkles, MessageSquare, TrendingUp, Shield, Database, ChevronRight
} from 'lucide-react';
import { aiService, IntentExtractionResponse, ChatMessage } from '../services/api/ai';
import { useNavigate } from 'react-router-dom';
import { createIntent } from '../services/api';

type PageMode = 'intent' | 'chat';

const CHAT_STARTERS = [
  { icon: TrendingUp, label: 'Account Summary', prompt: 'Give me a full summary of my account — total transactions, volume, and intent rules.' },
  { icon: Shield, label: 'Security Status', prompt: 'How many transactions were blocked in my account? What were the reasons?' },
  { icon: Database, label: 'Recent Activity', prompt: 'Show me my most recent transactions and their statuses.' },
  { icon: Sparkles, label: 'Finance Advice', prompt: 'What are the best practices for setting up payment intent rules for an e-commerce business in India?' },
];const formatMessage = (text: string) => {
  if (!text) return text;
  const cleanedText = text.replace(/(^|\n)\s*\*\s/g, '$1• ');
  const parts = cleanedText.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-app-textPrimary">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

export const AiIntentPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<PageMode>('chat');

  // ── Intent Builder state ──────────────────────────────────────────────────
  const [prompt, setPrompt] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [intentMessages, setIntentMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ai_chat_messages');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [{
      role: 'assistant',
      content: "Hi! I'm the PayGuard Intent Builder. Tell me what kind of payment rule you'd like to configure. For example, 'Block all international transactions above ₹4,00,000' or 'Set up a ₹4,000 recurring payment to Netflix'."
    }];
  });
  const [result, setResult] = useState<IntentExtractionResponse | null>(() => {
    const saved = localStorage.getItem('ai_chat_result');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return null;
  });

  useEffect(() => { localStorage.setItem('ai_chat_messages', JSON.stringify(intentMessages)); }, [intentMessages]);
  useEffect(() => {
    if (result) localStorage.setItem('ai_chat_result', JSON.stringify(result));
    else localStorage.removeItem('ai_chat_result');
  }, [result]);

  // ── Finance Chat state ────────────────────────────────────────────────────
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const intentEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { intentEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [intentMessages, isExtracting]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, isChatting]);

  // ── Intent Builder handlers ───────────────────────────────────────────────
  const handleClearIntent = () => {
    setIntentMessages([{ role: 'assistant', content: "Hi! I'm the PayGuard Intent Builder. Tell me what kind of payment rule you'd like to configure. For example, 'Block all international transactions above ₹4,00,000' or 'Set up a ₹4,000 recurring payment to Netflix'." }]);
    setResult(null);
  };

  const handleSaveAndDeploy = async () => {
    if (!result?.intent) return;
    setIsSaving(true);
    try {
      await createIntent(result.intent);
      handleClearIntent();
      navigate('/app/intents');
    } catch (err: any) {
      setIntentError(err.response?.data?.detail || 'Failed to save and deploy intent.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExtract = async (textToExtract = prompt) => {
    if (!textToExtract.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: textToExtract.trim() };
    setIntentMessages(prev => [...prev, userMsg]);
    setPrompt('');
    try {
      setIsExtracting(true);
      setIntentError(null);
      const data = await aiService.extractIntent(textToExtract.trim(), intentMessages);
      setResult(data);
      if (data.interpretation) {
        setIntentMessages(prev => [...prev, { role: 'assistant', content: data.interpretation }]);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to extract intent from text.';
      setIntentError(errMsg);
      setIntentMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errMsg}` }]);
    } finally {
      setIsExtracting(false);
    }
  };

  // ── Finance Chat handlers ─────────────────────────────────────────────────
  const handleChat = async (textToSend = chatInput) => {
    if (!textToSend.trim() || isChatting) return;
    const userMsg: ChatMessage = { role: 'user', content: textToSend.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);
    try {
      const data = await aiService.chat(textToSend.trim(), chatMessages);
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble reaching my AI engine. Please try again.'
      }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); }
  };
  const handleIntentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleExtract(); }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col gap-6 relative">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-app-green opacity-[0.015] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-app-red opacity-[0.015] blur-[120px] rounded-full pointer-events-none" />

      {/* Header + Tab switcher */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-editorial font-bold text-app-textPrimary tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#121110] flex items-center justify-center shadow-inner">
              <BrainCircuit className="w-5 h-5 text-app-green" />
            </div>
            AI Assistant
          </h1>
          <p className="text-app-textMuted mt-2 text-sm font-sans flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-app-green animate-pulse" />
            Your intelligent finance expert with live account access.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex items-center gap-2 bg-[#1A1918] rounded-2xl p-1.5 shadow-xl">
          <button
            onClick={() => setMode('chat')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              mode === 'chat'
                ? 'bg-gradient-to-r from-[#00E599]/20 to-[#00E599]/5 text-app-green border border-[#00E599]/20 shadow-[0_0_15px_rgba(0,229,153,0.1)]'
                : 'text-app-textMuted hover:text-app-textPrimary hover:bg-app-borderSubtle border border-transparent'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Finance Assistant
          </button>
          <button
            onClick={() => setMode('intent')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              mode === 'intent'
                ? 'bg-gradient-to-r from-[#FF2A4D]/20 to-[#FF2A4D]/5 text-app-red border border-[#FF2A4D]/20 shadow-[0_0_15px_rgba(255,42,77,0.1)]'
                : 'text-app-textMuted hover:text-app-textPrimary hover:bg-app-borderSubtle border border-transparent'
            }`}
          >
            <Zap className="w-4 h-4" />
            Intent Builder
          </button>
        </div>
      </div>

      {/* ── FINANCE ASSISTANT MODE ─────────────────────────────────────── */}
      {mode === 'chat' && (
        <div className="flex-1 min-h-0 flex flex-col relative bg-[#1A1918]/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl z-10">
          
          {chatMessages.length === 0 ? (
            /* HERO EMPTY STATE */
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
              <div className="flex flex-col items-center max-w-3xl w-full z-10 relative">
                {/* Badge */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2A2928] mb-8 shadow-lg">
                  <Sparkles className="w-4 h-4 text-[#e6b17a]" />
                  <span className="text-xs font-semibold tracking-wide text-app-textPrimary/90 font-sans uppercase">Introducing PayGuard AI</span>
                </div>

                {/* Typography */}
                <h2 className="text-5xl md:text-6xl font-editorial font-bold text-transparent bg-clip-text bg-gradient-to-b from-app-textPrimary to-white/60 text-center mb-6 leading-tight">
                  Manage your finances effortlessly
                </h2>
                <p className="text-app-textMuted text-center text-base md:text-lg font-sans mb-12 max-w-xl leading-relaxed">
                  PayGuard AI can manage your accounts, analyze transactions, and secure your payments with a few lines of prompt.
                </p>

                {/* Input Pill */}
                <div className="w-full max-w-2xl relative flex items-center bg-[#1A1918] rounded-full shadow-2xl p-2 pl-6 focus-within:shadow-[0_0_30px_rgba(0,229,153,0.15)] transition-all duration-500">
                  <Sparkles className="w-5 h-5 text-app-green shrink-0 mr-3" />
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder="How can PayGuard AI help you today?"
                    className="flex-1 bg-transparent border-none outline-none text-app-textPrimary placeholder:text-app-textMuted text-base font-sans py-3"
                  />
                  <button
                    onClick={() => handleChat()}
                    disabled={isChatting || !chatInput.trim()}
                    className="ml-2 p-3 bg-app-green hover:bg-[#00c986] text-black rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                  >
                    {isChatting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>

                {/* Quick Starters */}
                <div className="flex flex-wrap justify-center gap-3 mt-10">
                  {CHAT_STARTERS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleChat(s.prompt)}
                      className="px-5 py-2.5 bg-[#1A1918] hover:bg-[#2A2928] rounded-xl text-xs font-medium font-sans text-app-textMuted hover:text-app-textPrimary transition-all whitespace-nowrap shadow-sm"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD CHAT INTERFACE */
            <>
              {/* Chat header */}
              <div className="p-5 bg-[#1A1918]/80 backdrop-blur-md flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E599]/20 to-transparent border border-[#00E599]/20 flex items-center justify-center shadow-inner">
                    <Bot className="w-5 h-5 text-app-green" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-app-textPrimary tracking-wide">PayGuard Finance Assistant</p>
                    <p className="text-[11px] text-app-green font-medium tracking-wider uppercase mt-0.5">Live account access · Finance expert</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatMessages([])}
                  className="text-app-textMuted hover:text-app-red transition-colors p-2 rounded-xl hover:bg-app-red/10"
                  title="Clear Chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'user' ? (
                      <div className="max-w-[80%] bg-[#2A2928] text-app-textPrimary px-5 py-4 rounded-2xl rounded-tr-sm text-sm leading-relaxed font-sans whitespace-pre-wrap shadow-lg">
                        {formatMessage(msg.content)}
                      </div>
                    ) : (
                      <div className="max-w-[90%] flex items-start gap-4">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-app-green/10 border border-[#00E599]/20 flex items-center justify-center mt-1">
                          <Sparkles className="w-4 h-4 text-app-green" />
                        </div>
                        <div className="text-[#E8E5DF] text-sm leading-relaxed font-sans whitespace-pre-wrap py-2">
                          {formatMessage(msg.content)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isChatting && (
                  <div className="flex justify-start py-2 pl-12">
                    <div className="text-app-textMuted text-sm font-sans flex items-center gap-3 bg-[#1A1918] px-4 py-2 rounded-full">
                       <Loader2 className="w-4 h-4 animate-spin text-app-green" /> Processing request...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 shrink-0 bg-gradient-to-t from-[#0D0D0D] to-transparent">
                <div className="relative flex flex-col bg-[#1A1918]/80 backdrop-blur-xl rounded-2xl focus-within:shadow-[0_0_20px_rgba(0,229,153,0.15)] transition-all duration-300 overflow-hidden shadow-2xl">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder="Ask about your account, transactions, finance concepts..."
                    className="w-full bg-transparent border-none outline-none text-app-textPrimary placeholder:text-app-textMuted text-sm font-sans p-5 resize-none leading-relaxed"
                    style={{ minHeight: '100px', maxHeight: '200px' }}
                  />
                  <div className="flex items-center justify-between px-5 pb-4">
                    <div className="flex items-center gap-4 text-app-textMuted">
                       <span className="text-xs font-semibold tracking-wide uppercase font-sans flex items-center gap-1.5"><Sparkles size={14} className="text-app-green"/> Assistant Active</span>
                    </div>
                    <button
                      onClick={() => handleChat()}
                      disabled={isChatting || !chatInput.trim()}
                      className="p-2 text-black bg-app-green hover:bg-[#00c986] rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isChatting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── INTENT BUILDER MODE ────────────────────────────────────────── */}
      {mode === 'intent' && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          
          {intentError && (
            <div className="col-span-2 bg-app-red/10 border border-[#FF2A4D]/20 text-app-red px-5 py-4 rounded-2xl flex items-center gap-3 shadow-lg backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{intentError}</p>
            </div>
          )}

          {/* Chat side */}
          <div className="bg-[#1A1918]/60 backdrop-blur-xl rounded-3xl flex flex-col overflow-hidden min-h-0 shadow-2xl">
            <div className="p-5 bg-[#121110]/40 flex items-center justify-between shrink-0 shadow-sm">
              <h2 className="text-sm font-bold text-app-textPrimary uppercase tracking-widest flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-app-red/10 border border-[#FF2A4D]/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-app-red" />
                </div>
                Conversation
              </h2>
              <button onClick={handleClearIntent} className="text-app-textMuted hover:text-app-red transition-colors p-2 rounded-xl hover:bg-app-red/10" title="Clear">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {intentMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'user' ? (
                    <div className="max-w-[80%] bg-[#2A2928] text-app-textPrimary px-5 py-4 rounded-2xl rounded-tr-sm text-sm leading-relaxed font-sans whitespace-pre-wrap shadow-lg">
                      {formatMessage(msg.content)}
                    </div>
                  ) : (
                    <div className="max-w-[90%] flex items-start gap-4">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-app-red/10 border border-[#FF2A4D]/20 flex items-center justify-center mt-1">
                          <Bot className="w-4 h-4 text-app-red" />
                        </div>
                        <div className="text-[#E8E5DF] text-sm leading-relaxed font-sans whitespace-pre-wrap py-2">
                          {formatMessage(msg.content)}
                        </div>
                      </div>
                  )}
                </div>
              ))}
              {isExtracting && (
                <div className="flex justify-start py-2 pl-12">
                  <div className="text-app-textMuted text-sm font-sans flex items-center gap-3 bg-[#121110] px-4 py-2 rounded-full shadow-inner">
                     <Loader2 className="w-4 h-4 animate-spin text-app-red" /> Generating contract...
                  </div>
                </div>
              )}
              <div ref={intentEndRef} />
            </div>

            <div className="p-6 bg-gradient-to-t from-[#0D0D0D] to-transparent shrink-0">
              {intentMessages.length === 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Send ₹40,000 to John Doe for marketing', 'Block all international transactions above ₹4,00,000'].map((s, i) => (
                    <button key={i} onClick={() => handleExtract(s)}
                      className="text-xs bg-[#1A1918] hover:bg-[#2A2928] text-app-textMuted hover:text-app-textPrimary px-4 py-2 rounded-xl transition-all font-sans shadow-sm">
                      "{s}"
                    </button>
                  ))}
                </div>
              )}
              <div className="relative flex flex-col bg-[#121110]/80 backdrop-blur-xl rounded-2xl focus-within:shadow-[0_0_20px_rgba(255,42,77,0.15)] transition-all duration-300 overflow-hidden shadow-2xl">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleIntentKeyDown}
                  placeholder="Describe your payment rule..."
                  className="w-full bg-transparent border-none outline-none text-app-textPrimary placeholder:text-app-textMuted text-sm font-sans p-5 resize-none leading-relaxed"
                  style={{ minHeight: '100px', maxHeight: '200px' }}
                />
                <div className="flex items-center justify-between px-5 pb-4">
                  <div className="flex items-center gap-4 text-app-textMuted">
                     <span className="text-xs font-semibold tracking-wide uppercase font-sans flex items-center gap-1.5"><Sparkles size={14} className="text-app-red"/> Intent Engine</span>
                  </div>
                  <button
                    onClick={() => handleExtract()}
                    disabled={isExtracting || !prompt.trim()}
                    className="p-2 text-app-textPrimary bg-app-red hover:bg-[#ff3b5c] rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isExtracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Result side */}
          <div className="bg-[#1A1918]/60 backdrop-blur-xl rounded-3xl flex flex-col overflow-hidden min-h-0 shadow-2xl relative group">
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-app-textPrimary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="p-5 bg-[#121110]/40 flex items-center justify-between shrink-0 relative z-10 shadow-sm">
              <h2 className="text-sm font-bold text-app-textPrimary uppercase tracking-widest flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#121110] flex items-center justify-center shadow-inner">
                  <Code className="w-4 h-4 text-app-textMuted" />
                </div>
                Extracted Intent Contract
              </h2>
              {result?.intent && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-md bg-app-green/10 text-app-green font-sans border border-[#00E599]/20 shadow-sm">
                  READY TO DEPLOY
                </span>
              )}
            </div>

            <div className="flex-1 bg-app-primary/80 p-6 overflow-auto font-mono text-sm leading-relaxed relative z-10">
              {!result?.intent ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-app-textMuted p-8 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-app-textPrimary/[0.03] to-transparent">
                  <Code className="w-16 h-16 mb-6 opacity-20" />
                  <p className="font-sans text-base text-app-textPrimary/40">Chat with the Intent Builder to generate a structured rule.</p>
                  <p className="text-sm mt-2 opacity-40 font-sans max-w-sm">The final JSON contract will appear here once the AI has enough context.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <pre className="text-app-textMuted whitespace-pre-wrap bg-[#1A1918] rounded-2xl p-6 shadow-inner">
                    <span className="text-[#FF7B72]">{'{'}</span>{'\n'}
                    {Object.entries(result.intent).map(([key, value], idx, arr) => {
                      if (value === undefined || value === null) return null;
                      return (
                        <React.Fragment key={key}>
                          {'  '}<span className="text-[#79C0FF]">"{key}"</span>:{' '}
                          {typeof value === 'string'
                            ? <span className="text-[#A5D6FF]">"{value}"</span>
                            : <span className="text-[#D2A8FF]">{JSON.stringify(value)}</span>
                          }{idx < arr.length - 1 ? ',' : ''}{'\n'}
                        </React.Fragment>
                      );
                    })}
                    <span className="text-[#FF7B72]">{'}'}</span>
                  </pre>

                  <button
                    onClick={handleSaveAndDeploy}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-[#FF2A4D] to-[#FF5570] hover:from-[#ff3b5c] hover:to-[#ff6b82] text-app-textPrimary font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_0_30px_rgba(255,42,77,0.3)] hover:shadow-[0_0_40px_rgba(255,42,77,0.5)] transform hover:-translate-y-0.5"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Deploying Rule...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Save & Deploy Rule
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
