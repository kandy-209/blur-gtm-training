'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Lightbulb, 
  ExternalLink, 
  Plus,
  Star,
  X
} from 'lucide-react';

interface ResourceLink {
  id: string;
  url: string;
  title: string;
  type: string;
}

interface MessageFeedbackWidgetProps {
  messageId: string;
  originalMessage: string;
  objectionCategory: string;
  scenarioId?: string;
  onFeedbackSubmitted?: () => void;
}

export default function MessageFeedbackWidget({
  messageId,
  originalMessage,
  objectionCategory,
  scenarioId,
  onFeedbackSubmitted,
}: MessageFeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [improvedMessage, setImprovedMessage] = useState('');
  const [improvementReason, setImprovementReason] = useState('');
  const [originalRating, setOriginalRating] = useState(3);
  const [improvedRating, setImprovedRating] = useState(4);
  const [resourceLinks, setResourceLinks] = useState<ResourceLink[]>([]);
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIImprovements, setShowAIImprovements] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleAddResource = () => {
    if (newResourceUrl && newResourceTitle) {
      setResourceLinks([
        ...resourceLinks,
        {
          id: `res_${Date.now()}`,
          url: newResourceUrl,
          title: newResourceTitle,
          type: 'blog_post',
        },
      ]);
      setNewResourceUrl('');
      setNewResourceTitle('');
    }
  };

  const handleGenerateAIImprovements = async () => {
    setShowAIImprovements(true);
    setLoadingAI(true);
    
    try {
      const response = await fetch('/api/agents/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: 'improve-with-resources',
          input: {
            originalMessage,
            objectionCategory,
          },
          context: { scenarioId },
        }),
      });
      
      const data = await response.json();
      if (data.success && data.data) {
        setAiSuggestions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to generate AI improvements:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/messaging/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          messageType: 'response',
          originalMessage,
          improvedMessage: improvedMessage || undefined,
          feedbackText,
          improvementReason: improvementReason || undefined,
          resourceLinks,
          originalRating,
          improvedRating: improvedMessage ? improvedRating : undefined,
          objectionCategory,
          scenarioId,
          useCase: 'general',
        }),
      });
      
      if (response.ok) {
        setIsOpen(false);
        setFeedbackText('');
        setImprovedMessage('');
        setResourceLinks([]);
        setShowAIImprovements(false);
        setAiSuggestions([]);
        onFeedbackSubmitted?.();
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 mt-2"
      >
        <Lightbulb className="h-4 w-4" />
        Improve this message
      </Button>
    );
  }

  return (
    <Card className="mt-4 border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Improve this message
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Original message */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Original message</Label>
          <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm leading-relaxed">
            {originalMessage}
          </div>
        </div>

        {/* AI improvement suggestions */}
        <div>
          <Button
            variant="outline"
            onClick={handleGenerateAIImprovements}
            disabled={loadingAI}
            className="w-full border-gray-300 hover:bg-gray-50"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            {loadingAI ? 'Generating suggestions...' : 'Generate AI improvement suggestions'}
          </Button>
          
          {showAIImprovements && aiSuggestions.length > 0 && (
            <div className="mt-4 space-y-3">
              {aiSuggestions.map((suggestion, idx) => (
                <Card key={idx} className="p-4 border-gray-200">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                          Suggestion {idx + 1}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300">
                          {suggestion.confidenceScore || 75}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-3 leading-relaxed">
                        {suggestion.improvedMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {suggestion.improvementSummary}
                      </p>
                      {suggestion.matchedResources && suggestion.matchedResources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                          {suggestion.matchedResources.map((link: ResourceLink) => (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 font-medium transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              {link.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setImprovedMessage(suggestion.improvedMessage);
                        setImprovementReason(suggestion.improvementSummary);
                        if (suggestion.matchedResources) {
                          setResourceLinks(suggestion.matchedResources);
                        }
                      }}
                      className="shrink-0 border-gray-300 hover:bg-gray-50"
                    >
                      Use this
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Feedback form */}
        <div>
          <Label htmlFor="feedback-text">
            What could be improved? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="feedback-text"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Describe what could be improved about this message..."
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Improved message (optional) */}
        <div>
          <Label htmlFor="improved-message">
            Your improved version (optional)
          </Label>
          <Textarea
            id="improved-message"
            value={improvedMessage}
            onChange={(e) => setImprovedMessage(e.target.value)}
            placeholder="Rewrite the message with your improvements..."
            className="mt-1"
            rows={4}
          />
        </div>

        {/* Improvement reason */}
        {improvedMessage && (
          <div>
            <Label htmlFor="improvement-reason">
              Why is this better?
            </Label>
            <Textarea
              id="improvement-reason"
              value={improvementReason}
              onChange={(e) => setImprovementReason(e.target.value)}
              placeholder="Explain why your improved version is better..."
              className="mt-1"
              rows={2}
            />
          </div>
        )}

        {/* Ratings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Original message rating</Label>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOriginalRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= originalRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                {originalRating}/5
              </span>
            </div>
          </div>
          
          {improvedMessage && (
            <div>
              <Label>Improved message rating</Label>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setImprovedRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= improvedRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {improvedRating}/5
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Resource links */}
        <div>
          <Label>Relevant resources (blog posts, docs, etc.)</Label>
          <div className="mt-1 space-y-2">
            {resourceLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {link.title}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setResourceLinks(resourceLinks.filter((l) => l.id !== link.id))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Input
                placeholder="Resource URL"
                value={newResourceUrl}
                onChange={(e) => setNewResourceUrl(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Title"
                value={newResourceTitle}
                onChange={(e) => setNewResourceTitle(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddResource}
                disabled={!newResourceUrl || !newResourceTitle}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handleSubmitFeedback}
            disabled={!feedbackText.trim() || isSubmitting}
            className="flex-1 bg-black hover:bg-gray-900 text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit feedback'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
            className="border-gray-300"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

