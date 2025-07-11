import React from 'react';
import { Select } from '../select/Select';
import './VoiceSelector.scss';

export type VoiceType = 'alloy' | 'echo' | 'shimmer';

export interface VoiceOption {
  code: VoiceType;
  label: string;
  text: string;
  gender: 'male' | 'female';
  description: string;
}

interface VoiceSelectorProps {
  selectedVoice: VoiceOption;
  onVoiceChange: (voice: VoiceOption) => void;
  disabled?: boolean;
}

export const voiceOptions: VoiceOption[] = [
  {
    code: 'alloy',
    label: '🎭 Alloy (중성)',
    text: 'Alloy',
    gender: 'male',
    description: '균형잡힌 중성적인 목소리',
  },
  {
    code: 'echo',
    label: '👨 Echo (남성)',
    text: 'Echo',
    gender: 'male',
    description: '명확하고 깊은 남성 목소리',
  },
  {
    code: 'shimmer',
    label: '👩 Shimmer (여성)',
    text: 'Shimmer',
    gender: 'female',
    description: '부드럽고 우아한 여성 목소리',
  },
];

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onVoiceChange,
  disabled = false,
}) => {
  return (
    <div className="voice-selector">
      <div className="voice-selector-label">
        <span className="label-text">🎤 AI 음성 선택</span>
        <span className="label-description">
          대화할 AI의 목소리를 선택하세요
        </span>
      </div>

      <div className={`voice-selector-dropdown ${disabled ? 'disabled' : ''}`}>
        <Select
          value={selectedVoice}
          options={voiceOptions}
          onChange={onVoiceChange}
        />
      </div>

      <div className="voice-preview">
        <div className="preview-info">
          <span className="voice-name">{selectedVoice.text}</span>
          <span className="voice-description">{selectedVoice.description}</span>
        </div>
        <div className="voice-gender">
          <span className={`gender-badge ${selectedVoice.gender}`}>
            {selectedVoice.gender === 'male' ? '남성' : '여성'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;
