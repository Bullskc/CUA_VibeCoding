import React from 'react';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { Scenario } from '../../types/conversation';
import { Button } from '../button/Button';
import { Toggle } from '../toggle/Toggle';
import './ConversationView.scss';

interface ConversationViewProps {
  scenario: Scenario;
  items: ItemType[];
  isConnected: boolean;
  isRecording: boolean;
  canPushToTalk: boolean;
  currentTurn: number;
  maxTurns: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDisconnect: () => void;
  onTurnEndTypeChange: (value: string) => void;
  clientCanvasRef: React.RefObject<HTMLCanvasElement>;
  serverCanvasRef: React.RefObject<HTMLCanvasElement>;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  scenario,
  items,
  isConnected,
  isRecording,
  canPushToTalk,
  currentTurn,
  maxTurns,
  onStartRecording,
  onStopRecording,
  onDisconnect,
  onTurnEndTypeChange,
  clientCanvasRef,
  serverCanvasRef,
}) => {
  return (
    <div className="conversation-view">
      <div className="conversation-header">
        <div className="scenario-info">
          <span className="scenario-icon">{scenario.icon}</span>
          <div className="scenario-details">
            <h2>{scenario.title}</h2>
            <p>{scenario.titleKr}</p>
          </div>
        </div>
        <div className="progress-info">
          <span className="turn-counter">
            대화 {currentTurn}/{maxTurns}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentTurn / maxTurns) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="conversation-controls">
        <div className="connection-status">
          {isConnected ? (
            <span className="status-connected">🟢 연결됨</span>
          ) : (
            <span className="status-disconnected">🔴 연결 끊김</span>
          )}
        </div>

        <div className="audio-mode-toggle">
          <Toggle
            defaultValue={false}
            labels={['Push to Talk', 'Voice Detection']}
            values={['none', 'server_vad']}
            onChange={(_, value) => onTurnEndTypeChange(value)}
          />
        </div>

        <Button
          label="대화 종료"
          buttonStyle="regular"
          onClick={onDisconnect}
        />
      </div>

      <div className="conversation-content" data-conversation-content>
        <div className="conversation-messages">
          {!items.length && (
            <div className="conversation-starter">
              <p>🎤 AI와 영어 회화를 시작해보세요!</p>
              <p className="scenario-context">{scenario.description}</p>
            </div>
          )}
          {items.map((conversationItem, i) => (
            <div className="conversation-item" key={conversationItem.id}>
              <div className={`speaker ${conversationItem.role || ''}`}>
                <div className="speaker-content">
                  {/* tool response */}
                  {conversationItem.type === 'function_call_output' && (
                    <div>{conversationItem.formatted.output}</div>
                  )}
                  {/* tool call */}
                  {!!conversationItem.formatted.tool && (
                    <div>
                      {conversationItem.formatted.tool.name}(
                      {conversationItem.formatted.tool.arguments})
                    </div>
                  )}
                  {!conversationItem.formatted.tool &&
                    conversationItem.role === 'user' && (
                      <div>
                        <div className="speaker-label">👤 You</div>
                        {conversationItem.formatted.transcript ||
                          (conversationItem.formatted.audio?.length
                            ? '(음성 메시지)'
                            : conversationItem.formatted.text ||
                              '(메시지 없음)')}
                      </div>
                    )}
                  {!conversationItem.formatted.tool &&
                    conversationItem.role === 'assistant' && (
                      <div>
                        <div className="speaker-label">🤖 AI Teacher</div>
                        {conversationItem.formatted.transcript ||
                          conversationItem.formatted.text ||
                          '(메시지 생성 중...)'}
                      </div>
                    )}
                  {conversationItem.formatted.file && (
                    <audio
                      src={conversationItem.formatted.file.url}
                      controls
                      autoPlay
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="audio-visualization">
        <div className="visualization-section">
          <div className="visualization-entry client">
            <canvas ref={clientCanvasRef} />
            <div className="visualization-label">Your Voice</div>
          </div>
          <div className="visualization-entry server">
            <canvas ref={serverCanvasRef} />
            <div className="visualization-label">AI Response</div>
          </div>
        </div>
      </div>

      <div className="conversation-actions">
        {canPushToTalk && (
          <div className="push-to-talk-container">
            <Button
              label={
                isRecording
                  ? '🎤 말하기 중... (떼면 전송)'
                  : '🎤 버튼을 눌러 말하세요'
              }
              buttonStyle={isRecording ? 'alert' : 'action'}
              disabled={!isConnected}
              onMouseDown={onStartRecording}
              onMouseUp={onStopRecording}
              onTouchStart={onStartRecording}
              onTouchEnd={onStopRecording}
            />
          </div>
        )}
        {!canPushToTalk && (
          <div className="vad-mode-indicator">
            <p>🎤 음성 감지 모드 - 자동으로 음성을 감지합니다</p>
            {isRecording && (
              <span className="recording-indicator">🔴 녹음 중...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationView;
