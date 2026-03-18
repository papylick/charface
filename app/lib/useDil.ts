'use client'
import { useState, useEffect } from 'react'
import { diller, Dil, DilMetinleri } from './dil'

export function useDil(): DilMetinleri {
  const [metin, setMetin] = useState(diller.TR)

  useEffect(() => {
    const kayitliDil = (localStorage.getItem('dil') || 'TR') as Dil
    setMetin(diller[kayitliDil] || diller.TR)
  }, [])

  return metin
}