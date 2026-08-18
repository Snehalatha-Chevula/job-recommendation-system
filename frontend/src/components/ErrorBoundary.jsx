import { Component } from 'react';

/**
 * Last line of defence: catches a render-time exception anywhere in the tree so
 * an unexpected bug shows a readable message instead of a blank white page.
 *
 * Data-fetching failures are handled far earlier, by `ErrorState`; this only
 * catches programming errors during render.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Detail goes to the console for a developer; the user sees plain language.
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="container" style={{ padding: '64px 24px' }}>
        <div className="state state--error">
          <h3 className="state__title">Something went wrong</h3>
          <p className="state__message">
            The interface hit an unexpected problem. Reloading the page usually clears it.
          </p>
          <div className="state__actions">
            <button type="button" className="button" onClick={() => window.location.reload()}>
              Reload the page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
