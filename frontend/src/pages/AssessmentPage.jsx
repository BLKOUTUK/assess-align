import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AssessmentPage = () => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState(null);

  useEffect(() => {
    fetchData();
  }, [requestId]);

  const fetchData = async () => {
    try {
      const [questionsRes, requestRes] = await Promise.all([
        axios.get(`${API}/equity-questions`),
        axios.get(`${API}/research-requests/${requestId}`)
      ]);
      
      setQuestions(questionsRes.data.sort((a, b) => a.order - b.order));
      setRequest(requestRes.data);
      
      // Pre-fill if assessment already exists
      if (requestRes.data.assessment_responses?.length > 0) {
        const existingResponses = {};
        requestRes.data.assessment_responses.forEach(resp => {
          existingResponses[resp.question_id] = resp.response;
        });
        setResponses(existingResponses);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load assessment questions");
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all questions are answered
    const unanswered = questions.filter(q => !responses[q.id] || responses[q.id].trim() === "");
    if (unanswered.length > 0) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const assessmentResponses = questions.map(q => ({
        question_id: q.id,
        question_text: q.question,
        response: responses[q.id]
      }));

      await axios.post(`${API}/assessments/submit`, {
        request_id: requestId,
        responses: assessmentResponses
      });

      toast.success("Assessment submitted successfully!");
      navigate(`/feedback/${requestId}`);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading assessment...</p>
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
            <h1 className="text-2xl font-bold text-slate-800">Equity Assessment</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Request Summary */}
        {request && (
          <Card className="mb-8 border-2 border-slate-100" data-testid="request-summary-card">
            <CardHeader>
              <CardTitle>Research Request: {request.title}</CardTitle>
              {request.researcher_name && (
                <CardDescription>
                  Researcher: {request.researcher_name}
                  {request.institution && ` | ${request.institution}`}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{request.email_content}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card 
                key={question.id} 
                className="border-2 border-slate-100 hover:border-teal-200 transition-colors"
                data-testid={`question-card-${index}`}
              >
                <CardHeader>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <CardDescription className="text-xs text-slate-500 mb-2">
                        {question.category}
                      </CardDescription>
                      <CardTitle className="text-base font-medium text-slate-800">
                        {question.question}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter your assessment response..."
                    value={responses[question.id] || ""}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    rows={4}
                    className="border-slate-200 focus:border-teal-500 resize-y"
                    data-testid={`question-response-${index}`}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/')}
              data-testid="cancel-assessment-btn"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
              data-testid="submit-assessment-btn"
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
              <Send className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentPage;