import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', variant = 'danger' }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmBg = variant === 'danger' ? '#dc2626' : '#1e2530';

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title || 'Confirmar acción'}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)'
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white', borderRadius: '16px', padding: '28px',
          maxWidth: '400px', width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.14)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1a2033' }}>
          {title || '¿Estás seguro?'}
        </h3>
        <p style={{ color: '#5a6478', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db',
              background: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px', color: '#374151'
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: confirmBg, color: 'white', fontWeight: '600',
              cursor: 'pointer', fontSize: '14px'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
