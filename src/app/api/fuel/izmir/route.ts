import { NextResponse } from "next/server";

export async function GET() {
  const FALLBACK_PRICE = 30.5;
  const FALLBACK_NAME = "Motorin (Test Verisi)";

  try {
    // Province Code 35 is Izmir in Opet API
    const response = await fetch("https://api.opet.com.tr/api/fuelprices/prices?provinceCode=35", {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error("Opet API response was not ok");
    }

    const data = await response.json();
    
    const fuelPrices = data[0]?.fuelPrices || [];
    const dieselProduct = fuelPrices.find((p: any) => 
      p.productName?.toLowerCase().includes("motorin") || 
      p.productName?.toLowerCase().includes("dizel")
    );

    if (!dieselProduct) {
      throw new Error("Diesel price not found in response");
    }

    return NextResponse.json({
      price: dieselProduct.amount,
      productName: dieselProduct.productName,
      date: new Date().toISOString(),
      isFallback: false
    });
  } catch (error) {
    console.error("Fuel API error, using fallback:", error);
    // Return fallback data instead of 500 error as requested by the user
    return NextResponse.json({
      price: FALLBACK_PRICE,
      productName: FALLBACK_NAME,
      date: new Date().toISOString(),
      isFallback: true,
      error: "API bağlantısı başarısız, test verisi kullanılıyor."
    });
  }
}
