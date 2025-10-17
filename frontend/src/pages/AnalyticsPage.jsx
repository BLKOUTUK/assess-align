import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, FileText, CheckCircle2, Calendar } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, requestsRes] = await Promise.all([
        axios.get(`${API}/analytics/summary`),
        axios.get(`${API}/research-requests`)
      ]);
      
      setAnalytics(analyticsRes.data);
      setRequests(requestsRes.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ));
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
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
            <h1 className="text-2xl font-bold text-slate-800">Impact Analytics</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 border-teal-100" data-testid="stat-total-requests">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-teal-700">{analytics?.total_requests || 0}</div>
                <FileText className="w-8 h-8 text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100" data-testid="stat-completed">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Completed Assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-emerald-700">{analytics?.completed_assessments || 0}</div>
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100" data-testid="stat-this-month">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">This Month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-700">{analytics?.recent_requests_this_month || 0}</div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100" data-testid="stat-completion-rate">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Completion Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-purple-700">
                  {analytics?.total_requests > 0 
                    ? Math.round((analytics.completed_assessments / analytics.total_requests) * 100) 
                    : 0}%
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests Table */}
        <Card className="border-2 border-slate-100" data-testid="requests-table-card">
          <CardHeader>
            <CardTitle>Recent Research Requests</CardTitle>
            <CardDescription>
              Anonymized overview of assessed research requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No research requests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Institution</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request, index) => (
                      <tr 
                        key={request.id} 
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        data-testid={`request-row-${index}`}
                      >
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(request.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {request.title}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {request.institution || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            request.status === 'assessed' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/feedback/${request.id}`)}
                            data-testid={`view-request-btn-${index}`}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="mt-8 border-2 border-slate-100 bg-white/50">
          <CardHeader>
            <CardTitle className="text-lg">About These Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">
              These analytics provide an anonymized overview of research equity assessments conducted using Assess & Align. 
              The data helps identify trends in research requests and track the tool's impact in promoting equitable 
              research practices with Black communities. All data is stored securely and used solely for impact measurement.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;