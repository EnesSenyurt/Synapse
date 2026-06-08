import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Synapse] Yakalanmamış hata:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div className="error-boundary">
        <div className="error-boundary-card">
          <div className="error-boundary-icon">⚠️</div>
          <h2>Beklenmeyen bir hata oluştu</h2>
          <p>Uygulama bir sorunla karşılaştı. Aşağıdaki detayları geliştirici konsolunda da görebilirsiniz.</p>
          <details className="error-boundary-details">
            <summary>Hata detayı</summary>
            <pre>{error.message}</pre>
          </details>
          <button className="error-boundary-btn" onClick={this.handleReset}>
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }
}
