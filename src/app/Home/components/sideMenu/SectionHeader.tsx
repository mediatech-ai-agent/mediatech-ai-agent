import React from 'react';

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = React.memo(({ title }) => {
  return (
    <div className="w-[232px] h-11 ml-[10px] flex items-center justify-start">
      <h2 className="ml-3 text-white text-[17px] font-normal leading-[22px] font-['SF Pro'] opacity-60 flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-left">
        {title}
      </h2>
    </div>
  );
});

SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
