export default function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;
  return (
    <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '380px' }}>
      {toasts.map(t => (
        <div key={t.id} role="alert" style={{
          padding: '14px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', animation: 'toastIn 0.25s ease-out',
          background: t.type === 'error' ? '#fee2e2' : t.type === 'warning' ? '#fff3cd' : '#d1fae5',
          color: t.type === 'error' ? '#b91c1c' : t.type === 'warning' ? '#856404' : '#065f46',
          border: `1px solid ${t.type === 'error' ? '#fca5a5' : t.type === 'warning' ? '#fde68a' : '#6ee7b7'}`
        }}>
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit', padding: 0, lineHeight: 1 }}>×</button>
        </div>
      ))}
    </div>
  );
}
