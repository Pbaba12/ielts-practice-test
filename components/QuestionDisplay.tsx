
import React from 'react';
import { Question, QuestionType, UserAnswer } from '../types';
import { RadioGroup } from './ui/RadioGroup';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  userAnswer: UserAnswer | undefined;
  onAnswerChange: (questionId: string, answer: string | string[]) => void;
  showAnswer: boolean;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
  userAnswer,
  onAnswerChange,
  showAnswer,
}) => {
  const currentAnswer = userAnswer ? userAnswer.answer : '';

  const renderAnswerInput = () => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE_NOT_GIVEN:
        const options = question.options 
          ? question.options.map(opt => ({ label: opt, value: opt }))
          : (question.type === QuestionType.TRUE_FALSE_NOT_GIVEN 
              ? [{label: 'True', value: 'True'}, {label: 'False', value: 'False'}, {label: 'Not Given', value: 'Not Given'}] 
              : []);
        return (
          <RadioGroup
            name={`question-${question.id}`}
            options={options}
            selectedValue={currentAnswer as string}
            onChange={(value) => onAnswerChange(question.id, value)}
          />
        );
      case QuestionType.SHORT_ANSWER:
      case QuestionType.FILL_IN_THE_BLANKS: // Simplified as text input
        return (
          <input
            type="text"
            value={currentAnswer as string}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            placeholder="Type your answer here"
          />
        );
      // case QuestionType.MATCHING_HEADINGS:
      // Simplified: user might type in a letter or number. Or use a dropdown if more complex.
      // For now, also treat as short answer.
      default:
        return (
          <input
            type="text"
            value={currentAnswer as string}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            placeholder="Type your answer here"
          />
        );
    }
  };

  return (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <p className="font-semibold text-gray-800 mb-2">
        <span className="text-primary mr-2">Q{questionNumber}.</span>{question.questionText}
      </p>
      {question.passageMarker && <p className="text-sm text-gray-500 mb-2">Refers to: {question.passageMarker}</p>}
      <div className="my-3">{renderAnswerInput()}</div>
      {showAnswer && (
        <div className="mt-2 p-3 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm font-semibold text-green-700">Correct Answer: <span className="font-normal">{Array.isArray(question.answer) ? question.answer.join(', ') : question.answer}</span></p>
        </div>
      )}
    </div>
  );
};
