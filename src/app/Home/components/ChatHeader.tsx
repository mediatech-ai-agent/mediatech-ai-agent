import { useChatStore } from '@/stores/chatStore.ts';
import React from 'react';

const ChatHeader: React.FC = () => {
  const { currentSession } = useChatStore();
  
  const getFeatureInfo = (agentMode: string | null) => {
    switch (agentMode) {
      case 'person':
        return {
          icon: '/src/assets/sideMenu/ic_person_nor.png',
          title: '담당자 찾기'
        };
      case 'rule':
        return {
          icon: '/src/assets/sideMenu/ic_rule_nor.png',
          title: '정책 문의하기'
        };
      case 'jira':
        return {
          icon: '/src/assets/sideMenu/icon_jira.png',
          title: 'Jira 요약하기'
        };
      case 'cr':
        return {
          icon: '/src/assets/sideMenu/ic_cr_nor.png',
          title: 'CR 생성하기'
        };
      case 'new':
        return {
          icon: '/src/assets/sideMenu/ic_new_nor.png',
          title: '새로운 대화하기'
        };
      default:
        return {
          icon: '/src/assets/sideMenu/ic_menu_nor.png',
          title: '새로운 대화하기'
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