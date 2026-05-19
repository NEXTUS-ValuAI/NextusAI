import { useEffect } from "react"
import { CheckCircle, AlertCircle, X } from "lucide-react"

export function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    success: "bg-green-900/80 border-green-500/50",
    error: "bg-red-900/80 border-red-500/50",
    warning: "bg-yellow-900/80 border-yellow-500/50",
    info: "bg-blue-900/80 border-blue-500/50"
  }[type]

  const textColor = {
    success: "text-green-300",
    error: "text-red-300",
    warning: "text-yellow-300",
    info: "text-blue-300"
  }[type]

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: AlertCircle
  }[type]

  return (
    <div
      className={`fixed top-4 right-4 max-w-md ${bgColor} border rounded-2xl p-4 shadow-lg backdrop-blur-sm flex items-start gap-3 animate-slideIn z-50`}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <Icon size={20} className={textColor} />
      <div className="flex-1">
        <p className={`text-sm ${textColor} font-medium`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-300"
        aria-label="Bildirimi kapat"
      >
        <X size={18} />
      </button>
    </div>
  )
}
