// 브라우저 고유 세션 ID 관리

const SESSION_ID_KEY = 'mediatech_browser_session_id';

/**
 * UUID v4 형식의 랜덤 ID 생성
 */
function generateUniqueId(): string {
  return 'xxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 타임스탬프와 랜덤값을 조합한 고유 세션 ID 생성
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36); // 현재 시간을 36진수로 변환
  const randomPart = generateUniqueId();
  return `session_${timestamp}_${randomPart}`;
}

/**
 * 브라우저 고유 세션 ID 가져오기
 * 로컬스토리지에 없으면 새로 생성하여 저장
 */
export function getBrowserSessionId(): string {
  try {
    // 로컬스토리지에서 기존 세션 ID 확인
    const existingSessionId = localStorage.getItem(SESSION_ID_KEY);

    if (existingSessionId) {
      return existingSessionId;
    }

    // 없으면 새로 생성
    const newSessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, newSessionId);

    console.log('New browser session ID created:', newSessionId);
    return newSessionId;
  } catch (error) {
    // 로컬스토리지 접근 실패시 (예: 프라이빗 모드) 메모리에서만 사용할 임시 ID 생성
    console.warn(
      'LocalStorage access failed, using temporary session ID:',
      error
    );
    return generateSessionId();
  }
}

/**
 * 세션 ID 초기화 (새로운 브라우저 세션 시작)
 */
export function resetBrowserSessionId(): string {
  try {
    localStorage.removeItem(SESSION_ID_KEY);
    return getBrowserSessionId();
  } catch (error) {
    console.warn('Failed to reset session ID:', error);
    return generateSessionId();
  }
}

/**
 * 현재 세션 ID 확인 (생성하지 않음)
 */
export function getCurrentSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_ID_KEY);
  } catch (error) {
    console.warn('Failed to get current session ID:', error);
    return null;
  }
}
