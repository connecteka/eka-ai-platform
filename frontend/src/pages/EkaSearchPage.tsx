import React, { useState } from 'react';
import { Search, FileText, Wrench, User, Calendar, Filter, SlidersHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

/* Mascot URL */
const MASCOT_URL = "https://customer-assets.emergentagent.com/job_c888b364-381d-411f-9fb8-91dd9dd39bee/artifacts/0nsgjm67_MASCOT.jpg";

/* Mock search results */
const MOCK_RESULTS = [
  {
    type: 'job_card',
    id: 'JC-0047',
    title: 'Maruti Swift 2022 - Brake Pad Replacement',
    subtitle: 'Customer: Rahul Sharma • Status: PDI',
    date: '2 hours ago',
  },
  {
    type: 'job_card',
    id: 'JC-0045',
    title: 'Hyundai Creta 2023 - AC Service',
    subtitle: 'Customer: Anil Gupta • Status: In Progress',
    date: '1 day ago',
  },
  {
    type: 'invoice',
    id: 'INV-0018',
    title: 'Invoice for Honda City Service',
    subtitle: 'Customer: Priya Nair • Amount: ₹12,500',
    date: '3 days ago',
  },
  {
    type: 'customer',
    id: 'C-0012',
    title: 'Deepak Verma',
    subtitle: 'Phone: +91 98765 43210 • 3 vehicles',
    date: 'Last visit: 1 week ago',
  },
];

const FILTERS = ['All', 'Job Cards', 'Invoices', 'Customers', 'Vehicles'];

const EkaSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [results, setResults] = useState<typeof MOCK_RESULTS>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Mock search - in production this would hit the backend
    setResults(MOCK_RESULTS.filter(r => 
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(query.toLowerCase())
    ));
    setHasSearched(true);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'job_card': return Wrench;
      case 'invoice': return FileText;
      case 'customer': return User;
      default: return FileText;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]" data-testid="eka-search-page">
      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        
        {/* Search Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src={MASCOT_URL}
              alt="eka-ai"
              className="w-10 h-10 object-cover"
              style={{ borderRadius: '8px' }}
            />
            <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Search
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Find job cards, invoices, customers, and vehicles
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by vehicle number, customer name, job card ID..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F98906] focus:ring-2 focus:ring-[#F98906]/10 transition-all text-sm"
              data-testid="search-input"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#F98906] text-white rounded-lg text-sm font-medium hover:bg-[#E07A00] transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                activeFilter === filter
                  ? 'bg-[#F98906] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#F98906]/40'
              )}
            >
              {filter}
            </button>
          ))}
          <button className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-[#F98906]/40 transition-all ml-auto">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        {hasSearched ? (
          results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">
                Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </p>
              {results.map((result) => {
                const Icon = getIcon(result.type);
                return (
                  <div
                    key={result.id}
                    className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#F98906]/40 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#F98906]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#F98906]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[#F98906] bg-[#F98906]/10 px-2 py-0.5 rounded">
                          {result.id}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">
                          {result.type.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-800 truncate">{result.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{result.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {result.date}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No results found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F98906]/10 flex items-center justify-center">
              <Search className="w-8 h-8 text-[#F98906]" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Start searching</h3>
            <p className="text-sm text-gray-500">
              Enter a vehicle number, customer name, or job card ID
            </p>
          </div>
        )}

        {/* Recent Searches */}
        {!hasSearched && (
          <div className="mt-8">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Recent Searches</h4>
            <div className="flex flex-wrap gap-2">
              {['MH12AB1234', 'Rahul Sharma', 'JC-0042', 'Honda City'].map((term) => (
                <button
                  key={term}
                  onClick={() => { setQuery(term); }}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#F98906]/40 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EkaSearchPage;
