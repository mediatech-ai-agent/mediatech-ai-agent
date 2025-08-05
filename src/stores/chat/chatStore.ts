import { create } from 'zustand';
import type {
  ChatState,
  ChatActions,
  ChatSession,
  ChatMessage,
  MessageType,
  MessageSender,
  AgentMode,
} from './types';
import {
  loadSessions,
  saveSessions,
  getLocalStorageSize,
  getSessionsDataSize,
} from './storage';
import {
  insertNewSession,
  autoDeleteOldSessions,
  updateSessionOrder,
} from './sessionUtils';

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  currentSession: null,
  sessions: loadSessions(), // 초기화 시 로컬 스토리지에서 복원
  isAiResponding: false,
  isSessionLoading: false,

  createSession: () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: '새로운 대화',
      messages: [],
      agentMode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => {
      const updatedSessions = insertNewSession(newSession, state.sessions);
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
      set({ isSessionLoading: true });
      set({ currentSession: session });

      setTimeout(() => {
        set({ isSessionLoading: false });
      }, 500);
    }
  },

  deleteSession: (sessionId: string) => {
    set((state) => {
      const updatedSessions = state.sessions.filter((s) => s.id !== sessionId);
      saveSessions(updatedSessions);

      return {
        sessions: updatedSessions,
        currentSession:
          state.currentSession?.id === sessionId ? null : state.currentSession,
      };
    });
  },

  updateSessionTitle: (sessionId: string, title: string) => {
    set((state) => {
      const updatedSessions = state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, title, updatedAt: new Date() }
          : session
      );

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

  addMessage: (
    content: string,
    sender: MessageSender,
    type: MessageType = 'text',
    metadata?: ChatMessage['metadata'],
    sourceMetaData?: ChatMessage['sourceMetaData']
  ) => {
    const { currentSession } = get();
    if (!currentSession) {
      get().createSession();
      return get().addMessage(content, sender, type, metadata, sourceMetaData);
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender,
      type,
      timestamp: new Date(),
      metadata,
      sourceMetaData,
    };

    const updatedSession: ChatSession = {
      ...currentSession,
      messages: [...currentSession.messages, newMessage],
      updatedAt: new Date(),
      title:
        currentSession.messages.length === 0 && sender === 'user'
          ? content.slice(0, 30) + (content.length > 30 ? '...' : '')
          : currentSession.title,
    };

    set((state) => {
      const updatedSessions = state.sessions.map((session) =>
        session.id === currentSession.id ? updatedSession : session
      );

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
    metadata?: ChatMessage['metadata'],
    sourceMetaData?: ChatMessage['sourceMetaData']
  ) => {
    const { currentSession, sessions } = get();

    if (!currentSession) {
      get().createSession();
    }

    // 임시 세션인지 확인 (currentSession이 있지만 sessions에 없는 경우)
    const isTemporarySession =
      currentSession &&
      !sessions.find((session) => session.id === currentSession.id);

    if (isTemporarySession) {
      // 임시 세션을 정식 세션으로 변환
      const permanentSession: ChatSession = {
        ...currentSession,
        id: `session_${Date.now()}`,
      } as ChatSession;

      set((state) => {
        const sessionsToCheck = insertNewSession(
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

    get().addMessage(content, 'user', type, metadata, sourceMetaData);
  },

  addAiMessage: (
    content: string,
    type: MessageType = 'text',
    sourceMetaData?: ChatMessage['sourceMetaData']
  ) => {
    get().addMessage(content, 'ai', type, undefined, sourceMetaData);
  },

  createTemporarySession: () => {
    const newSession: ChatSession = {
      id: `temp_session_${Date.now()}`,
      title: '새로운 대화',
      messages: [],
      agentMode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set({ currentSession: newSession });
  },

  addAiMessageWithAgent: (
    content: string,
    agentMode: AgentMode,
    type: MessageType = 'text',
    metadata?: ChatMessage['metadata'],
    sourceMetaData?: ChatMessage['sourceMetaData']
  ) => {
    const newSession: ChatSession = {
      id: `temp_session_${Date.now()}`,
      title: '새로운 대화',
      messages: [],
      agentMode: agentMode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set({ currentSession: newSession });
    get().addMessage(content, 'ai', type, metadata, sourceMetaData);
  },

  addUserTempMessage: (agentMode: AgentMode) => {
    const newSession: ChatSession = {
      id: `temp_session_${Date.now()}`,
      title: '새로운 대화',
      messages: [],
      agentMode: agentMode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set({ currentSession: newSession });
  },

  setJiraNumber: (jiraNumber: string) => {
    set((state) => {
      if (!state.currentSession) return state;

      const updatedSession = {
        ...state.currentSession,
        jiraNumber,
        updatedAt: new Date(),
      };

      const isTemporarySession = !state.sessions.find(
        (session) => session.id === state.currentSession!.id
      );

      if (isTemporarySession) {
        return { ...state, currentSession: updatedSession };
      } else {
        const updatedSessions = state.sessions.map((session) =>
          session.id === state.currentSession!.id ? updatedSession : session
        );
        saveSessions(updatedSessions);
        return { sessions: updatedSessions, currentSession: updatedSession };
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

      const isTemporarySession = !state.sessions.find(
        (session) => session.id === state.currentSession!.id
      );

      if (isTemporarySession) {
        return { ...state, currentSession: updatedSession };
      } else {
        const updatedSessions = state.sessions.map((session) =>
          session.id === state.currentSession!.id ? updatedSession : session
        );
        saveSessions(updatedSessions);
        return { sessions: updatedSessions, currentSession: updatedSession };
      }
    });
  },

  updateLastMessage: (content: string) => {
    const { currentSession } = get();
    if (!currentSession || currentSession.messages.length === 0) return;

    const updatedMessages = [...currentSession.messages];
    const lastMessage = updatedMessages[updatedMessages.length - 1];
    updatedMessages[updatedMessages.length - 1] = {
      ...lastMessage,
      content,
    };

    const updatedSession: ChatSession = {
      ...currentSession,
      messages: updatedMessages,
      updatedAt: new Date(),
    };

    set((state) => {
      const updatedSessions = state.sessions.map((session) =>
        session.id === currentSession.id ? updatedSession : session
      );

      saveSessions(updatedSessions);

      return {
        currentSession: updatedSession,
        sessions: updatedSessions,
      };
    });
  },

  deleteMessage: (messageId: string) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const updatedMessages = currentSession.messages.filter(
      (msg) => msg.id !== messageId
    );

    const updatedSession: ChatSession = {
      ...currentSession,
      messages: updatedMessages,
      updatedAt: new Date(),
    };

    set((state) => {
      const updatedSessions = state.sessions.map((session) =>
        session.id === currentSession.id ? updatedSession : session
      );

      saveSessions(updatedSessions);

      return {
        currentSession: updatedSession,
        sessions: updatedSessions,
      };
    });
  },

  clearCurrentSession: () => {
    set({ currentSession: null });
  },

  setAiResponding: (isResponding: boolean) => {
    set({ isAiResponding: isResponding });
  },

  togglePinSession: (sessionId: string) => {
    set((state) => {
      const targetSession = state.sessions.find((s) => s.id === sessionId);
      if (!targetSession) return state;

      const isPinning = !targetSession.isPinned;
      const updatedSessions = updateSessionOrder(
        state.sessions,
        sessionId,
        isPinning
      );

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

  checkStorageSize: () => {
    const { sessions } = get();
    const totalSize = getLocalStorageSize();
    const sessionsSize = getSessionsDataSize(sessions);

    return {
      totalSize: (totalSize / 1024 / 1024).toFixed(2),
      sessionsSize: (sessionsSize / 1024 / 1024).toFixed(2),
      sessionCount: sessions.length,
    };
  },

  manualDeleteOldSessions: () => {
    set((state) => {
      const cleanedSessions = autoDeleteOldSessions(state.sessions);
      saveSessions(cleanedSessions);

      return {
        sessions: cleanedSessions,
        currentSession:
          cleanedSessions.find((s) => s.id === state.currentSession?.id) ||
          null,
      };
    });
  },
}));

// 브라우저 이탈 시 세션 저장을 위한 이벤트 리스너 등록
if (typeof window !== 'undefined') {
  const handleBeforeUnload = () => {
    const sessions = useChatStore.getState().sessions;
    if (sessions.length > 0) {
      try {
        localStorage.setItem(
          'chat-sessions:sessions',
          JSON.stringify(sessions)
        );
      } catch (error) {
        console.error('Failed to save sessions on beforeunload:', error);
      }
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // 개발 환경에서 디버깅을 위해 window 객체에 노출
  if (process.env.NODE_ENV === 'development') {
    (window as any).chatStore = useChatStore;
    (window as any).checkStorageSize = () =>
      useChatStore.getState().checkStorageSize();
    (window as any).manualDeleteOldSessions = () =>
      useChatStore.getState().manualDeleteOldSessions();
    (window as any).debugLocalStorage = () => {
      const allEntries = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          allEntries.push({ key, value: localStorage.getItem(key) });
        }
      }

      const chatKeys = Object.keys(localStorage).filter((key) =>
        key.includes('chat')
      );
      const chatEntries = chatKeys.map((key) => ({
        key,
        value: localStorage.getItem(key),
      }));

      const storeState = {
        sessions: useChatStore.getState().sessions,
        currentSession: useChatStore.getState().currentSession,
      };

      return { allEntries, chatEntries, storeState };
    };
  }
}
