export function formatLargeNumber(
    value: number,
    currency: string = "USD"
  ): string {
    const isIndian = currency === "INR"; // Only INR stocks get Crore/Lakh
  
    if (isIndian) {
      if (value >= 10000000) return (value / 10000000).toFixed(2) + " Cr";
      if (value >= 100000) return (value / 100000).toFixed(2) + " L";
      return value.toLocaleString("en-IN");
    } else {
      if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + "B";
      if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M";
      if (value >= 1_000) return (value / 1_000).toFixed(2) + "K";
      return value.toLocaleString("en-US");
    }
  }
  