package com.example.expenses_app.expenses.data

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.example.expenses_app.core.TAG
import com.example.expenses_app.expenses.data.remote.ExpenseApi
import java.util.*

class SyncWorker (context: Context,
                  workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val operation = inputData.getString("operation")
        val id = inputData.getString("id").orEmpty()
        val product = inputData.getString("product").orEmpty()
        val price = inputData.getInt("price", 0)
        val withCreditCard = inputData.getBoolean("withCreditCard", false)
        val dateDay = inputData.getInt("dateDay", 1)
        val dateMonth = inputData.getInt("dateMonth", 1)
        val dateYear = inputData.getInt("dateYear", 2022)
        val date = Date(dateYear, dateMonth, dateDay)

        val e = Expense(id, product, price, date, withCreditCard)

        try {
            Log.v(TAG, "sync - started")
            if(operation.equals("save")){
                val createdExpense = ExpenseApi.service.create(e)
            }
            else if(operation.equals("update")){
                val updatedExpense = ExpenseApi.service.update(id, e)
            }

            Log.v(TAG, "sync - succeeded")
            return Result.success()
        } catch (e: Exception) {
            Log.w(TAG, "sync - failed", e)
            return Result.failure()
        }

    }

}
