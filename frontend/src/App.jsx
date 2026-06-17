import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';

import Home           from './pages/Home';
import Chat           from './pages/Chat';
import DocumentUpload from './pages/DocumentUpload';
import Tracker        from './pages/Tracker';
import Analytics      from './pages/Analytics';
import ClaimAnalysis  from './pages/ClaimAnalysis';
import AssetDiscovery from './pages/AssetDiscovery';
import DocumentGenerator from './pages/DocumentGenerator';
import Login          from './pages/Login';
import DemoMode       from './pages/DemoMode';
import BankPortal     from './pages/BankPortal';

import './index.css';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"          element={<ErrorBoundary><Home           /></ErrorBoundary>} />
            <Route path="/chat"      element={<ErrorBoundary><Chat           /></ErrorBoundary>} />
            <Route path="/login"     element={<ErrorBoundary><Login          /></ErrorBoundary>} />
            <Route path="/upload"    element={<ErrorBoundary><DocumentUpload /></ErrorBoundary>} />
            <Route path="/analyze"   element={<Navigate to="/upload" replace />} />
            <Route path="/tracker"   element={<ErrorBoundary><Tracker        /></ErrorBoundary>} />
            <Route path="/analytics" element={<ErrorBoundary><Analytics      /></ErrorBoundary>} />
            <Route path="/claim-analysis" element={<ErrorBoundary><ClaimAnalysis /></ErrorBoundary>} />
            <Route path="/asset-discovery" element={<ErrorBoundary><AssetDiscovery /></ErrorBoundary>} />
            <Route path="/generate-document" element={<ErrorBoundary><DocumentGenerator /></ErrorBoundary>} />
            <Route path="/demo"      element={<ErrorBoundary><DemoMode       /></ErrorBoundary>} />
            <Route path="/bank-portal" element={<ErrorBoundary><BankPortal     /></ErrorBoundary>} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
