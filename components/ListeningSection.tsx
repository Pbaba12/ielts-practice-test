
import React, { useState, useEffect, useCallback } from 'react';
import { ListeningContent, UserAnswer } from '../types';
import { generateListeningContent } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Timer } from './Timer';
import { QuestionDisplay } from './QuestionDisplay';
import { Card, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { LISTENING_QUESTION_TIME_LIMIT } from '../constants';

enum ListeningState {
  LOADING,
  READY_TO_LISTEN, // User sees "Start Listening" button
  LISTENING,       // Script is shown, user "listens" (reads)
  ANSWERING,       // Questions are shown, timer starts
  SHOWING_ANSWERS
}

interface ListeningSectionProps {
  userEmail?: string;
}

export const ListeningSection: React.FC<ListeningSectionProps> = ({ userEmail }) => {
  const [listeningState, setListeningState] = useState<ListeningState>(ListeningState.LOADING);
  const [content, setContent] = useState<ListeningContent | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const fetchContent = useCallback(async () => {
    setListeningState(ListeningState.LOADING);
    setError(null);
    setUserAnswers([]);
    setIsTimerRunning(false);
    try {
      const fetchedContent = await generateListeningContent();
      if (fetchedContent) {
        setContent(fetchedContent);
        setUserAnswers(fetchedContent.questions?.map(q => ({ questionId: q.id, answer: '' })) || []);
        setListeningState(ListeningState.READY_TO_LISTEN);
      } else {
        setError("Failed to load listening content. The content might be invalid or the API limit reached.");
        setListeningState(ListeningState.LOADING); // Or an error state
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching listening content.");
      setListeningState(ListeningState.LOADING); // Or an error state
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
  
  const handleStartListening = () => {
    setListeningState(ListeningState.LISTENING);
  };

  const handleFinishListening = () => {
    setListeningState(ListeningState.ANSWERING);
    setIsTimerRunning(true);
  };

  const handleTimeUp = () => {
    setIsTimerRunning(false);
    setListeningState(ListeningState.SHOWING_ANSWERS); 
    let message = "Time's up for answering Listening questions!";
    if (userEmail) {
      message += ` Your mock results would be sent to ${userEmail}.`;
    }
    alert(message);
  };

  const handleShowAnswers = () => {
    setIsTimerRunning(false);
    setListeningState(ListeningState.SHOWING_ANSWERS);
    let message = "Listening section finished.";
     if (userEmail) {
      message += ` Mock results for this section would be sent to ${userEmail}.`;
    }
    alert(message);
  }

  if (listeningState === ListeningState.LOADING) return <LoadingSpinner />;
  if (error) return <Card><CardContent><p className="text-red-500 text-center">{error} <Button onClick={fetchContent} className="mt-2">Try Again</Button></p></CardContent></Card>;
  if (!content) return <Card><CardContent><p className="text-center">No content available. <Button onClick={fetchContent} className="mt-2">Load Content</Button></p></CardContent></Card>;

  return (
    <div className="space-y-8">
      <Card>
        <CardTitle>Listening Section</CardTitle>
        <CardContent>
          {listeningState === ListeningState.READY_TO_LISTEN && (
            <div className="text-center">
              <p className="mb-4 text-lg">You will "listen" to a recording (read a script) once. Then you will answer questions.</p>
              <Button onClick={handleStartListening} size="lg">Start Listening Simulation</Button>
            </div>
          )}
          {listeningState === ListeningState.LISTENING && (
            <div>
                <h3 className="text-xl font-semibold mb-3">Listening Script (Read Carefully)</h3>
                <div className="prose prose-indigo max-w-none p-4 border rounded-md bg-gray-50 h-96 overflow-y-auto whitespace-pre-line">
                    {content.script || "Script not available."}
                </div>
                <Button onClick={handleFinishListening} className="mt-6 w-full" size="lg">I've Finished Reading, Show Questions</Button>
            </div>
          )}
          {(listeningState === ListeningState.ANSWERING || listeningState === ListeningState.SHOWING_ANSWERS) && (
            <>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <p className="text-gray-600">Answer the questions based on the script you read. You have {LISTENING_QUESTION_TIME_LIMIT} minutes.</p>
                <Timer initialMinutes={LISTENING_QUESTION_TIME_LIMIT} onTimeUp={handleTimeUp} isRunning={isTimerRunning && listeningState === ListeningState.ANSWERING} />
              </div>
              {content.questions && content.questions.length > 0 ? (
                content.questions.map((q, index) => (
                  <QuestionDisplay
                    key={q.id}
                    question={q}
                    questionNumber={index + 1}
                    userAnswer={userAnswers.find(ua => ua.questionId === q.id)}
                    onAnswerChange={handleAnswerChange}
                    showAnswer={listeningState === ListeningState.SHOWING_ANSWERS}
                  />
                ))
              ) : (
                <p>No questions available for this script.</p>
              )}
            </>
          )}
        </CardContent>
         {(listeningState === ListeningState.ANSWERING || listeningState === ListeningState.SHOWING_ANSWERS) && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end p-6 border-t">
                <Button 
                    onClick={handleShowAnswers} 
                    variant="secondary" 
                    disabled={listeningState === ListeningState.SHOWING_ANSWERS}
                >
                    {listeningState === ListeningState.SHOWING_ANSWERS ? "Answers Shown" : "Finish & Show Answers"}
                </Button>
                <Button onClick={fetchContent} variant="primary">
                    Load New Test
                </Button>
            </div>
         )}
      </Card>
    </div>
  );
};
