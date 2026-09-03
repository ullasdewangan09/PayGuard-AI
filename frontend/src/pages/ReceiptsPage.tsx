import React, { useState, useEffect } from 'react';
import { getTransactions } from '../services/api';
import { Loader2, Receipt, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';

export const ReceiptsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const txData = await getTransactions();
        // Filter only captured payments for receipts
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

  const createPdfDoc = async (payment: any) => {
    const doc = new jsPDF();
    const dateStr = new Date(payment.created_at).toLocaleDateString();
    const orderNo = payment.id?.split('_')[1]?.substring(0,8) || payment.id?.substring(0,8) || 'N/A';
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("RECEIPT", 14, 22);

    doc.setFontSize(14);
    doc.text("PAYGUARD AI", 14, 32);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Date : ${dateStr}`, 14, 40);
    doc.text(`Order No : ${orderNo}`, 14, 46);
    doc.text(`Payment Method : Secure AI Transaction`, 14, 52);

    doc.setDrawColor(0);
    doc.circle(180, 32, 15, "S");
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("&", 177, 34);
    doc.setFontSize(8);
    doc.text("Logo Here", 172, 40);

    const items = payment.items || [{ name: "Secure Payment", quantity: 1, unit_price: payment.total_amount }];
    const tableData = items.map((item: any) => [
      item.name,
      item.quantity,
      `INR ${item.unit_price}`,
      `INR ${(item.quantity * item.unit_price).toFixed(2)}`
    ]);

    const autoTable = (await import('jspdf-autotable')).default;
    autoTable(doc, {
      startY: 65,
      head: [['Item', 'Quantity', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'plain',
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.1, lineColor: [200, 200, 200] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "normal");
    doc.text("Subtotal", 140, finalY);
    doc.text(`INR ${payment.total_amount}`, 170, finalY);
    
    doc.text("Tax (0%)", 140, finalY + 6);
    doc.text(`INR 0.00`, 170, finalY + 6);

    doc.line(140, finalY + 10, 195, finalY + 10);

    doc.setFont("helvetica", "bold");
    doc.text("Total", 140, finalY + 16);
    doc.text(`INR ${payment.total_amount}`, 170, finalY + 16);

    doc.setFont("helvetica", "normal");
    doc.text("f yourfacebook", 14, 250);
    doc.text("ig yourinstagram", 14, 256);
    doc.text("t yourtiktok", 14, 262);
    doc.text("e email@yourwebsite.com", 14, 268);
    
    doc.text("www.payguard.ai", 80, 280);

    doc.setFont("times", "italic");
    doc.setFontSize(24);
    doc.text("Thank you!", 140, 265);
    
    return doc;
  };

  const handleDownload = async (payment: any) => {
    try {
      const doc = await createPdfDoc(payment);
      doc.save(`Receipt_${payment.id}.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF", e);
    }
  };

  const handlePrint = async (payment: any) => {
    try {
      const doc = await createPdfDoc(payment);
      doc.autoPrint();
      const pdfUrl = doc.output('bloburl');
      window.open(pdfUrl, '_blank');
    } catch (e) {
      console.error("Failed to print PDF", e);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-editorial font-bold mb-1">Receipts</h1>
          <p className="text-app-textMuted font-mono text-sm">Digital receipts for all captured payments.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-app-textMuted font-mono flex flex-col items-center">
          <Loader2 className="w-6 h-6 animate-spin text-app-green mb-4" />
          Loading receipts...
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-[#1A1918] shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-12 text-center flex flex-col items-center justify-center h-64">
          <Receipt className="w-12 h-12 text-app-textPrimary/10 mb-4" />
          <p className="text-app-textPrimary font-mono text-lg mb-2">No Receipts Found</p>
          <p className="text-app-textMuted text-sm">
            Complete a payment to generate a receipt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {payments.map((payment) => (
            <div key={payment.id} className="relative group">
              {/* The slot overlay to look like it's coming out of a machine */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-[#1A1918] rounded-b-xl shadow-inner z-10 mx-2 border-b-2 border-[#121110]/50"></div>
              
              <div className="bg-[#EAE8E3] text-black rounded-b-md mx-4 mt-2 p-6 relative shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-shadow flex flex-col min-h-[400px]">
                
                <div className="text-center mb-6 pt-4">
                  <h2 className="font-mono font-bold text-2xl tracking-widest text-gray-800">RECEIPT</h2>
                </div>

                <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

                <div className="flex-1 space-y-2 text-sm font-mono text-gray-700">
                  {/* Items List */}
                  {(payment.items || [{name: "Secure Payment", quantity: 1, unit_price: payment.total_amount}]).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₹ {(item.quantity * item.unit_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-end">
                    <span className="font-mono font-bold text-gray-800">TOTAL AMOUNT</span>
                    <span className="font-mono font-bold text-lg text-gray-900">
                      ₹ {payment.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

                <div className="text-center mt-6 mb-4">
                  <h3 className="font-mono font-bold text-xl text-gray-800 tracking-wider">THANK YOU</h3>
                </div>

                {/* Barcode simulation */}
                <div className="flex justify-center items-center h-12 w-full opacity-70 mt-4 mb-4">
                  <div className="w-full h-10 bg-[repeating-linear-gradient(to_right,black,black_2px,transparent_2px,transparent_4px,black_4px,black_5px,transparent_5px,transparent_8px,black_8px,black_10px,transparent_10px,transparent_12px)]"></div>
                </div>

                {/* Receipt edge styling (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSI4Ij48cGF0aCBkPSJNMCA4IEwxMCAwIEwyMCA4IFoiIGZpbGw9IiMxMjExMTAiLz48L3N2Zz4=')] bg-repeat-x"></div>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                  <button 
                    onClick={() => handleDownload(payment)}
                    className="p-4 bg-white text-black rounded-full shadow-xl hover:bg-gray-100 transition-colors transform hover:scale-105"
                    title="Download PDF"
                  >
                    <Download size={20} />
                  </button>
                  <button 
                    onClick={() => handlePrint(payment)}
                    className="p-4 bg-white text-black rounded-full shadow-xl hover:bg-gray-100 transition-colors transform hover:scale-105"
                    title="Print Receipt"
                  >
                    <Printer size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
