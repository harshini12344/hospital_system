import React from 'react';

const StatusBadge = ({ status }) => {
  const cls = `badge badge-${status?.toLowerCase()}`;
  const icons = {
    BOOKED: '📅',
    CONFIRMED: '✅',
    COMPLETED: '🏁',
    CANCELLED: '❌',
  };
  return (
    <span className={cls}>
      {icons[status]} {status}
    </span>
  );
};

export default StatusBadge;
