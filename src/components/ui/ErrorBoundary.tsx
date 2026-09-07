import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="glass p-4 text-center">
            <p className="text-sm text-white/80">Não foi possível carregar esta seção.</p>
            <button onClick={() => this.setState({ hasError: false })} className="mt-2 text-xs underline text-white/60 hover:text-white/90">
              Tentar novamente
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
