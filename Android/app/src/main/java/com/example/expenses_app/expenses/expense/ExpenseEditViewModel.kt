package com.example.expenses_app.expenses.expense

import android.app.Application
import android.util.Log
import androidx.lifecycle.*
import androidx.work.*
import com.example.expenses_app.core.TAG
import com.example.expenses_app.expenses.data.Expense
import com.example.expenses_app.expenses.data.ExpenseRepository
import kotlinx.coroutines.launch
import com.example.expenses_app.core.Result
import com.example.expenses_app.expenses.data.SyncWorker
import com.example.expenses_app.expenses.data.local.ExpensesDatabase
import java.util.*

class ExpenseEditViewModel(application: Application) : AndroidViewModel(application) {

    private val mutableExpense = MutableLiveData<Expense>().apply { value = Expense("", "", 0, Date(),false) }

    private val mutableFetching = MutableLiveData<Boolean>().apply { value = false }
    private val mutableCompleted = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val expense: LiveData<Expense> = mutableExpense

    val fetching: LiveData<Boolean> = mutableFetching
    val fetchingError: LiveData<Exception> = mutableException
    val completed: LiveData<Boolean> = mutableCompleted

    val expenseRepository: ExpenseRepository
    init {
        val expenseDao = ExpensesDatabase.getDatabase(application, viewModelScope).expenseDao()
        expenseRepository = ExpenseRepository(expenseDao)
    }

    private val TAG_OUTPUT = "OUTPUT"
    //private val workManager = WorkManager.getInstance(application)


    fun getExpenseById(expenseId: String): LiveData<Expense> {
        Log.v(TAG, "getExpenseById...")
        return expenseRepository.getById(expenseId)
    }

    fun saveOrUpdateExpense(expense: Expense) {
        viewModelScope.launch {
            Log.v(TAG, "saveOrUpdateExpense...");

            mutableFetching.value = true
            mutableException.value = null

            val result: Result<Expense>
            var operation = ""

            if (expense._id.isNotEmpty()) {
                operation = "update"
                result = expenseRepository.update(expense)
            } else {
                var id = generateRandomString(10)
                expense._id = id
                operation = "save"
                result = expenseRepository.save(expense)
            }
            when (result) {
                is Result.Success -> {
                    Log.d(TAG, "saveOrUpdateExpense succeeded");
                }
                is Result.Error -> {
                    Log.w(TAG, "saveOrUpdateExpense failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableCompleted.value = true
            mutableFetching.value = false
        }
    }

    fun generateRandomString(length: Int) : String {
        val allowedChars = ('A'..'Z') + ('a'..'z') + ('0'..'9')
        return (1..length)
            .map { allowedChars.random() }
            .joinToString("")
    }


    // create a worker to synchronize the data as soon as possible
    private fun createJob(operation: String, expense: Expense): OneTimeWorkRequest {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val inputData = Data.Builder()
            .putString("operation", operation)
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
            .addTag(TAG_OUTPUT)
            .build()

        return myWork
    }
}

