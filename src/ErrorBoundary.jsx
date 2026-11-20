import { Component } from "react";

// Catches render errors so a bug shows a message instead of a black page.
export default class ErrorBoundary extends Component {
  state = { error: null, stack: "" };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ChronoWar crashed:", error, info?.componentStack);
    this.setState({ stack: info?.componentStack || "" });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: "100vh", background: "#05030c", color: "#e8d5a3", padding: 24, fontFamily: "Georgia, serif" }}>
        <h2 style={{ color: "#c89030", marginTop: 0 }}>The timeline fractured</h2>
        <p>Something went wrong. Reloading usually restores the war.</p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: "8px 16px", background: "#3a2508", color: "#e8c840", border: "1px solid #c89030", borderRadius: 6, cursor: "pointer" }}
        >
          Reload
        </button>
        <pre style={{ marginTop: 20, whiteSpace: "pre-wrap", fontSize: 12, color: "#d98a7a" }}>
          {String(this.state.error?.message || this.state.error)}
          {"\n"}
          {this.state.stack.split("\n").slice(0, 8).join("\n")}
        </pre>
      </div>
    );
  }
}
