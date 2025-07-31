import React, { forwardRef } from 'react';

interface JiraInputProps {
  show: boolean;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const JiraInput = forwardRef<HTMLInputElement, JiraInputProps>(
  ({ show, value, placeholder, onChange, onKeyDown }, ref) => {
    if (!show) {
      return <div style={{ height: '58px', marginBottom: '16px' }}></div>;
    }

    return (
      <div className="mb-4">
        <input
          ref={ref}
          type="text"
          className="bg-transparent border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 text-lg outline-none focus:border-white/60 transition-colors w-full"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          style={{
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            height: '58px',
          }}
        />
      </div>
    );
  }
);

JiraInput.displayName = 'JiraInput';

export default JiraInput;
