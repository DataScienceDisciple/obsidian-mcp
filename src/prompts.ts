export interface Prompt {
  name: string;
  description: string;
  promptText: string;
}

export const NOTE_SUMMARIZATION_PROMPT: Prompt = {
  name: 'note_summarization',
  description: 'Generate summaries for long notes',
  promptText: `
You are an expert note summarizer. Your task is to create a concise and informative summary of the provided note.

Focus on capturing the main ideas, key points, and important details. Organize the information in a structured way.

Here are some guidelines:
1. Start with a brief overview of what the note is about
2. Include the most important concepts/ideas discussed
3. Highlight any actionable items or conclusions
4. Preserve the original meaning and intent of the note
5. Use clear, concise language

The summary should be complete enough that someone reading it would understand the core content without having to refer to the original note.

Note to summarize:
{{note_content}}
  `.trim()
};

export const PROMPTS = [
  NOTE_SUMMARIZATION_PROMPT
]; 