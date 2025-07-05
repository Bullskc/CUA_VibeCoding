import React, { useState, useCallback, useRef, useEffect } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import { WavRenderer } from '../utils/wav_renderer';

import { Button } from './button/Button';
import { Toggle } from './toggle/Toggle';

import './ConversationTutorApp.scss';

import { scenarios } from '../data/scenarios';
import {
  Scenario,
  ConversationState,
  Message,
  ConversationEvaluation,
} from '../types/conversation';
import ScenarioSelector from './conversation/ScenarioSelector';
import ConversationView from './conversation/ConversationView';
import EvaluationView from './conversation/EvaluationView';

/**
 * Type for all event logs
 */
interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

export function ConversationTutorApp({
  onNavigateHome,
}: {
  onNavigateHome: () => void;
}) {
  /**
   * Ask user for API Key
   * If we're using the local relay server, we don't need this
   */
  const apiKey =
    localStorage.getItem('tmp::voice_api_key') ||
    prompt('OpenAI API Key') ||
    '';
  if (apiKey !== '') {
    localStorage.setItem('tmp::voice_api_key', apiKey);
  }

  /**
   * Instantiate:
   * - WavRecorder (speech input)
   * - WavStreamPlayer (speech output)
   * - RealtimeClient (API client)
   */
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      localStorage.getItem('tmp::voice_api_key')
        ? {
            apiKey: localStorage.getItem('tmp::voice_api_key') || '',
            dangerouslyAllowAPIKeyInBrowser: true,
          }
        : {
            url: localStorage.getItem('tmp::relay_server_url') || undefined,
          }
    )
  );

  /**
   * References for
   * - Rendering audio visualization (canvas)
   * - Autoscrolling event logs
   * - Timing delta for event log displays
   */
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);
  const eventsScrollHeightRef = useRef(0);
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<string>(new Date().toISOString());

  /**
   * All of our variables for displaying application state
   * - items are all conversation items (dialog)
   * - realtimeEvents are event logs, which can be expanded
   * - memoryKv is for set_memory / get_memory function calls
   * - coords, marker are for rendering map (if enabled)
   */
  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [memoryKv, setMemoryKv] = useState<{ [key: string]: any }>({});

  // Conversation specific state
  const [conversationState, setConversationState] =
    useState<ConversationState>('setup');
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [evaluation, setEvaluation] = useState<ConversationEvaluation | null>(
    null
  );
  const maxTurns = 5;

  /**
   * Utility for formatting the timing of logs
   */
  const formatTime = useCallback((timestamp: string) => {
    const startTime = startTimeRef.current;
    const t0 = new Date(startTime).valueOf();
    const t1 = new Date(timestamp).valueOf();
    const delta = t1 - t0;
    const hs = Math.floor(delta / 10) % 100;
    const s = Math.floor(delta / 1000) % 60;
    const m = Math.floor(delta / 60_000) % 60;
    const pad = (n: number) => {
      let s = n + '';
      while (s.length < 2) {
        s = '0' + s;
      }
      return s;
    };
    return `${pad(m)}:${pad(s)}.${pad(hs)}`;
  }, []);

  /**
   * When you click the API key
   */
  const resetAPIKey = useCallback(() => {
    const apiKey = prompt('OpenAI API Key');
    if (apiKey !== null) {
      localStorage.setItem('tmp::voice_api_key', apiKey);
      window.location.reload();
    }
  }, []);

  /**
   * Connect to conversation:
   * WavRecorder taks speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // Set state variables
    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    setRealtimeEvents([]);
    setItems([]);
    setMemoryKv({});

    // Connect to microphone
    await wavRecorder.begin();

    // Connect to audio output
    await wavStreamPlayer.connect();

    // Connect to realtime API
    await client.connect();
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello!`,
      },
    ]);

    if (client.getTurnDetectionType() === 'server_vad') {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
  }, []);

  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);
    setRealtimeEvents([]);
    setItems([]);
    setMemoryKv({});
    setIsRecording(false);

    const client = clientRef.current;
    client.disconnect();

    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.end();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  }, []);

  const deleteConversationItem = useCallback(async (id: string) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  /**
   * In push-to-talk mode, start recording
   * .appendInputAudio() for each sample
   */
  const startRecording = useCallback(async () => {
    setIsRecording(true);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  }, []);

  /**
   * In push-to-talk mode, stop recording
   */
  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    client.createResponse();
  }, []);

  /**
   * Switch between Manual <> VAD mode for communication
   */
  const changeTurnEndType = useCallback(async (value: string) => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    if (value === 'none' && wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }
    client.updateSession({
      turn_detection: value === 'none' ? null : { type: 'server_vad' },
    });
    if (value === 'server_vad' && client.isConnected()) {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
    setCanPushToTalk(value === 'none');
  }, []);

  /**
   * Auto-scroll the event logs
   */
  useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      // Only scroll if height has just changed
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [realtimeEvents]);

  /**
   * Auto-scroll the conversation logs
   */
  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);

  /**
   * Set up render loops for the visualization canvas
   */
  useEffect(() => {
    let isLoaded = true;

    const wavRecorder = wavRecorderRef.current;
    const clientCanvas = clientCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;

    const wavStreamPlayer = wavStreamPlayerRef.current;
    const serverCanvas = serverCanvasRef.current;
    let serverCtx: CanvasRenderingContext2D | null = null;

    const render = () => {
      if (isLoaded) {
        if (clientCanvas) {
          if (!clientCanvas.width || !clientCanvas.height) {
            clientCanvas.width = clientCanvas.offsetWidth;
            clientCanvas.height = clientCanvas.offsetHeight;
          }
          clientCtx = clientCtx || clientCanvas.getContext('2d');
          if (clientCtx) {
            clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
            const result = wavRecorder.recording
              ? wavRecorder.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              clientCanvas,
              clientCtx,
              result.values,
              '#0099ff',
              10,
              0,
              8
            );
          }
        }
        if (serverCanvas) {
          if (!serverCanvas.width || !serverCanvas.height) {
            serverCanvas.width = serverCanvas.offsetWidth;
            serverCanvas.height = serverCanvas.offsetHeight;
          }
          serverCtx = serverCtx || serverCanvas.getContext('2d');
          if (serverCtx) {
            serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
            const result = wavStreamPlayer.analyser
              ? wavStreamPlayer.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              serverCanvas,
              serverCtx,
              result.values,
              '#009900',
              10,
              0,
              8
            );
          }
        }
        requestAnimationFrame(render);
      }
    };
    render();

    return () => {
      isLoaded = false;
    };
  }, []);

  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // Set instructions
    const defaultInstructions = `You are an English conversation tutor helping students practice English in real-life situations. 
    Speak clearly and naturally. Ask engaging questions and provide helpful feedback. 
    Keep conversations appropriate for language learners.`;
    client.updateSession({ instructions: defaultInstructions });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    // Add tools if needed

    // handle realtime events from client + server for event logging
    client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents((realtimeEvents) => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          // if we receive multiple events in a row, aggregate them for display purposes
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });
    });
    client.on('error', (event: any) => console.error(event));
    client.on('conversation.interrupted', async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });
    client.on('conversation.updated', async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === 'completed' && item.formatted.audio?.length) {
        // Skip audio file creation for now - just set a placeholder
        item.formatted.file = { url: '', data: null };
      }

      // Update turn count when user completes a message
      if (item.status === 'completed' && item.role === 'user') {
        setCurrentTurn((prev) => prev + 1);
      }

      setItems(items);
    });

    setItems(client.conversation.getItems());

    return () => {
      // cleanup; resets to defaults
      client.reset();
    };
  }, []);

  // Conversation-specific handlers
  const handleScenarioSelect = useCallback(
    (scenarioId: string) => {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario) return;

      setCurrentScenario(scenario);
      setConversationState('conversation');
      setCurrentTurn(0);
      setConversationHistory([]);

      // Update client instructions for the selected scenario
      const client = clientRef.current;
      client.updateSession({
        instructions:
          scenario.aiPrompt +
          '\n\nThis is an English conversation practice session. The student is learning English, so please speak clearly and at an appropriate pace. Ask natural questions related to this scenario and be encouraging.',
      });

      connectConversation();
    },
    [connectConversation]
  );

  const handleConversationComplete = useCallback(() => {
    setConversationState('evaluation');
    // Here you would typically send the conversation to OpenAI for evaluation
    // For now, we'll create a mock evaluation
    const mockEvaluation: ConversationEvaluation = {
      pronunciationScore: 8,
      grammarScore: 7,
      vocabularyScore: 8,
      communicationScore: 9,
      overallScore: 8,
      feedback:
        'Great job! Your English conversation skills are improving. You spoke clearly and used appropriate vocabulary for the situation.',
      suggestions: [
        'Try to use more varied sentence structures',
        'Practice linking words to sound more natural',
        'Work on using past tense forms more accurately',
      ],
    };
    setEvaluation(mockEvaluation);
    disconnectConversation();
  }, [disconnectConversation]);

  const handleRestart = useCallback(() => {
    setConversationState('setup');
    setCurrentScenario(null);
    setConversationHistory([]);
    setCurrentTurn(0);
    setEvaluation(null);
    disconnectConversation();
  }, [disconnectConversation]);

  // Check if conversation should end
  useEffect(() => {
    if (currentTurn >= maxTurns && conversationState === 'conversation') {
      setTimeout(() => {
        handleConversationComplete();
      }, 2000); // Give a moment for the last response to complete
    }
  }, [currentTurn, maxTurns, conversationState, handleConversationComplete]);

  /**
   * Render the application
   */
  return (
    <div data-component="ConversationTutorApp">
      <div className="content-top">
        <div className="content-title">
          <img src="/openai-logomark.svg" alt="OpenAI" />
          <span>영어 회화 과외 선생</span>
        </div>
        <div className="content-actions">
          <Button
            label="🏠 홈으로"
            buttonStyle="regular"
            onClick={onNavigateHome}
          />
        </div>
      </div>

      <div className="conversation-tutor-content">
        {conversationState === 'setup' && (
          <ScenarioSelector
            scenarios={scenarios}
            onScenarioSelect={handleScenarioSelect}
          />
        )}

        {conversationState === 'conversation' && currentScenario && (
          <ConversationView
            scenario={currentScenario}
            items={items}
            isConnected={isConnected}
            isRecording={isRecording}
            canPushToTalk={canPushToTalk}
            currentTurn={currentTurn}
            maxTurns={maxTurns}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onDisconnect={disconnectConversation}
            onTurnEndTypeChange={changeTurnEndType}
            clientCanvasRef={clientCanvasRef}
            serverCanvasRef={serverCanvasRef}
          />
        )}

        {conversationState === 'evaluation' && evaluation && (
          <EvaluationView
            evaluation={evaluation}
            onRestart={handleRestart}
            onNewScenario={() => setConversationState('setup')}
          />
        )}
      </div>
    </div>
  );
}
