import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  //   AxiosRequestHeaders,
} from 'axios';
// @ts-expect-error: If no types, ignore for now
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';

type HttpClientOptions = {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
  defaultParams?: Record<string, unknown>;
  timeout?: number;
  retryOptions?: IAxiosRetryConfig;
  onRequest?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig;
  onResponse?: (response: AxiosResponse) => unknown;
  onError?: (error: AxiosError) => unknown;
};

export class HttpClient {
  private instance: AxiosInstance;

  constructor(options: HttpClientOptions) {
    this.instance = axios.create({
      baseURL: options.baseURL,
      headers: options.defaultHeaders,
      params: options.defaultParams,
      timeout: options.timeout,
    });

    // 재시도 로직 주입
    if (options.retryOptions) {
      axiosRetry(this.instance, options.retryOptions);
    }

    // 요청 인터셉터
    this.instance.interceptors.request.use(
      (config) => (options.onRequest ? options.onRequest(config) : config),
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터
    this.instance.interceptors.response.use(
      (response) => {
        if (options.onResponse) {
          // onResponse가 데이터를 가공하더라도, 원본 response를 반환해야 함
          options.onResponse(response);
        }
        return response;
      },
      (error) =>
        options.onError ? options.onError(error) : Promise.reject(error)
    );
  }

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

  // ... put, delete 등 추가
}

/**
 * 사용 예시
 */
// const apiClient = new HttpClient({
//     baseURL: 'https://api.example.com',
//     defaultHeaders: { 'Authorization': 'Bearer token' },
//     timeout: 10000,
//     retryOptions: {
//       retries: 3,
//       retryCondition: error => [429, 500, 502].includes(error.response?.status ?? 0),
//       retryDelay: retryCount => retryCount * 1000,
//     },
//     onError: error => {
//       // 예: 401이면 자동 로그아웃
//       if (error.response?.status === 401) {
//         // logout();
//       }
//       return Promise.reject(error);
//     }
//   });

//   // 각 요청마다 동적 헤더/파라미터 추가 가능
//   apiClient.get('/user', {
//     headers: { 'X-Request-Id': 'abc123' },
//     params: { lang: 'ko' }
//   });
