import React, { useState, useEffect } from 'react';
import { 
  Truck, Plus, Search, TrendingUp, TrendingDown, 
  Calendar, FileText, DollarSign, MapPin, X,
  ChevronRight, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || '';

interface MGContract {
  id: string;
  fleet_name: string;
  contract_start_date: string;
  contract_end_date: string;
  assured_km_per_year: number;
  rate_per_km: number;
  excess_rate_per_km?: number;
  billing_cycle_months: number;
  is_active: boolean;
}

interface VehicleLog {
  id: string;
  vehicle_reg_number: string;
  billing_month: string;
  opening_odometer: number;
  closing_odometer: number;
  actual_km_run: number;
  assured_km_quota: number;
  billable_amount: number;
  status: 'PENDING' | 'CALCULATED' | 'INVOICED' | 'DISPUTED';
}

interface MGReport {
  contract: MGContract;
  summary: {
    total_vehicles: number;
    total_km_run: number;
    total_billed_amount: number;
    log_entries: number;
  };
  vehicle_logs: VehicleLog[];
}

// Mock monthly data for chart
const generateMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    month,
    km: Math.floor(Math.random() * 5000) + 8000,
    revenue: Math.floor(Math.random() * 50000) + 80000,
  }));
};

export default function MGFleetPage() {
  const [contracts, setContracts] = useState<MGContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<MGContract | null>(null);
  const [contractReport, setContractReport] = useState<MGReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [monthlyData] = useState(generateMonthlyData);

  // New contract form
  const [newContract, setNewContract] = useState({
    fleet_name: '',
    contract_start_date: '',
    contract_end_date: '',
    assured_km_per_year: 12000,
    rate_per_km: 10.5,
    excess_rate_per_km: 15.0,
    billing_cycle_months: 1
  });

  // New log form
  const [newLog, setNewLog] = useState({
    vehicle_reg_number: '',
    billing_month: '',
    opening_odometer: 0,
    closing_odometer: 0,
    notes: ''
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/mg/contracts`);
      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts || []);
      }
    } catch (error) {
      console.error('Error fetching MG contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContractReport = async (contractId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/mg/reports/${contractId}`);
      if (response.ok) {
        const data = await response.json();
        setContractReport(data);
      }
    } catch (error) {
      console.error('Error fetching MG report:', error);
    }
  };

  const handleCreateContract = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mg/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContract)
      });

      if (response.ok) {
        setShowNewModal(false);
        setNewContract({
          fleet_name: '',
          contract_start_date: '',
          contract_end_date: '',
          assured_km_per_year: 12000,
          rate_per_km: 10.5,
          excess_rate_per_km: 15.0,
          billing_cycle_months: 1
        });
        fetchContracts();
      }
    } catch (error) {
      console.error('Error creating contract:', error);
    }
  };

  const handleCreateLog = async () => {
    if (!selectedContract) return;
    try {
      const response = await fetch(`${API_URL}/api/mg/vehicle-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLog,
          contract_id: selectedContract.id
        })
      });

      if (response.ok) {
        setShowLogModal(false);
        setNewLog({
          vehicle_reg_number: '',
          billing_month: '',
          opening_odometer: 0,
          closing_odometer: 0,
          notes: ''
        });
        fetchContractReport(selectedContract.id);
      }
    } catch (error) {
      console.error('Error creating vehicle log:', error);
    }
  };

  const selectContract = (contract: MGContract) => {
    setSelectedContract(contract);
    fetchContractReport(contract.id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);

  // Calculate utilization percentage
  const calculateUtilization = (contract: MGContract) => {
    if (!contractReport?.summary) return 0;
    const monthsElapsed = 6; // Mock: 6 months
    const expectedKm = (contract.assured_km_per_year / 12) * monthsElapsed;
    return Math.min((contractReport.summary.total_km_run / expectedKm) * 100, 150);
  };

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
          <p className="text-text-secondary text-xs mb-1">{label}</p>
          <p className="text-text-primary font-semibold">{formatNumber(payload[0].value)} km</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6" data-testid="mg-fleet-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">MG Fleet Management</h1>
          <p className="text-text-secondary text-sm mt-1">
            Minimum Guarantee contracts and fleet billing
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-hover transition-colors"
          data-testid="new-contract-btn"
        >
          <Plus className="w-4 h-4" />
          New Contract
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contracts List */}
        <div className="lg:col-span-1">
          <div className="bg-background-alt rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-text-primary">Contracts</h2>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-text-muted">
                <Clock className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                Loading...
              </div>
            ) : contracts.length === 0 ? (
              <div className="p-6 text-center">
                <Truck className="w-10 h-10 mx-auto mb-2 text-text-muted opacity-40" />
                <p className="text-sm text-text-muted">No contracts found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {contracts.map((contract) => {
                  const utilization = selectedContract?.id === contract.id ? calculateUtilization(contract) : 0;
                  
                  return (
                    <button
                      key={contract.id}
                      onClick={() => selectContract(contract)}
                      className={clsx(
                        "w-full p-4 text-left hover:bg-surface transition-colors",
                        selectedContract?.id === contract.id && "bg-brand-orange/5 border-l-2 border-brand-orange"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-text-primary">{contract.fleet_name}</span>
                        <span className={clsx(
                          "text-xs px-2 py-0.5 rounded-full",
                          contract.is_active 
                            ? "bg-green-500/10 text-green-400" 
                            : "bg-gray-500/10 text-gray-400"
                        )}>
                          {contract.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="text-sm text-text-muted space-y-1">
                        <p>₹{contract.rate_per_km}/km</p>
                        <p>{formatNumber(contract.assured_km_per_year)} km/year</p>
                      </div>
                      
                      {/* Utilization bar for selected */}
                      {selectedContract?.id === contract.id && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-text-muted">Utilization</span>
                            <span className={clsx(
                              "font-medium",
                              utilization < 80 && "text-green-400",
                              utilization >= 80 && utilization < 95 && "text-yellow-400",
                              utilization >= 95 && "text-red-400"
                            )}>
                              {utilization.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                            <div
                              className={clsx(
                                "h-full rounded-full transition-all",
                                utilization < 80 && "bg-green-500",
                                utilization >= 80 && utilization < 95 && "bg-yellow-500",
                                utilization >= 95 && "bg-red-500"
                              )}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Contract Details */}
        <div className="lg:col-span-2">
          {selectedContract ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              {contractReport?.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Vehicles"
                    value={contractReport.summary.total_vehicles.toString()}
                    icon={<Truck className="w-5 h-5" />}
                    color="blue"
                  />
                  <StatCard
                    label="Total KM Run"
                    value={formatNumber(contractReport.summary.total_km_run)}
                    icon={<MapPin className="w-5 h-5" />}
                    color="purple"
                  />
                  <StatCard
                    label="Total Billed"
                    value={formatCurrency(contractReport.summary.total_billed_amount)}
                    icon={<DollarSign className="w-5 h-5" />}
                    color="green"
                  />
                  <StatCard
                    label="Log Entries"
                    value={contractReport.summary.log_entries.toString()}
                    icon={<FileText className="w-5 h-5" />}
                    color="orange"
                  />
                </div>
              )}

              {/* Monthly KM Trend Chart */}
              <div className="bg-background-alt rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text-primary">Monthly KM Trend</h3>
                  <span className="text-xs text-text-muted">Last 6 months</span>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="kmGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#da7756" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#da7756" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#999', fontSize: 10 }}
                      />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="km" 
                        stroke="#da7756" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#kmGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Contract Info */}
              <div className="bg-background-alt rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text-primary">Contract Details</h3>
                  <button
                    onClick={() => setShowLogModal(true)}
                    className="px-3 py-1.5 bg-brand-orange text-white text-sm rounded-lg hover:bg-brand-hover transition-colors"
                  >
                    Add Vehicle Log
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <InfoItem label="Assured KM/Year" value={`${formatNumber(selectedContract.assured_km_per_year)} km`} />
                  <InfoItem label="Rate per KM" value={`₹${selectedContract.rate_per_km}`} />
                  <InfoItem label="Excess Rate" value={`₹${selectedContract.excess_rate_per_km || selectedContract.rate_per_km}`} />
                  <InfoItem label="Billing Cycle" value={`${selectedContract.billing_cycle_months} month(s)`} />
                  <InfoItem label="Start Date" value={new Date(selectedContract.contract_start_date).toLocaleDateString()} />
                  <InfoItem label="End Date" value={new Date(selectedContract.contract_end_date).toLocaleDateString()} />
                </div>
              </div>

              {/* Vehicle Logs */}
              {contractReport?.vehicle_logs && contractReport.vehicle_logs.length > 0 && (
                <div className="bg-background-alt rounded-xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-text-primary">Recent Vehicle Logs</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Vehicle</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Month</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase">KM Run</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase">Billable</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {contractReport.vehicle_logs.slice(0, 10).map((log) => (
                          <tr key={log.id} className="hover:bg-surface transition-colors">
                            <td className="px-4 py-3 font-medium text-text-primary">{log.vehicle_reg_number}</td>
                            <td className="px-4 py-3 text-text-muted">
                              {new Date(log.billing_month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 text-right text-text-primary">
                              {formatNumber(log.actual_km_run)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-text-primary">
                              {log.billable_amount ? formatCurrency(log.billable_amount) : '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={clsx(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                log.status === 'INVOICED' && "bg-green-500/10 text-green-400",
                                log.status === 'CALCULATED' && "bg-blue-500/10 text-blue-400",
                                log.status === 'DISPUTED' && "bg-red-500/10 text-red-400",
                                log.status === 'PENDING' && "bg-gray-500/10 text-gray-400"
                              )}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-background-alt rounded-xl border border-border p-12 text-center">
              <Truck className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-40" />
              <h3 className="text-lg font-medium text-text-primary mb-2">Select a Contract</h3>
              <p className="text-text-muted">Choose a contract from the list to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* New Contract Modal */}
      {showNewModal && (
        <Modal title="New MG Contract" onClose={() => setShowNewModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Fleet Name *</label>
              <input
                type="text"
                value={newContract.fleet_name}
                onChange={(e) => setNewContract({...newContract, fleet_name: e.target.value})}
                placeholder="e.g., ABC Logistics Fleet"
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-orange/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Start Date *</label>
                <input
                  type="date"
                  value={newContract.contract_start_date}
                  onChange={(e) => setNewContract({...newContract, contract_start_date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-brand-orange/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">End Date *</label>
                <input
                  type="date"
                  value={newContract.contract_end_date}
                  onChange={(e) => setNewContract({...newContract, contract_end_date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-brand-orange/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Assured KM per Year *</label>
              <input
                type="number"
                value={newContract.assured_km_per_year}
                onChange={(e) => setNewContract({...newContract, assured_km_per_year: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-brand-orange/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Rate per KM (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newContract.rate_per_km}
                  onChange={(e) => setNewContract({...newContract, rate_per_km: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-brand-orange/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Excess Rate per KM (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newContract.excess_rate_per_km}
                  onChange={(e) => setNewContract({...newContract, excess_rate_per_km: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-brand-orange/50"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowNewModal(false)}
              className="px-4 py-2 text-text-secondary hover:bg-surface rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateContract}
              disabled={!newContract.fleet_name || !newContract.contract_start_date}
              className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              Create Contract
            </button>
          </div>
        </Modal>
      )}

      {/* Add Vehicle Log Modal */}
      {showLogModal && selectedContract && (
        <Modal title="Add Vehicle Log" subtitle={selectedContract.fleet_name} onClose={() => setShowLogModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Vehicle Registration *</label>
              <input
                type="text"
                value={newLog.vehicle_reg_number}
                onChange={(e) => setNewLog({...newLog, vehicle_reg_number: e.target.value.toUpperCase()})}
                placeholder="MH01AB1234"
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-orange/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Billing Month *</label>
              <input
                type="month"
                value={newLog.billing_month}
                onChange={(e) => setNewLog({...newLog, billing_month: e.target.value + '-01'})}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-brand-orange/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Opening Odometer *</label>
                <input
                  type="number"
                  value={newLog.opening_odometer}
                  onChange={(e) => setNewLog({...newLog, opening_odometer: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-brand-orange/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Closing Odometer *</label>
                <input
                  type="number"
                  value={newLog.closing_odometer}
                  onChange={(e) => setNewLog({...newLog, closing_odometer: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-brand-orange/50"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowLogModal(false)}
              className="px-4 py-2 text-text-secondary hover:bg-surface rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateLog}
              disabled={!newLog.vehicle_reg_number || !newLog.billing_month}
              className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              Add Log
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Helper Components
const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'orange' | 'green' | 'blue' | 'purple';
}> = ({ label, value, icon, color }) => {
  const colorStyles = {
    orange: { bg: 'bg-brand-orange/10', text: 'text-brand-orange' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  };
  const styles = colorStyles[color];

  return (
    <div className="bg-background-alt rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-muted text-sm">{label}</p>
          <p className={clsx("text-xl font-bold mt-1", styles.text)}>{value}</p>
        </div>
        <div className={clsx("p-2 rounded-lg", styles.bg, styles.text)}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
    <p className="text-text-primary font-medium mt-1">{value}</p>
  </div>
);

const Modal: React.FC<{
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-background-alt rounded-2xl w-full max-w-lg border border-border">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-surface rounded-lg transition-colors text-text-muted"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);
