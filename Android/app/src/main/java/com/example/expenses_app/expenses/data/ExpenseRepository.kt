package com.example.expenses_app.expenses.data

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.work.*
import com.example.expenses_app.core.TAG
import com.example.expenses_app.core.Result
import com.example.expenses_app.expenses.data.local.ExpenseDao
import com.example.expenses_app.expenses.data.remote.ExpenseApi

class ExpenseRepository(private val expenseDao: ExpenseDao) {

    val expenses = expenseDao.getAll();


    suspend fun refresh(): Result<Boolean>{
        try{
            val expenses = ExpenseApi.service.find()
            for(expense in expenses){
                expenseDao.insert(expense)
            }
            return Result.Success(true)
        } catch (e: java.lang.Exception){
            return Result.Error(e)
        }
    }


    fun getById(expenseId: String): LiveData<Expense>{
        return expenseDao.getById(expenseId)
    }


    suspend fun save(expense: Expense): Result<Expense> {
        try {
            Log.v(TAG, "save - started")
            val createdExpense = ExpenseApi.service.create(expense)
            expenseDao.insert(createdExpense)
            Log.v(TAG, "save - succeeded")
            return Result.Success(createdExpense)
        } catch (e: Exception) {
            Log.w(TAG, "save - failed", e)

            expenseDao.insert(expense)

            createWorker(expense, "save")
            return Result.Error(e)
        }
    }

    suspend fun update(expense: Expense): Result<Expense> {
        try {
            Log.v(TAG, "update - started")
            val updatedExpense = ExpenseApi.service.update(expense._id, expense)
            expenseDao.update(updatedExpense)
            Log.v(TAG, "update - succeeded")
            return Result.Success(updatedExpense)
        } catch (e: Exception) {
            Log.v(TAG, "update - failed")
            expenseDao.update(expense)
            createWorker(expense, "update")
            return Result.Error(e)
        }
    }

    fun createWorker(expense: Expense, operation: String){
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val inputData = Data.Builder()
            .putString("operation", "save")
            .putString("id", expense._id)
            .putString("product", expense.product)
            .putInt("price", expense.price)
            .putBoolean("withCreditCard", expense.withCreditCard)
            .putInt("dateDay", expense.date.day)
            .putInt("dateMonth", expense.date.month)
            .putInt("dateYear", expense.date.year)
            .build()

        val myWork = OneTimeWorkRequest.Builder(SyncWorker::class.java)
            .setConstraints(constraints)
            .setInputData(inputData)
            .build()

        WorkManager.getInstance().enqueue(myWork);
    }

}