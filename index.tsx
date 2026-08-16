
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

if (import.meta.env.DEV) {
  window.addEventListener('error', (e) => {
    document.body.innerHTML = '<div style="color:red;padding:20px;"><h1>Error</h1><pre>' + e.error?.stack + '</pre></div>';
  });
  window.addEventListener('unhandledrejection', (e) => {
    document.body.innerHTML = '<div style="color:red;padding:20px;"><h1>Unhandled Promise Rejection</h1><pre>' + e.reason?.stack + '</pre></div>';
  });
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <p className="text-gray-800 dark:text-gray-200">Something went wrong — please reload</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
