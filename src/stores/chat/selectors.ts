import { useChatStore } from './chatStore';
import type { ChatMessage, ChatState, ChatActions } from './types';

// 빈 배열 상수 (참조 안정성을 위해)
const EMPTY_MESSAGES: ChatMessage[] = [];

// 현재 세션의 메시지들을 가져오는 셀렉터
export const useCurrentMessages = () => {
  return useChatStore(
    (state: ChatState & ChatActions) =>
      state.currentSession?.messages ?? EMPTY_MESSAGES
  );
};

// 채팅 세션 목록을 가져오는 셀렉터
export const useChatSessions = () => {
  return useChatStore((state: ChatState & ChatActions) => state.sessions);
};

// 현재 세션 정보를 가져오는 셀렉터
export const useCurrentSession = () => {
  return useChatStore((state: ChatState & ChatActions) => state.currentSession);
};

// 현재 에이전트 모드를 가져오는 셀렉터
export const useCurrentAgentMode = () => {
  return useChatStore(
    (state: ChatState & ChatActions) => state.currentSession?.agentMode ?? null
  );
};

// 세션 로딩 상태를 가져오는 셀렉터
export const useIsSessionLoading = () => {
  return useChatStore(
    (state: ChatState & ChatActions) => state.isSessionLoading
  );
};
