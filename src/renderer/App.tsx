import { MemoryRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import './App.css';
import Header from './Components/Header';
import { SettingsProvider } from './SettingsProvider';
import CardBuilder from './Components/ModBuilder/CardBuilder';
import { ModContextProvider } from './ModContextProvider';
import CardList from './Components/ModBuilder/CardList';
import PackageBuilder from './Components/PackageBuilder';

export default function App() {
  let { index } = useParams();

  return (
    <SettingsProvider>
      <ModContextProvider>
        <Router>
          <div style={{margin: '0', padding: '0', display: "grid", gridTemplateColumns: '1fr', gridTemplateRows: '3em 1fr'}}>
            <Header />
            <Routes>
              <Route path="/" element={<CardList />} />
              <Route path="card">
                <Route path=":index" element={<CardBuilder />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </ModContextProvider>
    </SettingsProvider>
  );
}
