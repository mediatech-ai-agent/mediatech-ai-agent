import { create } from 'zustand';
import { createStorageManager } from '@/shared/utils/localStorage';
import type { AgentType } from '@/shared/utils/common.ts';

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

// 로컬스토리지 용량 측정 함수 (바이트 단위)
const getLocalStorageSize = (): number => {
  let totalSize = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const value = localStorage.getItem(key) || '';
      totalSize += key.length + value.length;
    }
  }
  return totalSize * 2; // UTF-16 인코딩이므로 2배
};

// 세션 데이터 크기 측정 함수 (바이트 단위)
const getSessionsDataSize = (sessions: ChatSession[]): number => {
  try {
    const serialized = JSON.stringify(sessions);
    return serialized.length * 2; // UTF-16 인코딩이므로 2배
  } catch (error) {
    console.error('Failed to calculate sessions data size:', error);
    return 0;
  }
};

// 세션 순서 정렬 함수 (고정된 세션들이 항상 맨 위)
const sortSessionsWithPinnedFirst = (
  sessions: ChatSession[]
): ChatSession[] => {
  const pinnedSessions = sessions.filter((session) => session.isPinned);
  const unpinnedSessions = sessions.filter((session) => !session.isPinned);

  return [...pinnedSessions, ...unpinnedSessions];
};

// 새 세션을 올바른 위치에 삽입하는 함수
const insertNewSession = (
  newSession: ChatSession,
  existingSessions: ChatSession[]
): ChatSession[] => {
  const pinnedSessions = existingSessions.filter((session) => session.isPinned);
  const unpinnedSessions = existingSessions.filter(
    (session) => !session.isPinned
  );

  // 고정된 세션들 + 새 세션 + 기존 일반 세션들
  return [...pinnedSessions, newSession, ...unpinnedSessions];
};

