import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Components/Header';
import { SettingsProvider } from './SettingsProvider';
import { ReactFlowProvider } from 'reactflow';
import CardBuilder from './Components/ModBuilder/CardView';

export default function App() {
  return (
    <ReactFlowProvider>
      <SettingsProvider>
        <Router>
          <Routes>
            <Route path="/" element={<CardBuilder />} />
          </Routes>
          <Header />
        </Router>
      </SettingsProvider>
    </ReactFlowProvider>
  );
}
