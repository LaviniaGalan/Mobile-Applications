package com.example.expenses_app.expenses.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.*

@Entity(tableName = "expenses")
data class Expense(
    @PrimaryKey @ColumnInfo(name = "_id") var _id: String,
    @ColumnInfo(name = "product") var product: String,
    @ColumnInfo(name = "price") var price: Int,
    @ColumnInfo(name = "date") var date: Date,
    @ColumnInfo(name = "withCreditCard") var withCreditCard: Boolean
) {
    override fun toString(): String = product
}
