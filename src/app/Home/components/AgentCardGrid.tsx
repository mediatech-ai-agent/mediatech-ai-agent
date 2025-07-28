import { getAgentMessage, isValidAgentType, type AgentType } from '@/shared/utils/common';
import { useChatStore } from '@/stores/chatStore.ts';
import AgentCard from './AgentCard';

const AgentCardGrid = () => {
  const { addAiMessageWithAgent } = useChatStore();

  const handleAgentCardClick = (agentType: string) => {
    if (isValidAgentType(agentType)) {
      const aiMessage = getAgentMessage(agentType as AgentType);
      if (aiMessage) {
        addAiMessageWithAgent(aiMessage, agentType as AgentType);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <AgentCard
        title="Jira 요약하기"
        description="CR, BR 링크를 첨부해서\n댓글 요약, 히스토리 요청해 보세요"
        imageName="btn_jira"
        gradientColors={{
          primary: 'rgba(153, 211, 255, 0.2)',
          secondary: 'rgba(153, 255, 255, 0.1)',
        }}
        borderColor="rgba(153, 211, 255, 0.3)"
        shadowColor="rgba(153, 211, 255, 0.1)"
        onClick={() => handleAgentCardClick('jira')}
      />

      <AgentCard
        title="CR 생성하기"
        description="BR 링크를 첨부해서\nCR 초안 작성을 요청해 보세요"
        imageName="btn_cr"
        gradientColors={{
          primary: 'rgba(255, 165, 230, 0.2)',
          secondary: 'rgba(255, 167, 230, 0.1)',
        }}
        borderColor="rgba(255, 165, 230, 0.3)"
        shadowColor="rgba(255, 165, 230, 0.1)"
        onClick={() => handleAgentCardClick('cr')}
      />

      <AgentCard
        title="정책 문의하기"
        description="B tv 서비스 / UI 정책을 물어보세요\nFigma, Confluence 기반으로\n답변해 드려요"
        imageName="btn_polish"
        gradientColors={{
          primary: 'rgba(167, 178, 255, 0.2)',
          secondary: 'rgba(55, 73, 188, 0.1)',
        }}
        borderColor="rgba(167, 178, 255, 0.3)"
        shadowColor="rgba(167, 178, 255, 0.1)"
        onClick={() => handleAgentCardClick('policy')}
      />

      <AgentCard
        title="담당자 찾기"
        description="특정 서비스/기능 관련\nUI, GUI, 개발 담당자를 물어보세요"
        imageName="btn_person"
        gradientColors={{
          primary: 'rgba(199, 220, 255, 0.2)',
          secondary: 'rgba(96, 153, 252, 0.1)',
        }}
        borderColor="rgba(199, 220, 255, 0.3)"
        shadowColor="rgba(199, 220, 255, 0.1)"
        onClick={() => handleAgentCardClick('person')}
      />
    </div>
  );
};

export default AgentCardGrid;
