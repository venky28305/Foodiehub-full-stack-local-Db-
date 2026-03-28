import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-poppins' });

export const metadata = {
  title: 'FoodieHub - Order Food Online | Best Restaurant Delivery',
  description: 'Discover the best restaurants in your city. Order delicious food online with fast delivery.',
  keywords: 'food delivery, online ordering, restaurants, food near me',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans bg-gray-50`}>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#f97316',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}