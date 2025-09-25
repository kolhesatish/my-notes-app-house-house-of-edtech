"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";

type Props = {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  onSave: (data: { title: string; content: string; tags: string[] }) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

export default function NoteEditor({ initialTitle = "", initialContent = "", initialTags = [], onSave, onDelete }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [loading, setLoading] = useState(false);
  const [summaryDialog, setSummaryDialog] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");

  async function summarize(): Promise<void> {
    setLoading(true);
    setSummaryDialog(true);
    try {
      const res = await fetch("/api/ai/summarize", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ content }) 
      });
      const data: { summary?: string } = await res.json();
      if (data.summary) {
        setGeneratedSummary(data.summary);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      setGeneratedSummary("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function addSummaryToNote(): void {
    setContent((prev: string) => `${prev}\n\n---\n📝 AI Summary:\n${generatedSummary}`);
    setSummaryDialog(false);
    setGeneratedSummary("");
  }

  async function generateTags(): Promise<void> {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/tags", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ content }) 
      });
      const data: unknown = await res.json();

      const hasTagsArray = (x: unknown): x is { tags: string[] } =>
        typeof x === 'object' &&
        x !== null &&
        'tags' in x &&
        Array.isArray((x as { tags?: unknown }).tags);
      const hasTagsString = (x: unknown): x is { tags: string } =>
        typeof x === 'object' &&
        x !== null &&
        'tags' in x &&
        typeof (x as { tags?: unknown }).tags === 'string';

      let newTags: string[] = [];

      if (hasTagsArray(data)) {
        newTags = data.tags;
      } else if (Array.isArray(data)) {
        newTags = (data as unknown[]).map((t) => String(t));
      } else if (hasTagsString(data)) {
        try {
          const parsedTags: unknown = JSON.parse(data.tags);
          newTags = Array.isArray(parsedTags) ? (parsedTags as unknown[]).map((t) => String(t)) : [];
        } catch {
          newTags = data.tags.split(',').map((tag: string) => tag.trim().replace(/['"]/g, ''));
        }
      } else if (typeof data === 'string') {
        try {
          const parsedTags: unknown = JSON.parse(data);
          newTags = Array.isArray(parsedTags) ? (parsedTags as unknown[]).map((t) => String(t)) : [];
        } catch {
          newTags = data.split(',').map((tag: string) => tag.trim().replace(/['"]/g, ''));
        }
      }
      const cleanedTags2: string[] = newTags
      .map((tag: unknown) => {
        let s = String(tag || "").trim();

        // remove surrounding quotes
        s = s.replace(/^["']|["']$/g, "").trim();

        // remove leading 'json' tokens like "json nextjs" or "JSON:nextjs" or "json-nextjs"
        s = s.replace(/^\s*json(?:[:\-\s]+)?/i, "").trim();

        return s;
      })
      .filter((tag: string) => {
        // drop empty, pure "json", overly long tags or tags with only punctuation
        if (!tag) return false;
        if (/^json$/i.test(tag)) return false;
        if (tag.length > 50) return false;
        if (/^[\W_]+$/.test(tag)) return false;
        return true;
      });
      // Clean up tags and merge with existing ones
      const cleanedTags: string[] = cleanedTags2
        .map((tag: unknown) => String(tag).trim().replace(/['"]/g, ''))
        .filter((tag: string) => tag.length > 0 && tag.length < 50); // Reasonable tag length limit
      
      if (cleanedTags.length > 0) {
        const updatedTags = Array.from(new Set([...(tags || []), ...cleanedTags]));
        setTags(updatedTags);
        setTagInputValue(updatedTags.join(", "));
      }

      

      
    } catch (error) {
      console.error("Error generating tags:", error);
      // Optionally show user feedback
    } finally {
      setLoading(false);
    }
  }

  const [tagInputValue, setTagInputValue] = useState<string>(initialTags.join(", "));

  // Update tag input when tags change from external sources (like AI generation)
  useEffect(() => {
    setTagInputValue(tags.join(", "));
  }, [tags]);

  function handleTagInputChange(value: string): void {
    setTagInputValue(value);
  }

  function processTagInput(): void {
    const newTags = tagInputValue.split(",").map((t: string) => t.trim()).filter(Boolean);
    setTags(newTags);
    setTagInputValue(newTags.join(", "));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") {
      e.preventDefault();
      processTagInput();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
        rows={12}
className="border border-gray-300 rounded-md p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
      <input
        value={tagInputValue}
        onChange={(e) => handleTagInputChange(e.target.value)}
        onBlur={processTagInput}
        onKeyDown={handleTagKeyDown}
        placeholder="tags, comma, separated"
className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
      <div className="flex flex-wrap gap-2 items-center">
        <button 
          disabled={loading} 
          onClick={() => onSave({ title, content, tags })} 
          className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          Save
        </button>
        
        {onDelete && (
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                Delete
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in-0" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-gray-300 rounded-md p-4 w-[90vw] max-w-md animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]">
                <Dialog.Title className="font-medium mb-2">Delete note?</Dialog.Title>
                <Dialog.Description className="text-sm mb-4">This action cannot be undone.</Dialog.Description>
                <div className="flex justify-end gap-2">
                  <Dialog.Close asChild>
                    <button className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <button 
                      onClick={() => onDelete?.()} 
                      className="border border-red-600 rounded-md px-3 py-2 text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
        
        <div className="mx-2" />
        
        <button 
          disabled={loading} 
          onClick={summarize} 
          className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && summaryDialog ? "✨ Generating..." : "✨ Summarize with AI"}
        </button>
        
        <button 
          disabled={loading} 
          onClick={generateTags} 
          className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && !summaryDialog ? "🏷️ Generating..." : "🏷️ Generate Tags"}
        </button>
      </div>

      {/* Cool Summary Popup */}
     <Dialog.Root open={summaryDialog} onOpenChange={setSummaryDialog}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
    <Dialog.Content 
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 card w-[90vw] max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl" 
      style={{backgroundColor: 'var(--background)', borderColor: 'var(--border-color)'}}
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center" 
          style={{backgroundColor: 'var(--foreground)'}}
        >
          <span className="text-lg" style={{color: 'var(--background)'}}>✨</span>
        </div>
        <div>
          <Dialog.Title 
            className="text-lg font-semibold" 
            style={{color: 'var(--foreground)'}}
          >
            AI Summary Generated
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted">
            Here&apos;s your intelligent summary
          </Dialog.Description>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" 
              style={{borderColor: 'var(--border-color)', borderTopColor: 'transparent'}}
            ></div>
            <p className="text-sm text-muted">
              AI is analyzing your content...
            </p>
          </div>
        </div>
      ) : (
        <>
          <div 
            className="card mb-6" 
            style={{backgroundColor: 'var(--button-hover)', borderColor: 'var(--border-color)'}}
          >
            <div 
              className="text-sm whitespace-pre-wrap leading-relaxed" 
              style={{color: 'var(--foreground)'}}
            >
              {generatedSummary || "No summary generated yet."}
            </div>
          </div>
          
          <div 
            className="card mb-6" 
            style={{
              backgroundColor: 'var(--button-hover)', 
              borderColor: 'var(--border-color)',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">❓</span>
              <h4 
                className="font-medium" 
                style={{color: 'var(--foreground)'}}
              >
                What would you like to do?
              </h4>
            </div>
            <p className="text-sm text-muted">
              Would you like to add this AI-generated summary to your note, or would you prefer to cancel and keep your note unchanged?
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <Dialog.Close asChild>
              <button className="button">
                Cancel
              </button>
            </Dialog.Close>
            <button 
              onClick={addSummaryToNote}
              disabled={!generatedSummary}
              className="button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Yes, Add to Note
            </button>
          </div>
        </>
      )}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
    </div>
  );
}
