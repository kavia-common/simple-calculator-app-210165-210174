/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-CALC-APP-001
// User Story: As a user, I want to access the calculator on the home route.
// Acceptance Criteria: App renders Calculator UI with theme.
// GxP Impact: YES - Provides main UI entry and theme consistency.
// Risk Level: LOW
// Validation Protocol: VP-CALC-APP-001
// ============================================================================
*/

import React, { useEffect, useState } from 'react';
import './App.css';
import './styles/global.css';
import Calculator from './components/Calculator';

// PUBLIC_INTERFACE
function App() {
  /**
   * Simple light theme toggle support (kept from template). We default to light
   * as per Ocean Professional style. This is not GxP-critical.
   */
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.background = 'var(--color-background)';
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      <header className="App-header" style={{ background: 'transparent', minHeight: 'auto', paddingTop: '1rem' }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>
      <main className="container" role="main">
        <Calculator />
      </main>
    </div>
  );
}

export default App;
