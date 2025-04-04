import getOrderStatus from '../shared/getOrderStatus';
import { Typography } from '@mui/material';

interface OrderStatusProps {
  code: string;
  text?: string;
}

export default function OrderStatus(props: OrderStatusProps) {
  const { code, text } = props;

  const status = getOrderStatus(code);

  return status.name ? (
    <Typography color={status.color} fontSize={12}>
      {text || status.name}
    </Typography>
  ) : null;
}
