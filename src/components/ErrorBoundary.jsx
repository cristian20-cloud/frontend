// src/components/ErrorBoundary.jsx (mejorado)
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error capturado:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '30px',
          textAlign: 'center',
          color: '#fff',
          backgroundColor: '#1e293b',
          margin: '20px',
          borderRadius: '8px',
          border: '1px solid #334155'
        }}>
          <h2 style={{ color: '#F58A0F', marginBottom: '12px' }}>⚠️ Error en el componente</h2>
          <p style={{ marginBottom: '16px' }}>
            {this.state.error?.message || 'Ocurrió un error inesperado.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#F58A0F',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              🔄 Recargar página
            </button>
            <button
              onClick={() => window.history.back()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#334155',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ← Volver
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;