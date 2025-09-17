import { AppProps } from 'next/app';
import '../styles/globals.css';
import { UserProvider } from '../contexts/UserContext';
import { FastUserProvider } from '../contexts/FastUserContext';
import { RolProvider } from '../contexts/RolContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider, useToast } from '../contexts/ToastContext';
import ToastContainer from '../components/ui/ToastContainer';

// Componente interno para renderizar toasts
function ToastRenderer() {
  const { toasts, removeToast } = useToast();
  return <ToastContainer toasts={toasts} onRemoveToast={removeToast} />;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <UserProvider>
        <FastUserProvider>
          <RolProvider>
            <ToastProvider>
              <Component {...pageProps} />
              <ToastRenderer />
            </ToastProvider>
          </RolProvider>
        </FastUserProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default MyApp;
