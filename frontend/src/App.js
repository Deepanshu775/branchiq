import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Comparison from "@/pages/Comparison";
import Network from "@/pages/Network";
import Consultant from "@/pages/Consultant";
import Recommendations from "@/pages/Recommendations";
import Methodology from "@/pages/Methodology";
import OpportunityMap from "@/pages/OpportunityMap";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="comparison" element={<Comparison />} />
              <Route path="network" element={<Network />} />
              <Route path="opportunity-map" element={<OpportunityMap />} />
              <Route path="consultant" element={<Consultant />} />
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="methodology" element={<Methodology />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AppProvider>
    </div>
  );
}

export default App;
