import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Footer } from "@/components/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
    <Toaster />
  </BrowserRouter>
);

export default App;
