import { Component } from 'react';

/**
 * A cover that throws (a bad import, a missing picture, a shader that does not
 * link) must not take the gallery down. This boundary replaces that one
 * route's Canvas with DOM copy; the panel and the link back keep working.
 *
 * Error boundaries are still class components in React 19.
 */
export default class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error(`covers/${this.props.slug}:`, error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="canvas-error" role="alert">
          <p>
            This cover could not render: <code>{String(this.state.error.message ?? this.state.error)}</code>
          </p>
          <p className="meta">
            Check the browser console, then <code>covers/{this.props.slug}/src/</code>.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
