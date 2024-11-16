'use client'

import { useState, useEffect, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import styles from '@/styles/SpreadIndicator.module.scss'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const CACHE_EXPIRY = 2000 // Cache expiration in milliseconds
const cache = new Map<string, { data: any; timestamp: number }>()

export default function SpreadIndicator() {
  const [spreadData, setSpreadData] = useState<number[]>([])

  useEffect(() => {
    const fetchSpread = async () => {
      const product = 'BTC-USD'
      const cachedData = cache.get(product)

      // Use cached data if it is still valid
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        processSpread(cachedData.data)
        return
      }

      try {
        const response = await fetch(`https://api.exchange.coinbase.com/products/${product}/book?level=1`)
        const data = await response.json()

        // Cache the response
        cache.set(product, { data, timestamp: Date.now() })
        processSpread(data)
      } catch (error) {
        console.error('Error fetching spread:', error)
      }
    }

    const processSpread = (data: { asks: [string, string][]; bids: [string, string][] }) => {
      const spread = parseFloat(data.asks[0][0]) - parseFloat(data.bids[0][0])
      setSpreadData(prevData => [...prevData.slice(-59), spread]) // Keep only the latest 60 entries
    }

    fetchSpread()
    const interval = setInterval(fetchSpread, 1000)

    return () => clearInterval(interval) // Cleanup interval on unmount
  }, [])

  // Memoize chart data
  const chartData = useMemo(() => ({
    labels: Array.from({ length: spreadData.length }, (_, i) => `${i}s`),
    datasets: [
      {
        label: 'Spread',
        data: spreadData,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }), [spreadData])

  // Memoize chart options
  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Spread Indicator (1 minute)',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  }), [])

  return (
    <div className={`card ${styles.spreadIndicator}`}>
      <div className="card-header">
        <h2 className="card-title">Spread Indicator</h2>
      </div>
      <div className="card-body" >
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
