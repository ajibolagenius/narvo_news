import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import './i18n';
import App from './App';

const sentryDsn = process.env.REACT_APP_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV || 'development',
  });
}

function ErrorFallback({ error, resetError }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgb(27, 33, 26)',
        color: 'rgb(242, 242, 242)',
        fontFamily: 'system-ui, sans-serif',
      }}
      role="alert"
    >
      <p style={{ marginBottom: 16 }}>Something went wrong.</p>
      <button
        type="button"
        onClick={resetError}
        style={{
          padding: '8px 16px',
          border: '1px solid rgb(98, 129, 65)',
          background: 'transparent',
          color: 'rgb(139, 174, 102)',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
const app = sentryDsn ? (
  <Sentry.ErrorBoundary fallback={({ resetError }) => <ErrorFallback resetError={resetError} />}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Sentry.ErrorBoundary>
) : (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
root.render(app);
