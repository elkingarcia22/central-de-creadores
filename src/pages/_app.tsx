import { AppProps } from 'next/app';
import '../styles/globals.css';
import { UserProvider } from '../contexts/UserContext';
import { FastUserProvider } from '../contexts/FastUserContext';
import { RolProvider } from '../contexts/RolContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <UserProvider>
        <FastUserProvider>
          <RolProvider>
            <ToastProvider>
              <Component {...pageProps} />
            </ToastProvider>
          </RolProvider>
        </FastUserProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default MyApp;
