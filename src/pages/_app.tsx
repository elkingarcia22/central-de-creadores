import { AppProps } from 'next/app';
import { ThemeProvider } from '../contexts/ThemeContext';
import { UserProvider } from '../contexts/UserContext';
import { RolProvider } from '../contexts/RolContext';
import { FastUserProvider } from '../contexts/FastUserContext';
import { ToastProvider, useToast } from '../contexts/ToastContext';
import ToastContainer from '../components/ui/ToastContainer';
import '../styles/globals.css';
import '../styles/sidepanel-fix.css';

// Componente interno para usar useToast
function AppContent({ Component, pageProps, router }: AppProps) {
  const { toasts, removeToast } = useToast();
  
  return (
    <>
      <Component {...pageProps} />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
}

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <ThemeProvider>
      <UserProvider>
        <RolProvider>
          <FastUserProvider>
            <ToastProvider>
              <AppContent Component={Component} pageProps={pageProps} router={router} />
            </ToastProvider>
          </FastUserProvider>
        </RolProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default MyApp;

