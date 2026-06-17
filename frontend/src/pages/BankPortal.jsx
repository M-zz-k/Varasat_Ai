import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useTranslation } from '../hooks/useTranslation';

export default function BankPortal() {
  const { toggleLanguage, lang } = useTranslation();
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock institutional claims
  const [claims, setClaims] = useState([
    {
      id: 'CLM-1718091234',
      deceasedName: 'Ramesh Kumar Sharma',
      claimantName: 'Amit Kumar Sharma',
      relationship: 'Son',
      amount: '₹2,45,000',
      assetType: 'Savings Account',
      accountNumber: '30998877123',
      dateSubmitted: '2026-06-10',
      status: 'Pending Verification',
      verificationDetails: {
        documentOcr: 'Verified (Gemini)',
        successionCertificate: 'Pending review',
        deathCertificate: 'Verified',
      }
    },
    {
      id: 'CLM-9821034421',
      deceasedName: 'Shanti Devi',
      claimantName: 'Sunita Devi',
      relationship: 'Daughter',
      amount: '₹5,10,000',
      assetType: 'Fixed Deposit',
      accountNumber: '10992384771',
      dateSubmitted: '2026-06-12',
      status: 'Approved',
      verificationDetails: {
        documentOcr: 'Verified (Gemini)',
        successionCertificate: 'Approved by Legal',
        deathCertificate: 'Verified',
      }
    },
    {
      id: 'CLM-5523910291',
      deceasedName: 'Gopal Krishna Bhat',
      claimantName: 'Kalyani Bhat',
      relationship: 'Spouse',
      amount: '₹12,80,000',
      assetType: 'PPF Account',
      accountNumber: '22019488301',
      dateSubmitted: '2026-06-15',
      status: 'Pending Verification',
      verificationDetails: {
        documentOcr: 'Verified (Gemini)',
        successionCertificate: 'Pending signature',
        deathCertificate: 'Verified',
      }
    }
  ]);

  const [selectedClaim, setSelectedClaim] = useState(null);

  const handleVerify = (id, field) => {
    setClaims(prev => prev.map(c => {
      if (c.id === id) {
        const updatedDetails = { ...c.verificationDetails, [field]: 'Verified' };
        // Check if all are verified
        const allVerified = Object.values(updatedDetails).every(v => v === 'Verified');
        return {
          ...c,
          verificationDetails: updatedDetails,
          status: allVerified ? 'Approved' : c.status
        };
      }
      return c;
    }));
    if (selectedClaim && selectedClaim.id === id) {
      setSelectedClaim(prev => {
        const updatedDetails = { ...prev.verificationDetails, [field]: 'Verified' };
        const allVerified = Object.values(updatedDetails).every(v => v === 'Verified');
        return {
          ...prev,
          verificationDetails: updatedDetails,
          status: allVerified ? 'Approved' : prev.status
        };
      });
    }
  };

  const handleApproveClaim = (id) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
    if (selectedClaim && selectedClaim.id === id) {
      setSelectedClaim(prev => ({ ...prev, status: 'Approved' }));
    }
  };

  const filteredClaims = claims.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.deceasedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.claimantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'pending' && c.status === 'Pending Verification') ||
                       (activeTab === 'approved' && c.status === 'Approved');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-[#f3f8fc] bg-grid-dots font-sans antialiased text-slate-700 pb-16 relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[140px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[140px] -bottom-32 -right-32 pointer-events-none" />

      <Navbar 
        backTo="/" 
        backLabel="← Home" 
        subtitle="Institutional Dashboard & Claims Settlement" 
        rightSlot={
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-bold text-amber-500 hover:text-amber-400 transition-all cursor-pointer shadow-sm"
          >
            <svg style={{ width: '1rem', height: '1rem', stroke: 'currentColor', strokeWidth: 2, fill: 'none' }} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l7.5-7.5L21 21M16.5 15h3.75M3 5.25h16.5M3.75 3v15m9-15v15" />
            </svg>
            <span>{lang === 'en' ? 'हिंदी' : lang === 'hi' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        
        {/* Institutional Branding */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 mb-8 shadow-3d-blue flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest">Varasat Partner Network</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Institutional Claim Clearance Console
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-semibold">
              Authorized personnel access for verified asset release & compliance reporting.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2 border border-slate-200 rounded-xl">
            <span className="text-xs font-bold text-slate-500 pl-2">Active Institution:</span>
            <select 
              value={selectedBank} 
              onChange={(e) => setSelectedBank(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-extrabold rounded-lg px-3 py-1.5 outline-none focus:border-amber-500 transition-all shadow-sm"
            >
              <option>State Bank of India</option>
              <option>Punjab National Bank</option>
              <option>HDFC Bank</option>
              <option>ICICI Bank</option>
            </select>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Claims List View */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-3d-gold hover-glow-gold transition-all duration-300">
              
              {/* Search & Tabs */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
                <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Pending Verification
                  </button>
                  <button
                    onClick={() => setActiveTab('approved')}
                    className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'approved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    All
                  </button>
                </div>

                <div className="relative flex-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="Search claims..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 transition-all shadow-sm"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                  </svg>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Claim ID</th>
                      <th className="pb-3">Deceased / Heir</th>
                      <th className="pb-3">Asset & Account</th>
                      <th className="pb-3 text-right">Value</th>
                      <th className="pb-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClaims.map((claim) => (
                      <tr 
                        key={claim.id}
                        onClick={() => setSelectedClaim(claim)}
                        className={`hover:bg-slate-50/70 transition-all cursor-pointer ${selectedClaim?.id === claim.id ? 'bg-amber-50/40' : ''}`}
                      >
                        <td className="py-4 text-xs font-extrabold text-amber-600">{claim.id}</td>
                        <td className="py-4">
                          <span className="text-xs font-bold text-slate-900 block">{claim.deceasedName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Claimant: {claim.claimantName} ({claim.relationship})</span>
                        </td>
                        <td className="py-4">
                          <span className="text-xs font-bold text-slate-800 block">{claim.assetType}</span>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{claim.accountNumber}</span>
                        </td>
                        <td className="py-4 text-right text-xs font-black text-slate-900">{claim.amount}</td>
                        <td className="py-4 text-center">
                          <span className={`inline-block text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            claim.status === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {claim.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredClaims.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-xs text-slate-400 font-semibold">
                          No institutional claims match the filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          {/* Verification detail panel */}
          <div className="lg:col-span-1">
            {selectedClaim ? (
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-3d-blue space-y-6 relative z-10">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Currently Auditing</span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{selectedClaim.id}</h3>
                  <span className="text-[10px] font-mono text-slate-400">{selectedClaim.assetType} · {selectedClaim.accountNumber}</span>
                </div>

                {/* Audit checklist */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Settlement Checklist
                  </h4>
                  
                  {/* Item 1 */}
                  <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <span className="text-[10px] font-bold text-slate-800 block">AI Document Intelligence</span>
                      <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">✓ OCR match verified</span>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">Verified</span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <span className="text-[10px] font-bold text-slate-800 block">Death Certificate Validation</span>
                      <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">✓ Registry records matches</span>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">Verified</span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <span className="text-[10px] font-bold text-slate-800 block">Legal Heir Certificate</span>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                        {selectedClaim.verificationDetails.successionCertificate}
                      </span>
                    </div>
                    {selectedClaim.verificationDetails.successionCertificate === 'Verified' ? (
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">Verified</span>
                    ) : (
                      <button 
                        onClick={() => handleVerify(selectedClaim.id, 'successionCertificate')}
                        className="text-[9px] bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1 rounded shadow-sm cursor-pointer transition-all"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>

                {/* Approve settlement button */}
                {selectedClaim.status !== 'Approved' ? (
                  <button 
                    onClick={() => handleApproveClaim(selectedClaim.id)}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs h-11 tracking-wider transition-all duration-200 hover:scale-[1.02] shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    Release Legacy Wealth (Disburse)
                  </button>
                ) : (
                  <div className="text-center p-3.5 bg-emerald-50 border border-emerald-250 rounded-xl text-emerald-800 text-xs font-bold shadow-sm">
                    🎉 Funds disbursed & settlement report dispatched.
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center text-xs text-slate-400 font-semibold shadow-2xs">
                Select an institutional claim to review and authorize release.
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
