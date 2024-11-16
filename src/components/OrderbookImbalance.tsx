'use client'

import { useState, useEffect, useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import styles from '@/styles/OrderbookImbalance.module.scss'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const CACHE_EXPIRY = 5000 // Cache expiration in milliseconds
const cache = new Map<string, { data: { bids: string[][]; asks: string[][] }; timestamp: number }>()

export default function OrderbookImbalance() {
  const [imbalance, setImbalance] = useState<number>(0)

  useEffect(() => {
    const fetchOrderBook = async () => {
      const product = 'BTC-USD'
      const cachedData = cache.get(product)

      // Check if cached data is valid
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        processOrderBook(cachedData.data)
        return
      }

      try {
        const response = await fetch(`https://api.exchange.coinbase.com/products/${product}/book?level=2`)
        const data = await response.json()

        // Cache the fetched data
        cache.set(product, { data, timestamp: Date.now() })
        processOrderBook(data)
      } catch (error) {
        console.error('Error fetching order book:', error)
      }
    }

    const processOrderBook = (data: { bids: string[][]; asks: string[][] }) => {
      const bids = data.bids.slice(0, 10)
      const asks = data.asks.slice(0, 10)

      const totalBidSize = bids.reduce((sum: number, [, size]: [string, string]) => sum + parseFloat(size), 0)
      const totalAskSize = asks.reduce((sum: number, [, size]: [string, string]) => sum + parseFloat(size), 0)

      const newImbalance = (totalBidSize - totalAskSize) / (totalBidSize + totalAskSize)
      setImbalance(newImbalance)
    }

    fetchOrderBook()
    const interval = setInterval(fetchOrderBook, 1000)

    return () => clearInterval(interval) // Cleanup on unmount
  }, [])

  // Memoize chart data to prevent recalculations
  const chartData = useMemo(() => ({
    labels: ['Orderbook Imbalance'],
    datasets: [
      {
        label: 'Imbalance',
        data: [imbalance],
        backgroundColor: imbalance >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
      },
    ],
  }), [imbalance])

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Orderbook Imbalance',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMin: -1,
        suggestedMax: 1,
      },
    },
  }), [])

  return (
    <div className={`card ${styles.orderbookImbalance}`}>
      <div className="card-header">
        <h2 className="card-title">Orderbook Imbalance</h2>
      </div>
      <div className="card-body">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
