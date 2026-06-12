import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home           from './pages/Home';
import Chat           from './pages/Chat';
import Upload         from './pages/Upload';
import DocumentUpload from './pages/DocumentUpload';
import Tracker        from './pages/Tracker';
import Analytics      from './pages/Analytics';
import ClaimAnalysis  from './pages/ClaimAnalysis';
import AssetDiscovery from './pages/AssetDiscovery';
import DocumentGenerator from './pages/DocumentGenerator';
import Login          from './pages/Login';
import DemoMode       from './pages/DemoMode';

import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home           />} />
        <Route path="/chat"      element={<Chat           />} />
        <Route path="/login"     element={<Login          />} />
        <Route path="/upload"    element={<Upload         />} />
        <Route path="/analyze"   element={<DocumentUpload />} />
        <Route path="/tracker"   element={<Tracker        />} />
        <Route path="/analytics" element={<Analytics      />} />
        <Route path="/claim-analysis" element={<ClaimAnalysis />} />
        <Route path="/asset-discovery" element={<AssetDiscovery />} />
        <Route path="/generate-document" element={<DocumentGenerator />} />
        <Route path="/demo"      element={<DemoMode       />} />
      </Routes>
    </BrowserRouter>
  );
}
