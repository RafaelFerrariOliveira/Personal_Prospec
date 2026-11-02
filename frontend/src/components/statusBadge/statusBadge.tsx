import { CAMPAIGN_STATUS_LABELS } from '@enums/campaignStatus.enum';
import { Badge, Dot } from './statusBadge.styles';
import type { IStatusBadgeProps } from './statusBadge.types';

const StatusBadge = ({ status }: IStatusBadgeProps) => {
   return (
      <Badge $status={status} data-testid="status-badge" data-status={status}>
         <Dot $status={status} aria-hidden="true" />
         {CAMPAIGN_STATUS_LABELS[status]}
      </Badge>
   );
};

export default StatusBadge;
