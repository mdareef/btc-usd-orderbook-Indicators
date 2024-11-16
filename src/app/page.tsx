import OrderBook from '@/components/OrderBook'
import SpreadIndicator from '@/components/SpreadIndicator'
import OrderbookImbalance from '@/components/OrderbookImbalance'
import MarketDepthChart from '@/components/MarketDepthChart'

export default function Home() {
  return (
    <main className="container py-4">
      <h1 className="text-center mb-4">BTC-USD Orderbook & Indicators</h1>
      <div className="row justify-content-center g-4">
        <div className="col-8 align-self-center">
          <SpreadIndicator />
        </div>
        <div className="col-8 align-self-center">
          <OrderbookImbalance />
        </div>
        <div className="col-8 align-self-center">
          <MarketDepthChart />
        </div>
        <div className="col-8 align-self-center">
          <OrderBook />
        </div>
      </div>
    </main>
  )
}