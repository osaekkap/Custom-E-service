import { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ToastContainer from './components/ui/Toast.jsx';
import { useToast } from './stores/ToastContext.jsx';
import { registerToastHandler } from './api/client.js';
import App from './factory-portal-complete_2.jsx';

function AppWithToast() {
  const { addToast } = useToast();
  useEffect(() => { registerToastHandler(addToast); }, [addToast]);
  return (
    <>
      <App />
      <ToastContainer />
    </>
  );
}

export default function Root() {
  return (
    <ErrorBoundary>
      <AppWithToast />
    </ErrorBoundary>
  );
}
