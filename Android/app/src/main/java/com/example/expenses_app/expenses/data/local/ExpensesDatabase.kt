package com.example.expenses_app.expenses.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.expenses_app.expenses.data.Expense
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(entities = [Expense::class], version = 1)
@TypeConverters(Converters::class)
abstract class ExpensesDatabase : RoomDatabase() {

    abstract fun expenseDao(): ExpenseDao

    companion object {
        @Volatile
        private var INSTANCE: ExpensesDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): ExpensesDatabase {
            val inst = INSTANCE
            if (inst != null) {
                return inst
            }
            val instance =
                Room.databaseBuilder(
                    context.applicationContext,
                    ExpensesDatabase::class.java,
                    "expenses_db"
                )
                    //.addCallback(WordDatabaseCallback(scope))
                    .build()
            INSTANCE = instance
            return instance
        }

//        private class WordDatabaseCallback(private val scope: CoroutineScope) :
//            RoomDatabase.Callback() {
//
//            override fun onOpen(db: SupportSQLiteDatabase) {
//                super.onOpen(db)
//                INSTANCE?.let { database ->
//                    scope.launch(Dispatchers.IO) {
//                        populateDatabase(database.expenseDao())
//                    }
//                }
//            }
//        }
//
//        suspend fun populateDatabase(expenseDao: ExpenseDao) {
////            expenseDao.deleteAll()
////            val expense = Expense("1", "Hello", 0, false)
////            expenseDao.insert(expense)
//        }
    }

}