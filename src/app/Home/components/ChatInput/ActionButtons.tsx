import React from 'react';
import { ArrowUp, Link } from 'lucide-react';
import { Tooltip } from '@/shared/components';
import type { AgentMode } from '@/stores/chat/types';

interface ActionButtonsProps {
  showLinkInput: boolean;
  hasJiraNumber: boolean;
  ableSendMessage: boolean;
  isLinkBtnHovered: boolean;
  isSendBtnHovered: boolean;
  agentMode: AgentMode;
  onLinkButtonClick: () => void;
  onSendButtonClick: () => void;
  onLinkButtonHover: (hover: boolean) => void;
  onSendButtonHover: (hover: boolean) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  showLinkInput,
  hasJiraNumber,
  ableSendMessage,
  isLinkBtnHovered,
  isSendBtnHovered,
  agentMode,
  onLinkButtonClick,
  onSendButtonClick,
  onLinkButtonHover,
  onSendButtonHover,
}) => {
  // agentMode가 'jira', 'cr', 'person' 중 하나인지 확인
  const shouldShowButtons = agentMode === 'jira' || agentMode === 'cr' || agentMode === 'person';

  return (
    <div className="flex justify-between">
      <Tooltip
        content={'링크 추가하기'}
        position="bottom"
        show={isLinkBtnHovered}
        className="z-10"
      >
        <button
          type="submit"
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 relative overflow-hidden ${
            !showLinkInput && !hasJiraNumber && shouldShowButtons ? 'block' : 'hidden'
          }`}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
          }}
          onClick={onLinkButtonClick}
          onMouseEnter={() => onLinkButtonHover(true)}
          onMouseLeave={() => onLinkButtonHover(false)}
        >
          <Link
            size={24}
            className={`text-white transition-colors duration-200`}
          />
        </button>
      </Tooltip>

      <Tooltip
        content={'질문 보내기'}
        position="bottom"
        show={isSendBtnHovered}
        className="z-10"
      >
        <button
          type="submit"
          disabled={!ableSendMessage}
          className="flex overflow-hidden relative justify-center items-center w-14 h-14 rounded-full transition-all duration-200"
          style={
            ableSendMessage
              ? {
                  background: 'rgba(255, 255, 255, 0.1)',
                }
              : {
                  background: 'rgba(255, 255, 255, 0.1)',
                  cursor: 'not-allowed',
                }
          }
          onClick={onSendButtonClick}
          onMouseEnter={() => {
            if (ableSendMessage) {
              onSendButtonHover(true);
            }
          }}
          onMouseLeave={() => onSendButtonHover(false)}
        >
          <ArrowUp
            size={24}
            className={`${
              ableSendMessage ? 'text-white' : 'text-white/40'
            } transition-colors duration-200`}
          />
        </button>
      </Tooltip>
    </div>
  );
};

export default ActionButtons;
