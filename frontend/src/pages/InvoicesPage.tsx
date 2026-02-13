import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, FileText, IndianRupee, 
  CheckCircle, Clock, AlertCircle, XCircle,
  ChevronDown, ChevronUp, Send, Eye
} from 'lucide-react';
import { clsx } from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Invoice {
  id: string;
  invoice_number: string;
  job_card_id: string;
  customer_name: string;
  customer_gstin?: string;
  tax_type: 'CGST_SGST' | 'IGST';
  total_taxable_value: number;
  total_tax_amount: number;
  grand_total: number;
  amount?: number;
  total_amount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  due_date?: string;
  generated_at?: string;
  created_at?: string;
  items?: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  item_type: 'PART' | 'LABOR' | 'MG_ADJUSTMENT';
  description: string;
  hsn_sac_code: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  taxable_value: number;
  tax_amount: number;
  total_amount: number;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  DRAFT: { bg: 'bg-gray-500/10', text: 'text-gray-400', icon: <Clock className="w-4 h-4" /> },
  SENT: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: <Send className="w-4 h-4" /> },
  PAID: { bg: 'bg-green-500/10', text: 'text-green-400', icon: <CheckCircle className="w-4 h-4" /> },
  OVERDUE: { bg: 'bg-red-500/10', text: 'text-red-400', icon: <AlertCircle className="w-4 h-4" /> },
  CANCELLED: { bg: 'bg-gray-500/10', text: 'text-gray-500', icon: <XCircle className="w-4 h-4" /> },
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', '50');
      
      const response = await fetch(`${API_URL}/api/invoices?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data || data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (invoiceId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/invoices/${invoiceId}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const markAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/invoices/${invoiceId}/mark-paid`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error marking invoice paid:', error);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.invoice_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inv.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number | undefined) => {
    const value = amount || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const getGrandTotal = (inv: Invoice) => {
    return inv.grand_total || inv.total_amount || (inv.amount || 0) + (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0);
  };

  const getTaxableValue = (inv: Invoice) => inv.total_taxable_value || inv.amount || 0;
  const getTaxAmount = (inv: Invoice) => inv.total_tax_amount || ((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0));

  // Calculate totals
  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
    .reduce((sum, inv) => sum + getGrandTotal(inv), 0);
  const totalPaid = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + getGrandTotal(inv), 0);
  const overdueCount = invoices.filter(inv => inv.status === 'OVERDUE').length;
  const draftCount = invoices.filter(inv => inv.status === 'DRAFT').length;

  return (
    <div className="p-6 space-y-6" data-testid="invoices-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Invoices</h1>
          <p className="text-text-secondary text-sm mt-1">
            GST-compliant invoice management
          </p>
        </div>
        <button
          onClick={() => navigate('/chat?action=create_invoice')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-hover transition-colors"
          data-testid="create-invoice-btn"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Outstanding"
          value={formatCurrency(totalOutstanding)}
          icon={<IndianRupee className="w-5 h-5" />}
          color="orange"
        />
        <SummaryCard
          label="Paid This Month"
          value={formatCurrency(totalPaid)}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <SummaryCard
          label="Overdue"
          value={overdueCount.toString()}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
        <SummaryCard
          label="Draft Invoices"
          value={draftCount.toString()}
          icon={<Clock className="w-5 h-5" />}
          color="gray"
        />
      </div>

      {/* Filters */}
      <div className="bg-background-alt rounded-xl p-4 border border-border flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by invoice number or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-orange/50"
            data-testid="search-input"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-brand-orange/50"
          data-testid="status-filter"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-text-secondary">
            <Clock className="w-8 h-8 mx-auto mb-3 animate-pulse text-text-muted" />
            Loading invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-background-alt rounded-xl p-12 border border-border text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-40" />
            <p className="text-text-secondary">No invoices found</p>
            <p className="text-text-muted text-sm mt-1">Create your first invoice to get started</p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => {
            const statusStyle = STATUS_STYLES[invoice.status] || STATUS_STYLES.DRAFT;
            const isExpanded = expandedInvoice === invoice.id;

            return (
              <div
                key={invoice.id}
                className="bg-background-alt rounded-xl border border-border overflow-hidden"
              >
                {/* Invoice Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface transition-colors"
                  onClick={() => setExpandedInvoice(isExpanded ? null : invoice.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", statusStyle.bg, statusStyle.text)}>
                      {statusStyle.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{invoice.invoice_number}</span>
                        <span className={clsx("px-2 py-0.5 rounded-full text-xs", statusStyle.bg, statusStyle.text)}>
                          {invoice.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted">{invoice.customer_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-text-primary">
                        {formatCurrency(getGrandTotal(invoice))}
                      </p>
                      <p className="text-xs text-text-muted">
                        {invoice.tax_type === 'CGST_SGST' ? 'CGST/SGST' : 'IGST'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {invoice.status === 'SENT' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsPaid(invoice.id); }}
                          className="px-3 py-1.5 bg-green-500/10 text-green-400 text-sm rounded-lg hover:bg-green-500/20 transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); downloadPDF(invoice.id); }}
                        className="p-2 text-text-muted hover:bg-surface rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-muted" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border p-4">
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-text-secondary mb-2">Customer Details</h4>
                        <p className="text-sm text-text-primary">{invoice.customer_name}</p>
                        {invoice.customer_gstin && (
                          <p className="text-sm text-text-muted">GSTIN: {invoice.customer_gstin}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-text-secondary mb-2">Invoice Details</h4>
                        <p className="text-sm text-text-primary">
                          Generated: {invoice.generated_at ? new Date(invoice.generated_at).toLocaleDateString() : 'N/A'}
                        </p>
                        {invoice.due_date && (
                          <p className="text-sm text-text-muted">
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <thead className="bg-surface">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase">Description</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase">HSN/SAC</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-text-muted uppercase">Qty</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-text-muted uppercase">Rate</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-text-muted uppercase">GST</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-text-muted uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {invoice.items?.map((item) => (
                            <tr key={item.id}>
                              <td className="px-3 py-2 text-text-primary">
                                <span className="text-xs px-1.5 py-0.5 bg-surface rounded mr-2 text-text-muted">
                                  {item.item_type}
                                </span>
                                {item.description}
                              </td>
                              <td className="px-3 py-2 text-text-muted">{item.hsn_sac_code}</td>
                              <td className="px-3 py-2 text-right text-text-primary">{item.quantity}</td>
                              <td className="px-3 py-2 text-right text-text-primary">{formatCurrency(item.unit_price)}</td>
                              <td className="px-3 py-2 text-right text-text-muted">{item.gst_rate}%</td>
                              <td className="px-3 py-2 text-right font-medium text-text-primary">
                                {formatCurrency(item.total_amount)}
                              </td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan={6} className="px-3 py-4 text-center text-text-muted">
                                No line items
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="bg-surface">
                          <tr>
                            <td colSpan={5} className="px-3 py-2 text-right text-text-secondary">
                              Taxable Value:
                            </td>
                            <td className="px-3 py-2 text-right text-text-primary">
                              {formatCurrency(getTaxableValue(invoice))}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={5} className="px-3 py-2 text-right text-text-secondary">
                              Tax Amount:
                            </td>
                            <td className="px-3 py-2 text-right text-text-primary">
                              {formatCurrency(getTaxAmount(invoice))}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={5} className="px-3 py-2 text-right font-bold text-text-primary">
                              Grand Total:
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-brand-orange text-lg">
                              {formatCurrency(getGrandTotal(invoice))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Summary Card Component
const SummaryCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'orange' | 'green' | 'red' | 'gray';
}> = ({ label, value, icon, color }) => {
  const colorStyles = {
    orange: { bg: 'bg-brand-orange/10', text: 'text-brand-orange' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400' },
    gray: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
  };
  const styles = colorStyles[color];

  return (
    <div className="bg-background-alt rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-muted text-sm">{label}</p>
          <p className={clsx("text-2xl font-bold mt-1", styles.text)}>{value}</p>
        </div>
        <div className={clsx("p-3 rounded-lg", styles.bg, styles.text)}>
          {icon}
        </div>
      </div>
    </div>
  );
};
