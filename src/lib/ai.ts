// src/lib/ai.ts
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

export async function summarizeText(text: string): Promise<string> {
  try {
    const prompt = `Summarize the following note in 2-3 concise sentences, preserving key points and tone.\n\nNote:\n${text}`;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contents: [{ 
          parts: [{ text: prompt }] 
        }] 
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated.";
    
    return summary.trim();

  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
}

export async function suggestTags(text: string, maxTags = 5): Promise<string[]> {
  try {
    const prompt = `Read the note below and return a JSON array of ${maxTags} short, lowercase tags (single or double words).\nOnly return the JSON array, no explanation.\n\nNote:\n${text}`;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contents: [{ 
          parts: [{ text: prompt }] 
        }] 
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    try {
      // Try to parse as JSON first
      const json = JSON.parse(raw.trim());
      if (Array.isArray(json)) {
        return json.map((t) => String(t)).slice(0, maxTags);
      }
    } catch {
      // Fallback: extract tags from response text
      console.log("Failed to parse JSON, using fallback parsing");
    }
    
    // Fallback parsing
    return raw
      .replace(/\[|\]|`|\n|\r|"/g, " ")
      .split(/[,;]+/)
      .map((s : any) => s.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, maxTags);

  } catch (error) {
    console.error("Error generating tags:", error);
    throw new Error("Failed to generate tags");
  }
}