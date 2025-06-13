interface ScholarshipCSVRow {
  "No.": string
  "Scholarship Name": string
  "Host Country": string
  "Host Organization": string
  "Level of Study": string
  "Latest Deadline (Approx.)": string
  "Eligibility Criteria (Key Points)": string
  "Benefits (Key Points)": string
  "Fully Funded?": string
  "Official URL": string
}

export interface ScholarshipData {
  id: number
  name: string
  host_country: string
  host_organization: string
  level_of_study: string
  deadline: string
  eligibility_criteria: string
  benefits: string
  fully_funded: string
  official_url: string
  description?: string
  amount?: number
  applyUrl?: string
}

export function parseScholarshipCSV(csvData: ScholarshipCSVRow[]): ScholarshipData[] {
  return csvData.map((row, index) => ({
    id: parseInt(row["No."]) || index + 1,
    name: row["Scholarship Name"],
    host_country: row["Host Country"],
    host_organization: row["Host Organization"],
    level_of_study: row["Level of Study"],
    deadline: row["Latest Deadline (Approx.)"],
    eligibility_criteria: row["Eligibility Criteria (Key Points)"],
    benefits: row["Benefits (Key Points)"],
    fully_funded: row["Fully Funded?"],
    official_url: row["Official URL"]
  }))
}

// Utility function to extract amount from benefits text (if needed)
export function extractAmountFromBenefits(benefits: string): number | undefined {
  // Look for currency patterns in the benefits text
  const patterns = [
    /€([\d,]+)/,     // Euro
    /\$([\d,]+)/,    // Dollar
    /£([\d,]+)/,     // Pound
    /([\d,]+)\s*EUR/i, // EUR
    /([\d,]+)\s*USD/i, // USD
    /([\d,]+)\s*GBP/i  // GBP
  ]
  
  for (const pattern of patterns) {
    const match = benefits.match(pattern)
    if (match) {
      const amount = parseInt(match[1].replace(/,/g, ''))
      if (!isNaN(amount)) {
        return amount
      }
    }
  }
  
  return undefined
}

// Utility function to determine if a scholarship is fully funded
export function determineFundingType(fully_funded: string, amount?: number): string {
  if (fully_funded.toLowerCase().includes('yes') || fully_funded.toLowerCase().includes('full')) {
    return 'Fully Funded'
  }
  if (fully_funded.toLowerCase().includes('partial')) {
    return 'Partially Funded'
  }
  if (fully_funded.toLowerCase().includes('varies')) {
    return 'Varies'
  }
  
  // Fallback to amount-based determination
  if (amount) {
    if (amount > 40000) return 'Fully Funded'
    if (amount > 20000) return 'Partially Funded'
  }
  
  return 'Merit-based'
}

// Utility function to format HTML content for display
export function formatHTMLContent(htmlContent: string): string {
  return htmlContent
    .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
    .replace(/&lt;/g, '<')         // Convert HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

// Utility function to convert HTML to array for list display
export function htmlToArray(htmlContent: string): string[] {
  return htmlContent
    .split('<br>')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => item.replace(/^-\s*/, '')) // Remove leading dashes
} 