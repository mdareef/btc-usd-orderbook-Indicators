# Crypto Orderbook & Market Indicators

## Technologies Used

- Next.js 14
- React
- Bootstrap for UI components
- SCSS for custom styling
- Chart.js & react-chartjs-2 for data visualization
- Coinbase Advanced Trade API for market data


## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/crypto-orderbook.git
   cd crypto-orderbook
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
crypto-orderbook/
├── app/
│   ├── page.tsx           # Main page component
│   └── globals.scss       # Global styles
├── components/
│   ├── OrderBook.tsx      # Orderbook display component
│   ├── SpreadIndicator.tsx    # Spread visualization
│   ├── OrderbookImbalance.tsx # Imbalance indicator
│   └── MarketDepthChart.tsx   # Depth chart component
├── styles/
│   ├── OrderBook.module.scss
│   ├── SpreadIndicator.module.scss
│   ├── OrderbookImbalance.module.scss
│   └── MarketDepthChart.module.scss
└── package.json
```

## API Usage

The application uses the Coinbase Advanced Trade API to fetch market data. The following endpoints are used:

- Order Book: `https://api.exchange.coinbase.com/products/BTC-USD/book`
- Market Data: `https://api.exchange.coinbase.com/products/BTC-USD/book?level=2`

Data is refreshed every second to provide real-time market information.

## Styling

The project uses a combination of Bootstrap and custom SCSS modules:
- Bootstrap provides the base UI components and grid system
- Custom SCSS modules handle component-specific styling
- Responsive design breakpoints ensure mobile compatibility

