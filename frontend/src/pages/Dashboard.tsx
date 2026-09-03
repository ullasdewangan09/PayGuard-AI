import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTransactions, getIntents } from '../services/api';
import { Activity, ShieldCheck, ShieldAlert, FileCode2, ArrowRight, Server, Wallet, FileWarning } from 'lucide-react';
import { InsightCard } from '../components/ui/insight-card';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    approved: 0,
    blocked: 0,
    ask: 0,
    activeIntents: 0,
    totalVolume: 0,
  });
  
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txs, intents] = await Promise.all([
          getTransactions(0, 100),
          getIntents()
        ]);

        const approved = txs.filter((t: any) => t.decision === 'APPROVE').length;
        const blocked = txs.filter((t: any) => t.decision === 'BLOCK').length;
        const ask = txs.filter((t: any) => t.decision === 'ASK').length;
        
        const totalVolume = txs
          .filter((t: any) => t.decision === 'APPROVE' || t.payment_status === 'CAPTURED')
          .reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0);

        setStats({
          totalTransactions: txs.length,
          approved,
          blocked,
          ask,
          activeIntents: intents.length,
          totalVolume,
        });

        // Get 5 most recent transactions
        setRecentTransactions(txs.slice(0, 5));

        // Group transactions by date for the chart
        const dateGroups: Record<string, { approved: number, blocked: number, ask: number }> = {};
        
        txs.forEach((t: any) => {
          const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!dateGroups[date]) {
            dateGroups[date] = { approved: 0, blocked: 0, ask: 0 };
          }
          if (t.decision === 'APPROVE') dateGroups[date].approved += 1;
          else if (t.decision === 'BLOCK') dateGroups[date].blocked += 1;
          else if (t.decision === 'ASK') dateGroups[date].ask += 1;
        });

        let formattedChartData = Object.keys(dateGroups).map(date => ({
          name: date,
          Approved: dateGroups[date].approved,
          Blocked: dateGroups[date].blocked,
          Review: dateGroups[date].ask
        })).reverse(); 

        // Fix Recharts bug: AreaChart needs at least 2 points to draw a curve
        if (formattedChartData.length === 1) {
          const singleDateStr = formattedChartData[0].name;
          const fakeDate = new Date(`${singleDateStr} 2026`); 
          fakeDate.setDate(fakeDate.getDate() - 1);
          const dummyDate = fakeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          formattedChartData = [
            { name: dummyDate, Approved: 0, Blocked: 0, Review: 0 },
            ...formattedChartData
          ];
        }

        setChartData(formattedChartData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12 animate-in fade-in duration-500 max-w-7xl mx-auto px-8 w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8">
        <motion.div variants={itemVariants}>
          <h1 className="font-editorial text-4xl font-bold tracking-tight mb-2 text-white">System Overview</h1>
          <p className="text-[#A3A09A] font-mono text-sm">Real-time metrics for PayGuard AI authorization runtime.</p>
        </motion.div>
        

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Processed" 
          value={stats.totalVolume.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })} 
          icon={Wallet} 
          color="text-[#F2EFE9]" 
        />
        <StatCard 
          title="Active Intents" 
          value={stats.activeIntents} 
          icon={FileCode2} 
          color="text-blue-400" 
        />
        <StatCard 
          title="Approved" 
          value={stats.approved} 
          icon={ShieldCheck} 
          color="text-[#00E599]" 
        />
        <StatCard 
          title="Flagged (Ask/Block)" 
          value={stats.blocked + stats.ask} 
          icon={ShieldAlert} 
          color="text-[#FF2A4D]" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col min-h-[450px]">
          {isLoading ? (
            <div className="rounded-3xl p-6 flex-1 flex flex-col items-center justify-center text-[#A3A09A] bg-[#1A1918] shadow-2xl">
              <Activity className="w-8 h-8 animate-pulse text-[#00E599] mb-4" />
              <p className="font-mono text-sm">Loading telemetry...</p>
            </div>
          ) : chartData.length > 0 ? (
            <InsightCard 
              className="flex-1 bg-[#1A1918] shadow-2xl"
              title="Authorization Volume"
              data={chartData}
              xAxisKey="name"
              series={[
                { key: 'Approved', name: 'Approved', color: '#00E599' },
                { key: 'Blocked', name: 'Blocked', color: '#FF2A4D' },
                { key: 'Review', name: 'Review', color: '#F59E0B' }
              ]}
              metrics={[
                {
                  label: "Approval Rate",
                  value: stats.totalTransactions > 0 ? `${((stats.approved / stats.totalTransactions) * 100).toFixed(1)}%` : '0%',
                  trend: "up",
                  trendType: "good",
                  icon: <ShieldCheck className="w-4 h-4 text-[#00E599]" />
                },
                {
                  label: "Requires Review",
                  value: stats.ask.toString(),
                  trend: "up",
                  trendType: "warning",
                  icon: <FileWarning className="w-4 h-4 text-[#F59E0B]" />
                }
              ]}
            />
          ) : (
            <div className="rounded-3xl p-6 flex-1 flex flex-col items-center justify-center text-[#6B6965] bg-[#1A1918] shadow-2xl">
              <Activity size={32} className="mb-2 opacity-50" />
              <p className="font-mono text-sm">No telemetry data available</p>
            </div>
          )}
        </motion.div>
        
        {/* Recent Transactions List */}
        <motion.div variants={itemVariants} className="rounded-3xl p-6 flex flex-col lg:col-span-1 shadow-2xl bg-[#1A1918]">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <div>
              <h3 className="font-editorial text-xl font-bold text-white">Recent Activity</h3>
              <p className="text-sm font-mono text-[#A3A09A]">Latest AI evaluations</p>
            </div>
            <a href="/app/transactions" className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-[#A3A09A] hover:text-white bg-[#1A1918] border border-white/5">
              <ArrowRight size={16} />
            </a>
          </div>

          <motion.div variants={containerVariants} className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
            {isLoading ? (
              <p className="text-center font-mono text-sm text-[#A3A09A] mt-10">Loading activity...</p>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <motion.div 
                  variants={itemVariants}
                  key={tx.id} 
                  className={`group flex justify-between items-center p-4 rounded-xl bg-[#1A1918] border transition-all cursor-pointer relative overflow-hidden shadow-sm ${
                    tx.decision === 'APPROVE' ? 'border-transparent hover:border-[#00E599]/30 hover:bg-[#00E599]/5' :
                    tx.decision === 'BLOCK' ? 'border-transparent hover:border-[#FF2A4D]/30 hover:bg-[#FF2A4D]/5' :
                    'border-transparent hover:border-[#F59E0B]/30 hover:bg-[#F59E0B]/5'
                  }`}
                  onClick={() => window.location.href = '/app/transactions'}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                    tx.decision === 'APPROVE' ? 'bg-gradient-to-b from-transparent via-[#00E599]/50 to-transparent' :
                    tx.decision === 'BLOCK' ? 'bg-gradient-to-b from-transparent via-[#FF2A4D]/50 to-transparent' :
                    'bg-gradient-to-b from-transparent via-[#F59E0B]/50 to-transparent'
                  }`} />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`p-2.5 rounded-xl flex items-center justify-center shadow-inner ${
                      tx.decision === 'APPROVE' 
                        ? 'bg-[#00E599]/10 text-[#00E599] border border-[#00E599]/20' 
                        : tx.decision === 'BLOCK' 
                        ? 'bg-[#FF2A4D]/10 text-[#FF2A4D] border border-[#FF2A4D]/20'
                        : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                    }`}>
                      {tx.decision === 'APPROVE' ? <ShieldCheck size={18} /> : 
                       tx.decision === 'BLOCK' ? <ShieldAlert size={18} /> : 
                       <FileWarning size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-white group-hover:text-white/80 transition-colors">
                          {tx.decision === 'ASK' ? 'Review Required' : 'Secure Payment'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded tracking-wider font-bold ${
                          tx.decision === 'APPROVE' ? 'bg-[#00E599]/20 text-[#00E599]' : 
                          tx.decision === 'BLOCK' ? 'bg-[#FF2A4D]/20 text-[#FF2A4D]' :
                          'bg-[#F59E0B]/20 text-[#F59E0B]'
                        }`}>
                          {tx.decision === 'APPROVE' ? 'VERIFIED' : 
                           tx.decision === 'BLOCK' ? 'BLOCKED' : 
                           'FLAGGED'}
                        </span>
                        <p className="text-xs text-[#A3A09A] font-mono">{tx.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="text-sm font-mono font-bold text-white">{(tx.total_amount || 0).toLocaleString('en-IN', { style: 'currency', currency: tx.currency || 'INR', maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-[#A3A09A] mt-1 font-mono">
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-[#6B6965] font-mono mt-10">No recent activity</p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => {
  const chartColorHex = color.includes('text-[#00E599]') ? '#00E599' : color.includes('text-[#FF2A4D]') ? '#FF2A4D' : color.includes('text-blue-400') ? '#60A5FA' : '#F2EFE9';
  const filterId = `glow-${title.replace(/\s+/g, '')}`;
  const gradientId = `grad-${title.replace(/\s+/g, '')}`;
  
  // Perfectly looping cubic bezier path simulating analytics data
  const pathD = `M 0 20 C 15 20, 15 5, 30 12 C 45 19, 50 26, 70 20 C 85 14, 90 20, 100 20 C 115 20, 115 5, 130 12 C 145 19, 150 26, 170 20 C 185 14, 190 20, 200 20`;

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="p-6 rounded-3xl relative overflow-hidden group transition-all bg-[#1A1918] shadow-xl hover:shadow-2xl hover:bg-[#1f1e1d]"
    >
      {/* Animated Scrolling Line Graph Background */}
      <div className="absolute bottom-0 left-0 right-0 h-[50%] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full overflow-hidden">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColorHex} stopOpacity="0.4" />
              <stop offset="100%" stopColor={chartColorHex} stopOpacity="0" />
            </linearGradient>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <motion.g
            initial={{ x: 0 }}
            animate={{ x: -100 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <path
              d={`${pathD} L200,30 L0,30 Z`}
              fill={`url(#${gradientId})`}
            />
            <path
              d={pathD}
              fill="none"
              stroke={chartColorHex}
              strokeWidth="1.5"
              strokeLinecap="round"
              filter={`url(#${filterId})`}
            />
          </motion.g>
        </svg>
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-[#A3A09A] font-mono text-xs uppercase tracking-wider mb-2 font-medium">{title}</p>
          <p className={`text-4xl font-editorial font-bold ${color.includes('text-[#00E599]') ? 'text-[#00E599]' : color.includes('text-[#FF2A4D]') ? 'text-[#FF2A4D]' : 'text-white'}`}>{value}</p>
        </div>
        <div className={`p-4 rounded-2xl bg-[#1A1918] border border-white/5 shadow-inner ${color}`}>
          <Icon size={24} />
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};
