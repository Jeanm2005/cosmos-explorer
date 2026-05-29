import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import StarCatalogPage from './pages/StarCatalogPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false } },
});

function ComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: 12 }}>
      <div style={{ fontSize: 48, opacity: 0.3 }}>🔭</div>
      <h2 style={{ color: '#e0e8ff', margin: 0 }}>{title}</h2>
      <p style={{ color: 'rgba(255,255,255,0.3)', margin: 0, fontSize: 13 }}>{subtitle}</p>
      <div style={{ marginTop: 16, padding: '6px 14px', border: '1px solid rgba(77,217,255,0.2', borderRadius: 20, fontSize: 11, color: 'rgba(77,217,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Phase 3 Coming Soon
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: '#050814' }}>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/stars" element={<StarCatalogPage />} />
            <Route path="/exoplanets" element={<ComingSoon title="Exoplanet Explorer" subtitle="NASA Exoplanet Archive" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}