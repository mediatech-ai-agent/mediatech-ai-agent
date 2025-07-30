import React, { useState } from 'react';

interface AgentCardProps {
  title: string;
  description: string;
  imageName: string; // btn_jira, btn_cr, btn_polish, btn_person
  gradientColors: {
    primary: string;
    secondary: string;
  };
  borderColor: string;
  shadowColor: string;
  onClick?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  title,
  description,
  imageName,
  gradientColors,
  borderColor,
  shadowColor,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getImageSrc = (focused: boolean = false) => {
    const suffix = focused ? '_foc' : '';
    return `/src/assets/${imageName}${suffix}.png`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const cardStyle = {
    background: `linear-gradient(135deg, ${gradientColors.primary}, ${gradientColors.secondary})`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${borderColor}`,
    boxShadow: `0 8px 32px ${shadowColor}`,
  };

  return (
    <div
      className="relative rounded-3xl cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden agent-card"
      style={{
        aspectRatio: '1', // 정사각형 비율 강제 (높이는 자동 계산)
        ...(imageError ? cardStyle : {}),
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!imageError ? (
        <img
          src={getImageSrc(isHovered)}
          alt={title}
          className="w-full h-full object-cover rounded-3xl"
          onError={handleImageError}
          style={{
            transition: 'opacity 0.3s ease',
          }}
        />
      ) : (
        // Fallback CSS 버전
        <div className="p-6" style={cardStyle}>
          <div className="text-2xl font-bold text-white mb-2">{title}</div>
          <div className="text-white/80 text-sm leading-relaxed">
            {description.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < description.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCard;
