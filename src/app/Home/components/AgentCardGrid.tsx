import AgentCard from './AgentCard';
import { useChatStore } from '@/stores/chatStore.ts';

const AgentCardGrid = () => {
  const { addAiMessage } = useChatStore();

  const handleAgentCardClick = (agentType: string) => {
    let aiMessage = '';
    switch (agentType) {
      case 'jira':
        aiMessage = `어떤 이슈인지 금방 파악하고 싶은가요?  
CR이나 BR 링크만 주시면,  
히스토리부터 핵심 요점까지 정리해드릴게요.  
여러 개의 링크를 주시면,  
서로 어떻게 연결되는지도 같이 정리해드릴게요!`;
        break;
      case 'cr':
        aiMessage = `사업 기획서를 개발 요청서로 바꾸고 싶을 때 사용하세요.  
BR이나 회의록 링크를 주시면,  
바로 쓸 수 있는 CR 형식으로 정리해드릴게요.  

기본적으로 배경, 필요 개발 컴포넌트, 카테고리, Acceptance Criteria, 요구사항 항목이 포함돼요.  
추가로 넣고 싶은 항목이 있다면 질문 입력창에서 선택해 주세요.`;
        break;
      case 'polish':
        aiMessage = `B tv 서비스, UI 정책이 궁금하신가요?  
"홈 배너 노출 조건이 뭐야?"처럼  
구체적으로 질문해주시면 Figma, Confluence 정책 문서를 기반으로 알려드릴게요.`;
        break;
      case 'person':
        aiMessage = `누구랑 이야기해야 할지 막막할 때 써보세요.  
궁금한 기능의 UI·GUI·개발 담당자를 찾는 건 물론,  
새로운 기획을 제안하거나 논의하고 싶을 때 연결할 담당자도 찾아드릴게요.`;
        break;
    }

    if (aiMessage) {
      addAiMessage(aiMessage);
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
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
        onClick={() => handleAgentCardClick('polish')}
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
