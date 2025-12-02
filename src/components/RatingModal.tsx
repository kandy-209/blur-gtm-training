'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface RatingModalProps {
  sessionId: string;
  ratedUserId: string;
  ratedUsername: string;
  onClose: () => void;
  onRated: () => void;
}

export default function RatingModal({
  sessionId,
  ratedUserId,
  ratedUsername,
  onClose,
  onRated,
}: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState<'overall' | 'communication' | 'product_knowledge' | 'objection_handling' | 'closing'>('overall');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Get current user ID from localStorage or session
      const session = localStorage.getItem('supabase_session');
      if (!session) {
        throw new Error('Not authenticated');
      }

      const sessionData = JSON.parse(session);
      const raterUserId = sessionData.user?.id;

      if (!raterUserId) {
        throw new Error('User ID not found');
      }

      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          raterUserId,
          ratedUserId,
          rating,
          category,
          feedback: feedback || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit rating');
      }

      onRated();
      onClose();
    } catch (error: any) {
      alert(error.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rate Your Partner</CardTitle>
              <CardDescription>How was {ratedUsername}'s performance?</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Overall Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Category</Label>
            <Select value={category} onValueChange={(value: any) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall Performance</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="product_knowledge">Product Knowledge</SelectItem>
                <SelectItem value="objection_handling">Objection Handling</SelectItem>
                <SelectItem value="closing">Closing Skills</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Feedback (Optional)</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did they do well? What could be improved?"
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-black hover:bg-gray-900 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

