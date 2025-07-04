import { AuthProvider } from "./context/AuthContext"; // adjust path
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import "./globals.css";
import { ToastContainer } from "react-toastify";

export const metadata = {
  title: "BaseFinder",
  description: "Find your perfect base",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <ToastContainer position="bottom-right"/>
        </AuthProvider>
      </body>
    </html>
  );
}
