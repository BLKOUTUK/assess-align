import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import SubmitRequestPage from "@/pages/SubmitRequestPage";
import AssessmentPage from "@/pages/AssessmentPage";
import FeedbackPage from "@/pages/FeedbackPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/submit" element={<SubmitRequestPage />} />
          <Route path="/assess/:requestId" element={<AssessmentPage />} />
          <Route path="/feedback/:requestId" element={<FeedbackPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;