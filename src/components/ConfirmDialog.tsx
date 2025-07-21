
import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message }: ConfirmDialogProps) {
  const { t: translations } = useLocalization();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
        <p className="text-secondary mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-4 py-2 bg-background-subtle text-primary rounded-md hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-subtle">{translations.cancel}</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-danger text-on-interactive rounded-md hover:bg-danger-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger">{translations.delete}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
