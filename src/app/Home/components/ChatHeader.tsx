import React from 'react';
import { useChatStore } from '@/stores/chatStore.ts';
import { ICON_PATH } from '@/shared/constants';
import type { AgentType } from '@/shared/utils/common.ts';

const ChatHeader: React.FC = () => {
  const { currentSession } = useChatStore();

  const getFeatureInfo = (agentMode: AgentType | null) => {
    switch (agentMode) {
      case 'person':
        return {
          icon: ICON_PATH.SIDE_MENU.PERSON,
          title: '담당자 찾기',
        };
      case 'policy':
        return {
          icon: ICON_PATH.SIDE_MENU.POLICY,
          title: '정책 문의하기',
        };
      case 'jira':
        return {
          icon: ICON_PATH.SIDE_MENU.JIRA,
          title: 'Jira 요약하기',
        };
      case 'cr':
        return {
          icon: ICON_PATH.SIDE_MENU.CR,
          title: 'CR 생성하기',
        };
      case 'new':
        return {
          icon: ICON_PATH.SIDE_MENU.NEW_CHAT,
          title: '새로운 대화하기',
        };
      default:
        return {
          icon: ICON_PATH.SIDE_MENU.NEW_CHAT,
          title: '새로운 대화하기',
        };
    }
  };

  const featureInfo = getFeatureInfo(currentSession?.agentMode || null);

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center px-6 z-10"
      style={{
        height: '44px',
      }}
    >
      <div className="flex items-center space-x-3">
        <img
          src={featureInfo.icon}
          alt={featureInfo.title}
          className="w-6 h-6"
          style={{ width: '44px', height: '44px' }}
        />
        <span className="text-white font-pretendard font-medium text-[17px] leading-6 tracking-[0%] align-bottom">
          {featureInfo.title}
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;
