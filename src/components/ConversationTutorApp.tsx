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
import { VoiceOption, voiceOptions } from './conversation/VoiceSelector';

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
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(
    voiceOptions[0]
  );
  const maxTurns = 5;

  /**
   * Test microphone access and provide detailed diagnostics
   */
  const testMicrophoneAccess = useCallback(async () => {
    console.log('Testing microphone access...');

    // Check basic browser support
    if (!navigator.mediaDevices) {
      throw new Error('navigator.mediaDevices not supported');
    }

    if (!navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia not supported');
    }

    // Check HTTPS requirement
    if (
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      throw new Error('HTTPS required for microphone access');
    }

    // Get available audio input devices
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(
        (device) => device.kind === 'audioinput'
      );
      console.log('Available audio input devices:', audioInputs);

      if (audioInputs.length === 0) {
        throw new Error('No audio input devices found');
      }
    } catch (enumError) {
      console.warn('Could not enumerate devices:', enumError);
    }

    // Test basic microphone access
    let testStream: MediaStream | null = null;
    try {
      testStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const tracks = testStream.getAudioTracks();
      if (tracks.length === 0) {
        throw new Error('No audio tracks in stream');
      }

      const track = tracks[0];
      if (track.readyState !== 'live') {
        throw new Error(`Audio track state: ${track.readyState}`);
      }

      console.log('Microphone test successful:', {
        label: track.label,
        settings: track.getSettings(),
        capabilities: track.getCapabilities(),
      });

      return true;
    } finally {
      if (testStream) {
        testStream.getTracks().forEach((track) => track.stop());
      }
    }
  }, []);

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

    try {
      // Set state variables
      startTimeRef.current = new Date().toISOString();
      setIsConnected(false);
      setRealtimeEvents([]);
      setItems([]);
      setMemoryKv({});

      // Enhanced microphone access with detailed error handling
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          '이 브라우저는 마이크를 지원하지 않습니다.\n\n해결 방법:\n• Chrome, Firefox, Safari의 최신 버전을 사용해주세요\n• Internet Explorer는 지원되지 않습니다'
        );
      }

      // Check if we're on HTTPS (required for microphone access)
      if (
        window.location.protocol !== 'https:' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1'
      ) {
        throw new Error(
          '마이크 접근을 위해서는 HTTPS 연결이 필요합니다.\n\n해결 방법:\n• HTTPS 사이트에서 접속해주세요\n• 로컬 개발환경에서는 localhost를 사용해주세요'
        );
      }

      // Try to get microphone access with specific error handling
      let stream: MediaStream | null = null;
      try {
        console.log('Requesting microphone access...');

        // First, try to get a simple audio stream to test permissions
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 24000,
          },
        });

        console.log('Microphone access granted');

        // Test if we can actually use the stream
        if (
          !stream ||
          !stream.getAudioTracks() ||
          stream.getAudioTracks().length === 0
        ) {
          throw new Error('마이크 스트림을 가져올 수 없습니다');
        }

        // Check if the audio track is enabled and active
        const audioTrack = stream.getAudioTracks()[0];
        if (!audioTrack || audioTrack.readyState !== 'live') {
          throw new Error('마이크가 활성화되지 않았습니다');
        }

        console.log('Microphone stream validated successfully');

        // Stop the test stream immediately - WavRecorder will create its own
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      } catch (micError: any) {
        console.error('Microphone access error:', micError);

        // Clean up test stream if it exists
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          stream = null;
        }

        if (micError.name === 'NotAllowedError') {
          throw new Error(
            '마이크 권한이 거부되었습니다.\n\n해결 방법:\n1. 브라우저 주소창 왼쪽의 🔒 또는 🎤 아이콘을 클릭\n2. "마이크" 권한을 "허용"으로 변경\n3. 페이지를 새로고침한 후 다시 시도해주세요\n\n다른 방법:\n• 브라우저 설정 → 개인정보 및 보안 → 사이트 설정 → 마이크에서 허용'
          );
        } else if (micError.name === 'NotFoundError') {
          throw new Error(
            '마이크를 찾을 수 없습니다.\n\n해결 방법:\n1. 마이크가 컴퓨터에 제대로 연결되어 있는지 확인\n2. 시스템 설정에서 마이크가 인식되는지 확인\n3. 다른 마이크나 헤드셋을 시도해보세요\n4. USB 마이크의 경우 다른 포트에 연결해보세요'
          );
        } else if (micError.name === 'NotReadableError') {
          throw new Error(
            '마이크가 다른 앱에서 사용 중입니다.\n\n해결 방법:\n1. Zoom, Teams, Discord, Skype 등 화상회의 앱 종료\n2. 브라우저의 다른 탭에서 마이크를 사용하는 사이트 종료\n3. 음성 녹음 앱이나 게임 종료\n4. 브라우저를 완전히 재시작\n5. 컴퓨터 재시작'
          );
        } else if (micError.name === 'OverconstrainedError') {
          throw new Error(
            '마이크 설정에 문제가 있습니다.\n\n해결 방법:\n1. 시스템 오디오 설정에서 마이크 품질 확인\n2. 마이크 드라이버 업데이트\n3. 브라우저를 재시작\n4. 다른 브라우저로 시도'
          );
        } else if (micError.name === 'AbortError') {
          throw new Error(
            '마이크 접근이 중단되었습니다.\n\n해결 방법:\n1. 페이지를 새로고침\n2. 다시 시도해주세요'
          );
        } else {
          throw new Error(
            `마이크 접근 오류: ${
              micError.message || micError
            }\n\n일반적인 해결 방법:\n1. 브라우저를 새로고침\n2. 다른 브라우저로 시도\n3. 컴퓨터를 재시작\n4. 마이크 드라이버 업데이트`
          );
        }
      }

      // Connect to microphone through WavRecorder with enhanced error handling
      try {
        console.log('Initializing WavRecorder...');
        await wavRecorder.begin();
        console.log('WavRecorder initialized successfully');
      } catch (recorderError: any) {
        console.error('WavRecorder error:', recorderError);
        throw new Error(
          '음성 녹음 시스템을 초기화할 수 없습니다.\n\n해결 방법:\n1. 브라우저를 새로고침\n2. 마이크 드라이버를 업데이트\n3. 관리자 권한으로 브라우저 실행\n4. 오디오 서비스 재시작 (Windows: services.msc에서 "Windows Audio" 재시작)'
        );
      }

      // Connect to audio output
      try {
        console.log('Connecting audio output...');
        await wavStreamPlayer.connect();
        console.log('Audio output connected successfully');
      } catch (audioError: any) {
        console.error('Audio output error:', audioError);
        throw new Error(
          '오디오 출력을 설정할 수 없습니다.\n\n해결 방법:\n1. 스피커나 헤드폰이 제대로 연결되어 있는지 확인\n2. 시스템 오디오 설정에서 기본 재생 장치 확인\n3. 다른 오디오 기기로 시도\n4. 오디오 드라이버 업데이트'
        );
      }

      // Connect to realtime API
      try {
        console.log('Connecting to OpenAI API...');
        await client.connect();
        console.log('API connected successfully');

        client.sendUserMessageContent([
          {
            type: 'input_text',
            text: 'Hello!',
          },
        ]);
      } catch (apiError: any) {
        console.error('API connection error:', apiError);
        const apiErrorMessage = apiError.message || apiError.toString();

        if (
          apiErrorMessage.includes('401') ||
          apiErrorMessage.includes('Unauthorized')
        ) {
          throw new Error(
            'OpenAI API 키가 유효하지 않습니다.\n\n해결 방법:\n1. API 키가 올바른지 확인\n2. API 키에 충분한 크레딧이 있는지 확인\n3. 새로운 API 키를 발급받아 시도'
          );
        } else if (
          apiErrorMessage.includes('429') ||
          apiErrorMessage.includes('rate limit')
        ) {
          throw new Error(
            'API 사용량 한도를 초과했습니다.\n\n해결 방법:\n1. 잠시 후 다시 시도\n2. OpenAI 대시보드에서 사용량 확인\n3. 요금제 업그레이드 고려'
          );
        } else if (
          apiErrorMessage.includes('network') ||
          apiErrorMessage.includes('fetch')
        ) {
          throw new Error(
            '인터넷 연결에 문제가 있습니다.\n\n해결 방법:\n1. 인터넷 연결 상태 확인\n2. VPN 사용 중이면 잠시 해제\n3. 방화벽 설정 확인\n4. 잠시 후 다시 시도'
          );
        } else {
          throw new Error(
            `OpenAI API 연결 실패: ${apiErrorMessage}\n\n해결 방법:\n1. API 키와 인터넷 연결 확인\n2. 잠시 후 다시 시도\n3. OpenAI 서비스 상태 확인`
          );
        }
      }

      if (client.getTurnDetectionType() === 'server_vad') {
        await wavRecorder.record((data) => client.appendInputAudio(data.mono));
      }

      // Only set connected to true if everything succeeded
      setIsConnected(true);
      console.log('All connections successful!');
    } catch (error: any) {
      console.error('Connection failed:', error);
      setIsConnected(false);

      // Enhanced cleanup on error
      try {
        console.log('Cleaning up failed connections...');

        setIsConnected(false);
        setRealtimeEvents([]);
        setItems([]);
        setMemoryKv({});
        setIsRecording(false);

        // Disconnect client safely
        try {
          if (client.isConnected()) {
            client.disconnect();
          }
        } catch (clientError) {
          console.warn('Client disconnect error:', clientError);
        }

        // Stop recorder safely
        try {
          if (wavRecorder.getStatus() === 'recording') {
            await wavRecorder.end();
          }
        } catch (recorderError) {
          console.warn('Recorder stop error:', recorderError);
        }

        // Stop player safely
        try {
          await wavStreamPlayer.interrupt();
        } catch (playerError) {
          console.warn('Player stop error:', playerError);
        }

        console.log('Cleanup completed');
      } catch (cleanupError: any) {
        console.error('Cleanup error:', cleanupError);
      }

      // Show detailed error message
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';
      alert(`연결 실패:\n\n${errorMessage}`);
      throw error;
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
    // Set default voice
    client.updateSession({ voice: selectedVoice.code });

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

  const handleVoiceChange = useCallback((voice: VoiceOption) => {
    setSelectedVoice(voice);
    const client = clientRef.current;
    if (client.isConnected()) {
      client.updateSession({ voice: voice.code });
    }
  }, []);

  // Conversation-specific handlers
  const handleScenarioSelect = useCallback(
    async (scenarioId: string) => {
      try {
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

        await connectConversation();
      } catch (error) {
        console.error('Failed to start scenario:', error);
        // Reset state on error
        setConversationState('setup');
        setCurrentScenario(null);
        setCurrentTurn(0);
        setConversationHistory([]);

        const errorMessage =
          error instanceof Error
            ? error.message
            : '시나리오를 시작할 수 없습니다.';
        alert(`시나리오 시작 실패: ${errorMessage}`);
      }
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
            selectedVoice={selectedVoice}
            onVoiceChange={handleVoiceChange}
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
            selectedVoice={selectedVoice}
            onVoiceChange={handleVoiceChange}
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
