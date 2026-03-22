export const metadata = {
  title: 'RNG Switch Remote',
  description: 'Remote UI for Raspberry Pi RNG hybrid app',
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
