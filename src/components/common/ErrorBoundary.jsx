import { Component } from "react"
import { AlertTriangle } from "lucide-react"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 max-w-md">
            <div className="flex justify-center mb-4">
              <AlertTriangle size={48} className="text-red-400" />
            </div>
            
            <h1 className="text-2xl font-black text-center mb-2 text-red-400">
              Beklenmeyen Hata
            </h1>
            
            <p className="text-slate-300 text-center mb-6">
              Bir şeyler yanlış gitti. Sayfayı yenile veya daha sonra tekrar deneyin.
            </p>
            
            {process.env.NODE_ENV === "development" && (
              <details className="bg-slate-950 rounded-lg p-3 mb-4">
                <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300">
                  Hata Detayları
                </summary>
                <pre className="text-xs text-red-300 mt-2 overflow-auto max-h-32">
                  {this.state.error?.message}
                </pre>
              </details>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
