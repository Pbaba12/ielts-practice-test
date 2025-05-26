
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ReadingContent, WritingTasks, ListeningContent, SpeakingPrompts, Question } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

// Ensure API_KEY is available in the environment.
// In a real deployment, this key should be handled securely, likely via a backend proxy.
// For this exercise, we assume process.env.API_KEY is set.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please set the process.env.API_KEY environment variable.");
  // Potentially throw an error or have a fallback, but instructions imply it's available.
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Use non-null assertion as per assumption

const parseJsonFromGeminiResponse = <T,>(responseText: string): T | null => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  
  try {
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error("Failed to parse JSON response from Gemini:", error, "Original text:", responseText);
    // Try to find JSON within a potentially larger string
    const jsonStart = jsonStr.indexOf('{');
    const jsonEnd = jsonStr.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        try {
            return JSON.parse(jsonStr.substring(jsonStart, jsonEnd + 1)) as T;
        } catch (e) {
            console.error("Secondary attempt to parse JSON substring failed:", e);
        }
    }
    return null;
  }
};


export const generateReadingContent = async (): Promise<ReadingContent | null> => {
  const prompt = `
    Generate an IELTS Academic Reading passage of about 600-700 words on an academic topic (e.g., science, history, sociology).
    Then, generate 5 IELTS-style questions based on this passage.
    Question types should include a mix of:
    1. MULTIPLE_CHOICE (with 4 options: A, B, C, D)
    2. TRUE_FALSE_NOT_GIVEN
    3. SHORT_ANSWER (answer should be 1-3 words)

    Format the response as a single JSON object with the following structure:
    {
      "passage": "The full reading passage text...",
      "questions": [
        {
          "id": "r_q1",
          "type": "MULTIPLE_CHOICE", 
          "questionText": "What is the main idea of the first paragraph?",
          "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
          "answer": "Option B text" 
        },
        {
          "id": "r_q2",
          "type": "TRUE_FALSE_NOT_GIVEN",
          "questionText": "The author states that...",
          "answer": "True" 
        },
        {
          "id": "r_q3",
          "type": "SHORT_ANSWER",
          "questionText": "According to the passage, what was discovered in 1985?",
          "answer": "a new species"
        }
      ]
    }
    Ensure ids are unique, like r_q1, r_q2, etc. Ensure the 'answer' field contains the correct answer text or value.
    For MULTIPLE_CHOICE, 'options' must be an array of 4 strings. For TRUE_FALSE_NOT_GIVEN, 'options' array is not needed.
  `;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return parseJsonFromGeminiResponse<ReadingContent>(response.text);
  } catch (error) {
    console.error("Error generating reading content:", error);
    return null;
  }
};

export const generateWritingTasks = async (): Promise<WritingTasks | null> => {
  const prompt = `
    Generate IELTS Academic Writing tasks.
    Provide one Task 1 prompt (describing a visual element like a graph, chart, table, or diagram - describe the visual in text rather than providing an image URL).
    Provide one Task 2 prompt (an essay topic).
    Format the response as a single JSON object:
    {
      "task1": {
        "type": "DESCRIBE_CHART", 
        "prompt": "The provided bar chart illustrates the changes in global energy consumption by fuel type from 1980 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant."
      },
      "task2": {
        "type": "ESSAY",
        "prompt": "Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?"
      }
    }
    Ensure the 'type' for task1 reflects the visual (e.g., DESCRIBE_GRAPH, DESCRIBE_TABLE, DESCRIBE_PROCESS).
  `;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return parseJsonFromGeminiResponse<WritingTasks>(response.text);
  } catch (error) {
    console.error("Error generating writing tasks:", error);
    return null;
  }
};

export const generateListeningContent = async (): Promise<ListeningContent | null> => {
  const prompt = `
    Generate an IELTS Listening script (e.g., a conversation between two speakers, or a monologue, about 300-400 words).
    Then, generate 5 IELTS-style questions based on this script.
    Question types should include a mix of:
    1. MULTIPLE_CHOICE (with 3 options: A, B, C)
    2. SHORT_ANSWER (answer should be 1-3 words)

    Format the response as a single JSON object:
    {
      "script": "Speaker A: Hello, I'd like to inquire about joining the library. Speaker B: Certainly...",
      "questions": [
        {
          "id": "l_q1",
          "type": "MULTIPLE_CHOICE",
          "questionText": "Why did the man visit the library?",
          "options": ["To borrow a book", "To join the library", "To use the computer"],
          "answer": "To join the library"
        },
        {
          "id": "l_q2",
          "type": "SHORT_ANSWER",
          "questionText": "What is the membership fee per year?",
          "answer": "twenty pounds"
        }
      ]
    }
    Ensure ids are unique, like l_q1, l_q2, etc.
    For MULTIPLE_CHOICE, 'options' must be an array of 3 strings.
  `;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return parseJsonFromGeminiResponse<ListeningContent>(response.text);
  } catch (error) {
    console.error("Error generating listening content:", error);
    return null;
  }
};

export const generateSpeakingPrompts = async (): Promise<SpeakingPrompts | null> => {
  const prompt = `
    Generate IELTS Speaking prompts covering all three parts.
    Part 1: 3-4 introductory questions on a common topic (e.g., work, study, hobbies, hometown).
    Part 2: A cue card topic. The candidate should describe something, with 3-4 bullet points on what to include.
    Part 3: 3-4 follow-up discussion questions related to the Part 2 topic, exploring more abstract ideas.

    Format the response as a single JSON object:
    {
      "part1Prompts": [
        "Let's talk about your hometown. Can you describe it briefly?",
        "What is the most interesting part of your hometown?",
        "Has your hometown changed much since you were a child?"
      ],
      "part2CueCard": {
        "topic": "Describe an important celebration or festival in your culture.",
        "points": [
          "When this celebration takes place",
          "What people do during this celebration",
          "What you particularly like about it",
          "And explain why it is important in your culture."
        ]
      },
      "part3Prompts": [
        "What is the role of festivals in society today?",
        "Do you think traditional celebrations are losing their importance?",
        "How can celebrating cultural events benefit individuals and communities?"
      ]
    }
  `;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return parseJsonFromGeminiResponse<SpeakingPrompts>(response.text);
  } catch (error) {
    console.error("Error generating speaking prompts:", error);
    return null;
  }
};
