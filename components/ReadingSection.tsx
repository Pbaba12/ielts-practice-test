
import React, { useState, useEffect, useCallback } from 'react';
import { ReadingContent, Question, UserAnswer } from '../types';
import { generateReadingContent } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Timer } from './Timer';
import { QuestionDisplay } from './QuestionDisplay';
import { Card, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { READING_TIME_LIMIT } from '../constants';

interface ReadingSectionProps {
  userEmail?: string;
}

export const ReadingSection: React.FC<ReadingSectionProps> = ({ userEmail }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<ReadingContent | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setShowAnswers(false);
    setUserAnswers([]);
    try {
      const fetchedContent = await generateReadingContent();
      if (fetchedContent) {
        setContent(fetchedContent);
        setUserAnswers(fetchedContent.questions?.map(q => ({ questionId: q.id, answer: '' })) || []);
        setIsTimerRunning(true); // Start timer when content is loaded
      } else {
        setError("Failed to load reading content. The content might be invalid or the API limit reached.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching reading content.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setUserAnswers((prevAnswers) =>
      prevAnswers.map((ua) =>
        ua.questionId === questionId ? { ...ua, answer } : ua
      )
    );
  };
  
  const handleTimeUp = () => {
    setIsTimerRunning(false);
    setShowAnswers(true); // Automatically show answers when time is up
    let message = "Time's up for the Reading section!";
    if (userEmail) {
      message += ` Your mock results would be sent to ${userEmail}.`;
    }
    alert(message);
  };

  const handleFinishAndShowAnswers = () => {
    setIsTimerRunning(false); 
    setShowAnswers(true);
    let message = "Reading section finished.";
    if (userEmail) {
      message += ` Mock results for this section would be sent to ${userEmail}.`;
    }
    alert(message);
  }

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Card><CardContent><p className="text-red-500 text-center">{error} <Button onClick={fetchContent} className="mt-2">Try Again</Button></p></CardContent></Card>;
  if (!content) return <Card><CardContent><p className="text-center">No content available. <Button onClick={fetchContent} className="mt-2">Load Content</Button></p></CardContent></Card>;

  return (
    <div className="space-y-8">
      <Card>
        <CardTitle>Reading Section</CardTitle>
        <CardContent className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <p className="text-gray-600">You have {READING_TIME_LIMIT} minutes to complete this section.</p>
            <Timer initialMinutes={READING_TIME_LIMIT} onTimeUp={handleTimeUp} isRunning={isTimerRunning} />
        </CardContent>
      </Card>

      <Card>
        <CardTitle>Reading Passage</CardTitle>
        <CardContent>
          <div className="prose prose-indigo max-w-none leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: content.passage || "Passage not available." }} />
        </CardContent>
      </Card>

      <Card>
        <CardTitle>Questions</CardTitle>
        <CardContent>
          {content.questions && content.questions.length > 0 ? (
            content.questions.map((q, index) => (
              <QuestionDisplay
                key={q.id}
                question={q}
                questionNumber={index + 1}
                userAnswer={userAnswers.find(ua => ua.questionId === q.id)}
                onAnswerChange={handleAnswerChange}
                showAnswer={showAnswers}
              />
            ))
          ) : (
            <p>No questions available for this passage.</p>
          )}
        </CardContent>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end p-6 border-t">
            <Button onClick={handleFinishAndShowAnswers} variant="secondary" disabled={showAnswers}>
                {showAnswers ? "Answers Shown" : "Finish & Show Answers"}
            </Button>
             <Button onClick={fetchContent} variant="primary">
                Load New Test
            </Button>
        </div>
      </Card>
    </div>
  );
};
