import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from './hooks/useTheme';
import NavBar from './components/NavBar';
import NeoPage from './pages/NeoPage';
import HomePage from './pages/HomePage';
import StarCatalogPage from './pages/StarCatalogPage';
import ExoplanetPage from './pages/ExoplanetPage';
import DeepSkyPage from './pages/DeepSkyPage';
import AboutPage from './pages/AboutPage';
import CosmicBackground from './components/CosmicBackground';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false} },
});

function Shell() {
  const { isDark, toggle } = useTheme();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', position: 'relative' }}>
      <CosmicBackground isDark={isDark} />
      <NavBar isDark={isDark} toggle={toggle} />
      <main style={{ paddingTop: 64, position: 'relative', zIndex: 10 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stars" element={<StarCatalogPage />} />
          <Route path="/exoplanets" element={<ExoplanetPage />} />
          <Route path="/neos" element={<NeoPage />} />
          <Route path="/deepsky" element={<DeepSkyPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </QueryClientProvider>
  );
}