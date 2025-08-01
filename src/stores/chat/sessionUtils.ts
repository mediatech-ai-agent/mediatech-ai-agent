import type { ChatSession } from './types';
import { getSessionsDataSize } from './storage';

// 세션 순서 정렬 함수 (고정된 세션들이 항상 맨 위)
export const sortSessionsWithPinnedFirst = (
  sessions: ChatSession[]
): ChatSession[] => {
  const pinnedSessions = sessions.filter((session) => session.isPinned);
  const unpinnedSessions = sessions.filter((session) => !session.isPinned);
  return [...pinnedSessions, ...unpinnedSessions];
};

// 새 세션을 올바른 위치에 삽입하는 함수
export const insertNewSession = (
  newSession: ChatSession,
  existingSessions: ChatSession[]
): ChatSession[] => {
  const pinnedSessions = existingSessions.filter((session) => session.isPinned);
  const unpinnedSessions = existingSessions.filter(
    (session) => !session.isPinned
  );
  return [...pinnedSessions, newSession, ...unpinnedSessions];
};

// 자동 대화 삭제 함수
export const autoDeleteOldSessions = (
  sessions: ChatSession[]
): ChatSession[] => {
  const TARGET_SIZE = 3.8 * 1024 * 1024; // 3.8MB

  const currentDataSize = getSessionsDataSize(sessions);
  console.log(
    '📊 현재 세션 데이터 크기:',
    (currentDataSize / 1024 / 1024).toFixed(2),
    'MB'
  );

  if (currentDataSize <= TARGET_SIZE) {
    console.log('✅ 크기가 목표치 이하입니다. 삭제 불필요.');
    return sessions;
  }

  console.log('⚠️ 크기가 목표치를 초과했습니다. 자동 삭제를 시작합니다...');

  // 고정되지 않은 세션들만 필터링하고 생성일 기준으로 정렬 (오래된 것부터)
  const pinnedSessions = sessions.filter((session) => session.isPinned);
  const unpinnedSessions = sessions
    .filter((session) => !session.isPinned)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  console.log('📌 고정된 세션 수:', pinnedSessions.length);
  console.log('📄 일반 세션 수:', unpinnedSessions.length);

  const remainingSessions = [...pinnedSessions];

  // 고정되지 않은 세션들을 하나씩 추가하면서 크기 확인
  for (const session of unpinnedSessions.reverse()) {
    // 최신 것부터 추가
    const tempSessions = [session, ...remainingSessions];
    const tempSize = getSessionsDataSize(tempSessions);

    if (tempSize <= TARGET_SIZE) {
      remainingSessions.unshift(session); // 맨 앞에 추가 (최신순 유지)
    } else {
      console.log(
        '🗑️ 세션 삭제됨:',
        session.title,
        '(생성일:',
        session.createdAt.toLocaleDateString(),
        ')'
      );
    }
  }

  const deletedCount = sessions.length - remainingSessions.length;
  const finalSize = getSessionsDataSize(remainingSessions);

  console.log('🎯 자동 삭제 완료!');
  console.log('  - 삭제된 세션 수:', deletedCount);
  console.log('  - 최종 크기:', (finalSize / 1024 / 1024).toFixed(2), 'MB');
  console.log('  - 남은 세션 수:', remainingSessions.length);

  return sortSessionsWithPinnedFirst(remainingSessions);
};

// 고정/해제 시 세션 순서 관리
export const updateSessionOrder = (
  sessions: ChatSession[],
  sessionId: string,
  isPinning: boolean
): ChatSession[] => {
  const targetSessionIndex = sessions.findIndex((s) => s.id === sessionId);
  if (targetSessionIndex === -1) return sessions;

  const targetSession = sessions[targetSessionIndex];
  const otherSessions = sessions.filter((session) => session.id !== sessionId);

  if (isPinning) {
    // 고정하는 경우: 고정된 세션들의 맨 위로 이동
    const sessionToPin = {
      ...targetSession,
      isPinned: true,
      updatedAt: new Date(),
    };

    const existingPinnedSessions = otherSessions.filter(
      (session) => session.isPinned
    );
    const unpinnedSessions = otherSessions.filter(
      (session) => !session.isPinned
    );

    return [sessionToPin, ...existingPinnedSessions, ...unpinnedSessions];
  } else {
    // 고정 해제하는 경우: 일반 세션들의 맨 위로 이동
    const sessionToUnpin = {
      ...targetSession,
      isPinned: false,
      updatedAt: new Date(),
    };

    const pinnedSessions = otherSessions.filter((session) => session.isPinned);
    const unpinnedSessions = otherSessions.filter(
      (session) => !session.isPinned
    );

    return [...pinnedSessions, sessionToUnpin, ...unpinnedSessions];
  }
};
