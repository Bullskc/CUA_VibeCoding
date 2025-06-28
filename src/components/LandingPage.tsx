import React from 'react';
import './LandingPage.scss';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'original' | 'experiment' | 'console') => void;
}

const LandingPageComponent: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="landing-page">
      <div className="landing-container">
        <h1 className="landing-title">
          Catch Up AI
          <br />
          재미로 하는 Vibe Coding
        </h1>

        <div className="landing-description">
          <p>
            OpenAI Realtime Console을 기반으로 한 실시간 음성 AI 통역 프로젝트
          </p>
        </div>

        <div className="landing-buttons">
          <button
            onClick={() => onNavigate('original')}
            className="landing-button original"
          >
            <div className="button-icon">🎯</div>
            <h3>원본 앱</h3>
            <p>
              기존 기능을 그대로 보존한 원본 OpenAI Realtime Console 앱입니다
            </p>
          </button>

          <button
            onClick={() => onNavigate('experiment')}
            className="landing-button experiment"
          >
            <div className="button-icon">🧪</div>
            <h3>실험용 앱</h3>
            <p>새로운 기능을 추가하고 수정할 수 있는 실험용 앱입니다</p>
          </button>
        </div>

        <div className="landing-footer">
          <p>Powered by OpenAI Realtime API</p>
          <p className="version">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPageComponent;
