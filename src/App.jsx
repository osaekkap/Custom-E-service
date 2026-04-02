import ErrorBoundary from './components/ErrorBoundary.jsx';
import App from './factory-portal-complete_2.jsx';

export default function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
