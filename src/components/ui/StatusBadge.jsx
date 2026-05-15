import { STATUS_COLORS } from '../../constants/statusColors';
import { formatStatus } from '../../helpers/formatters';

const StatusBadge = ({ status }) => {
  const classes = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${classes}`}>
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
