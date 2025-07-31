import { useMutation } from '@tanstack/react-query';
import { HttpClient } from '../utils/HttpClient';
import type { AgentMode } from '@/stores/chatStore';

// 전용 API 클라이언트 인스턴스 생성
const agentApiClient = new HttpClient({
  baseURL: 'http://1.255.86.189:8080',
  timeout: 30000, // 30초 타임아웃 (AI 응답 대기)
  retryOptions: {
    retries: 2,
    retryCondition: (error) => {
      const status = error.response?.status;
      return status ? [500, 502, 503, 504].includes(status) : false;
    },
    retryDelay: (retryCount: number) => retryCount * 2000,
  },
});

// AgentMode를 실제 API agent_type으로 매핑하는 함수
const mapAgentTypeForApi = (agentMode: AgentMode): string => {
  if (!agentMode) {
    return 'default';
  }

  switch (agentMode) {
    case 'jira':
      return 'summary';
    case 'cr':
      return 'br_cr';
    case 'policy':
      return 'policy';
    case 'person':
      return 'owner';
    default:
      return 'default';
  }
};

// API 요청/응답 타입 정의
export interface RequestAgentData {
  question: string;
  agent_type: AgentMode;
  issue_key?: string;
  session_id: string;
}

// 실제 API로 보낼 데이터 타입 (agent_type이 string)
interface ApiRequestData {
  question: string;
  agent_type: string;
  issue_key?: string;
  session_id: string;
}

export interface MetaData {
  source: string;
  title: string;
  url: string;
}

export interface RequestAgentResponse {
  agent: string;
  issue_key: string;
  meta_data: MetaData[];
  result: string;
  status: string;
}

// API 에러 타입
export interface RequestAgentError {
  message: string;
  status?: number;
}

// React Query Hook for /api/query endpoint
export const useRequestAgent = () => {
  return useMutation<RequestAgentResponse, RequestAgentError, RequestAgentData>(
    {
      mutationFn: async (
        data: RequestAgentData
      ): Promise<RequestAgentResponse> => {
        const apiData: ApiRequestData = {
          ...data,
          agent_type: mapAgentTypeForApi(data.agent_type),
        };
        return agentApiClient.post<RequestAgentResponse>('/api/query', apiData);
      },
      onError: (error: RequestAgentError) => {
        console.error('Request Agent Error:', error);
      },
    }
  );
};

export default useRequestAgent;
