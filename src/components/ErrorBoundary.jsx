import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '40px', textAlign: 'center', background: '#f7f8fa'
        }}>
          <span style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</span>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#1a2033' }}>
            Algo salió mal
          </h2>
          <p style={{ color: '#5a6478', marginBottom: '24px', maxWidth: '400px' }}>
            Ocurrió un error inesperado. Nuestro equipo ya fue notificado.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#1e2530', color: 'white', border: 'none',
              padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold',
              cursor: 'pointer', fontSize: '15px'
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
