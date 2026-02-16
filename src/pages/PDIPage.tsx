import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Car,
  User,
  Upload,
  Download,
  Filter
} from 'lucide-react';
import { clsx } from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || '';

interface PDIChecklistItem {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'passed' | 'failed';
  notes: string;
  photo_url?: string;
}

interface PDIChecklist {
  id: string;
  job_card_id: string;
  vehicle_registration: string;
  technician_name: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  items: PDIChecklistItem[];
  created_at: string;
  completed_at?: string;
}

// Default PDI items template
const DEFAULT_PDI_ITEMS: Omit<PDIChecklistItem, 'id'>[] = [
  // Exterior
  { name: 'Body Condition (Dents/Scratches)', category: 'Exterior', status: 'pending', notes: '' },
  { name: 'Paint Quality & Finish', category: 'Exterior', status: 'pending', notes: '' },
  { name: 'Windshield & Glass (Chips/Cracks)', category: 'Exterior', status: 'pending', notes: '' },
  { name: 'Headlights & Tail Lights', category: 'Exterior', status: 'pending', notes: '' },
  { name: 'Tyres & Wheel Condition', category: 'Exterior', status: 'pending', notes: '' },
  { name: 'Door Alignment & Seals', category: 'Exterior', status: 'pending', notes: '' },
  // Mechanical
  { name: 'Engine Oil Level', category: 'Mechanical', status: 'pending', notes: '' },
  { name: 'Coolant Level', category: 'Mechanical', status: 'pending', notes: '' },
  { name: 'Brake Fluid Level', category: 'Mechanical', status: 'pending', notes: '' },
  { name: 'Battery Condition & Terminals', category: 'Mechanical', status: 'pending', notes: '' },
  { name: 'Belt & Hose Condition', category: 'Mechanical', status: 'pending', notes: '' },
  { name: 'Brake Pad Thickness', category: 'Mechanical', status: 'pending', notes: '' },
  // Electrical
  { name: 'All Interior Lights', category: 'Electrical', status: 'pending', notes: '' },
  { name: 'Horn Functionality', category: 'Electrical', status: 'pending', notes: '' },
  { name: 'Wipers & Washers', category: 'Electrical', status: 'pending', notes: '' },
  { name: 'Power Windows', category: 'Electrical', status: 'pending', notes: '' },
  { name: 'Central Locking', category: 'Electrical', status: 'pending', notes: '' },
  // Interior
  { name: 'Seats & Upholstery', category: 'Interior', status: 'pending', notes: '' },
  { name: 'Dashboard & Controls', category: 'Interior', status: 'pending', notes: '' },
  { name: 'AC/Heating System', category: 'Interior', status: 'pending', notes: '' },
  { name: 'Infotainment System', category: 'Interior', status: 'pending', notes: '' },
  { name: 'Steering Wheel & Controls', category: 'Interior', status: 'pending', notes: '' },
  // Safety
  { name: 'Seat Belts Functionality', category: 'Safety', status: 'pending', notes: '' },
  { name: 'Airbag Indicators', category: 'Safety', status: 'pending', notes: '' },
  { name: 'Tool Kit & Spare Tyre', category: 'Safety', status: 'pending', notes: '' },
];

const CATEGORIES = ['Exterior', 'Mechanical', 'Electrical', 'Interior', 'Safety'];

const PDIPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobCardId = searchParams.get('job_card');
  
  const [pdiChecklists, setPdiChecklists] = useState<PDIChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedPDI, setSelectedPDI] = useState<PDIChecklist | null>(null);
  
  // New PDI form state
  const [vehicleReg, setVehicleReg] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [pdiItems, setPdiItems] = useState<PDIChecklistItem[]>(
    DEFAULT_PDI_ITEMS.map((item, idx) => ({ ...item, id: `item-${idx}` }))
  );
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    fetchPDIChecklists();
  }, []);

  const fetchPDIChecklists = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/pdi`);
      if (response.ok) {
        const data = await response.json();
        setPdiChecklists(data.checklists || []);
      }
    } catch (error) {
      console.error('Error fetching PDI checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePDIItem = (itemId: string, status: 'passed' | 'failed', notes?: string) => {
    setPdiItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, status, notes: notes ?? item.notes }
          : item
      )
    );
  };

  const handleSubmitPDI = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pdi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_card_id: jobCardId,
          vehicle_registration: vehicleReg,
          technician_name: technicianName,
          items: pdiItems
        })
      });

      if (response.ok) {
        setShowNewModal(false);
        setVehicleReg('');
        setTechnicianName('');
        setPdiItems(DEFAULT_PDI_ITEMS.map((item, idx) => ({ ...item, id: `item-${idx}` })));
        fetchPDIChecklists();
      }
    } catch (error) {
      console.error('Error creating PDI:', error);
    }
  };

  const completedCount = pdiItems.filter(item => item.status !== 'pending').length;
  const passedCount = pdiItems.filter(item => item.status === 'passed').length;
  const failedCount = pdiItems.filter(item => item.status === 'failed').length;

  const filteredItems = activeCategory === 'All' 
    ? pdiItems 
    : pdiItems.filter(item => item.category === activeCategory);

  return (
    <div className="p-6 space-y-6" data-testid="pdi-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">PDI Checklist</h1>
          <p className="text-text-secondary text-sm mt-1">
            Pre-Delivery Inspection with photo evidence
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-hover transition-colors"
          data-testid="new-pdi-btn"
        >
          <Plus className="w-4 h-4" />
          New PDI
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Checklists"
          value={pdiChecklists.length}
          icon={<ClipboardCheck className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="In Progress"
          value={pdiChecklists.filter(p => p.status === 'IN_PROGRESS').length}
          icon={<AlertCircle className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard
          label="Completed"
          value={pdiChecklists.filter(p => p.status === 'COMPLETED').length}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Approved"
          value={pdiChecklists.filter(p => p.status === 'APPROVED').length}
          icon={<CheckCircle className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* PDI List */}
      <div className="bg-background-alt rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Recent Inspections</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-brand-orange/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-secondary">Loading...</div>
        ) : pdiChecklists.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardCheck className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <p className="text-text-secondary">No PDI checklists yet</p>
            <p className="text-text-muted text-sm mt-1">Create your first inspection checklist</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pdiChecklists.map((pdi) => (
              <div
                key={pdi.id}
                onClick={() => setSelectedPDI(pdi)}
                className="p-4 flex items-center justify-between hover:bg-surface cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{pdi.vehicle_registration}</p>
                    <p className="text-sm text-text-muted">By {pdi.technician_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={clsx(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    pdi.status === 'IN_PROGRESS' && "bg-yellow-500/10 text-yellow-400",
                    pdi.status === 'COMPLETED' && "bg-green-500/10 text-green-400",
                    pdi.status === 'APPROVED' && "bg-blue-500/10 text-blue-400"
                  )}>
                    {pdi.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-text-muted">
                    {new Date(pdi.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New PDI Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background-alt rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-border">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-text-primary">New PDI Checklist</h2>
                <p className="text-sm text-text-muted mt-1">
                  {completedCount}/{pdiItems.length} items inspected
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-2 hover:bg-surface rounded-lg transition-colors text-text-muted"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Vehicle Registration *
                  </label>
                  <input
                    type="text"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                    placeholder="MH01AB1234"
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-orange/50"
                    data-testid="pdi-vehicle-reg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Technician Name *
                  </label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-orange/50"
                    data-testid="pdi-technician"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-muted">Progress</span>
                  <span className="text-text-primary font-medium">
                    {passedCount} passed • {failedCount} failed • {pdiItems.length - completedCount} pending
                  </span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                  <div className="h-full flex">
                    <div
                      className="bg-green-500 transition-all duration-300"
                      style={{ width: `${(passedCount / pdiItems.length) * 100}%` }}
                    />
                    <div
                      className="bg-red-500 transition-all duration-300"
                      style={{ width: `${(failedCount / pdiItems.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setActiveCategory('All')}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    activeCategory === 'All'
                      ? "bg-brand-orange text-white"
                      : "bg-surface text-text-secondary hover:bg-border"
                  )}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      activeCategory === cat
                        ? "bg-brand-orange text-white"
                        : "bg-surface text-text-secondary hover:bg-border"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={clsx(
                      "flex items-center justify-between p-4 rounded-xl border transition-colors",
                      item.status === 'passed' && "bg-green-500/5 border-green-500/20",
                      item.status === 'failed' && "bg-red-500/5 border-red-500/20",
                      item.status === 'pending' && "bg-surface border-border"
                    )}
                    data-testid={`pdi-item-${item.id}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updatePDIItem(item.id, 'passed')}
                        className={clsx(
                          "p-2 rounded-lg transition-colors",
                          item.status === 'passed'
                            ? "bg-green-500 text-white"
                            : "bg-surface border border-border text-text-muted hover:border-green-500 hover:text-green-500"
                        )}
                        title="Pass"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updatePDIItem(item.id, 'failed')}
                        className={clsx(
                          "p-2 rounded-lg transition-colors",
                          item.status === 'failed'
                            ? "bg-red-500 text-white"
                            : "bg-surface border border-border text-text-muted hover:border-red-500 hover:text-red-500"
                        )}
                        title="Fail"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 bg-surface border border-border text-text-muted rounded-lg hover:border-brand-orange hover:text-brand-orange transition-colors"
                        title="Add Photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border flex items-center justify-between bg-surface">
              <div className="text-sm text-text-muted">
                All items must be inspected to complete
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-text-secondary hover:bg-border rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPDI}
                  disabled={!vehicleReg || !technicianName || completedCount < pdiItems.length}
                  className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  data-testid="pdi-submit"
                >
                  <Upload className="w-4 h-4" />
                  Complete PDI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'orange' | 'green' | 'blue' | 'yellow';
}> = ({ label, value, icon, color }) => {
  const colorStyles = {
    orange: { bg: 'bg-brand-orange/10', text: 'text-brand-orange' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
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

export default PDIPage;
