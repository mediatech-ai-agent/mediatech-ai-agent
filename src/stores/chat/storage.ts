import { createStorageManager } from '@/shared/utils/localStorage';
import type { ChatSession } from './types';

// 채팅 세션 전용 스토리지
const chatStorage = createStorageManager('chat-sessions');
const SESSIONS_STORAGE_KEY = 'sessions';

// 세션 저장 디바운스를 위한 타이머
let saveSessionsTimer: NodeJS.Timeout | null = null;

// 세션을 로컬 스토리지에 저장하는 함수 (디바운스 적용)
export const saveSessions = (sessions: ChatSession[]) => {
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
export const loadSessions = (): ChatSession[] => {
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
export const saveSessionsImmediately = (sessions: ChatSession[]) => {
  try {
    chatStorage.set(SESSIONS_STORAGE_KEY, sessions);
  } catch (error) {
    console.error('Failed to save sessions immediately:', error);
  }
};

// 로컬스토리지 용량 측정 함수 (바이트 단위)
export const getLocalStorageSize = (): number => {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const value = localStorage.getItem(key);
      if (value) {
        // UTF-16 문자열이므로 길이에 2를 곱함
        total += key.length * 2 + value.length * 2;
      }
    }
  }
  return total;
};

// 세션 데이터 크기 측정 함수 (바이트 단위)
export const getSessionsDataSize = (sessions: ChatSession[]): number => {
  try {
    const serialized = JSON.stringify(sessions);
    // UTF-16 문자열이므로 길이에 2를 곱함
    return serialized.length * 2;
  } catch (error) {
    console.error('Failed to calculate sessions data size:', error);
    return 0;
  }
};
