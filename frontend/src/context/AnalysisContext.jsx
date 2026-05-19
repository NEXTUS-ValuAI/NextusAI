import { createContext, useContext, useState, useCallback } from "react"

const AnalysisContext = createContext(null)

export function AnalysisProvider({ children }) {
  const [symbol, setSymbol] = useState("ASELS")
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cache, setCache] = useState({})
  const [toast, setToast] = useState(null)

  const updateToast = useCallback((message, type = "success", duration = 3000) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), duration)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const setAnalysisData = useCallback((newData) => {
    setData(newData)
    setCache(prev => ({
      ...prev,
      [newData.symbol]: newData
    }))
    clearError()
  }, [clearError])

  const setAnalysisError = useCallback((errorMessage) => {
    setError(errorMessage)
    setData(null)
    updateToast(errorMessage, "error", 5000)
  }, [updateToast])

  const value = {
    symbol,
    setSymbol,
    data,
    setAnalysisData,
    loading,
    setLoading,
    error,
    setAnalysisError,
    clearError,
    cache,
    toast,
    updateToast
  }

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (!context) {
    throw new Error("useAnalysis must be used within AnalysisProvider")
  }
  return context
}
