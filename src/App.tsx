import { useState, useCallback } from 'react';
import { StoryInput } from './components/StoryInput';
import { ComparisonView } from './components/ComparisonView';
import { ProgressTracker } from './components/ProgressTracker';
import { CopyButton } from './components/CopyButton';
import { splitIntoParagraphs, createParagraphs } from './utils/textProcessing';
import { openAIService } from './services/openai';
import type { StoryRewriteState } from './types';
import './App.css';

function App() {
  const [state, setState] = useState<StoryRewriteState>({
    originalStory: '',
    paragraphs: [],
    isProcessing: false,
    completedCount: 0,
    totalCount: 0,
    selectedModelId: undefined
  });

  const handleStorySubmit = useCallback(async (story: string, modelId: string) => {
    const textSegments = splitIntoParagraphs(story);
    const paragraphs = createParagraphs(textSegments);

    setState({
      originalStory: story,
      paragraphs,
      isProcessing: true,
      completedCount: 0,
      totalCount: paragraphs.length,
      selectedModelId: modelId
    });

    // Process paragraphs sequentially to avoid overwhelming the API
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];

      // Update paragraph status to processing
      setState(prevState => ({
        ...prevState,
        paragraphs: prevState.paragraphs.map(p =>
          p.id === paragraph.id ? { ...p, status: 'processing' } : p
        )
      }));

      try {
        const rewrittenText = await openAIService.rewriteParagraph(paragraph.originalText, modelId);

        // Update paragraph with rewritten text
        setState(prevState => ({
          ...prevState,
          paragraphs: prevState.paragraphs.map(p =>
            p.id === paragraph.id
              ? { ...p, status: 'completed', rewrittenText, modelId }
              : p
          ),
          completedCount: prevState.completedCount + 1
        }));
      } catch (error) {
        // Update paragraph with error
        setState(prevState => ({
          ...prevState,
          paragraphs: prevState.paragraphs.map(p =>
            p.id === paragraph.id
              ? {
                  ...p,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Unknown error',
                  retryCount: p.retryCount + 1
                }
              : p
          )
        }));
      }
    }

    // Mark processing as complete
    setState(prevState => ({
      ...prevState,
      isProcessing: false
    }));
  }, []);

  const handleRegenerateParagraph = useCallback(async (paragraphId: string) => {
    const paragraph = state.paragraphs.find(p => p.id === paragraphId);
    if (!paragraph || !state.selectedModelId) {
      return;
    }

    // Set paragraph status to regenerating
    setState(prevState => ({
      ...prevState,
      paragraphs: prevState.paragraphs.map(p =>
        p.id === paragraphId ? { ...p, status: 'regenerating' } : p
      )
    }));

    try {
      const rewrittenText = await openAIService.regenerateParagraph(
        paragraph.originalText,
        state.selectedModelId
      );

      // Update paragraph with new rewritten text
      setState(prevState => ({
        ...prevState,
        paragraphs: prevState.paragraphs.map(p =>
          p.id === paragraphId
            ? { ...p, status: 'completed', rewrittenText, modelId: state.selectedModelId }
            : p
        )
      }));
    } catch (error) {
      // Update paragraph with error
      setState(prevState => ({
        ...prevState,
        paragraphs: prevState.paragraphs.map(p =>
          p.id === paragraphId
            ? {
                ...p,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                retryCount: p.retryCount + 1
              }
            : p
        )
      }));
    }
  }, [state.paragraphs, state.selectedModelId]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Story Rewriter</h1>
        <p>Transform your stories with AI-powered rewriting</p>
      </header>

      <main className="app-main">
        {state.paragraphs.length === 0 ? (
          <StoryInput
            onStorySubmit={handleStorySubmit}
            isProcessing={state.isProcessing}
            availableModels={openAIService.getAvailableModels()}
            defaultModelId={openAIService.getDefaultModelId()}
          />
        ) : (
          <div className="processing-view">
            <ProgressTracker state={state} />
            <ComparisonView
              paragraphs={state.paragraphs}
              onRegenerateParagraph={handleRegenerateParagraph}
              isProcessing={state.isProcessing}
            />
            <CopyButton
              paragraphs={state.paragraphs}
              disabled={state.isProcessing}
            />

            <div className="reset-section">
              <button
                onClick={() => setState({
                  originalStory: '',
                  paragraphs: [],
                  isProcessing: false,
                  completedCount: 0,
                  totalCount: 0,
                  selectedModelId: undefined
                })}
                className="reset-button"
                disabled={state.isProcessing}
              >
                Start New Story
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
