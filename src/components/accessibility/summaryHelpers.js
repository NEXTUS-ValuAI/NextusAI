import { money } from "../../utils/formatters"

const TURKISH_CURRENCY_LABELS = {
  TRY: "Türk lirası",
  TL: "Türk lirası",
  USD: "dolar",
  EUR: "euro",
  GBP: "sterlin",
}

export function formatSpeechFriendlyText(text) {
  return String(text || "")
    .replace(/ValuAI Score/gi, "NextusAI Puanı")
    .replace(/ValuAI/gi, "NextusAI")
    .replace(/Market Mood/gi, "Piyasa Eğilimi")
    .replace(/Comparable model/gi, "Karşılaştırmalı model")
    .replace(/F\/K/gi, "F K")
    .replace(/PD\/DD/gi, "P D D")
    .replace(/(\d+(?:[.,]\d+)?)\/100/g, "yüz üzerinden $1")
    .replace(/%(\d+(?:[.,]\d+)?)/g, "yüzde $1")
    .replace(/([0-9]+)\.([0-9]+)/g, "$1 virgül $2")
}

export function formatSpeechScoreText(score) {
  const numericScore = Number(score)

  if (!Number.isFinite(numericScore)) {
    return "hesaplanamadı"
  }

  return `yüz üzerinden ${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(numericScore)}`
}

export function getFirstMeaningfulText(items, fallback) {
  if (!Array.isArray(items)) return fallback

  const value = items
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .find(Boolean)

  return value || fallback
}

export function formatPotentialText(potential) {
  const numericPotential = Number(potential)

  if (!Number.isFinite(numericPotential)) {
    return "Teorik potansiyel hesaplanamadı."
  }

  const direction = numericPotential >= 0 ? "üzerinde" : "altında"
  return `Model, teorik değeri mevcut fiyatın yaklaşık %${Math.abs(numericPotential).toFixed(1)} ${direction} hesaplıyor.`
}

export function formatSpeechMoney(value, currency) {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return "bilinmiyor"
  }

  const formattedValue = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)

  const currencyCode = typeof currency === "string" ? currency.trim().toUpperCase() : ""
  const currencyLabel = TURKISH_CURRENCY_LABELS[currencyCode] || currencyCode

  return currencyLabel ? `${formattedValue} ${currencyLabel}` : formattedValue
}

export function formatSpeechPotentialText(potential) {
  const numericPotential = Number(potential)

  if (!Number.isFinite(numericPotential)) {
    return "Teorik potansiyel hesaplanamadı."
  }

  const formattedPotential = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(numericPotential))

  if (numericPotential >= 0) {
    return `Model, teorik değeri mevcut fiyatın yaklaşık yüzde ${formattedPotential} üzerinde hesaplıyor.`
  }

  return `Model, teorik değeri mevcut fiyatın yaklaşık yüzde ${formattedPotential} altında hesaplıyor.`
}

export function findTurkishVoice(voices) {
  if (!Array.isArray(voices)) return null

  const turkishVoices = voices.filter((voice) => /^tr(-|$)/i.test(voice.lang) || /turk/i.test(voice.name))

  if (!turkishVoices.length) return null

  const maleHints = [
    /erkek/i,
    /male/i,
    /man/i,
    /tolga/i,
    /ahmet/i,
    /ozan/i,
    /murat/i,
    /hakan/i,
    /serkan/i,
    /kerem/i,
    /berk/i,
    /emre/i,
    /kaan/i,
    /furkan/i,
    /burak/i,
    /selim/i,
    /ozgur/i,
    /oguz/i,
    /engin/i,
    /yunus/i,
    /umut/i,
  ]

  const femaleHints = [
    /female/i,
    /woman/i,
    /kadin/i,
    /kadın/i,
    /elif/i,
    /ayse/i,
    /ayşe/i,
    /fatma/i,
    /zeynep/i,
    /merve/i,
    /hande/i,
    /gizem/i,
    /seda/i,
    /esra/i,
    /cansu/i,
  ]

  const isMaleHint = (voice) => {
    const candidate = `${voice.name || ""} ${voice.voiceURI || ""}`
    return maleHints.some((pattern) => pattern.test(candidate))
  }

  const isFemaleHint = (voice) => {
    const candidate = `${voice.name || ""} ${voice.voiceURI || ""}`
    return femaleHints.some((pattern) => pattern.test(candidate))
  }

  return (
    turkishVoices.find((voice) => isMaleHint(voice)) ||
    turkishVoices.find((voice) => !isFemaleHint(voice)) ||
    turkishVoices[0] ||
    null
  )
}

export function buildSummaryModel(data) {
  const companyName = data?.company_name || data?.symbol || "Bu hisse"
  const score = Number(data?.valuai_score)
  const scoreText = Number.isFinite(score) ? `${score.toFixed(1)}/100` : "hesaplanamadı"
  const riskText = data?.risk_label || "Belirsiz"
  const moodText = data?.market_mood || "Nötr"
  const fairValue = Number(data?.final_fair_value)
  const fairValueText = Number.isFinite(fairValue) ? money(fairValue, data?.currency) : "bilinmiyor"
  const potentialText = formatPotentialText(data?.potential)
  const strongestSignal = getFirstMeaningfulText(data?.positive_signals, "Belirgin güçlü sinyal yok")
  const biggestRisk = getFirstMeaningfulText(data?.negative_signals, data?.risk_label || "Belirgin risk yok")

  const summaryText = `${companyName} için NextusAI skoru ${scoreText}. Risk seviyesi ${riskText}. Piyasa eğilimi ${moodText}. Teorik değer ${fairValueText}. ${potentialText} En güçlü sinyal: ${strongestSignal}. En büyük risk: ${biggestRisk}.`
  const speechText = summaryText

  return {
    companyName,
    scoreText,
    riskText,
    moodText,
    fairValueText,
    potentialText,
    strongestSignal,
    biggestRisk,
    summaryText,
    speechText,
  }
}

export function extractVoiceCommandSymbol(transcript) {
  if (!transcript) return null

  const normalized = transcript.trim().replace(/\s+/g, " ")
  const match = normalized.match(/^(.+?)\s+analiz\s+et$/i)

  if (!match) return null

  const rawSymbol = match[1].replace(/\s+/g, "")
  const symbol = rawSymbol.replace(/[^A-Za-z0-9.\-]/g, "").toUpperCase()

  return symbol || null
}