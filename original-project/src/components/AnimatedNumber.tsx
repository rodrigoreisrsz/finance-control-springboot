import { useEffect, useRef, useState } from 'react'

type NumberFormat = 'currency' | 'percent' | 'integer' | 'decimal'

type AnimatedNumberProps = {
  value: number
  format?: NumberFormat
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
}

function formatNumber(value: number, format: NumberFormat, decimals?: number) {
  const fractionDigits = decimals ?? (format === 'currency' ? 2 : format === 'decimal' ? 1 : 0)
  const formatter = new Intl.NumberFormat('pt-BR', {
    ...(format === 'currency' ? { style: 'currency' as const, currency: 'BRL' } : {}),
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
  return formatter.format(value)
}

function AnimatedNumber({
  value,
  format = 'currency',
  decimals,
  prefix = '',
  suffix = '',
  duration = 1100,
}: AnimatedNumberProps) {
  const target = Number.isFinite(value) ? value : 0
  const [displayedValue, setDisplayedValue] = useState(0)
  const displayedValueRef = useRef(0)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    const from = hasAnimatedRef.current ? displayedValueRef.current : 0
    hasAnimatedRef.current = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || duration <= 0 || from === target) {
      displayedValueRef.current = target
      setDisplayedValue(target)
      return
    }

    let frame = 0
    let startTime: number | undefined

    const animate = (timestamp: number) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        displayedValueRef.current = target
        setDisplayedValue(target)
        return
      }

      startTime ??= timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easedProgress = 1 - (1 - progress) ** 4
      const nextValue = progress === 1 ? target : from + (target - from) * easedProgress

      displayedValueRef.current = nextValue
      setDisplayedValue(nextValue)

      if (progress < 1) frame = window.requestAnimationFrame(animate)
    }

    frame = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(frame)
  }, [duration, target])

  const formattedSuffix = format === 'percent' ? suffix || '%' : suffix
  const formattedTarget = `${prefix}${formatNumber(target, format, decimals)}${formattedSuffix}`
  const formattedDisplayedValue = `${prefix}${formatNumber(displayedValue, format, decimals)}${formattedSuffix}`

  return (
    <span className="animated-number" aria-label={formattedTarget} aria-live="off">
      {formattedDisplayedValue}
    </span>
  )
}

export default AnimatedNumber
