import '../styles/globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'HopperFlix',
  description: 'Movie Recommendation Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
