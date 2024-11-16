'use client'

import { useState, useEffect, useMemo } from 'react'
import styles from '@/styles/OrderBook.module.scss'

type OrderBookEntry = {
  price: string
  size: string
}

type OrderBookData = {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
}

const CACHE_EXPIRY = 5000 // Cache expiration in milliseconds
const cache = new Map<string, { data: OrderBookData; timestamp: number }>()

export default function OrderBook() {
  const [orderBook, setOrderBook] = useState<OrderBookData>({ bids: [], asks: [] })

  useEffect(() => {
    const fetchOrderBook = async () => {
      const product = 'BTC-USD'
      const cachedData = cache.get(product)

      // Check if cached data is valid
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        setOrderBook(cachedData.data)
        return
      }

      try {
        const response = await fetch(`https://api.exchange.coinbase.com/products/${product}/book?level=2`)
        const data = await response.json()

        const newOrderBook: OrderBookData = {
          bids: data.bids.slice(0, 10).map(([price, size]: [string, string]) => ({ price, size })),
          asks: data.asks.slice(0, 10).map(([price, size]: [string, string]) => ({ price, size })),
        }

        // Update state and cache
        setOrderBook(newOrderBook)
        cache.set(product, { data: newOrderBook, timestamp: Date.now() })
      } catch (error) {
        console.error('Error fetching order book:', error)
      }
    }

    fetchOrderBook()
    const interval = setInterval(fetchOrderBook, 1000)

    return () => clearInterval(interval) // Cleanup on unmount
  }, [])

  // Memoize rows to prevent unnecessary recalculations
  const bidRows = useMemo(() => {
    return orderBook.bids.map((bid, index) => (
      <tr key={index}>
        <td>{parseFloat(bid.size).toFixed(8)}</td>
        <td className="bidPrice">{parseFloat(bid.price).toFixed(2)}</td>
      </tr>
    ))
  }, [orderBook.bids])

  const askRows = useMemo(() => {
    return orderBook.asks.map((ask, index) => (
      <tr key={index}>
        <td className="askPrice">{parseFloat(ask.price).toFixed(2)}</td>
        <td>{parseFloat(ask.size).toFixed(8)}</td>
      </tr>
    ))
  }, [orderBook.asks])

  return (
    <div className={`card ${styles.orderBook}`}>
      <div className="card-header">
        <h2 className="card-title">Order Book</h2>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Bid Size</th>
                  <th>Bid Price</th>
                </tr>
              </thead>
              <tbody>{bidRows}</tbody>
            </table>
          </div>
          <div className="col-md-6">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Ask Price</th>
                  <th>Ask Size</th>
                </tr>
              </thead>
              <tbody>{askRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
