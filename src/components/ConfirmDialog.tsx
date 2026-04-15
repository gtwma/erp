import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const colors = {
    warning: 'text-orange-500 bg-orange-50 border-orange-100',
    danger: 'text-red-500 bg-red-50 border-red-100',
    info: 'text-blue-500 bg-blue-50 border-blue-100'
  };

  const btnColors = {
    warning: 'bg-orange-500 hover:bg-orange-600',
    danger: 'bg-red-500 hover:bg-red-600',
    info: 'bg-blue-500 hover:bg-blue-600'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-200"
        >
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-full border ${colors[type]}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-100">
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">注意</p>
                  <p className="text-xs text-gray-600 mt-1">此操作执行后将无法撤销，请谨慎操作。</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2 text-sm font-bold text-white rounded shadow-sm transition-all active:scale-95 ${btnColors[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
