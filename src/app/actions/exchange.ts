"use server";

export async function getLatestRates() {
  // Switch to FXRatesAPI for real-time market data
  const url = "https://api.fxratesapi.com/latest?base=USD&currencies=TRY,EUR";
  
  try {
    const response = await fetch(url, { 
      next: { revalidate: 300 } // Real-time: update every 5 mins
    });
    const data = await response.json();

    if (data.success && data.rates.TRY) {
      // Use the date part from the timestamp/date provided by the API
      const dateStr = data.date.split('T')[0];

      return {
        USD: data.rates.TRY as number,
        EUR: (data.rates.TRY / data.rates.EUR) as number,
        date: dateStr,
        success: true as const
      };
    }
    
    return { success: false as const, error: "Döviz kurları alınamadı." };
  } catch (error) {
    console.error("Error fetching rates:", error);
    return { success: false as const, error: "Bağlantı hatası." };
  }
}

export async function getExchangeHistory() {
  const baseUrl = "https://api.frankfurter.app";
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  try {
    const response = await fetch(`${baseUrl}/${startDate}..${endDate}?from=USD&to=TRY,EUR`, { 
      next: { revalidate: 3600 } 
    });
    const data = await response.json();
    
    if (!data.rates) throw new Error("No rates found");

    const formattedHistory = Object.entries(data.rates).map(([date, values]: [string, any]) => ({
      date: date.split('-').slice(1, 3).reverse().join('.'), // DD.MM format
      USD: values.TRY as number,
      EUR: (values.TRY / values.EUR) as number
    }));
    
    return { success: true as const, history: formattedHistory };
  } catch (error) {
    console.error("Error fetching history:", error);
    return { success: false as const, error: "Geçmiş veriler alınamadı.", history: [] };
  }
}
