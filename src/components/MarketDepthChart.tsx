'use client'

import { useState, useEffect, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import styles from '@/styles/MarketDepthChart.module.scss'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type OrderBookEntry = [string, string]
type DepthData = { bids: number[]; asks: number[] }

const CACHE_EXPIRY = 5000 // Cache expiry in milliseconds
const cache = new Map<string, { data: DepthData; timestamp: number }>()

export default function MarketDepthChart() {
  const [depthData, setDepthData] = useState<DepthData>({ bids: [], asks: [] })

  useEffect(() => {
    let isMounted = true // Prevent state updates if the component is unmounted

    const fetchOrderBook = async () => {
      const product = 'BTC-USD'
      const cachedData = cache.get(product)

      // Use cached data if valid
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        if (isMounted) setDepthData(cachedData.data)
        return
      }

      try {
        const response = await fetch(`https://api.exchange.coinbase.com/products/${product}/book?level=2`)
        const data = await response.json()

        const processOrders = (orders: OrderBookEntry[]) => {
          let cumulative = 0
          return orders.slice(0, 50).map(([price, size]) => {
            cumulative += parseFloat(size)
            return cumulative
          })
        }

        const newDepthData: DepthData = {
          bids: processOrders(data.bids),
          asks: processOrders(data.asks),
        }

        // Update state and cache only if mounted
        if (isMounted) {
          setDepthData(newDepthData)
          cache.set(product, { data: newDepthData, timestamp: Date.now() })
        }
      } catch (error) {
        console.error('Error fetching order book:', error)
      }
    }

    // Fetch data initially and set up interval
    fetchOrderBook()
    const interval = setInterval(fetchOrderBook, 1000)

    return () => {
      isMounted = false
      clearInterval(interval) // Cleanup interval on unmount
    }
  }, [])

  // Memoize chart data
  const chartData = useMemo(() => ({
    labels: Array.from({ length: Math.max(depthData.bids.length, depthData.asks.length) }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Bids',
        data: depthData.bids,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
      {
        label: 'Asks',
        data: depthData.asks,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
    ],
  }), [depthData])

  // Memoize chart options
  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Market Depth Chart',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }), [])

  return (
    <div className={`card ${styles.marketDepthChart}`}>
      <div className="card-header">
        <h2 className="card-title">Market Depth Chart</h2>
      </div>
      <div className="card-body">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
