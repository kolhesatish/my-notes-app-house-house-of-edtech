import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function summarizeText(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Summarize the following note in 2-3 concise sentences, preserving key points and tone.\n\nNote:\n${text}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

export async function suggestTags(text: string, maxTags = 5): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Read the note below and return a JSON array of ${maxTags} short, lowercase tags (single or double words).\nOnly return the JSON array, no explanation.\n\nNote:\n${text}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const raw = response.text().trim();
  try {
    const json = JSON.parse(raw);
    if (Array.isArray(json)) {
      return json.map((t) => String(t)).slice(0, maxTags);
    }
  } catch {
    // fallback: split by commas/lines
  }
  return raw
    .replace(/\[|\]|`|\n|\r/g, " ")
    .split(/[,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, maxTags);
}
