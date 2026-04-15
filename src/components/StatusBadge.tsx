/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuditStatus, ReqProcessStatus, PlanProcessStatus } from '../types';

interface StatusBadgeProps {
  status: AuditStatus | ReqProcessStatus | PlanProcessStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (s: string) => {
    switch (s) {
      case AuditStatus.APPROVED:
        return 'bg-green-100 text-green-700 border-green-200';
      case ReqProcessStatus.COMPLETED:
      case PlanProcessStatus.ASSIGNED:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case PlanProcessStatus.SUBCONTRACTED:
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case AuditStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case AuditStatus.REJECTED:
      case '审核不通过':
        return 'bg-red-100 text-red-700 border-red-200';
      case AuditStatus.CHANGE_DRAFT:
      case AuditStatus.TERMINATE_DRAFT:
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case AuditStatus.CHANGE_PENDING:
      case AuditStatus.TERMINATE_PENDING:
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case AuditStatus.TERMINATED:
        return 'bg-gray-100 text-gray-500 border-gray-200';
      case ReqProcessStatus.CANCELLED:
      case PlanProcessStatus.CANCELLED:
        return 'bg-red-100 text-red-700 border-red-200';
      case ReqProcessStatus.SPLIT:
      case ReqProcessStatus.MERGED:
      case PlanProcessStatus.SPLIT:
      case PlanProcessStatus.MERGED:
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
