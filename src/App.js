import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GalleryList from './components/GalleryList';
import GalleryDetail from './components/GalleryDetail';
import PhotoFullScreen from './components/PhotoFullScreen';
import Admin from './components/Admin'; // Import the Settings component
import Settings from './utils/settings';
import './App.css';

function App() {
    const [settings, setSettings] = useState(false);
  
  // Function that calls loadSettings
  const initializeSettings = async () => {
    const ok = await Settings.loadSettings();
    console.log(ok);
    if (ok) {
      console.log('Settings loaded successfully');
      setSettings(true);
    } else {
      console.error('Failed to load settings.');
      setSettings(false);
    }
  };

  useEffect(() => {
    initializeSettings();
  }, [settings]);

  if (!settings) {
    return (
      <div
      className="error-message"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center'
      }}
      >
      <div style={{ fontSize: '100px' }}>❌</div>
      <h2>Erreur d'initialisation de l'application</h2>
      <p>- Vérifier que le serveur soit démarré</p>
      <p>- Si vous utilisez PostgreSQL, vérifier le cluster</p>
      </div>
    );
  } else return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<GalleryList />} />
          <Route path="/gallery/:id" element={<GalleryDetail />} />
          <Route path="/photo/full" element={<PhotoFullScreen />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;