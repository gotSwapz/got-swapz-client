import { Route, Routes } from "react-router-dom";
import { Navbar } from "./navigation/Navbar";
import { pages } from "./navigation/Pages";
import { SignerProvider } from "./context/SignerProvider";
import { NotFoundPage } from "./pages/NotFound";
import { Footer } from "./components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BetaBanner } from "./components/BetaBanner";
import { NetworkBanner } from "./components/NetworkBanner";
import { getBannerDismissed } from "./utils/localStorage";

function App() {
  return (
    <div
      className="bg-prim-bg m-0 p-0 w-full text-white font-sans font-medium flex flex-col 
        justify-between min-h-screen"
    >
      <div>
        <SignerProvider>
          {!getBannerDismissed() && <BetaBanner />}
          <NetworkBanner />
          <Navbar />
          <Routes>
            {pages.map((page) => (
              <Route
                key={page.key}
                path={page.route}
                element={page.component}
              />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SignerProvider>

        <ToastContainer
          position={toast.POSITION.BOTTOM_LEFT}
          newestOnTop
          pauseOnFocusLoss
          pauseOnHover
          draggable
          theme="colored"
        />
      </div>
      <Footer />
    </div>
  );
}

export default App;
