import { GeoSyncProvider } from '@/context/GeoSyncContext';
import { Inter, Fira_Code } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-fira-code' });

export const metadata = {
    title: 'Real-Time Geo-Sync',
    description: 'Synchronize map views in real-time between a Tracker and Follower.',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
            </head>
            <body className="font-sans antialiased bg-black text-white overflow-x-hidden">
                <GeoSyncProvider>
                    {children}
                </GeoSyncProvider>
            </body>
        </html>
    );
}
