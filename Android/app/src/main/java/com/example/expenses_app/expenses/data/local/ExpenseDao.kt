package com.example.expenses_app.expenses.data.local

import androidx.lifecycle.LiveData
import androidx.room.*
import com.example.expenses_app.expenses.data.Expense


@Dao
interface ExpenseDao {
    @Query("SELECT * from expenses ORDER BY product ASC")
    fun getAll(): LiveData<List<Expense>>

    @Query("SELECT * FROM expenses WHERE _id=:id ")
    fun getById(id: String): LiveData<Expense>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(expense: Expense)

    @Update(onConflict = OnConflictStrategy.REPLACE)
    suspend fun update(expense: Expense)

    @Query("DELETE FROM expenses")
    suspend fun deleteAll()

}