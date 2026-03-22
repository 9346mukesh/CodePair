import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    this.props?.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary">
          <div className="mb-1 font-semibold text-text-primary">Panel crashed</div>
          <div>Try reloading the page. Your code is saved locally every 30s.</div>
        </div>
      )
    }
    return this.props.children
  }
}

