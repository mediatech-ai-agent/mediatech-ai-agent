import { create } from 'zustand';
import { createStorageManager } from '@/shared/utils/localStorage';

// 빈 배열 상수 (참조 안정성을 위해)
const EMPTY_MESSAGES: ChatMessage[] = [];

// 채팅 세션 전용 스토리지
const chatStorage = createStorageManager('chat-sessions');
const SESSIONS_STORAGE_KEY = 'sessions';

// 세션 저장 디바운스를 위한 타이머
let saveSessionsTimer: NodeJS.Timeout | null = null;

// 세션을 로컬 스토리지에 저장하는 함수 (디바운스 적용)
const saveSessions = (sessions: ChatSession[]) => {
  // 기존 타이머 클리어
  if (saveSessionsTimer) {
    clearTimeout(saveSessionsTimer);
  }
  
  // 500ms 후에 저장 (디바운스)
  saveSessionsTimer = setTimeout(() => {
    try {
      chatStorage.set(SESSIONS_STORAGE_KEY, sessions);
    } catch (error) {
      console.error('Failed to save sessions to localStorage:', error);
    }
  }, 500);
};

// 로컬 스토리지에서 세션을 복원하는 함수
const loadSessions = (): ChatSession[] => {
  try {
    const sessions = chatStorage.get<ChatSession[]>(SESSIONS_STORAGE_KEY);
    if (sessions && Array.isArray(sessions)) {
      // Date 객체 복원
      return sessions.map(session => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map(message => ({
          ...message,
          timestamp: new Date(message.timestamp)
        }))
      }));
    }
  } catch (error) {
    console.error('Failed to load sessions from localStorage:', error);
  }
  return [];
};

// 브라우저 이탈 시 즉시 저장
const saveSessionsImmediately = (sessions: ChatSession[]) => {
  try {
    chatStorage.set(SESSIONS_STORAGE_KEY, sessions);
  } catch (error) {
    console.error('Failed to save sessions immediately:', error);
  }
};

// 메시지 타입 정의
export type MessageType = 'text' | 'image' | 'file' | 'code' | 'markdown';

// 메시지 발신자 타입
export type MessageSender = 'user' | 'ai';

// 에이전트 모드 타입 정의
export type AgentMode = 'jira' | 'cr' | 'policy' | 'person' | null;

// 개별 메시지 인터페이스
export interface ChatMessage {
  id: string;
  content: string;
  sender: MessageSender;
  type: MessageType;
  timestamp: Date;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
    codeLanguage?: string;
    [key: string]: unknown;
  };
}

// 채팅 세션 인터페이스
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// 채팅 스토어 상태 인터페이스
interface ChatState {
  // 현재 활성 세션
  currentSession: ChatSession | null;
  // 모든 채팅 세션들
  sessions: ChatSession[];
  // 현재 에이전트 모드
  currentAgentMode: AgentMode;
  // 로딩 상태
  isLoading: boolean;
  // AI 응답 대기 상태
  isAiResponding: boolean;
}

// 채팅 스토어 액션 인터페이스
interface ChatActions {
  // 새 채팅 세션 생성
  createSession: () => void;
  // 세션 선택
  selectSession: (sessionId: string) => void;
  // 메시지 추가
  addMessage: (
    content: string,
    sender: MessageSender,
    type?: MessageType,
    metadata?: ChatMessage['metadata']
  ) => void;
  // 사용자 메시지 추가 (편의 함수)
  addUserMessage: (
    content: string,
    type?: MessageType,
    metadata?: ChatMessage['metadata']
  ) => void;
  // AI 메시지 추가 (편의 함수)
  addAiMessage: (
    content: string,
    type?: MessageType,
    metadata?: ChatMessage['metadata']
  ) => void;
  // 에이전트 모드와 함께 AI 메시지 추가
  addAiMessageWithAgent: (
    content: string,
    agentMode: AgentMode,
    type?: MessageType,
    metadata?: ChatMessage['metadata']
  ) => void;
  // 에이전트 모드 설정
  setAgentMode: (mode: AgentMode) => void;
  // AI 응답 상태 설정
  setAiResponding: (isResponding: boolean) => void;
  // 로딩 상태 설정
  setLoading: (isLoading: boolean) => void;
  // 세션 제목 업데이트
  updateSessionTitle: (sessionId: string, title: string) => void;
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  currentSession: null,
  sessions: loadSessions(), // 초기화 시 로컬 스토리지에서 복원
  currentAgentMode: null,
  isLoading: false,
  isAiResponding: false,

