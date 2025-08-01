// Types
export type {
  ChatMessage,
  ChatSession,
  ChatState,
  ChatActions,
  MessageType,
  MessageSender,
  AgentMode,
} from './types';

// Main store
export { useChatStore } from './chatStore';

// Selectors
export {
  useCurrentMessages,
  useChatSessions,
  useCurrentSession,
  useCurrentAgentMode,
  useIsSessionLoading,
} from './selectors';

// Storage utilities (for debugging or external use)
export { getLocalStorageSize, getSessionsDataSize } from './storage';

// Session utilities (for external manipulation if needed)
export {
  sortSessionsWithPinnedFirst,
  insertNewSession,
  autoDeleteOldSessions,
} from './sessionUtils';
