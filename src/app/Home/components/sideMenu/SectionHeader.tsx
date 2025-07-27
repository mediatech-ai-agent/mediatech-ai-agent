import React from 'react';

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <div className="w-[232px] h-11 ml-[10px] flex items-center">
      <h2 className="ml-3 text-white text-[17px] font-normal leading-[22px] font-['SF Pro'] opacity-60">
        {title}
      </h2>
    </div>
  );
};

export default SectionHeader;
