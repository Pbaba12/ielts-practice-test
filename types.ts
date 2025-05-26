
export enum TestSection {
  READING = 'Reading',
  WRITING = 'Writing',
  LISTENING = 'Listening',
  SPEAKING = 'Speaking',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE_NOT_GIVEN = 'TRUE_FALSE_NOT_GIVEN',
  SHORT_ANSWER = 'SHORT_ANSWER',
  MATCHING_HEADINGS = 'MATCHING_HEADINGS', // Added for completeness, UI might simplify
  FILL_IN_THE_BLANKS = 'FILL_IN_THE_BLANKS', // Added for completeness
}

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[];
  answer: string | string[]; // For matching multiple answers or a single string answer
  passageMarker?: string; // e.g., "Paragraph A" for matching headings
}

export interface ReadingContent {
  passage: string;
  questions: Question[];
}

export interface WritingTask {
  type: string; // E.g., "DESCRIBE_GRAPH", "ESSAY"
  prompt: string;
  imageUrl?: string; // Optional image for Task 1
}
export interface WritingTasks {
  task1: WritingTask;
  task2: WritingTask;
}

export interface ListeningContent {
  script: string;
  questions: Question[];
}

export interface SpeakingPrompts {
  part1Prompts: string[];
  part2CueCard: {
    topic: string;
    points: string[];
  };
  part3Prompts: string[];
}

export interface UserAnswer {
  questionId: string;
  answer: string | string[];
}

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string; // Optional
}
