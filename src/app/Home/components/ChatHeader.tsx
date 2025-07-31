import React from 'react';
import { useChatStore } from '@/stores/chatStore.ts';
import { ICON_PATH } from '@/shared/constants';
import type { AgentType } from '@/shared/utils/common.ts';

const ChatHeader: React.FC = () => {
  const { currentSession } = useChatStore();
  const [imageError, setImageError] = React.useState(false);

  // 사용자 메시지가 있는지 확인
  const hasUserMessage =
    currentSession?.messages?.some((message) => message.sender === 'user') ||
    false;

  // 세션이 변경될 때마다 이미지 에러 상태 초기화
  React.useEffect(() => {
    setImageError(false);
  }, [currentSession?.id]);

  const getFeatureInfo = (agentMode: AgentType | null) => {
    switch (agentMode) {
      case 'person':
        return {
          icon: ICON_PATH.CHAT_HEADER.PERSON,
          title: '담당자 찾기',
        };
      case 'policy':
        return {
          icon: ICON_PATH.CHAT_HEADER.POLICY,
          title: '정책 문의하기',
        };
      case 'jira':
        return {
          icon: ICON_PATH.CHAT_HEADER.JIRA,
          title: 'Jira 요약하기',
        };
      case 'cr':
        return {
          icon: ICON_PATH.CHAT_HEADER.CR,
          title: 'CR 생성하기',
        };

      default:
        return {
          icon: '',
          title: '새로운 대화하기',
        };
    }
  };

  const featureInfo = getFeatureInfo(currentSession?.agentMode || null);

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center px-6 z-10 transition-all duration-300"
      style={{
        height: hasUserMessage ? '44px' : '69px',
        width: '100%',
      }}
    >
      <div className="flex items-center space-x-3">
        {featureInfo.icon && !imageError ? (
          <img
            src={featureInfo.icon}
            alt={featureInfo.title}
            className="w-6 h-6 transition-all duration-300"
            style={{
              width: 'auto',
              height: hasUserMessage ? '44px' : '69px',
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-white font-pretendard font-medium text-[17px] leading-6 tracking-[0%] align-bottom">
            {featureInfo.title}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
