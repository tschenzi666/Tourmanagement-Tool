"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Upload, FileSpreadsheet, Check, X, Sparkles } from "lucide-react"
import { importExpensesFromCsv } from "@/lib/actions/crew-actions"

const EXPENSE_CATEGORIES = [
  "TRAVEL", "ACCOMMODATION", "CATERING", "EQUIPMENT", "VEHICLE",
  "FUEL", "TOLLS", "PARKING", "COMMUNICATION", "PER_DIEM",
  "PRODUCTION", "MERCH", "INSURANCE", "VISA", "MISCELLANEOUS", "OTHER",
]

// Smart category detection based on keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  TRAVEL: ["travel", "taxi", "uber", "lyft", "train", "bus", "transport", "flight", "airline", "ticket"],
  ACCOMMODATION: ["hotel", "airbnb", "hostel", "lodge", "room", "accommodation", "stay", "motel"],
  CATERING: ["food", "catering", "meal", "lunch", "dinner", "breakfast", "snack", "drinks", "restaurant", "coffee"],
  EQUIPMENT: ["equipment", "gear", "instrument", "cable", "mic", "microphone", "speaker", "amp", "guitar", "drum", "rental"],
  VEHICLE: ["vehicle", "van", "truck", "bus rental", "car rental", "rental car"],
  FUEL: ["fuel", "gas", "petrol", "diesel", "benzin", "tankstelle"],
  TOLLS: ["toll", "maut", "vignette", "autobahngebühr"],
  PARKING: ["parking", "parkplatz", "garage"],
  COMMUNICATION: ["phone", "internet", "wifi", "sim", "data", "communication"],
  PER_DIEM: ["per diem", "daily allowance", "tagegeld", "spesen"],
  PRODUCTION: ["production", "stage", "lighting", "sound", "rigging", "backdrop"],
  MERCH: ["merch", "merchandise", "t-shirt", "poster", "print", "vinyl"],
  INSURANCE: ["insurance", "versicherung"],
  VISA: ["visa", "visum", "permit", "work permit"],
}

function detectCategory(description: string): string {
  const lower = description.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return category
    }
  }
  return "OTHER"
}

function parseAmount(value: string): number | null {
  // Remove currency symbols and whitespace
  const cleaned = value.replace(/[$€£¥₹,\s]/g, "").replace(",", ".")
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : Math.abs(num)
}

