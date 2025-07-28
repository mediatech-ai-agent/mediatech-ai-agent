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
      // Date 객체 복원 및 기본값 설정
      return sessions.map((session) => ({
        ...session,
        agentMode: session.agentMode ?? null, // 기존 세션에 agentMode가 없으면 null로 설정
        isPinned: session.isPinned ?? false, // 기존 세션에 isPinned가 없으면 false로 설정
        originalIndex: session.originalIndex, // originalIndex는 있으면 유지, 없으면 undefined
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((message) => ({
          ...message,
          timestamp: new Date(message.timestamp),
        })),
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
  agentMode: AgentMode; // 해당 세션의 에이전트 모드
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean; // 고정 상태
  originalIndex?: number; // 원래 순서 (고정 해제 시 복원용)
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
  // 임시 세션 생성 (sessions에 저장하지 않음)
  createTemporarySession: () => void;
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
  // 세션 고정/해제 토글
  togglePinSession: (sessionId: string) => void;
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  currentSession: null,
  sessions: loadSessions(), // 초기화 시 로컬 스토리지에서 복원
  currentAgentMode: null,
  isLoading: false,
  isAiResponding: false,

  createSession: () => {
    const { currentAgentMode } = get();
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: '새로운 대화',
      messages: [],
      agentMode: currentAgentMode,
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

  createTemporarySession: () => {
    const { currentAgentMode } = get();
    const newSession: ChatSession = {
      id: `temp_session_${Date.now()}`,
      title: '새로운 대화',
      messages: [],
      agentMode: currentAgentMode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // sessions에는 저장하지 않고 currentSession만 설정
    set({
      currentSession: newSession,
    });
  },

  selectSession: (sessionId: string) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (session) {
      set({
        currentSession: session,
        currentAgentMode: session.agentMode, // 세션의 agentMode를 현재 상태로 설정
      });
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
    const { currentSession, sessions } = get();

    // 임시 세션인지 확인 (currentSession이 있지만 sessions에 없는 경우)
    const isTemporarySession =
      currentSession &&
      !sessions.find((session) => session.id === currentSession.id);

    if (isTemporarySession) {
      // 임시 세션을 정식 세션으로 변환하여 sessions에 추가
      const permanentSession: ChatSession = {
        ...currentSession,
        id: `session_${Date.now()}`, // 새로운 정식 ID 생성
      };

      set((state) => {
        const updatedSessions = [permanentSession, ...state.sessions];
        saveSessions(updatedSessions);

        return {
          sessions: updatedSessions,
          currentSession: permanentSession,
        };
      });
    }

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
    // 에이전트 모드 먼저 설정
    set({ currentAgentMode: agentMode });

    // 임시 세션 생성 (sessions에 저장하지 않음)
    get().createTemporarySession();

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
            ? {
                ...state.currentSession,
                title,
                updatedAt: new Date(),
                agentMode: state.currentSession.agentMode, // agentMode 유지
              }
            : state.currentSession,
      };
    });
  },

  togglePinSession: (sessionId: string) => {
    set((state) => {
      const targetSessionIndex = state.sessions.findIndex((s) => s.id === sessionId);
      if (targetSessionIndex === -1) return state;

      const targetSession = state.sessions[targetSessionIndex];
      const isPinning = !targetSession.isPinned;

      let updatedSessions: ChatSession[];

      if (isPinning) {
        // 고정하는 경우: 해당 세션을 맨 앞으로 이동
        const sessionToPin = {
          ...targetSession,
          isPinned: true,
          originalIndex: targetSessionIndex, // 원래 위치 저장
          updatedAt: new Date(),
        };

        // 다른 세션들과 함께 새 배열 생성 (고정된 세션을 맨 앞에)
        updatedSessions = [
          sessionToPin,
          ...state.sessions.filter((session) => session.id !== sessionId),
        ];
      } else {
        // 고정 해제하는 경우: 원래 위치로 복원
        const sessionToUnpin = {
          ...targetSession,
          isPinned: false,
          originalIndex: undefined,
          updatedAt: new Date(),
        };

        // 다른 세션들 먼저 배치
        const otherSessions = state.sessions.filter((session) => session.id !== sessionId);
        
        // 원래 인덱스가 있으면 그 위치에 삽입, 없으면 끝에 추가
        const insertIndex = targetSession.originalIndex !== undefined 
          ? Math.min(targetSession.originalIndex, otherSessions.length)
          : otherSessions.length;

        updatedSessions = [
          ...otherSessions.slice(0, insertIndex),
          sessionToUnpin,
          ...otherSessions.slice(insertIndex),
        ];
      }

      // 로컬 스토리지에 저장
      saveSessions(updatedSessions);

      return {
        sessions: updatedSessions,
        currentSession:
          state.currentSession?.id === sessionId
            ? { ...state.currentSession, isPinned: isPinning }
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
