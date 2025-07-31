export type AgentType = 'jira' | 'cr' | 'policy' | 'person';

export interface AgentInfo {
  id: AgentType;
  title: string;
  message: string;
}

/**
 * 에이전트 타입별 AI 메시지 정보
 */
export const AGENT_MESSAGES: Record<AgentType, string> = {
  jira: `어떤 이슈인지 금방 파악하고 싶은가요?
**CR이나 BR 번호**만 주시면,
히스토리부터 핵심 요점까지 정리해드릴게요.`,

  cr: `<div>사업 기획서를 개발 요청서로 바꾸고 싶을 때 사용하세요.<br><strong>BR 번호</strong>를 주시면,<br>바로 쓸 수 있는 CR 형식으로 정리해드릴게요.<br><br>기본적으로 <strong>배경, 필요 개발 컴포넌트, 카테고리, Acceptance Criteria, 요구사항</strong> 항목이 포함돼요.<br>추가로 넣고 싶은 항목이 있다면 이어서 질문해 주세요.</div>`,

  policy: `**B tv 서비스, UI 정책**이 궁금하신가요?
"홈 배너 노출 조건이 뭐야?"처럼
구체적으로 질문해주시면 Figma, Confluence 정책 문서를 기반으로 알려드릴게요.`,

  person: `누구랑 이야기해야 할지 막막할 때 써보세요.
궁금한 기능의 **UI·GUI·개발 담당자**를 찾는 건 물론,
새로운 기획을 제안하거나 논의하고 싶을 때 연결할 담당자도 찾아드릴게요.`,
};

/**
 * 에이전트 타입에 따른 AI 메시지를 반환합니다.
 */
export const getAgentMessage = (agentType: AgentType): string => {
  return AGENT_MESSAGES[agentType] || '';
};

/**
 * 에이전트 타입이 유효한지 확인합니다.
 */
export const isValidAgentType = (agentType: string): agentType is AgentType => {
  return Object.keys(AGENT_MESSAGES).includes(agentType);
};

/**
 * 모든 에이전트 타입 목록을 반환합니다.
 */
export const getAllAgentTypes = (): AgentType[] => {
  return Object.keys(AGENT_MESSAGES) as AgentType[];
};
