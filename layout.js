import "./globals.css";

export const metadata = {
  title: "KhatraDJ.com - DJ Song Download",
  description: "KhatraDJ.com song download and upload platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}