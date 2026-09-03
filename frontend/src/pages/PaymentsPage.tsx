import React, { useState, useEffect } from 'react';
import { getTransactions } from '../services/api';
import { BeamSearch } from '../components/ui/beam-components';
import { Loader2, CheckCircle, ArrowUpRight, DollarSign } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const txData = await getTransactions();
        // Filter only captured payments
        const captured = txData.filter((tx: any) => tx.payment_status === 'CAPTURED');
        setPayments(captured);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p =>
    !searchQuery ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.total_amount).includes(searchQuery)
  );

  const totalRevenue = payments.reduce((sum, p) => sum + (p.total_amount || 0), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-editorial font-bold mb-1">Payments Ledger</h1>
          <p className="text-app-textMuted font-mono text-sm">Successfully captured transactions.</p>
        </div>
        
        <div className="text-right">
          <div className="text-app-textMuted font-mono text-xs uppercase tracking-wider mb-1">Total Captured</div>
          <div className="text-2xl font-mono text-app-green flex items-center gap-1 justify-end">
            <DollarSign size={20} />
            {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-[#1A1918] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
        <div className="p-4 flex items-center justify-between bg-[#121110] shadow-md">
          <div className="w-96">
            <BeamSearch
              placeholder="Search payments..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-app-textMuted font-mono flex flex-col items-center">
            <Loader2 className="w-6 h-6 animate-spin text-app-green mb-4" />
            Loading ledger...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center h-64">
            <CheckCircle className="w-12 h-12 text-app-textPrimary/10 mb-4" />
            <p className="text-app-textPrimary font-mono text-lg mb-2">No Payments Found</p>
            <p className="text-app-textMuted text-sm">
              Successfully captured transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#121110] shadow-md z-10">
                <tr className="border-b border-[#1f1e1d]">
                  <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">PAYMENT ID</th>
                  <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">AMOUNT</th>
                  <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">METHOD</th>
                  <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">STATUS</th>
                  <th className="p-4 text-xs font-mono text-app-textMuted font-normal tracking-wider">DATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr 
                    key={payment.id} 
                    className="border-b border-[#1f1e1d] hover:bg-[#1f1e1d] transition-colors group cursor-pointer"
                  >
                    <td className="p-4 font-mono text-sm text-app-textPrimary flex items-center gap-2">
                      {payment.id.split('_')[1]}
                      <ArrowUpRight size={14} className="text-app-textMuted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                    <td className="p-4 font-mono text-sm text-app-textPrimary">
                      {payment.currency} {payment.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 font-mono text-sm text-app-textPrimary capitalize">
                      Razorpay Checkout
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono tracking-wider font-bold bg-[#00E599] text-[#121110] shadow-[0_0_10px_rgba(0,229,153,0.3)]">
                        <CheckCircle size={12} />
                        CAPTURED
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-app-textMuted">
                      {new Date(payment.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
