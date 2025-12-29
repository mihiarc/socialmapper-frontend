/**
 * SSE (Server-Sent Events) client for streaming analysis progress.
 */

import type { AnalysisRequest, AnalysisResult, ProgressEvent } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SSECallbacks {
  onProgress: (event: ProgressEvent) => void;
  onComplete: (result: AnalysisResult) => void;
  onError: (error: string) => void;
}

/**
 * Run analysis with streaming progress updates via SSE.
 * Returns an AbortController that can be used to cancel the request.
 */
export function runAnalysisWithProgress(
  request: AnalysisRequest,
  callbacks: SSECallbacks
): AbortController {
  const abortController = new AbortController();

  const runStream = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete event in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const event: ProgressEvent = JSON.parse(data);

              if (event.step === 'complete' && event.result) {
                callbacks.onComplete(event.result);
              } else if (event.step === 'error') {
                callbacks.onError(event.error || 'Unknown error');
              } else {
                callbacks.onProgress(event);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE event:', parseError);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled - not an error
        return;
      }
      callbacks.onError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  runStream();

  return abortController;
}
