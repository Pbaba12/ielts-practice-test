
import React, { useState, useEffect, useCallback } from 'react';
import { SpeakingPrompts } from '../types';
import { generateSpeakingPrompts } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Timer } from './Timer';
import { Card, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { SPEAKING_PART2_PREP_TIME, SPEAKING_PART2_TALK_TIME } from '../constants';

enum SpeakingPart {
  LOADING,
  INTRO, // Intro message
  PART1,
  PART2_PREP,
  PART2_SPEAK,
  PART3,
  FINISHED
}

interface SpeakingSectionProps {
  userEmail?: string;
}

export const SpeakingSection: React.FC<SpeakingSectionProps> = ({ userEmail }) => {
  const [speakingState, setSpeakingState] = useState<SpeakingPart>(SpeakingPart.LOADING);
  const [prompts, setPrompts] = useState<SpeakingPrompts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimerDuration, setCurrentTimerDuration] = useState(0);

  const fetchPrompts = useCallback(async () => {
    setSpeakingState(SpeakingPart.LOADING);
    setError(null);
    try {
      const fetchedPrompts = await generateSpeakingPrompts();
      if (fetchedPrompts) {
        setPrompts(fetchedPrompts);
        setSpeakingState(SpeakingPart.INTRO);
      } else {
        setError("Failed to load speaking prompts. The content might be invalid or the API limit reached.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching speaking prompts.");
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advanceState = () => {
    setIsTimerRunning(false); // Stop any current timer
    switch (speakingState) {
      case SpeakingPart.INTRO:
        setSpeakingState(SpeakingPart.PART1);
        break;
      case SpeakingPart.PART1:
        setSpeakingState(SpeakingPart.PART2_PREP);
        setCurrentTimerDuration(SPEAKING_PART2_PREP_TIME);
        setIsTimerRunning(true);
        break;
      case SpeakingPart.PART2_PREP: // Timer finished for prep
        setSpeakingState(SpeakingPart.PART2_SPEAK);
        setCurrentTimerDuration(SPEAKING_PART2_TALK_TIME);
        setIsTimerRunning(true);
        break;
      case SpeakingPart.PART2_SPEAK: // Timer finished for talk
        setSpeakingState(SpeakingPart.PART3);
        break;
      case SpeakingPart.PART3:
        setSpeakingState(SpeakingPart.FINISHED);
        break;
      default:
        break;
    }
  };
  
  const handleTimerUp = () => {
    // Automatically advance state when timer is up for Part 2 Prep/Speak
    if (speakingState === SpeakingPart.PART2_PREP || speakingState === SpeakingPart.PART2_SPEAK) {
        advanceState();
    }
  };

  if (speakingState === SpeakingPart.LOADING) return <LoadingSpinner />;
  if (error) return <Card><CardContent><p className="text-red-500 text-center">{error} <Button onClick={fetchPrompts} className="mt-2">Try Again</Button></p></CardContent></Card>;
  if (!prompts) return <Card><CardContent><p className="text-center">No prompts available. <Button onClick={fetchPrompts} className="mt-2">Load Prompts</Button></p></CardContent></Card>;

  let currentPartTitle = "";
  let contentEl: React.ReactNode = null;

  switch (speakingState) {
    case SpeakingPart.INTRO:
      currentPartTitle = "Welcome to the Speaking Test";
      contentEl = (
        <>
          <p className="mb-4 text-lg">This simulates the IELTS Speaking test. You will be presented with prompts for Part 1, Part 2 (with preparation time), and Part 3.</p>
          <p className="mb-6">Prepare to speak as if you are in a real test. There is no recording in this simulation.</p>
          <Button onClick={advanceState} size="lg">Start Part 1</Button>
        </>
      );
      break;
    case SpeakingPart.PART1:
      currentPartTitle = "Speaking: Part 1";
      contentEl = (
        <>
          <p className="mb-4 text-gray-600">Answer the following questions.</p>
          <ul className="list-disc list-inside space-y-3 mb-6 pl-4">
            {prompts.part1Prompts && prompts.part1Prompts.length > 0 ? (
                prompts.part1Prompts.map((prompt, i) => <li key={i} className="text-lg">{prompt}</li>)
            ) : (
                <li>No Part 1 prompts available.</li>
            )}
          </ul>
          <Button onClick={advanceState}>Proceed to Part 2</Button>
        </>
      );
      break;
    case SpeakingPart.PART2_PREP:
      currentPartTitle = "Speaking: Part 2 - Preparation";
      contentEl = (
        <>
          <p className="mb-2 text-gray-600">You have {SPEAKING_PART2_PREP_TIME} minute to prepare your answer for the following topic. You can make notes.</p>
          <Timer initialMinutes={SPEAKING_PART2_PREP_TIME} onTimeUp={handleTimerUp} isRunning={isTimerRunning} />
          <Card className="my-6 bg-blue-50 border border-blue-200">
            <CardTitle className="text-xl text-blue-700">{prompts.part2CueCard?.topic || "Topic not available."}</CardTitle>
            <CardContent>
              <p className="font-semibold mb-2">You should say:</p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                {prompts.part2CueCard?.points && prompts.part2CueCard.points.length > 0 ? (
                    prompts.part2CueCard.points.map((point, i) => <li key={i}>{point}</li>)
                ) : (
                    <li>No specific points provided for this topic.</li>
                )}
              </ul>
            </CardContent>
          </Card>
          <p className="text-sm text-gray-500">The timer will automatically advance you when preparation time is up.</p>
        </>
      );
      break;
    case SpeakingPart.PART2_SPEAK:
      currentPartTitle = "Speaking: Part 2 - Speak Now";
      contentEl = (
        <>
          <p className="mb-2 text-gray-600">Now you need to talk about the topic. The timer is set for {SPEAKING_PART2_TALK_TIME} minutes.</p>
          <Timer initialMinutes={SPEAKING_PART2_TALK_TIME} onTimeUp={handleTimerUp} isRunning={isTimerRunning} />
           <Card className="my-6 bg-green-50 border border-green-200">
            <CardTitle className="text-xl text-green-700">{prompts.part2CueCard?.topic || "Topic not available."}</CardTitle>
            <CardContent>
              <p className="font-semibold mb-2">Remember to cover:</p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                 {prompts.part2CueCard?.points && prompts.part2CueCard.points.length > 0 ? (
                    prompts.part2CueCard.points.map((point, i) => <li key={i}>{point}</li>)
                ) : (
                    <li>No specific points provided for this topic.</li>
                )}
              </ul>
            </CardContent>
          </Card>
          <p className="text-sm text-gray-500">The timer will automatically advance you when speaking time is up.</p>
        </>
      );
      break;
    case SpeakingPart.PART3:
      currentPartTitle = "Speaking: Part 3";
      contentEl = (
        <>
          <p className="mb-4 text-gray-600">Answer the following discussion questions related to the Part 2 topic.</p>
          <ul className="list-disc list-inside space-y-3 mb-6 pl-4">
            {prompts.part3Prompts && prompts.part3Prompts.length > 0 ? (
                prompts.part3Prompts.map((prompt, i) => <li key={i} className="text-lg">{prompt}</li>)
            ) : (
                <li>No Part 3 prompts available.</li>
            )}
          </ul>
          <Button onClick={advanceState}>Finish Speaking Test</Button>
        </>
      );
      break;
    case SpeakingPart.FINISHED:
      currentPartTitle = "Speaking Test Completed";
      let completionMessage = "You have completed the speaking test simulation. Well done!";
      if (userEmail) {
        completionMessage += ` Your mock feedback for this section would be sent to ${userEmail}.`;
      }
      contentEl = (
        <>
          <p className="text-lg text-green-600 mb-6">{completionMessage}</p>
          <Button onClick={fetchPrompts} variant="primary">Start New Speaking Test</Button>
        </>
      );
      break;
  }

  return (
    <Card>
      <CardTitle>{currentPartTitle}</CardTitle>
      <CardContent>
        {contentEl}
      </CardContent>
    </Card>
  );
};
