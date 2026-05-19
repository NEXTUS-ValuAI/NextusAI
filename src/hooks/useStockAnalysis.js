import { useCallback } from "react"
import { useAnalysis } from "../context/AnalysisContext"
import { analyzeStock as apiAnalyzeStock } from "../api/nextusApi"

export function useStockAnalysis() {
  const { setAnalysisData, setAnalysisError, setLoading, cache } = useAnalysis()

  const analyzeStock = useCallback(async (symbol) => {
    if (!symbol.trim()) {
      setAnalysisError("Lütfen hisse kodu girin")
      return
    }

    // Check cache
    if (cache[symbol.toUpperCase()]) {
      setAnalysisData(cache[symbol.toUpperCase()])
      return
    }

    try {
      setLoading(true)
      const result = await apiAnalyzeStock(symbol.trim())
      setAnalysisData(result)
    } catch (error) {
      let errorMessage = "Veri alınamadı"
      
      if (error.response?.status === 404) {
        errorMessage = `'${symbol}' hissesi bulunamadı. Sembolü kontrol edin.`
      } else if (error.response?.status === 400) {
        errorMessage = "Geçersiz hisse sembolü"
      } else if (error.response?.status === 503) {
        errorMessage = "Veri kaynağı geçici olarak kullanılamıyor. Tekrar deneyin."
      } else if (error.message === "Network Error") {
        errorMessage = "Bağlantı hatası. Backend çalışıyor mu kontrol edin."
      }
      
      setAnalysisError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [cache, setAnalysisData, setAnalysisError, setLoading])

  return { analyzeStock }
}
