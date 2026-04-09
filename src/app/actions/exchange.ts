"use server";

export async function getLatestRates() {
  const url = "https://api.exchangerate.host/latest?base=TRY&symbols=USD,EUR";
  try {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();

    if (data.rates && data.rates.USD) {
      return {
        USD: 1 / data.rates.USD as number,
        EUR: 1 / data.rates.EUR as number,
        date: data.date as string,
        success: true as const
      };
    }
    
    // Fallback if the user's API fails (e.g. requires key)
    const fallbackUrl = "https://api.frankfurter.app/latest?from=USD&to=TRY,EUR";
    const fallbackRes = await fetch(fallbackUrl, { next: { revalidate: 3600 } });
    const fallbackData = await fallbackRes.json();
    
    return {
      USD: fallbackData.rates.TRY as number,
      EUR: (fallbackData.rates.TRY / fallbackData.rates.EUR) as number,
      date: fallbackData.date as string,
      success: true as const
    };
  } catch (error) {
    console.error("Error fetching rates:", error);
    return { success: false as const, error: "Döviz kurları alınamadı." };
  }
}

export async function getExchangeHistory() {
  const fallbackUrl = "https://api.frankfurter.app";
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  try {
    const response = await fetch(`${fallbackUrl}/${startDate}..${endDate}?from=USD&to=TRY,EUR`, { 
      next: { revalidate: 3600 } 
    });
    const data = await response.json();
    
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