// 자동 대화 삭제 함수
const autoDeleteOldSessions = (sessions: ChatSession[]): ChatSession[] => {
  const MAX_SIZE = 4 * 1024 * 1024; // 4MB
  const TARGET_SIZE = 3.8 * 1024 * 1024; // 3.8MB

  const currentSize = getSessionsDataSize(sessions);

  if (currentSize <= TARGET_SIZE) {
    console.log(
      `용량 체크 통과: ${(currentSize / 1024 / 1024).toFixed(2)}MB / ${(TARGET_SIZE / 1024 / 1024).toFixed(2)}MB`
    );
    return sessions;
  }

  console.log(
    `용량 초과 감지: ${(currentSize / 1024 / 1024).toFixed(2)}MB / ${(TARGET_SIZE / 1024 / 1024).toFixed(2)}MB`
  );

  // 고정되지 않은 세션들을 생성일 기준으로 정렬 (오래된 것부터)
  const unpinnedSessions = sessions
    .filter((session) => !session.isPinned)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const pinnedSessions = sessions.filter((session) => session.isPinned);

  if (unpinnedSessions.length === 0) {
    console.warn('삭제 가능한 대화가 없습니다 (모든 대화가 고정됨)');
    return sessions;
  }

  let updatedSessions = [...sessions];
  let deletedCount = 0;

  // 목표 크기에 도달할 때까지 오래된 대화부터 삭제
  for (const sessionToDelete of unpinnedSessions) {
    updatedSessions = updatedSessions.filter(
      (s) => s.id !== sessionToDelete.id
    );
    deletedCount++;

    const newSize = getSessionsDataSize(updatedSessions);
    console.log(
      `대화 삭제: "${sessionToDelete.title}" (${deletedCount}개 삭제됨, 현재 크기: ${(newSize / 1024 / 1024).toFixed(2)}MB)`
    );

    if (newSize <= TARGET_SIZE) {
      break;
    }
  }

  console.log(
    `✅ 자동 삭제 완료: ${deletedCount}개 대화 삭제, 최종 크기: ${(getSessionsDataSize(updatedSessions) / 1024 / 1024).toFixed(2)}MB`
  );

  return updatedSessions;
};

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
  jiraNumber?: string; // Jira 티켓 번호 (BPM-00000 형태)
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean; // 고정 상태
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
  // 세션 로딩 상태 (세션 전환 시)
  isSessionLoading: boolean;
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
  // 임시 세션 생성 (sessions에 저장하지 않음)
  addUserTempMessage: (agentMode: AgentMode) => void;
  // 에이전트 모드 설정
  setAgentMode: (mode: AgentMode) => void;
  // AI 응답 상태 설정
  setAiResponding: (isResponding: boolean) => void;
  // 로딩 상태 설정
  setLoading: (isLoading: boolean) => void;
  // 세션 제목 업데이트
  updateSessionTitle: (sessionId: string, title: string) => void;
  // 세션의 Jira 번호 설정
  setJiraNumber: (jiraNumber: string) => void;
  // 세션의 Jira 번호 삭제
  removeJiraNumber: () => void;
  // 세션 고정/해제 토글
  togglePinSession: (sessionId: string) => void;
  // 디버깅을 위한 함수들
  debugStorage: () => any;
  clearAllStorage: () => void;
  // 용량 관련 디버깅 함수들
  checkStorageSize: () => void;
  manualDeleteOldSessions: () => void;
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  currentSession: null,
  sessions: loadSessions(), // 초기화 시 로컬 스토리지에서 복원
  currentAgentMode: null,
  isLoading: false,
  isAiResponding: false,
  isSessionLoading: false,

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
      // 새 세션을 고정된 세션들 아래, 일반 세션들 위에 삽입
      const updatedSessions = insertNewSession(newSession, state.sessions);
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
      // 세션 로딩 시작
      set({ isSessionLoading: true });

      // 세션 설정
      set({
        currentSession: session,
        currentAgentMode: session.agentMode, // 세션의 agentMode를 현재 상태로 설정
      });

      // 메시지 로드와 스크롤링을 위한 시간 후 로딩 완료
      setTimeout(() => {
        set({ isSessionLoading: false });
      }, 500); // 스크롤링 완료를 위한 충분한 시간
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

    // 현재 세션이 없으면 새로운 일반 세션 생성 (agentMode: null)
    if (!currentSession) {
      set({ currentAgentMode: null });
      get().createSession();
    }

    // 임시 세션인지 확인 (currentSession이 있지만 sessions에 없는 경우)
    const isTemporarySession =
      currentSession &&
      !sessions.find((session) => session.id === currentSession.id);

    if (isTemporarySession) {
      // 임시 세션을 정식 세션으로 변환하여 sessions에 추가
      const permanentSession: ChatSession = {
        ...currentSession,
        id: `session_${Date.now()}`, // 새로운 정식 ID 생성
      } as ChatSession;

      set((state) => {
        // 새 세션을 올바른 위치에 삽입하고 용량 체크 및 자동 삭제
        let sessionsToCheck = insertNewSession(
          permanentSession,
          state.sessions
        );
        const cleanedSessions = autoDeleteOldSessions(sessionsToCheck);

        saveSessions(cleanedSessions);

        return {
          sessions: cleanedSessions,
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

  addUserTempMessage: (agentMode: AgentMode) => {
    // 에이전트 모드 먼저 설정
    set({ currentAgentMode: agentMode });

    // 임시 세션 생성 (sessions에 저장하지 않음)
    get().createTemporarySession();
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

  setJiraNumber: (jiraNumber: string) => {
    set((state) => {
      if (!state.currentSession) return state;

      const updatedSession = {
        ...state.currentSession,
        jiraNumber,
        updatedAt: new Date(),
      };

      // 임시 세션인지 확인 (currentSession이 있지만 sessions에 없는 경우)
      const isTemporarySession = !state.sessions.find(
        (session) => session.id === state.currentSession!.id
      );

      if (isTemporarySession) {
        // 임시 세션의 경우 currentSession만 업데이트
        return {
          ...state,
          currentSession: updatedSession,
        };
      } else {
        // 정식 세션의 경우 sessions 배열도 업데이트
        const updatedSessions = state.sessions.map((session) =>
          session.id === state.currentSession!.id ? updatedSession : session
        );

        // 로컬 스토리지에 저장
        saveSessions(updatedSessions);

        return {
          sessions: updatedSessions,
          currentSession: updatedSession,
        };
      }
    });
  },

  removeJiraNumber: () => {
    set((state) => {
      if (!state.currentSession) return state;

      const updatedSession = {
        ...state.currentSession,
        jiraNumber: undefined,
        updatedAt: new Date(),
      };

      // 임시 세션인지 확인 (currentSession이 있지만 sessions에 없는 경우)
      const isTemporarySession = !state.sessions.find(
        (session) => session.id === state.currentSession!.id
      );

      if (isTemporarySession) {
        // 임시 세션의 경우 currentSession만 업데이트
        return {
          ...state,
          currentSession: updatedSession,
        };
      } else {
        // 정식 세션의 경우 sessions 배열도 업데이트
        const updatedSessions = state.sessions.map((session) =>
          session.id === state.currentSession!.id ? updatedSession : session
        );

        // 로컬 스토리지에 저장
        saveSessions(updatedSessions);

        return {
          sessions: updatedSessions,
          currentSession: updatedSession,
        };
      }
    });
  },

  togglePinSession: (sessionId: string) => {
    set((state) => {
      const targetSessionIndex = state.sessions.findIndex(
        (s) => s.id === sessionId
      );
      if (targetSessionIndex === -1) return state;

      const targetSession = state.sessions[targetSessionIndex];
      const isPinning = !targetSession.isPinned;

      let updatedSessions: ChatSession[];

      if (isPinning) {
        // 고정하는 경우: 고정된 세션들의 맨 위로 이동
        const sessionToPin = {
          ...targetSession,
          isPinned: true,
          updatedAt: new Date(),
        };

        // 다른 세션들
        const otherSessions = state.sessions.filter(
          (session) => session.id !== sessionId
        );
        const existingPinnedSessions = otherSessions.filter(
          (session) => session.isPinned
        );
        const unpinnedSessions = otherSessions.filter(
          (session) => !session.isPinned
        );

        // 새로 고정하는 세션을 고정된 세션들의 맨 위에 배치
        updatedSessions = [
          sessionToPin,
          ...existingPinnedSessions,
          ...unpinnedSessions,
        ];

        console.log(
          `📌 세션 고정: "${targetSession.title}" (고정된 대화 맨 위로 이동)`
        );
      } else {
        // 고정 해제하는 경우: 일반 세션들의 맨 위로 이동
        const sessionToUnpin = {
          ...targetSession,
          isPinned: false,
          updatedAt: new Date(),
        };

        // 다른 세션들
        const otherSessions = state.sessions.filter(
          (session) => session.id !== sessionId
        );
        const pinnedSessions = otherSessions.filter(
          (session) => session.isPinned
        );
        const unpinnedSessions = otherSessions.filter(
          (session) => !session.isPinned
        );

        // 고정 해제한 세션을 일반 세션들의 맨 위에 배치
        updatedSessions = [
          ...pinnedSessions,
          sessionToUnpin,
          ...unpinnedSessions,
        ];

        console.log(
          `🔓 세션 고정 해제: "${targetSession.title}" (일반 대화 맨 위로 이동)`
        );
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

  // 디버깅을 위한 함수들
  debugStorage: () => {
    const allKeys = Object.keys(localStorage);
    const chatKeys = allKeys.filter(
      (key) => key.includes('chat') || key.includes('session')
    );
    console.log('All localStorage keys:', allKeys);
    console.log('Chat-related keys:', chatKeys);
    console.log(
      'Chat sessions storage:',
      chatStorage.get(SESSIONS_STORAGE_KEY)
    );
    return {
      allKeys,
      chatKeys,
      sessions: chatStorage.get(SESSIONS_STORAGE_KEY),
    };
  },

  clearAllStorage: () => {
    // 모든 로컬스토리지 삭제
    localStorage.clear();
    // chat-sessions 네임스페이스 삭제
    chatStorage.clear();
    // 세션 상태 초기화
    set({
      sessions: [],
      currentSession: null,
      currentAgentMode: null,
    });
    console.log('All storage cleared');
  },

  // 현재 스토리지 용량 상태 확인
  checkStorageSize: () => {
    const { sessions } = get();
    const totalLocalStorageSize = getLocalStorageSize();
    const sessionsDataSize = getSessionsDataSize(sessions);
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB
    const TARGET_SIZE = 3.8 * 1024 * 1024; // 3.8MB

    const unpinnedCount = sessions.filter((s) => !s.isPinned).length;
    const pinnedCount = sessions.filter((s) => s.isPinned).length;

    console.log('📊 스토리지 용량 상태:');
    console.log(
      `  • 전체 로컬스토리지: ${(totalLocalStorageSize / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `  • 채팅 세션 데이터: ${(sessionsDataSize / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(`  • 최대 허용 크기: ${(MAX_SIZE / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  • 삭제 임계값: ${(TARGET_SIZE / 1024 / 1024).toFixed(2)}MB`);
    console.log(
      `  • 남은 용량: ${((TARGET_SIZE - sessionsDataSize) / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `  • 전체 세션: ${sessions.length}개 (고정: ${pinnedCount}개, 일반: ${unpinnedCount}개)`
    );

    if (sessionsDataSize > TARGET_SIZE) {
      console.warn(
        `⚠️ 용량 초과! 다음 대화 시작 시 ${Math.ceil(((sessionsDataSize - TARGET_SIZE) / 1024 / 1024) * 10) / 10}MB 정도 삭제 예정`
      );
    } else {
      console.log('✅ 용량 상태 양호');
    }

    return {
      totalLocalStorageSize,
      sessionsDataSize,
      maxSize: MAX_SIZE,
      targetSize: TARGET_SIZE,
      remainingSize: TARGET_SIZE - sessionsDataSize,
      totalSessions: sessions.length,
      pinnedSessions: pinnedCount,
      unpinnedSessions: unpinnedCount,
      needsCleanup: sessionsDataSize > TARGET_SIZE,
    };
  },

  // 수동으로 오래된 대화 삭제 실행
  manualDeleteOldSessions: () => {
    set((state) => {
      const cleanedSessions = autoDeleteOldSessions(state.sessions);
      saveSessions(cleanedSessions);

      return {
        sessions: cleanedSessions,
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

// 세션 로딩 상태를 가져오는 셀렉터
export const useIsSessionLoading = () => {
  return useChatStore((state) => state.isSessionLoading);
};

// 개발 환경에서 디버깅을 위해 window 객체에 노출
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).chatStore = {
    debugStorage: () => useChatStore.getState().debugStorage(),
    clearAllStorage: () => useChatStore.getState().clearAllStorage(),
    checkStorageSize: () => useChatStore.getState().checkStorageSize(),
    manualDeleteOldSessions: () =>
      useChatStore.getState().manualDeleteOldSessions(),
    getState: () => useChatStore.getState(),
  };
}
