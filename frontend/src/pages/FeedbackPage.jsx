import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Sparkles, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FeedbackPage = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      const response = await axios.get(`${API}/research-requests/${requestId}`);
      setRequest(response.data);
      
      // If assessment is done but no feedback, generate it
      if (response.data.status === 'assessed' && !response.data.ai_feedback) {
        await generateFeedback();
      }
    } catch (error) {
      console.error("Error fetching request:", error);
      toast.error("Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  const generateFeedback = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API}/feedback/generate`, {
        request_id: requestId
      });
      
      // Update the request with generated feedback
      setRequest(prev => ({
        ...prev,
        ai_feedback: response.data.feedback,
        status: 'completed'
      }));
      
      toast.success("Feedback generated successfully!");
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Failed to generate feedback. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const downloadFeedback = () => {
    if (!request?.ai_feedback) return;
    
    const content = `ASSESS & ALIGN - Research Equity Feedback\n\n` +
      `Research Request: ${request.title}\n` +
      `Date: ${new Date(request.created_at).toLocaleDateString()}\n\n` +
      `---\n\n` +
      `${request.ai_feedback}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${request.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Feedback downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-slate-800">AI-Generated Feedback</h1>
          </div>
          {request?.ai_feedback && (
            <Button 
              variant="outline" 
              onClick={downloadFeedback}
              data-testid="download-feedback-btn"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Request Summary */}
        {request && (
          <Card className="mb-8 border-2 border-slate-100" data-testid="feedback-request-summary">
            <CardHeader>
              <CardTitle>Research Request: {request.title}</CardTitle>
              <CardDescription>
                Status: <span className="capitalize font-medium">{request.status}</span>
                {request.researcher_name && ` | Researcher: ${request.researcher_name}`}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Feedback Content */}
        {generating ? (
          <Card className="border-2 border-teal-200">
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Generating Feedback...</h3>
                <p className="text-sm text-slate-600">Our AI is analyzing the assessment responses and creating detailed, constructive feedback.</p>
              </div>
            </CardContent>
          </Card>
        ) : request?.ai_feedback ? (
          <Card className="border-2 border-emerald-200" data-testid="feedback-content-card">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-emerald-700">Equity-Focused Feedback</CardTitle>
              </div>
              <CardDescription>
                Generated by AI based on your equity assessment responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none">
                <div className="bg-white rounded-lg p-6 border border-slate-200 whitespace-pre-wrap text-sm leading-relaxed text-slate-700" data-testid="feedback-text">
                  {request.ai_feedback}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-3">Next Steps</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span>Share this feedback with the researcher</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span>Use it as a starting point for dialogue about research partnership</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span>Download for your records and future reference</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-yellow-200" data-testid="no-feedback-card">
            <CardContent className="py-12">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Feedback Yet</h3>
                <p className="text-sm text-slate-600 mb-6">Complete the equity assessment to generate AI feedback.</p>
                <Button 
                  onClick={() => navigate(`/assess/${requestId}`)}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                  data-testid="go-to-assessment-btn"
                >
                  Go to Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            data-testid="back-home-btn"
          >
            Back to Home
          </Button>
          <Button 
            onClick={() => navigate('/submit')}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
            data-testid="assess-another-btn"
          >
            Assess Another Request
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;