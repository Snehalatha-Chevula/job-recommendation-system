import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { DeveloperProfilePage } from './pages/DeveloperProfilePage.jsx';
import { DevelopersPage } from './pages/DevelopersPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { JobDetailPage } from './pages/JobDetailPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

/**
 * Route table.
 *
 *   /                    landing page and live graph statistics
 *   /developers          developer explorer
 *   /developers/:id      profile, plus on-demand recommendations
 *   /jobs/:id            job detail, optionally with ?developerId= context
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/developers" element={<DevelopersPage />} />
        <Route path="/developers/:id" element={<DeveloperProfilePage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