  createSession: () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: '새로운 대화',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => {
      const updatedSessions = [newSession, ...state.sessions];
      // 로컬 스토리지에 저장 (디바운스 적용)
      saveSessions(updatedSessions);
      
      return {
        sessions: updatedSessions,
        currentSession: newSession,
      };
    });
  },

  selectSession: (sessionId: string) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (session) {
      set({ currentSession: session });
    }
  },

  addMessage: (
    content: string,
    sender: MessageSender,
    type: MessageType = 'text',
    metadata?: ChatMessage['metadata']
  ) => {
    const { currentSession } = get();
    if (!currentSession) {
      get().createSession();
      return get().addMessage(content, sender, type, metadata);
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender,
      type,
      timestamp: new Date(),
      metadata,
    };

    const updatedSession: ChatSession = {     
      ...currentSession,
      messages: [...currentSession.messages, newMessage],
      updatedAt: new Date(),
      // 첫 번째 사용자 메시지를 제목으로 설정
      title:
        currentSession.messages.length === 0 && sender === 'user'
          ? content.slice(0, 30) + (content.length > 30 ? '...' : '')
          : currentSession.title,
    };

    set((state) => {
      const updatedSessions = state.sessions.map((session) =>
        session.id === currentSession.id ? updatedSession : session
      );
      
      // 로컬 스토리지에 저장 (디바운스 적용)
      saveSessions(updatedSessions);
      
      return {
        currentSession: updatedSession,
        sessions: updatedSessions,
      };
    });
  },

  addUserMessage: (
    content: string,
    type: MessageType = 'text',
    metadata?: ChatMessage['metadata']
  ) => {
    get().addMessage(content, 'user', type, metadata);
  },

  addAiMessage: (
    content: string,
    type: MessageType = 'text',
    metadata?: ChatMessage['metadata']
  ) => {
    get().addMessage(content, 'ai', type, metadata);
  },

  addAiMessageWithAgent: (
    content: string,
    agentMode: AgentMode,
    type: MessageType = 'text',
    metadata?: ChatMessage['metadata']
  ) => {
    // 새로운 세션 생성
    get().createSession();
    
    // 에이전트 모드 설정
    set({ currentAgentMode: agentMode });
    
    // AI 메시지 추가
    get().addMessage(content, 'ai', type, metadata);
  },

  setAgentMode: (mode: AgentMode) => {
    set({ currentAgentMode: mode });
  },

  setAiResponding: (isResponding: boolean) => {
    set({ isAiResponding: isResponding });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  updateSessionTitle: (sessionId: string, title: string) => {
    set((state) => {
      const updatedSessions = state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, title, updatedAt: new Date() }
          : session
      );
      
      // 로컬 스토리지에 저장
      saveSessions(updatedSessions);
      
      return {
        sessions: updatedSessions,
        currentSession:
          state.currentSession?.id === sessionId
            ? { ...state.currentSession, title, updatedAt: new Date() }
            : state.currentSession,
      };
    });
  },
}));

// 브라우저 이탈 시 세션 저장을 위한 이벤트 리스너 등록
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const currentSessions = useChatStore.getState().sessions;
    saveSessionsImmediately(currentSessions);
  });
  
  // 페이지 숨김 시에도 저장 (모바일 브라우저 대응)
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      const currentSessions = useChatStore.getState().sessions;
      saveSessionsImmediately(currentSessions);
    }
  });
}

// 현재 세션의 메시지들을 가져오는 셀렉터
export const useCurrentMessages = () => {
  return useChatStore(
    (state) => state.currentSession?.messages ?? EMPTY_MESSAGES
  );
};

// 채팅 세션 목록을 가져오는 셀렉터
export const useChatSessions = () => {
  return useChatStore((state) => state.sessions);
};

// 현재 세션 정보를 가져오는 셀렉터
export const useCurrentSession = () => {
  return useChatStore((state) => state.currentSession);
};

// 현재 에이전트 모드를 가져오는 셀렉터
export const useCurrentAgentMode = () => {
  return useChatStore((state) => state.currentAgentMode);
};
