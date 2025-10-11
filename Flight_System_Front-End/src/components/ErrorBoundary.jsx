import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(err, info) {
    console.error("ErrorBoundary caught:", err, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1117",
          color: "#fff",
          padding: 24
        }}>
          <div style={{
            maxWidth: 520,
            width: "100%",
            background: "#161b22",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,.3)"
          }}>
            <h3 style={{margin: 0, marginBottom: 12}}>حدث خطأ غير متوقع</h3>
            <p style={{opacity:.85, marginBottom: 16}}>
              جرّب تحديث الصفحة. إن تكرر الخطأ راجع الكونسول (F12).
            </p>
            <button onClick={this.handleReload}
              style={{
                background:"#238636", color:"#fff", border:"none",
                borderRadius:10, padding:"10px 16px", cursor:"pointer"
              }}>
              إعادة تحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}