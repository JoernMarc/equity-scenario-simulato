import React from 'react';
import type { Translations } from '../i18n';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  translations: Translations;
  title: string;
  message: string;
}

function ConfirmDialog({ isOpen, onConfirm, onCancel, translations, title, message }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-theme-surface rounded-lg shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">{title}</h3>
        <p className="text-theme-secondary mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-4 py-2 bg-theme-subtle text-theme-primary rounded-md hover:bg-theme-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-subtle">{translations.cancel}</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-theme-danger text-theme-on-interactive rounded-md hover:bg-theme-danger-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-danger">{translations.delete}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;