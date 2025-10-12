import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SbcProvider } from '@stablecoin.xyz/react';
import { base } from 'viem/chains';
import Navigation from './components/Navigation';
import Explore from './screens/Explore';
import Chat from './screens/Chat';
import Statistics from './screens/Statistics';
import Create from './screens/Create';
import SignIn from './screens/SignIn';

// SBC AppKit configuration
const sbcConfig = {
  apiKey: import.meta.env.VITE_SBC_API_KEY || 'your-sbc-api-key-here',
  chain: base,
  wallet: 'auto', // Automatically detect available wallets
  debug: true,
};

function App() {
  return (
    <SbcProvider config={sbcConfig}>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Explore />} />
              <Route path="/chat/:modelId" element={<Chat />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/create" element={<Create />} />
              <Route path="/signin" element={<SignIn />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SbcProvider>
  );
}

export default App;
