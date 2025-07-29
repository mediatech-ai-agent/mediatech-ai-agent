import { useChatStore, type AgentMode } from '@/stores/chatStore.ts';
import { ICON_PATH } from '@/shared/constants';
import { getAgentMessage, isValidAgentType, type AgentType } from '@/shared/utils/common';

export const MENU_HEADER_ITEMS = [
  {
    id: 'new-chat',
    title: '새로운 대화하기',
    icon: ICON_PATH.SIDE_MENU.NEW_CHAT,
  },
];

export const MENU_ITEMS = [
    {
      id: 'jira',
      title: 'Jira 요약하기',
      icon: ICON_PATH.SIDE_MENU.JIRA,
    },
    {
      id: 'cr',
      title: 'CR 생성하기',
      icon: ICON_PATH.SIDE_MENU.CR,
    },
    {
      id: 'policy',
      title: '정책 문의하기',
      icon: ICON_PATH.SIDE_MENU.POLICY,
    },
    {
      id: 'person',
      title: '담당자 찾기',
      icon: ICON_PATH.SIDE_MENU.PERSON,
    },
  ];

// 에이전트 모드에 따른 아이콘 매핑
export const getIconByAgentMode = (agentMode: AgentMode): string => {
  switch (agentMode) {
    case 'jira':
      return ICON_PATH.HISTORY_MENU.JIRA;
    case 'cr':
      return ICON_PATH.HISTORY_MENU.CR;
    case 'policy':
      return ICON_PATH.HISTORY_MENU.POLICY;
    case 'person':
      return ICON_PATH.HISTORY_MENU.PERSON;
    default:
      return ICON_PATH.HISTORY_MENU.NEW_CHAT;
  }
};

export const useSidebarController = () => {
  const { addAiMessageWithAgent, selectSession } = useChatStore();

  const handleMenuClick = (id: string) => {
    if (id === 'new-chat') {
      addAiMessageWithAgent('새로운 대화를 시작합니다.', null);
      return;
    }

    if (isValidAgentType(id)) {
      const aiMessage = getAgentMessage(id as AgentType);
      if (aiMessage) {
        addAiMessageWithAgent(aiMessage, id as AgentType);
      }
    }
  }

  const handleHistoryClick = (sessionId: string) => {
    selectSession(sessionId);
  };

  return {
    handleMenuClick,
    handleHistoryClick,
  }
}