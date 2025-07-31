import { forwardRef } from 'react';
import { Link } from 'lucide-react';

interface JiraCardProps {
  jiraNumber: string;
  showJiraCard: boolean;
  onRemove: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const JiraCard = forwardRef<HTMLDivElement, JiraCardProps>(
  ({ jiraNumber, showJiraCard, onRemove, onMouseEnter, onMouseLeave }, ref) => {
    if (!jiraNumber || !showJiraCard) return null;

    return (
      <div className="absolute left-0 z-10 group" style={{ top: '-10px' }}>
        <div
          ref={ref}
          className="flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex-shrink-0 transition-opacity duration-200"
          style={{
            width: '152px',
            height: '36px',
            paddingLeft: '8px',
            paddingRight: '8px',
          }}
        >
          <Link size={16} className="mr-2 text-white" />
          <span className="text-white font-medium" style={{ fontSize: '17px' }}>
            {jiraNumber}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 ml-1 absolute"
          style={{
            top: '-11px',
            left: '-15px',
            border: '1px solid #fff',
          }}
        >
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    );
  }
);

JiraCard.displayName = 'JiraCard';

export default JiraCard;
