import { useChatInput } from '../../../../shared/hooks/useChatInput';
import { useCurrentAgentMode } from '@/stores/chat/selectors';
import JiraCard from './JiraCard';
import JiraInput from './JiraInput';
import ChatTextarea from './ChatTextarea';
import ActionButtons from './ActionButtons';

const ChatInput = () => {
  const agentMode = useCurrentAgentMode();

  const {
    // Refs
    jiraCardRef,
    textareaRef,
    inputRef,

    // State
    input,
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
    hasJiraNumber,
    ableSendMessage,
    isAiResponding,

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
  } = useChatInput();

  return (
    <div
      className="overflow-hidden fixed bottom-0 chat-input-container"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(1192px, 80vw, 1400px)',
        maxWidth: '1192px',
        minHeight: '236px',
        maxHeight: '800px',
        background: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderRadius: '24px',
        zIndex: 10,
        padding: '32px 40px',
        boxSizing: 'border-box',
      }}
    >
      {/* Input area */}
      <div className="flex relative flex-col h-full">
        {/* Textarea - 위쪽 영역 */}
        <div className="relative flex-1 min-h-0">
          <div className="relative h-full">
            <JiraCard
              ref={jiraCardRef}
              jiraNumber={hasJiraNumber || ''}
              showJiraCard={showJiraCard}
              onRemove={handleJiraCardRemove}
              onMouseEnter={() => {
                const card = jiraCardRef.current;
                if (card) card.style.opacity = '0.1';
              }}
              onMouseLeave={() => {
                const card = jiraCardRef.current;
                if (card) card.style.opacity = '1';
              }}
            />

            <ChatTextarea
              ref={textareaRef}
              value={input}
              placeholder={getPlaceholder()}
              jiraCardWidth={jiraCardWidth}
              hasJiraNumber={!!hasJiraNumber}
              disabled={isAiResponding}
              onChange={handleChange}
              onKeyDown={handleTextAreaKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
            />
          </div>
        </div>

        {/* Bottom area - Input과 Send button 수직 배치 */}
        <div
          className="flex flex-col flex-shrink-0"
          style={{ height: '120px' }}
        >
          <JiraInput
            ref={inputRef}
            show={showLinkInput}
            value={jiraTicketId}
            placeholder={getJiraInputPlaceholder()}
            agentType={agentMode || 'jira'}
            hasError={hasInputError}
            showError={showInputError}
            disabled={isAiResponding}
            onChange={setJiraTicketId}
            onKeyDown={handleInputKeyDown}
          />

          <ActionButtons
            showLinkInput={showLinkInput}
            hasJiraNumber={!!hasJiraNumber}
            ableSendMessage={ableSendMessage}
            isLinkBtnHovered={isLinkBtnHovered}
            isSendBtnHovered={isSendBtnHovered}
            agentMode={agentMode}
            onLinkButtonClick={() => setShowLinkInput(true)}
            onSendButtonClick={() => {
              if (ableSendMessage) {
                handleSend(input);
                setInput('');
                setJiraTicketId('');
              }
            }}
            onLinkButtonHover={setIsLinkBtnHovered}
            onSendButtonHover={setIsSendBtnHovered}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
