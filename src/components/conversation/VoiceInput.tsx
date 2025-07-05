import React, { useState, useEffect, useRef } from 'react';
import './VoiceInput.scss';

// Speech Recognition API 타입 정의
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceInputProps {
  onMessage: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  disabled: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onMessage,
  isListening,
  setIsListening,
  disabled,
}) => {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 브라우저 음성 인식 지원 확인
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          onMessage(finalTranscript.trim());
          setTranscript('');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onMessage, setIsListening]);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !disabled) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleManualInput = () => {
    const text = prompt('Please enter your response in English:');
    if (text && text.trim()) {
      onMessage(text.trim());
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-input">
        <div className="voice-input-container">
          <button
            className="manual-input-button"
            onClick={handleManualInput}
            disabled={disabled}
          >
            💬 Type Response
          </button>
          <p className="not-supported-text">
            Voice input not supported. Use the text input button above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-input">
      <div className="voice-input-container">
        {transcript && (
          <div className="transcript-preview">
            <span className="transcript-text">{transcript}</span>
          </div>
        )}

        <div className="input-controls">
          <button
            className="manual-input-button"
            onClick={handleManualInput}
            disabled={disabled}
            title="Type your response"
          >
            💬
          </button>

          <button
            className={`voice-button ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
            disabled={disabled}
            title={isListening ? 'Stop recording' : 'Start recording'}
          >
            <div className="voice-icon">{isListening ? '🔴' : '🎤'}</div>
            {isListening && (
              <div className="voice-animation">
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
              </div>
            )}
          </button>
        </div>

        <div className="input-instruction">
          {disabled ? (
            <span className="disabled-text">Please wait...</span>
          ) : isListening ? (
            <span className="listening-text">
              Listening... Speak in English
            </span>
          ) : (
            <span className="ready-text">
              Press microphone to speak or 💬 to type
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;
