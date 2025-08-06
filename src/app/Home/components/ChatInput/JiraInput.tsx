import React, { forwardRef } from 'react';
import { INPUT_VALIDATION } from '@/shared/constants';
import type { AgentType } from '@/shared/utils/common';

interface JiraInputProps {
  show: boolean;
  value: string;
  placeholder: string;
  agentType: AgentType;
  hasError: boolean;
  showError: boolean;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const JiraInput = forwardRef<HTMLInputElement, JiraInputProps>(
  ({ show, value, placeholder, agentType, hasError, showError, onChange, onKeyDown }, ref) => {
    // AgentType에 따른 에러 메시지 가져오기
    const getErrorMessage = (type: AgentType) => {
      switch (type) {
        case 'jira':
          return INPUT_VALIDATION.ERROR_MESSAGES.JIRA;
        case 'cr':
          return INPUT_VALIDATION.ERROR_MESSAGES.CR;
        case 'person':
          return INPUT_VALIDATION.ERROR_MESSAGES.PERSON;
        default:
          return '';
      }
    };

    if (!show) {
      return <div style={{ height: '58px', marginBottom: '16px' }}></div>;
    }

    return (
      <div className="mb-4">
        <input
          ref={ref}
          type="text"
          className={`bg-transparent border rounded-lg px-4 py-3 text-white placeholder-white/50 text-lg outline-none transition-colors w-full ${hasError
            ? 'border-red-400 focus:border-red-500'
            : 'border-white/30 focus:border-white/60'
            }`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          style={{
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            height: '58px',
          }}
        />
        {/* 에러 메시지 */}
        {showError && hasError && (
          <div
            className="mt-2 text-sm text-red-400"
            style={{
              fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '16px',
            }}
          >
            {getErrorMessage(agentType)}
          </div>
        )}
      </div>
    );
  }
);

JiraInput.displayName = 'JiraInput';

export default JiraInput;
