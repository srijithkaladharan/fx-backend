import { POSITIONS, STATUSES } from '../lib/models/createTransaction.model';

export const isPositionValid = (position) => POSITIONS.hasOwnProperty(position.toUpperCase());

export const isStatusValid = (status) => STATUSES.hasOwnProperty(status.toUpperCase());
