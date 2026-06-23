import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 120000, // 2 minutes for large roadmap generation
});

/**
 * Stream the roadmap generation via SSE for real-time UI updates.
 * Falls back to regular POST if streaming fails.
 */
export async function streamRoadmap(formData, { onChunk, onMetadata, onDone, onError }) {
  try {
    const response = await fetch("http://127.0.0.1:8000/generate-path/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(line.slice(6));

            if (parsed.type === "metadata" && onMetadata) {
              onMetadata(parsed.data);
            } else if (parsed.type === "chunk" && onChunk) {
              onChunk(parsed.data);
            } else if (parsed.type === "done" && onDone) {
              onDone();
            } else if (parsed.type === "error" && onError) {
              onError(parsed.data);
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    }
  } catch (err) {
    if (onError) onError(err.message || "Streaming failed");
  }
}

export default API;
