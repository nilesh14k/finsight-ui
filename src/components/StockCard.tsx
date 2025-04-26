interface StockCardProps {
    data: {
      symbol: string;
      price: number;
      day_high: number;
      day_low: number;
      prev_close: number;
      timestamp: string;
    };
  }
  
  export default function StockCard({ data }: StockCardProps) {
    return (
      <div className="bg-white shadow-md rounded-xl p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">{data.symbol}</h2>
        <p className="text-lg">Current: <span className="font-semibold">${data.price.toFixed(2)}</span></p>
        <div className="flex justify-between mt-2 text-sm text-gray-700">
          <span>High: ${data.day_high.toFixed(2)}</span>
          <span>Low: ${data.day_low.toFixed(2)}</span>
          <span>Prev Close: ${data.prev_close.toFixed(2)}</span>
        </div>
        <p className="mt-4 text-gray-500 text-sm">
          Updated: {new Date(data.timestamp).toLocaleString()}
        </p>
      </div>
    );
}