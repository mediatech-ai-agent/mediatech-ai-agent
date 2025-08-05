import React from 'react';
import type { SourceMetaData } from '@/stores/chat/types';
import CopyButton from './CopyButton';
import SourceButton from './SourceButton';

interface ChatActionsProps {
    /** 복사할 텍스트 내용 */
    textContent: string;
    /** 출처 데이터 배열 */
    metaData?: SourceMetaData[];
    /** SourceContainer 표시/숨김 콜백 */
    onShowSources?: () => void;
    /** 추가 클래스명 */
    className?: string;
}

/**
 * 채팅 액션 wrapper 컴포넌트
 * - 답변 텍스트 하단에 항상 노출되는 영역
 * - 복사하기, 출처 버튼을 포함
 */
const ChatActions: React.FC<ChatActionsProps> = ({
    textContent,
    metaData = [],
    onShowSources,
    className = ''
}) => {
    return (
        <div
            className={`flex gap-1 items-center mt-2 ${className}`}
            style={{
                height: '36px', // 피그마 기준 높이
            }}
        >
            {/* 복사하기 버튼 */}
            <CopyButton textContent={textContent} />

            {/* 출처 버튼 - meta_data가 있을 때만 표시 */}
            {metaData.length > 0 && (
                <SourceButton
                    sourceCount={metaData.length}
                    onClick={onShowSources}
                />
            )}
        </div>
    );
};

export default ChatActions;