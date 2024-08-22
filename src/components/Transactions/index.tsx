import { useCallback, useContext } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"
import { AppContext } from "src/utils/context"

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch()
  const { cache } = useContext(AppContext)
  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })

      // Removing Cache valye from paginatedTransactions
      const key = `paginatedTransactions@{"page":0}`
      const cachedValue = cache?.current.get(key)
      if (cachedValue && cache) {
        const parsedValue = JSON.parse(cachedValue)
        parsedValue.data.forEach((element: any) => {
          if (element.id === transactionId) {
            element.approved = newValue
          }
        })
        cache.current.set(key, JSON.stringify(parsedValue))
      } else {
        if (cache) {
          cache.current.clear()
        }
      }

      // Removing Cache valye from transactionsByEmployee
      const employeeKey = `transactionsByEmployee@{"employeeId":"89bd9324-04e0-4cd6-aa27-981508bd219f"}`
      const employeecachedValue = cache?.current.get(employeeKey)
      if (employeecachedValue && cache) {
        const parsedValue = JSON.parse(employeecachedValue)
        console.log(parsedValue)
        parsedValue.forEach((element: any) => {
          if (element.id === transactionId) {
            element.approved = newValue
          }
        })
        cache.current.set(employeeKey, JSON.stringify(parsedValue))
      } else {
        if (cache) {
          cache.current.clear()
        }
      }
    },
    [fetchWithoutCache]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
