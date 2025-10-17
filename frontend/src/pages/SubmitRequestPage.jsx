import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubmitRequestPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    email_content: "",
    researcher_name: "",
    institution: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.email_content) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/research-requests`, formData);
      toast.success("Research request submitted successfully!");
      navigate(`/assess/${response.data.id}`);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-slate-800">Submit Research Request</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-2 border-slate-100 shadow-lg" data-testid="submit-form-card">
          <CardHeader>
            <CardTitle className="text-2xl">Research Request Details</CardTitle>
            <CardDescription>
              Paste or enter the research request email content below. This will be used for equity assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Request Title *</Label>
                <Input
                  id="title"
                  data-testid="request-title-input"
                  placeholder="e.g., Mental Health Study on Black Youth"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  className="border-slate-200 focus:border-teal-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_content" className="text-sm font-medium">Email Content / Research Request *</Label>
                <Textarea
                  id="email_content"
                  data-testid="email-content-textarea"
                  placeholder="Paste the full email or research request here..."
                  value={formData.email_content}
                  onChange={(e) => handleChange('email_content', e.target.value)}
                  required
                  rows={12}
                  className="border-slate-200 focus:border-teal-500 resize-y"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="researcher_name" className="text-sm font-medium">Researcher Name (Optional)</Label>
                  <Input
                    id="researcher_name"
                    data-testid="researcher-name-input"
                    placeholder="e.g., Dr. Jane Smith"
                    value={formData.researcher_name}
                    onChange={(e) => handleChange('researcher_name', e.target.value)}
                    className="border-slate-200 focus:border-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution" className="text-sm font-medium">Institution (Optional)</Label>
                  <Input
                    id="institution"
                    data-testid="institution-input"
                    placeholder="e.g., University of London"
                    value={formData.institution}
                    onChange={(e) => handleChange('institution', e.target.value)}
                    className="border-slate-200 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  data-testid="cancel-btn"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                  data-testid="submit-request-btn"
                >
                  {loading ? "Submitting..." : "Continue to Assessment"}
                  <Send className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmitRequestPage;