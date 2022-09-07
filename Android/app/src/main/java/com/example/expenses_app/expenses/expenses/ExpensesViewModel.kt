package com.example.expenses_app.expenses.expenses

import android.app.Application
import android.util.Log
import androidx.lifecycle.*
import com.example.expenses_app.core.TAG
import com.example.expenses_app.expenses.data.Expense
import com.example.expenses_app.expenses.data.ExpenseRepository
import kotlinx.coroutines.launch
import com.example.expenses_app.core.Result
import com.example.expenses_app.expenses.data.local.ExpensesDatabase

class ExpenseListViewModel(application: Application) : AndroidViewModel(application) {
    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val expenses: LiveData<List<Expense>>
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException

    val expenseRepository: ExpenseRepository

    init {
        val expenseDao = ExpensesDatabase.getDatabase(application, viewModelScope).expenseDao()
        expenseRepository = ExpenseRepository(expenseDao)
        expenses = expenseRepository.expenses
    }

    fun refresh() {
        viewModelScope.launch {
            Log.v(TAG, "refresh...");
            mutableLoading.value = true
            mutableException.value = null
            when (val result = expenseRepository.refresh()) {
                is Result.Success -> {
                    Log.d(TAG, "refresh succeeded");
                }
                is Result.Error -> {
                    Log.w(TAG, "refresh failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableLoading.value = false
        }
    }

}