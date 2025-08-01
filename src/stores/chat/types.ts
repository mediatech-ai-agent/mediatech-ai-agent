import type { AgentType } from '@/shared/utils/common.ts';

// 메시지 타입 정의
export type MessageType = 'text' | 'image' | 'file' | 'code' | 'markdown';

// 메시지 발신자 타입
export type MessageSender = 'user' | 'ai';

// 에이전트 모드 타입 정의
export type AgentMode = AgentType | null;

// 개별 메시지 인터페이스
export interface ChatMessage {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: Date;
  type?: MessageType;
  agentMode?: AgentMode;
  metadata?: {
    jiraNumber?: string;
    files?: File[];
    [key: string]: any;
  };
}

// 채팅 세션 인터페이스
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  agentMode: AgentMode; // 해당 세션의 에이전트 모드
  jiraNumber?: string; // Jira 티켓 번호 (BPM-00000 형태)
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean; // 고정 상태
}

// 채팅 스토어 상태 인터페이스
export interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isAiResponding: boolean;
  isSessionLoading: boolean;
}

// 채팅 스토어 액션 인터페이스
export interface ChatActions {
  createSession: () => void;
  createTemporarySession: () => void;
  selectSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  addMessage: (
    content: string,
    sender: MessageSender,
    type?: MessageType,
    metadata?: {
      jiraNumber?: string;
      files?: File[];
      [key: string]: any;
    }
  ) => void;
  addUserMessage: (
    content: string,
    type?: MessageType,
    metadata?: {
      jiraNumber?: string;
      files?: File[];
      [key: string]: any;
    }
  ) => void;
  addAiMessage: (content: string, type?: MessageType) => void;
  addAiMessageWithAgent: (
    content: string,
    agentMode: AgentMode,
    type?: MessageType,
    metadata?: {
      jiraNumber?: string;
      files?: File[];
      [key: string]: any;
    }
  ) => void;
  addUserTempMessage: (agentMode: AgentMode) => void;
  updateLastMessage: (content: string) => void;
  deleteMessage: (messageId: string) => void;
  clearCurrentSession: () => void;
  setAiResponding: (isResponding: boolean) => void;
  setJiraNumber: (jiraNumber: string) => void;
  removeJiraNumber: () => void;
  togglePinSession: (sessionId: string) => void;
  checkStorageSize: () => void;
  manualDeleteOldSessions: () => void;
}
