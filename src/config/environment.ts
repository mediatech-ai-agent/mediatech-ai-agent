/**
 * 환경별 설정 관리 모듈
 *
 * 각 환경(development, staging, production)에 따른 설정을 관리합니다.
 */

// 환경 타입 정의
export type Environment = 'development' | 'staging' | 'production' | 'test';

// 로그 레벨 타입 정의
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

// 환경 설정 인터페이스
export interface EnvironmentConfig {
  app: {
    name: string;
    version: string;
    description: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    analytics: boolean;
    errorTracking: boolean;
    performanceMonitoring: boolean;
    devtools: boolean;
  };
  logging: {
    level: LogLevel;
    enableConsole: boolean;
  };
  // TODO: 외부 서비스 연결 필요하면 추가
  //   external: {
  //     sentryDsn?: string;
  //     googleAnalyticsId?: string;
  //     hotjarId?: string;
  //   };
}

// 기본 설정
// TODO: 프로젝트에 맞게 기본 설정 값 수정 필요
const defaultConfig: EnvironmentConfig = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'MediaTech AI Agent',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description:
      import.meta.env.VITE_APP_DESCRIPTION || 'AI 기반 미디어 기술 에이전트',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  },
  features: {
    analytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
    errorTracking: import.meta.env.VITE_FEATURE_ERROR_TRACKING === 'true',
    performanceMonitoring:
      import.meta.env.VITE_FEATURE_PERFORMANCE_MONITORING === 'true',
    devtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  },
  logging: {
    level: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info',
    enableConsole: import.meta.env.DEV,
  },
  // TODO: 외부 서비스 연결 필요하면 추가
  //   external: {
  //     sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  //     googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  //     hotjarId: import.meta.env.VITE_HOTJAR_ID,
  //   },
};

// 환경별 설정 오버라이드
const environmentConfigs: Record<Environment, Partial<EnvironmentConfig>> = {
  development: {
    features: {
      analytics: false,
      errorTracking: false,
      performanceMonitoring: false,
      devtools: true,
    },
    logging: {
      level: 'debug',
      enableConsole: true,
    },
  },
  staging: {
    features: {
      analytics: true,
      errorTracking: true,
      performanceMonitoring: true,
      devtools: false,
    },
    logging: {
      level: 'info',
      enableConsole: true,
    },
  },
  production: {
    features: {
      analytics: true,
      errorTracking: true,
      performanceMonitoring: true,
      devtools: false,
    },
    logging: {
      level: 'error',
      enableConsole: false,
    },
  },
  test: {
    features: {
      analytics: false,
      errorTracking: false,
      performanceMonitoring: false,
      devtools: false,
    },
    logging: {
      level: 'silent',
      enableConsole: false,
    },
  },
};

// 현재 환경 감지
const getCurrentEnvironment = (): Environment => {
  const mode = import.meta.env.MODE;

  if (mode === 'test') return 'test';
  if (mode === 'staging') return 'staging';
  if (mode === 'production') return 'production';

  return 'development';
};

// 환경별 설정 병합
const mergeConfigs = (
  base: EnvironmentConfig,
  override: Partial<EnvironmentConfig>
): EnvironmentConfig => {
  return {
    ...base,
    app: { ...base.app, ...override.app },
    api: { ...base.api, ...override.api },
    features: { ...base.features, ...override.features },
    logging: { ...base.logging, ...override.logging },
    // external: { ...base.external, ...override.external },
  } as EnvironmentConfig;
};

// 최종 환경 설정
export const currentEnvironment = getCurrentEnvironment();
export const config = mergeConfigs(
  defaultConfig,
  environmentConfigs[currentEnvironment]
);

// 환경별 헬퍼 함수들
export const isDevelopment = () => currentEnvironment === 'development';
export const isStaging = () => currentEnvironment === 'staging';
export const isProduction = () => currentEnvironment === 'production';
export const isTest = () => currentEnvironment === 'test';

// 환경별 로깅 설정
export const logging = {
  isEnabled: (level: LogLevel) => {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent'];
    const currentLevelIndex = levels.indexOf(config.logging.level);
    const checkLevelIndex = levels.indexOf(level);

    return checkLevelIndex >= currentLevelIndex;
  },
  debug: (...args: unknown[]) => {
    if (logging.isEnabled('debug')) {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (logging.isEnabled('info')) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (logging.isEnabled('warn')) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (logging.isEnabled('error')) {
      console.error('[ERROR]', ...args);
    }
  },
};

// 환경별 API 설정
export const api = {
  baseUrl: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': config.app.version,
    'X-Environment': currentEnvironment,
  },
};

// 앱 정보
// TODO: 필요없으면 삭제
export const app = {
  name: config.app.name,
  version: config.app.version,
  description: config.app.description,
  environment: currentEnvironment,
};

// 디버깅용 정보 출력이 필요하면 아래 블록을 활성화
// if (config.logging.enableConsole) {
//   console.group(`🌍 Environment: ${currentEnvironment}`);
//   console.log('Mode:', import.meta.env.MODE);
//   console.log('Config:', config);
//   console.log('Environment Variables:', {
//     PROD: import.meta.env.PROD,
//     DEV: import.meta.env.DEV,
//     MODE: import.meta.env.MODE,
//   });
//   console.groupEnd();
// }

export default config;