function parseDate(value: string): string | null {
  // Try various date formats
  const formats = [
    // ISO format
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    // German format
    /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/,
    // US format
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/,
  ]

  for (const regex of formats) {
    const match = value.trim().match(regex)
    if (match) {
      if (regex === formats[0]) {
        // ISO: YYYY-MM-DD
        return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`
      } else if (regex === formats[1]) {
        // German: DD.MM.YYYY
        const year = match[3].length === 2 ? `20${match[3]}` : match[3]
        return `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`
      } else {
        // US: MM/DD/YYYY
        const year = match[3].length === 2 ? `20${match[3]}` : match[3]
        return `${year}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`
      }
    }
  }

  // Try parsing with Date constructor as fallback
  const d = new Date(value)
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0]
  }
  return null
}

interface ParsedExpense {
  description: string
  amount: number
  category: string
  date: string
  vendor?: string
  notes?: string
}

function smartParseCsv(text: string): ParsedExpense[] {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return []

  // Detect delimiter
  const firstLine = lines[0]
  const delimiter = firstLine.includes("\t") ? "\t" : firstLine.includes(";") ? ";" : ","

  // Parse header
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""))

  // Smart column detection
  const colMap = {
    description: -1,
    amount: -1,
    date: -1,
    category: -1,
    vendor: -1,
    notes: -1,
  }

  headers.forEach((h, i) => {
    const header = h.toLowerCase()
    if (["description", "beschreibung", "name", "item", "expense", "bezeichnung", "posten"].some((k) => header.includes(k))) {
      colMap.description = i
    } else if (["amount", "betrag", "cost", "price", "preis", "summe", "total", "value"].some((k) => header.includes(k))) {
      colMap.amount = i
    } else if (["date", "datum", "day", "tag"].some((k) => header.includes(k))) {
      colMap.date = i
    } else if (["category", "kategorie", "type", "typ", "art"].some((k) => header.includes(k))) {
      colMap.category = i
    } else if (["vendor", "lieferant", "supplier", "anbieter", "shop", "store"].some((k) => header.includes(k))) {
      colMap.vendor = i
    } else if (["notes", "notizen", "comment", "kommentar", "anmerkung"].some((k) => header.includes(k))) {
      colMap.notes = i
    }
  })

  // If no description column found, try first text-like column
  if (colMap.description === -1) {
    for (let i = 0; i < headers.length; i++) {
      if (colMap.amount !== i && colMap.date !== i) {
        colMap.description = i
        break
      }
    }
  }

  // If no amount column found, try to find one with numbers
  if (colMap.amount === -1 && lines.length > 1) {
    const sampleRow = lines[1].split(delimiter)
    for (let i = 0; i < sampleRow.length; i++) {
      if (parseAmount(sampleRow[i].trim().replace(/^["']|["']$/g, "")) !== null && colMap.description !== i) {
        colMap.amount = i
        break
      }
    }
  }

  // Parse rows
  const expenses: ParsedExpense[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ""))
    if (cols.length < 2 || cols.every((c) => !c)) continue

    const description = colMap.description >= 0 ? cols[colMap.description] || "" : `Expense ${i}`
    const amountStr = colMap.amount >= 0 ? cols[colMap.amount] || "0" : "0"
    const amount = parseAmount(amountStr)
    if (!amount || amount === 0) continue

    const dateStr = colMap.date >= 0 ? cols[colMap.date] || "" : ""
    const date = parseDate(dateStr) || new Date().toISOString().split("T")[0]

    const csvCategory = colMap.category >= 0 ? cols[colMap.category] || "" : ""
    // Try to match the CSV category to our categories, or detect from description
    const upperCat = csvCategory.toUpperCase().replace(/\s+/g, "_")
    const category = EXPENSE_CATEGORIES.includes(upperCat) ? upperCat : detectCategory(description)

    const vendor = colMap.vendor >= 0 ? cols[colMap.vendor] || undefined : undefined
    const notes = colMap.notes >= 0 ? cols[colMap.notes] || undefined : undefined

    expenses.push({ description, amount, category, date, vendor, notes })
  }

  return expenses
}

export function CsvImport({ tourId }: { tourId: string }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [parsed, setParsed] = useState<ParsedExpense[] | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const expenses = smartParseCsv(text)
      setParsed(expenses)
    }
    reader.readAsText(file)
  }

  function handleImport() {
    if (!parsed || parsed.length === 0) return

    startTransition(async () => {
      try {
        const result = await importExpensesFromCsv(tourId, parsed)
        toast.success(`${result.imported} expenses imported!`)
        setParsed(null)
        setFileName(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        router.refresh()
      } catch {
        toast.error("Failed to import expenses")
      }
    })
  }

  function handleCancel() {
    setParsed(null)
    setFileName(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          CSV Import
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Smart Parse
          </Badge>
        </CardTitle>
        <CardDescription>
          Upload a CSV file with expenses. The AI parser automatically detects columns,
          dates, amounts, and categories — supports German and English formats.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!parsed ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supported: CSV, TSV (comma, semicolon, or tab-separated).
              Headers like &quot;Description&quot;, &quot;Amount&quot;, &quot;Date&quot;, &quot;Category&quot;, &quot;Vendor&quot; are auto-detected.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="font-medium">{fileName}</span>
                <Badge variant="secondary">{parsed.length} expenses detected</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleImport} disabled={isPending || parsed.length === 0}>
                  <Check className="mr-1 h-4 w-4" />
                  {isPending ? "Importing..." : `Import ${parsed.length} Expenses`}
                </Button>
              </div>
            </div>

            {/* Preview table */}
            <div className="rounded-lg border overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Description</th>
                    <th className="text-right p-2 font-medium">Amount</th>
                    <th className="text-left p-2 font-medium">Date</th>
                    <th className="text-left p-2 font-medium">Category</th>
                    <th className="text-left p-2 font-medium">Vendor</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 20).map((exp, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 truncate max-w-[200px]">{exp.description}</td>
                      <td className="p-2 text-right tabular-nums font-medium">
                        ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-muted-foreground">{exp.date}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">{exp.category}</Badge>
                      </td>
                      <td className="p-2 text-muted-foreground truncate max-w-[150px]">
                        {exp.vendor || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.length > 20 && (
                <p className="text-xs text-muted-foreground p-2 text-center bg-muted">
                  ... and {parsed.length - 20} more
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
