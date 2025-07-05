import React from 'react';
import { ConversationEvaluation } from '../../types/conversation';
import { Button } from '../button/Button';
import './EvaluationView.scss';

interface EvaluationViewProps {
  evaluation: ConversationEvaluation;
  onRestart: () => void;
  onNewScenario: () => void;
}

const EvaluationView: React.FC<EvaluationViewProps> = ({
  evaluation,
  onRestart,
  onNewScenario,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4caf50'; // Green
    if (score >= 6) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return '훌륭해요!';
    if (score >= 7) return '잘했어요!';
    if (score >= 5) return '괜찮아요';
    return '연습이 더 필요해요';
  };

  return (
    <div className="evaluation-view">
      <div className="evaluation-header">
        <h2>🎉 회화 평가 결과</h2>
        <p className="evaluation-subtitle">5번의 대화를 모두 완료했습니다!</p>
      </div>

      <div className="overall-score-section">
        <div className="overall-score-circle">
          <div
            className="score-circle"
            style={{
              background: `conic-gradient(${getScoreColor(
                evaluation.overallScore
              )} ${evaluation.overallScore * 36}deg, #e0e0e0 0deg)`,
            }}
          >
            <div className="score-inner">
              <span className="score-number">{evaluation.overallScore}</span>
              <span className="score-total">/10</span>
            </div>
          </div>
        </div>
        <div className="overall-score-text">
          <h3>전체 점수</h3>
          <p className="score-label">
            {getScoreLabel(evaluation.overallScore)}
          </p>
        </div>
      </div>

      <div className="detailed-scores">
        <h3>세부 평가</h3>
        <div className="score-items">
          <div className="score-item">
            <div className="score-category">
              <span className="category-icon">🗣️</span>
              <span className="category-name">발음</span>
            </div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${evaluation.pronunciationScore * 10}%`,
                  backgroundColor: getScoreColor(evaluation.pronunciationScore),
                }}
              />
            </div>
            <span className="score-value">
              {evaluation.pronunciationScore}/10
            </span>
          </div>

          <div className="score-item">
            <div className="score-category">
              <span className="category-icon">📝</span>
              <span className="category-name">문법</span>
            </div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${evaluation.grammarScore * 10}%`,
                  backgroundColor: getScoreColor(evaluation.grammarScore),
                }}
              />
            </div>
            <span className="score-value">{evaluation.grammarScore}/10</span>
          </div>

          <div className="score-item">
            <div className="score-category">
              <span className="category-icon">📚</span>
              <span className="category-name">어휘</span>
            </div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${evaluation.vocabularyScore * 10}%`,
                  backgroundColor: getScoreColor(evaluation.vocabularyScore),
                }}
              />
            </div>
            <span className="score-value">{evaluation.vocabularyScore}/10</span>
          </div>

          <div className="score-item">
            <div className="score-category">
              <span className="category-icon">💬</span>
              <span className="category-name">의사소통</span>
            </div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${evaluation.communicationScore * 10}%`,
                  backgroundColor: getScoreColor(evaluation.communicationScore),
                }}
              />
            </div>
            <span className="score-value">
              {evaluation.communicationScore}/10
            </span>
          </div>
        </div>
      </div>

      <div className="feedback-section">
        <h3>피드백</h3>
        <div className="feedback-content">
          <p className="feedback-text">{evaluation.feedback}</p>
        </div>
      </div>

      {evaluation.suggestions && evaluation.suggestions.length > 0 && (
        <div className="suggestions-section">
          <h3>개선 제안</h3>
          <ul className="suggestions-list">
            {evaluation.suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                <span className="suggestion-icon">💡</span>
                <span className="suggestion-text">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="evaluation-actions">
        <Button
          label="🔄 같은 상황 다시 연습"
          buttonStyle="regular"
          onClick={onRestart}
        />
        <Button
          label="🆕 다른 상황 선택"
          buttonStyle="action"
          onClick={onNewScenario}
        />
      </div>
    </div>
  );
};

export default EvaluationView;
