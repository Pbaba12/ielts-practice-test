
import React, { useState, useEffect, useCallback } from 'react';
import { WritingTasks } from '../types';
import { generateWritingTasks } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Timer } from './Timer';
import { Card, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { TextArea } from './ui/TextArea';
import { WRITING_TIME_LIMIT } from '../constants';

interface WritingSectionProps {
  userEmail?: string;
}

export const WritingSection: React.FC<WritingSectionProps> = ({ userEmail }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<WritingTasks | null>(null);
  const [task1Answer, setTask1Answer] = useState('');
  const [task2Answer, setTask2Answer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setTask1Answer('');
    setTask2Answer('');
    setSubmitted(false);
    try {
      const fetchedTasks = await generateWritingTasks();
      if (fetchedTasks) {
        setTasks(fetchedTasks);
        setIsTimerRunning(true);
      } else {
        setError("Failed to load writing tasks. The content might be invalid or the API limit reached.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching writing tasks.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (isTimeUp: boolean = false) => {
    setIsTimerRunning(false);
    setSubmitted(true);
    
    let message = isTimeUp 
      ? "Time's up for the Writing section! Your answers have been submitted." 
      : "Writing submitted!";
      
    if (userEmail) {
      message += ` Mock results would be sent to ${userEmail}.`;
    }
    message += " (Answers logged to console for review)";
    alert(message);
    console.log("Task 1 Answer:", task1Answer);
    console.log("Task 2 Answer:", task2Answer);
  };
  
  const handleTimeUp = () => {
    handleSubmit(true); 
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Card><CardContent><p className="text-red-500 text-center">{error} <Button onClick={fetchTasks} className="mt-2">Try Again</Button></p></CardContent></Card>;
  if (!tasks) return <Card><CardContent><p className="text-center">No tasks available. <Button onClick={fetchTasks} className="mt-2">Load Tasks</Button></p></CardContent></Card>;

  return (
    <div className="space-y-8">
      <Card>
        <CardTitle>Writing Section</CardTitle>
        <CardContent className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
           <p className="text-gray-600">You have {WRITING_TIME_LIMIT} minutes for both tasks. Recommended time: 20 mins for Task 1, 40 mins for Task 2.</p>
           <Timer initialMinutes={WRITING_TIME_LIMIT} onTimeUp={handleTimeUp} isRunning={isTimerRunning} />
        </CardContent>
      </Card>

      <Card>
        <CardTitle>Task 1: {tasks.task1.type.replace(/_/g, ' ')}</CardTitle>
        <CardContent>
          <p className="mb-4 prose max-w-none">{tasks.task1.prompt}</p>
          {tasks.task1.imageUrl && (
            <div className="my-4">
                <img src={tasks.task1.imageUrl} alt="Task 1 Visual" className="max-w-full h-auto rounded-md shadow-md mx-auto" />
            </div>
           )}
          <TextArea
            label="Your Answer for Task 1"
            value={task1Answer}
            onChange={(e) => setTask1Answer(e.target.value)}
            disabled={submitted || !isTimerRunning}
            placeholder="Write at least 150 words..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardTitle>Task 2: Essay</CardTitle>
        <CardContent>
          <p className="mb-4 prose max-w-none">{tasks.task2.prompt}</p>
          <TextArea
            label="Your Answer for Task 2"
            value={task2Answer}
            onChange={(e) => setTask2Answer(e.target.value)}
            disabled={submitted || !isTimerRunning}
            placeholder="Write at least 250 words..."
          />
        </CardContent>
      </Card>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end p-6 border-t">
        <Button onClick={() => handleSubmit(false)} variant="success" disabled={submitted || !isTimerRunning}>
          {submitted ? "Submitted" : "Submit Writing"}
        </Button>
        <Button onClick={fetchTasks} variant="primary">
            Load New Tasks
        </Button>
      </div>
    </div>
  );
};
