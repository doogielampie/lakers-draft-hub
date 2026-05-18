import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import DraftOrder from './pages/DraftOrder';
import ClassOverview from './pages/ClassOverview';
import LakersAt25 from './pages/LakersAt25';
import BigBoard from './pages/BigBoard';
import Compare from './pages/Compare';

export default function App() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#f0f0f0' }}>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/draft-order" element={<DraftOrder />} />
        <Route path="/class-overview" element={<ClassOverview />} />
        <Route path="/lakers-at-25" element={<LakersAt25 />} />
        <Route path="/big-board" element={<BigBoard />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </div>
  );
}
