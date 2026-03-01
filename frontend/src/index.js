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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
