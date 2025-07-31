import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axiosRetry from 'axios-retry';
import {
  config,
  logging,
  api as apiConfig,
  currentEnvironment,
} from '../../config/environment';

// axios-retry 옵션 타입 정의
interface RetryOptions {
  retries?: number;
  retryCondition?: (error: AxiosError) => boolean;
  retryDelay?: (retryCount: number, error?: AxiosError) => number;
  shouldResetTimeout?: boolean;
  onRetry?: (
    retryCount: number,
    error: AxiosError,
    requestConfig: AxiosRequestConfig
  ) => void;
}

type HttpClientOptions = {
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
  defaultParams?: Record<string, unknown>;
  timeout?: number;
  retryOptions?: RetryOptions;
  onRequest?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig;
  onResponse?: (response: AxiosResponse) => unknown;
  onError?: (error: AxiosError) => unknown;
  enableLogging?: boolean;
  enableErrorTracking?: boolean;
};

export class HttpClient {
  private instance: AxiosInstance;
  private options: HttpClientOptions;

  constructor(options: HttpClientOptions = {}) {
    this.options = {
      // 환경 설정에서 기본값 적용
      baseURL: apiConfig.baseUrl,
      timeout: apiConfig.timeout,
      defaultHeaders: apiConfig.headers,
      enableLogging: config.logging.enableConsole,
      enableErrorTracking: config.features.errorTracking,
      ...options,
    };

    this.instance = axios.create({
      baseURL: this.options.baseURL,
      headers: this.options.defaultHeaders,
      params: this.options.defaultParams,
      timeout: this.options.timeout,
    });

    // 환경별 재시도 로직 설정
    const defaultRetryOptions: RetryOptions = {
      retries: config.features.devtools ? 1 : 3, // 개발환경에서는 재시도 적게
      retryCondition: (error: AxiosError) => {
        const status = error.response?.status;
        return status ? [429, 500, 502, 503, 504].includes(status) : false;
      },
      retryDelay: (retryCount: number) => {
        const delay = Math.min(1000 * 2 ** retryCount, 30000);
        if (this.options.enableLogging) {
          logging.warn(
            `Retrying request (${retryCount}/${defaultRetryOptions.retries}) after ${delay}ms`
          );
        }
        return delay;
      },
    };

    axiosRetry(this.instance, this.options.retryOptions || defaultRetryOptions);

    // 요청 인터셉터
    this.instance.interceptors.request.use(
      (config) => {
        // 환경별 로깅
        if (this.options.enableLogging) {
          logging.debug(
            `🚀 Request: ${config.method?.toUpperCase()} ${config.url}`,
            {
              headers: config.headers,
              params: config.params,
              data: config.data,
            }
          );
        }

        // 사용자 정의 요청 인터셉터
        if (this.options.onRequest) {
          config = this.options.onRequest(config);
        }

        return config;
      },
      (error) => {
        if (this.options.enableLogging) {
          logging.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.instance.interceptors.response.use(
      (response) => {
        // 환경별 로깅
        if (this.options.enableLogging) {
          logging.debug(
            `✅ Response: ${response.status} ${response.config.url}`,
            {
              status: response.status,
              headers: response.headers,
              data: response.data,
            }
          );
        }

        // 사용자 정의 응답 인터셉터
        if (this.options.onResponse) {
          this.options.onResponse(response);
        }

        return response;
      },
      (error) => {
        // 환경별 에러 로깅
        if (this.options.enableLogging) {
          logging.error('❌ Response Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data,
          });
        }

        // 환경별 에러 추적 (프로덕션에서는 외부 서비스로 전송)
        // TODO: 필요하면 이후 추가
        // if (this.options.enableErrorTracking && config.features.errorTracking) {
        //   this.trackError(error);
        // }

        // 사용자 정의 에러 핸들러
        if (this.options.onError) {
          return this.options.onError(error);
        }

        return Promise.reject(error);
      }
    );
  }

  // 에러 추적 (실제 프로덕션에서는 Sentry 등으로 전송)
  // TODO: 필요하면 이후 추가
  // private trackError(error: AxiosError) {
  //   const errorInfo = {
  //     message: error.message,
  //     status: error.response?.status,
  //     url: error.config?.url,
  //     method: error.config?.method,
  //     timestamp: new Date().toISOString(),
  //     userAgent: navigator.userAgent,
  //     environment: currentEnvironment,
  //   };

  //   if (config.external.sentryDsn) {
  //     // 실제 프로덕션에서는 Sentry.captureException(error, { extra: errorInfo });
  //     console.error('Error tracked:', errorInfo);
  //   } else if (this.options.enableLogging) {
  //     logging.error('Error tracking:', errorInfo);
  //   }
  // }

  // 각 요청마다 옵션 덮어쓰기 가능
  public request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request<T>(config).then((res) => res.data);
  }

  public get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.get<T>(url, config).then((res) => res.data);
  }

  public post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.post<T>(url, data, config).then((res) => res.data);
  }

  public put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.put<T>(url, data, config).then((res) => res.data);
  }

  public patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.patch<T>(url, data, config).then((res) => res.data);
  }

  public delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.delete<T>(url, config).then((res) => res.data);
  }

  // 헬스체크 (환경별 API 연결 확인)
  public async healthCheck(): Promise<{
    status: string;
    environment: string;
    timestamp: string;
  }> {
    try {
      const response = await this.get<{ status: string }>('/health');
      return {
        status: response.status || 'ok',
        environment: currentEnvironment,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (this.options.enableLogging) {
        logging.error('Health check failed:', error);
      }
      return {
        status: 'error',
        environment: currentEnvironment,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 인스턴스 설정 정보 조회
  public getConfig() {
    return {
      baseURL: this.options.baseURL,
      timeout: this.options.timeout,
      headers: this.options.defaultHeaders,
      environment: currentEnvironment,
      features: {
        logging: this.options.enableLogging,
        errorTracking: this.options.enableErrorTracking,
      },
    };
  }
}

/**
 * 환경별 기본 HttpClient 팩토리
 */
export const createHttpClient = (options: HttpClientOptions = {}) => {
  return new HttpClient(options);
};

/**
 * 기본 API 클라이언트 인스턴스
 * 환경 설정을 자동으로 적용합니다.
 */
export const defaultApiClient = createHttpClient();

/**
 * 사용 예시
 */
// // 기본 클라이언트 사용
// const users = await defaultApiClient.get('/users');
//
// // 커스텀 클라이언트 생성
// const customClient = createHttpClient({
//   baseURL: 'https://api.example.com',
//   defaultHeaders: { 'Authorization': 'Bearer token' },
//   enableLogging: true,
//   onError: (error) => {
//     if (error.response?.status === 401) {
//       // 자동 로그아웃 처리
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// });
//
// // 헬스체크
// const health = await defaultApiClient.healthCheck();
// console.log('API Health:', health);
//
// // 설정 정보 확인
// console.log('Client Config:', defaultApiClient.getConfig());
