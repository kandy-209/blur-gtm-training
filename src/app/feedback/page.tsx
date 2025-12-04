'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundaryWithContext';
import { useAuth } from '@/hooks/useAuth';

interface FormErrors {
  type?: string;
  subject?: string;
  message?: string;
  rating?: string;
  general?: string;
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'general',
    subject: '',
    message: '',
    rating: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.type) {
      newErrors.type = 'Please select a feedback type';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    } else if (formData.subject.trim().length > 200) {
      newErrors.subject = 'Subject must be no more than 200 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 5000) {
      newErrors.message = 'Message must be no more than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user?.id || 'anonymous',
          email: (user as any)?.email || 'anonymous',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from API
        if (data.details?.errors) {
          const apiErrors: FormErrors = {};
          data.details.errors.forEach((err: { field: string; message: string }) => {
            apiErrors[err.field as keyof FormErrors] = err.message;
          });
          setErrors(apiErrors);
        } else {
          setErrors({ general: data.error || 'Failed to submit feedback. Please try again.' });
        }
        return;
      }

      setSubmitted(true);
      setFormData({ type: 'general', subject: '', message: '', rating: 0 });
      setErrors({});
      
      // Reset submitted state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Feedback submission error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <ProtectedRoute>
      <ErrorBoundaryWithContext component="FeedbackPage">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Share Your Feedback
              </h1>
              <p className="text-gray-600">
                Help us improve by sharing your thoughts, suggestions, or reporting issues
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-gray-900" />
                  <CardTitle>Feedback Form</CardTitle>
                </div>
                <CardDescription>
                  Your feedback helps us make this platform better for everyone
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Thank You!
                    </h3>
                    <p className="text-gray-600">
                      Your feedback has been submitted successfully. We appreciate your input!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {errors.general && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-900">Error</p>
                          <p className="text-sm text-red-700 mt-1">{errors.general}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="type">Feedback Type</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => handleFieldChange('type', e.target.value)}
                        className={`flex h-10 w-full rounded-lg border px-4 py-2 text-sm ${
                          errors.type
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 bg-white'
                        }`}
                        aria-invalid={!!errors.type}
                        aria-describedby={errors.type ? 'type-error' : undefined}
                      >
                        <option value="general">General Feedback</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="improvement">Improvement Suggestion</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.type && (
                        <p id="type-error" className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.type}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="rating">Overall Rating <span className="text-gray-400 font-normal">(Optional)</span></Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleFieldChange('rating', rating)}
                            className={`h-10 w-10 rounded-lg border-2 transition-all hover:scale-110 ${
                              formData.rating >= rating
                                ? 'bg-yellow-400 border-yellow-500'
                                : 'bg-gray-100 border-gray-300 hover:border-gray-400'
                            }`}
                            aria-label={`Rate ${rating} out of 5`}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.rating > 0 ? `${formData.rating} out of 5 stars` : 'Select a rating (optional)'}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="subject">
                        Subject
                        <span className="text-gray-400 font-normal ml-1">
                          ({formData.subject.length}/200)
                        </span>
                      </Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleFieldChange('subject', e.target.value)}
                        placeholder="Brief summary of your feedback"
                        className={errors.subject ? 'border-red-300 bg-red-50' : ''}
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                        maxLength={200}
                      />
                      {errors.subject && (
                        <p id="subject-error" className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message">
                        Message
                        <span className="text-gray-400 font-normal ml-1">
                          ({formData.message.length}/5000)
                        </span>
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleFieldChange('message', e.target.value)}
                        placeholder="Tell us more about your feedback..."
                        rows={6}
                        className={errors.message ? 'border-red-300 bg-red-50' : ''}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                        maxLength={5000}
                      />
                      {errors.message && (
                        <p id="message-error" className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg" 
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ErrorBoundaryWithContext>
    </ProtectedRoute>
  );
}



