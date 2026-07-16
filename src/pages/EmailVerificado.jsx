import { useSearchParams, useNavigate } from 'react-router-dom';

const REASON_MESSAGES = {
  missing_token: 'No se recibió un token de verificación.',
  user_not_found: 'El usuario no existe o ya fue eliminado.',
  invalid_token: 'El enlace de verificación no es válido.',
  expired: 'El enlace de verificación ha expirado (24h). Solicita uno nuevo.',
  invalid: 'El enlace de verificación está corrupto o es inválido.',
};

const EmailVerificado = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const reason = searchParams.get('reason');

  const isSuccess = status === 'success';
  const errorMsg = REASON_MESSAGES[reason] || 'Ocurrió un error inesperado.';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        {isSuccess ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Correo Verificado</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              Tu correo electrónico ha sido verificado exitosamente. Ya puedes iniciar sesión.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Error de Verificación</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>{errorMsg}</p>
            {reason === 'expired' && (
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
                Puedes solicitar un nuevo enlace desde la pantalla de inicio de sesión.
              </p>
            )}
          </>
        )}
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
            backgroundColor: '#0f172a', color: 'white', fontWeight: 600,
            cursor: 'pointer', fontSize: '15px',
          }}
        >
          Ir al inicio
        </button>
      </div>
    </div>
  );
};

export default EmailVerificado;
