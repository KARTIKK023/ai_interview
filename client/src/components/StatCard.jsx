import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const themeStyles = {
  purple: {
    bg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
    border: '1px solid #e9d5ff',
    titleColor: '#7e22ce',
    valueColor: '#581c87',
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconColor: '#7e22ce',
    iconBorder: '1px solid rgba(168, 85, 247, 0.25)',
    shadow: '0 8px 20px -4px rgba(168, 85, 247, 0.12)',
    hoverShadow: '0 14px 28px -4px rgba(168, 85, 247, 0.22)',
  },
  warning: {
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    border: '1px solid #fde68a',
    titleColor: '#b45309',
    valueColor: '#78350f',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#d97706',
    iconBorder: '1px solid rgba(245, 158, 11, 0.25)',
    shadow: '0 8px 20px -4px rgba(245, 158, 11, 0.12)',
    hoverShadow: '0 14px 28px -4px rgba(245, 158, 11, 0.22)',
  },
  orange: {
    bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
    border: '1px solid #fed7aa',
    titleColor: '#c2410c',
    valueColor: '#7c2d12',
    iconBg: 'rgba(249, 115, 22, 0.15)',
    iconColor: '#ea580c',
    iconBorder: '1px solid rgba(249, 115, 22, 0.25)',
    shadow: '0 8px 20px -4px rgba(249, 115, 22, 0.12)',
    hoverShadow: '0 14px 28px -4px rgba(249, 115, 22, 0.22)',
  },
  success: {
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border: '1px solid #bbf7d0',
    titleColor: '#15803d',
    valueColor: '#14532d',
    iconBg: 'rgba(34, 197, 94, 0.15)',
    iconColor: '#16a34a',
    iconBorder: '1px solid rgba(34, 197, 94, 0.25)',
    shadow: '0 8px 20px -4px rgba(34, 197, 94, 0.12)',
    hoverShadow: '0 14px 28px -4px rgba(34, 197, 94, 0.22)',
  },
  green: {
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border: '1px solid #bbf7d0',
    titleColor: '#15803d',
    valueColor: '#14532d',
    iconBg: 'rgba(34, 197, 94, 0.15)',
    iconColor: '#16a34a',
    iconBorder: '1px solid rgba(34, 197, 94, 0.25)',
    shadow: '0 8px 20px -4px rgba(34, 197, 94, 0.12)',
    hoverShadow: '0 14px 28px -4px rgba(34, 197, 94, 0.22)',
  },
  primary: {
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    border: '1px solid #bfdbfe',
    titleColor: '#1d4ed8',
    valueColor: '#1e3a8a',
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#2563eb',
    iconBorder: '1px solid rgba(59, 130, 246, 0.25)',
    shadow: '0 8px 20px -4px rgba(59, 130, 246, 0.12)',
    hoverShadow: '0 14px 28px -4px rgba(59, 130, 246, 0.22)',
  },
  blue: {
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    border: '1px solid #bfdbfe',
    titleColor: '#1d4ed8',
    valueColor: '#1e3a8a',
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#2563eb',
    iconBorder: '1px solid rgba(59, 130, 246, 0.25)',
    shadow: '0 8px 20px -4px rgba(59, 130, 246, 0.12)',
    hoverShadow: '0 14px 28px -4px rgba(59, 130, 246, 0.22)',
  },
  info: {
    bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
    border: '1px solid #a5f3fc',
    titleColor: '#0e7490',
    valueColor: '#164e63',
    iconBg: 'rgba(6, 182, 212, 0.15)',
    iconColor: '#0891b2',
    iconBorder: '1px solid rgba(6, 182, 212, 0.25)',
    shadow: '0 8px 20px -4px rgba(6, 182, 212, 0.12)',
    hoverShadow: '0 14px 28px -4px rgba(6, 182, 212, 0.22)',
  },
  danger: {
    bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
    border: '1px solid #fecdd3',
    titleColor: '#be123c',
    valueColor: '#881337',
    iconBg: 'rgba(244, 63, 94, 0.15)',
    iconColor: '#e11d48',
    iconBorder: '1px solid rgba(244, 63, 94, 0.25)',
    shadow: '0 8px 20px -4px rgba(244, 63, 94, 0.12)',
    hoverShadow: '0 14px 28px -4px rgba(244, 63, 94, 0.22)',
  }
};

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, children, actionLink, actionTitle, onClick }) => {
  const theme = themeStyles[color] || themeStyles.primary;
  const [isHovered, setIsHovered] = useState(false);

  const iconBox = (
    <div
      className="p-3 d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        background: theme.iconBg,
        color: theme.iconColor,
        border: theme.iconBorder,
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        transition: 'transform 0.25s ease',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)'
      }}
    >
      {Icon && <Icon size={24} />}
    </div>
  );

  const cardContent = (
    <motion.div
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="p-3 h-100"
      onClick={onClick}
      style={{
        background: theme.bg,
        border: theme.border,
        boxShadow: isHovered ? theme.hoverShadow : theme.shadow,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '16px',
        cursor: (actionLink || onClick) ? 'pointer' : 'default'
      }}
    >
      <div className="d-flex align-items-center justify-content-between h-100">
        <div className="flex-grow-1 me-2 overflow-hidden">
          <h6
            className="mb-1 small text-uppercase fw-bold"
            style={{ color: theme.titleColor, letterSpacing: '0.5px', fontSize: '0.725rem' }}
          >
            {title}
          </h6>
          <h3 className="fw-extrabold mb-0" style={{ color: theme.valueColor, fontSize: '1.75rem' }}>
            {value}
          </h3>
          {subtitle && <small style={{ color: theme.titleColor, opacity: 0.85 }}>{subtitle}</small>}
          {children}
        </div>
        {iconBox}
      </div>
    </motion.div>
  );

  if (actionLink) {
    return (
      <Link to={actionLink} title={actionTitle || title} className="text-decoration-none d-block h-100">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default StatCard;
