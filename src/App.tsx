import React, { useState } from 'react';
import LandingPageComponent from './components/LandingPage';
import { OriginalApp } from './components/OriginalApp';
import { ExperimentApp } from './components/ExperimentApp';
import { ConsolePage } from './pages/ConsolePage';
import './App.scss';

type AppView = 'landing' | 'original' | 'experiment' | 'console';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPageComponent onNavigate={setCurrentView} />;
      case 'original':
        return <OriginalApp onNavigate={setCurrentView} />;
      case 'experiment':
        return <ExperimentApp onNavigate={setCurrentView} />;
      case 'console':
        return <ConsolePage />;
      default:
        return <LandingPageComponent onNavigate={setCurrentView} />;
    }
  };

  return <div data-component="App">{renderView()}</div>;
}

export default App;
