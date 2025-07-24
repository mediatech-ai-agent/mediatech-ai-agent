import { useChatStore } from '@/stores/chatStore.ts';
import { ICON_PATH } from '@/shared/constants';
import { getAgentMessage, isValidAgentType, type AgentType } from '@/shared/utils/common';

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

export const useSidebarController = () => {
  const { addAiMessageWithAgent } = useChatStore();

  const handleMenuClick = (id: string) => {
    if (isValidAgentType(id)) {
      const aiMessage = getAgentMessage(id as AgentType);
      if (aiMessage) {
        addAiMessageWithAgent(aiMessage, id as AgentType);
      }
    }
  }

  const handleHistoryClick = (id: string) => {
    console.log('History clicked:', id);
  };

  return {
    handleMenuClick,
    handleHistoryClick,
  }
}