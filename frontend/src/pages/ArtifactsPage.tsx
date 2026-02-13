import React, { useState } from 'react';
import { Plus, FileText, CheckSquare, BarChart3, Calculator, Car, X, Camera, Upload } from 'lucide-react';

interface PDIItem {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'passed' | 'failed';
  notes: string;
}

const ArtifactsPage = () => {
  // Tab state - content filtering to be implemented when user artifacts data is available
  const [activeTab, setActiveTab] = useState('inspiration');
  const [showPDIModal, setShowPDIModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  // PDI Checklist state
  const [pdiItems, setPdiItems] = useState<PDIItem[]>([
    { id: '1', name: 'Exterior Body Condition', category: 'Exterior', status: 'pending', notes: '' },
    { id: '2', name: 'Paint Quality & Finish', category: 'Exterior', status: 'pending', notes: '' },
    { id: '3', name: 'Windshield & Windows', category: 'Exterior', status: 'pending', notes: '' },
    { id: '4', name: 'Tyres & Wheels', category: 'Exterior', status: 'pending', notes: '' },
    { id: '5', name: 'Engine Bay Inspection', category: 'Mechanical', status: 'pending', notes: '' },
    { id: '6', name: 'Fluid Levels', category: 'Mechanical', status: 'pending', notes: '' },
    { id: '7', name: 'Battery Condition', category: 'Electrical', status: 'pending', notes: '' },
    { id: '8', name: 'All Lights Functional', category: 'Electrical', status: 'pending', notes: '' },
    { id: '9', name: 'Infotainment System', category: 'Interior', status: 'pending', notes: '' },
    { id: '10', name: 'AC/Heating System', category: 'Interior', status: 'pending', notes: '' },
  ]);
  const [vehicleReg, setVehicleReg] = useState('');
  const [technicianName, setTechnicianName] = useState('');

  const handleToolClick = (toolName: string) => {
    setSelectedTool(toolName);
    if (toolName === 'PDI Checklist Generator') {
      setShowPDIModal(true);
    }
    // Add other tool handlers as needed
  };

  const updatePDIItem = (id: string, status: 'passed' | 'failed', notes?: string) => {
    setPdiItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, status, notes: notes ?? item.notes }
          : item
      )
    );
  };

  const completedCount = pdiItems.filter(item => item.status !== 'pending').length;
  const passedCount = pdiItems.filter(item => item.status === 'passed').length;

  return (
    <main className="flex-1 overflow-y-auto bg-[#fafaf9] h-screen">
      <div className="max-w-6xl mx-auto px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-4xl text-gray-900">Artifacts</h1>
          <button 
            onClick={() => setShowPDIModal(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            data-testid="new-artifact-btn"
          >
            <Plus size={16} />
            New artifact
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
          <button 
            onClick={() => setActiveTab('inspiration')}
            className={`pb-3 text-sm transition-colors ${activeTab === 'inspiration' ? 'text-gray-900 border-b-2 border-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Inspiration
          </button>
          <button 
            onClick={() => setActiveTab('yours')}
            className={`pb-3 text-sm transition-colors ${activeTab === 'yours' ? 'text-gray-900 border-b-2 border-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Your artifacts
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['All', 'Diagnostics', 'Reports', 'Compliance', 'Estimates', 'Fleet Tools'].map((cat, idx) => (
            <button key={cat} className={`px-4 py-2 rounded-full text-sm transition-colors border ${idx === 0 ? 'bg-gray-100 border-transparent text-gray-900 font-medium' : 'bg-transparent border-transparent text-gray-600 hover:bg-gray-50'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ArtifactCard 
            title="Job Card Writer" 
            desc="Generate professional job cards with estimates"
            icon={<FileText className="text-orange-500" />}
            color="bg-orange-50"
            onClick={() => handleToolClick('Job Card Writer')}
          />
          <ArtifactCard 
            title="PDI Checklist Generator" 
            desc="Create comprehensive PDI lists with photo evidence"
            icon={<CheckSquare className="text-blue-500" />}
            color="bg-blue-50"
            onClick={() => handleToolClick('PDI Checklist Generator')}
          />
          <ArtifactCard 
            title="Fleet Report Builder" 
            desc="Generate MG contract reports and analytics"
            icon={<BarChart3 className="text-purple-500" />}
            color="bg-purple-50"
            onClick={() => handleToolClick('Fleet Report Builder')}
          />
          <ArtifactCard 
            title="Estimate Generator" 
            desc="Create GST-compliant estimates"
            icon={<Calculator className="text-teal-500" />}
            color="bg-teal-50"
            onClick={() => handleToolClick('Estimate Generator')}
          />
          <ArtifactCard 
            title="Vehicle Comparison" 
            desc="Compare vehicles for fleet procurement"
            icon={<Car className="text-indigo-500" />}
            color="bg-indigo-50"
            onClick={() => handleToolClick('Vehicle Comparison')}
          />
        </div>

        {/* PDI Checklist Modal */}
        {showPDIModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="pdi-modal">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">PDI Checklist Generator</h2>
                  <p className="text-sm text-gray-500 mt-1">Pre-Delivery Inspection with photo evidence</p>
                </div>
                <button 
                  onClick={() => setShowPDIModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  data-testid="close-pdi-modal"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Vehicle Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Vehicle Registration *
                    </label>
                    <input
                      type="text"
                      value={vehicleReg}
                      onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                      placeholder="MH01AB1234"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      data-testid="pdi-vehicle-reg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Technician Name *
                    </label>
                    <input
                      type="text"
                      value={technicianName}
                      onChange={(e) => setTechnicianName(e.target.value)}
                      placeholder="Enter technician name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      data-testid="pdi-technician-name"
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{completedCount}/{pdiItems.length} items checked</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedCount / pdiItems.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Checklist Items */}
                <div className="space-y-3">
                  {['Exterior', 'Mechanical', 'Electrical', 'Interior'].map(category => (
                    <div key={category} className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{category}</h3>
                      {pdiItems.filter(item => item.category === category).map(item => (
                        <div 
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-xl border mb-2 transition-colors ${
                            item.status === 'passed' ? 'bg-green-50 border-green-200' :
                            item.status === 'failed' ? 'bg-red-50 border-red-200' :
                            'bg-gray-50 border-gray-200'
                          }`}
                          data-testid={`pdi-item-${item.id}`}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.notes && (
                              <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => updatePDIItem(item.id, 'passed')}
                              className={`p-2 rounded-lg transition-colors ${
                                item.status === 'passed' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-white border border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-500'
                              }`}
                              title="Pass"
                              data-testid={`pdi-pass-${item.id}`}
                            >
                              <CheckSquare size={18} />
                            </button>
                            <button
                              onClick={() => updatePDIItem(item.id, 'failed')}
                              className={`p-2 rounded-lg transition-colors ${
                                item.status === 'failed' 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-white border border-gray-300 text-gray-500 hover:border-red-500 hover:text-red-500'
                              }`}
                              title="Fail"
                              data-testid={`pdi-fail-${item.id}`}
                            >
                              <X size={18} />
                            </button>
                            <button
                              className="p-2 bg-white border border-gray-300 text-gray-500 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
                              title="Add Photo Evidence"
                              data-testid={`pdi-photo-${item.id}`}
                            >
                              <Camera size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">
                  {passedCount} passed • {completedCount - passedCount} failed • {pdiItems.length - completedCount} pending
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPDIModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Save PDI checklist to backend
                      alert('PDI Checklist saved successfully!');
                      setShowPDIModal(false);
                    }}
                    disabled={!vehicleReg || !technicianName || completedCount < pdiItems.length}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    data-testid="pdi-submit"
                  >
                    <Upload size={16} />
                    Complete PDI
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

const ArtifactCard = ({ title, desc, icon, color, onClick }: { 
  title: string, 
  desc: string, 
  icon: React.ReactNode, 
  color: string,
  onClick?: () => void 
}) => (
  <div 
    className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
    onClick={onClick}
    data-testid={`artifact-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div className={`aspect-[4/3] ${color} p-6 flex items-center justify-center`}>
      <div className="bg-white p-4 rounded-xl shadow-sm group-hover:scale-105 transition-transform">
        {icon}
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  </div>
);

export default ArtifactsPage;
