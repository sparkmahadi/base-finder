
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
        <Navbar/>
        {children}
        <Footer/>
        <ToastContainer />
      </body>
    </html>
  );
}
