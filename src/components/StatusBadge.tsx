/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ReqStatus, PlanStatus } from '../types';

interface StatusBadgeProps {
  status: ReqStatus | PlanStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (s: string) => {
    switch (s) {
      case ReqStatus.APPROVED:
      case PlanStatus.APPROVED:
        return 'bg-green-100 text-green-700 border-green-200';
      case ReqStatus.EXECUTING:
      case PlanStatus.ASSIGNED:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case ReqStatus.COMPLETED:
      case PlanStatus.SUBCONTRACTED:
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case ReqStatus.DRAFT:
      case PlanStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case ReqStatus.CANCELLED:
      case PlanStatus.CANCELLED:
        return 'bg-red-100 text-red-700 border-red-200';
      case ReqStatus.SPLIT:
      case ReqStatus.MERGED:
      case PlanStatus.SPLIT:
      case PlanStatus.MERGED:
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(status as string)}`}>
      {status}
    </span>
  );
};
