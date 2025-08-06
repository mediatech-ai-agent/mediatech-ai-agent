import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore.ts';
import { useRequestAgent } from '@/shared/hooks/useRequestAgent';
import { CHAT_INPUT_PLACEHOLDER, INPUT_VALIDATION } from '@/shared/constants';
import type { AgentType } from '@/shared/utils/common';

export const useChatInput = () => {
  const {
    addUserMessage,
    addAiMessage,
    addUserTempMessage,
    setAiResponding,
    setJiraNumber,
    removeJiraNumber,
    currentSession,
  } = useChatStore();

  const requestAgent = useRequestAgent();
  const jiraCardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // State
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [jiraTicketId, setJiraTicketId] = useState('');
  const [jiraCardWidth, setJiraCardWidth] = useState(140);
  const [isSendBtnHovered, setIsSendBtnHovered] = useState(false);
  const [isLinkBtnHovered, setIsLinkBtnHovered] = useState(false);
  const [showJiraCard, setShowJiraCard] = useState(true);
  const [showLinkInput, setShowLinkInput] = useState(false);

  // Validation state
  const [hasInputError, setHasInputError] = useState(false);
  const [showInputError, setShowInputError] = useState(false);

  // Computed values
  const isJiraMode = currentSession?.agentMode === 'jira';
  const isCrMode = currentSession?.agentMode === 'cr';
  const hasJiraNumber = currentSession?.jiraNumber;
  const isIssueKeyMode = isJiraMode || isCrMode;

  const ableSendMessage = useMemo(() => {
    if (showLinkInput) {
      return jiraTicketId.trim() !== '' && !hasInputError;
    } else {
      return input.trim() !== '';
    }
  }, [showLinkInput, jiraTicketId, input, hasInputError]);

  // Validation logic functions
  const getValidationPattern = useCallback((type: AgentType) => {
    switch (type) {
      case 'jira':
        return INPUT_VALIDATION.PATTERNS.JIRA;
      case 'cr':
        return INPUT_VALIDATION.PATTERNS.CR;
      case 'person':
        return INPUT_VALIDATION.PATTERNS.PERSON;
      default:
        return null;
    }
  }, []);

  const validateJiraInput = useCallback(
    (inputValue: string) => {
      if (!inputValue.trim()) {
        setHasInputError(false);
        setShowInputError(false);
        return;
      }

      const agentType = currentSession?.agentMode;
      if (!agentType) return;

      const pattern = getValidationPattern(agentType);
      if (pattern) {
        const isValid = pattern.test(inputValue.trim());
        setHasInputError(!isValid);
        setShowInputError(!isValid);
      }
    },
    [currentSession?.agentMode, getValidationPattern]
  );

  // Effects
  // 세션 변경 시 입력 필드들 초기화
  useEffect(() => {
    setInput('');
    setJiraTicketId('');
    setShowLinkInput(false);
    // 검증 상태도 초기화
    setHasInputError(false);
    setShowInputError(false);
  }, [currentSession?.id]);

  // jiraTicketId 변경 시 검증 실행
  useEffect(() => {
    validateJiraInput(jiraTicketId);
  }, [jiraTicketId, validateJiraInput]);

  useEffect(() => {
    if (hasJiraNumber && jiraCardRef.current) {
      const cardWidth = jiraCardRef.current.offsetWidth;
      setJiraCardWidth(cardWidth + 8);
    }
  }, [hasJiraNumber]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const lineHeight = parseFloat('20');

    const handleScroll = () => {
      const shouldHide = el.scrollTop >= lineHeight;
      setShowJiraCard(!shouldHide);
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setJiraTicketId('');

    if (
      currentSession?.agentMode === 'jira' ||
      currentSession?.agentMode === 'cr'
    ) {
      if (!hasJiraNumber) {
        setShowLinkInput(true);
      }
    } else {
      setShowLinkInput(false);
    }
  }, [currentSession?.agentMode, hasJiraNumber]);

  useEffect(() => {
    if (showLinkInput && inputRef.current) {
      inputRef.current.focus();
      if (textareaRef.current) {
        textareaRef.current.disabled = true;
        textareaRef.current.style.cursor = 'not-allowed';
      }
    } else {
      if (textareaRef.current) {
        textareaRef.current.disabled = false;
        textareaRef.current.style.cursor = 'auto';
      }
    }
  }, [showLinkInput]);

  useEffect(() => {
    if (hasJiraNumber) {
      setShowLinkInput(false);
    }
  }, [hasJiraNumber]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleSend = async (message: string) => {
    let fullMessage = message;
    let issueKey: string | undefined;

    if (isIssueKeyMode && jiraTicketId.trim()) {
      fullMessage = `${message}`;
      issueKey = jiraTicketId.trim();
      setJiraNumber(jiraTicketId.trim());
    }

    // 세션이 없으면 미리 임시 세션을 생성하여 session_id 확보
    let sessionId = currentSession?.id;
    if (!currentSession) {
      const { createTemporarySession } = useChatStore.getState();
      createTemporarySession();
      sessionId = useChatStore.getState().currentSession?.id;
    }

    addUserMessage(fullMessage);
    setAiResponding(true);

    // 최신 세션 정보 가져오기 (addUserMessage로 인해 변경될 수 있음)
    const latestSession = useChatStore.getState().currentSession;

    try {
      const response = await requestAgent.mutateAsync({
        question: message,
        agent_type: latestSession?.agentMode ?? null,
        issue_key: latestSession?.jiraNumber ?? issueKey,
        session_id: latestSession?.id ?? sessionId ?? '',
      });

      addAiMessage(response.result, 'text', response.meta_data);
    } catch (error) {
      console.error('API 요청 실패:', error);

      const errorMessage =
        currentSession?.agentMode !== 'cr'
          ? `
## 죄송합니다. 일시적인 오류가 발생했습니다.

현재 AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.

**오류 유형**: 네트워크 연결 오류
**해결 방법**: 
- 인터넷 연결을 확인해주세요
- 잠시 후 다시 시도해주세요
- 문제가 지속되면 관리자에게 문의해주세요

> 불편을 드려 죄송합니다. 🙏
      `
          : `<div class="inline-block leading-relaxed text-white markdown-content"><h2>죄송합니다. 일시적인 오류가 발생했습니다.</h2>
<p style="white-space: pre-wrap;">현재 AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.</p>
<p style="white-space: pre-wrap;"><strong>오류 유형</strong>: 네트워크 연결 오류
<strong>해결 방법</strong>:</p>
<ul>
<li>인터넷 연결을 확인해주세요</li>
<li>잠시 후 다시 시도해주세요</li>
<li>문제가 지속되면 관리자에게 문의해주세요</li>
</ul>
<blockquote>
<p style="white-space: pre-wrap;">불편을 드려 죄송합니다. 🙏</p>
</blockquote></div>`;
      addAiMessage(errorMessage.trim());
    } finally {
      setAiResponding(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();

      const jiraValue = jiraTicketId.trim();
      if (!jiraValue) return;

      if (!currentSession) {
        addUserTempMessage(null);
      }

      setJiraNumber(jiraValue);
      setJiraTicketId('');
      setShowLinkInput(false);
      setShowJiraCard(true);
    }
  };

  const handleTextAreaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (ableSendMessage) {
        handleSend(input);
        setInput('');
        setJiraTicketId('');
      }
    }
  };

  const handleJiraCardRemove = () => {
    removeJiraNumber();

    if (isJiraMode || isCrMode) {
      setShowLinkInput(true);
    } else {
      setShowJiraCard(false);
    }
  };

  const getPlaceholder = () => {
    const ticketPlaceholder = '에 대해 무엇이든 물어보세요';
    if (hasJiraNumber) return ticketPlaceholder;

    switch (currentSession?.agentMode) {
      case 'jira':
        return CHAT_INPUT_PLACEHOLDER.JIRA;
      case 'cr':
        return CHAT_INPUT_PLACEHOLDER.CR;
      case 'policy':
        return CHAT_INPUT_PLACEHOLDER.POLICY;
      case 'person':
        return CHAT_INPUT_PLACEHOLDER.PERSON;
      default:
        return CHAT_INPUT_PLACEHOLDER.DEFAULT;
    }
  };

  const getJiraInputPlaceholder = () => {
    return isJiraMode
      ? 'BPM-00000 또는 BTVB-00000'
      : isCrMode
        ? 'BTVB-00000'
        : 'BPM-00000 또는 BTVB-00000';
  };

  return {
    // Refs
    jiraCardRef,
    textareaRef,
    inputRef,

    // State
    input,
    isComposing,
    jiraTicketId,
    jiraCardWidth,
    isSendBtnHovered,
    isLinkBtnHovered,
    showJiraCard,
    showLinkInput,

    // Validation state
    hasInputError,
    showInputError,

    // Computed
    isJiraMode,
    isCrMode,
    hasJiraNumber,
    isIssueKeyMode,
    ableSendMessage,

    // Handlers
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    handleSend,
    handleInputKeyDown,
    handleTextAreaKeyDown,
    handleJiraCardRemove,

    // Setters
    setInput,
    setJiraTicketId,
    setIsSendBtnHovered,
    setIsLinkBtnHovered,
    setShowLinkInput,

    // Helpers
    getPlaceholder,
    getJiraInputPlaceholder,
  };
};
