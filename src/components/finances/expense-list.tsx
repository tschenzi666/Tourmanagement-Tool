"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatExpenseCategory, getCategoryEmoji } from "@/lib/validations/finance"
import { deleteExpense, toggleExpenseReimbursed } from "@/lib/actions/finance-actions"
import { format } from "date-fns"
import { Check, Trash2, X } from "lucide-react"

interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  category: string
  date: Date
  vendor: string | null
  notes: string | null
  isReimbursed: boolean
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
}

export function ExpenseList({ expenses, tourId }: { expenses: Expense[]; tourId: string }) {
  if (expenses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No expenses recorded yet. Click &quot;Add Expense&quot; to start tracking.
      </p>
    )
  }

  return (
    <div className="divide-y">
      {expenses.map((expense) => {
        const symbol = currencySymbols[expense.currency] || expense.currency
        return (
          <div
            key={expense.id}
            className="flex items-center gap-4 py-3 px-2"
          >
            <div className="text-2xl">
              {getCategoryEmoji(expense.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{expense.description}</p>
                {expense.isReimbursed && (
                  <Badge variant="default" className="text-xs bg-green-600">
                    Reimbursed
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                <span>{formatExpenseCategory(expense.category)}</span>
                <span>·</span>
                <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                {expense.vendor && (
                  <>
                    <span>·</span>
                    <span>{expense.vendor}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold tabular-nums">
                {symbol}{Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-1">
              <form action={toggleExpenseReimbursed.bind(null, tourId, expense.id)}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  type="submit"
                  title={expense.isReimbursed ? "Mark as not reimbursed" : "Mark as reimbursed"}
                >
                  {expense.isReimbursed ? (
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  )}
                </Button>
              </form>
              <form action={deleteExpense.bind(null, tourId, expense.id)}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  type="submit"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </div>
        )
      })}
    </div>
  )
}
