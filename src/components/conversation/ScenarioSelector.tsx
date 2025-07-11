import React from 'react';
import { Scenario, ScenarioType } from '../../types/conversation';
import { scenarios } from '../../data/scenarios';
import VoiceSelector, { VoiceOption } from './VoiceSelector';
import './ScenarioSelector.scss';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  onScenarioSelect: (scenarioId: string) => void | Promise<void>;
  selectedVoice: VoiceOption;
  onVoiceChange: (voice: VoiceOption) => void;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  onScenarioSelect,
  selectedVoice,
  onVoiceChange,
}) => {
  const [selectedScenario, setSelectedScenario] = React.useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const handleScenarioClick = (scenarioId: string) => {
    if (!isLoading) {
      setSelectedScenario(scenarioId);
    }
  };

  const handleStartConversation = async () => {
    if (selectedScenario && !isLoading) {
      setIsLoading(true);
      try {
        await onScenarioSelect(selectedScenario);
      } catch (error) {
        console.error('Failed to start scenario:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <div className="scenario-selector">
      <div className="scenario-header">
        <h2>Choose Your Conversation Scenario</h2>
        <p className="scenario-subtitle">
          상황을 선택하고 영어 회화를 연습해보세요
        </p>
      </div>

      <div className="scenario-grid">
        {scenarios.map((scenario: Scenario) => (
          <div
            key={scenario.id}
            className={`scenario-card ${
              selectedScenario === scenario.id ? 'selected' : ''
            }`}
            onClick={() => handleScenarioClick(scenario.id)}
            style={{ backgroundColor: scenario.backgroundColor }}
          >
            <div className="scenario-icon">{scenario.icon}</div>
            <h3 className="scenario-title">{scenario.title}</h3>
            <h4 className="scenario-title-kr">{scenario.titleKr}</h4>
            <p className="scenario-description">{scenario.description}</p>
          </div>
        ))}
      </div>

      {selectedScenario && (
        <div className="bottom-controls">
          <div className="voice-selector-container">
            <VoiceSelector
              selectedVoice={selectedVoice}
              onVoiceChange={onVoiceChange}
              disabled={isLoading}
            />
          </div>
          <div className="start-section">
            <button
              className={`start-button ${isLoading ? 'loading' : ''}`}
              onClick={handleStartConversation}
              disabled={isLoading}
            >
              <span className="start-icon">{isLoading ? '⏳' : '🚀'}</span>
              {isLoading ? 'Starting...' : 'Start Conversation'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioSelector;
