package com.example.expenses_app.expenses.data.remote

import com.example.expenses_app.core.Api
import com.example.expenses_app.expenses.data.Expense
import retrofit2.Call
import retrofit2.http.*

object ExpenseApi {
    interface Service {
        @GET("api/expense")
        suspend fun find(): List<Expense>

        @GET("/api/expense/{id}")
        suspend fun read(@Path("id") expenseId: String): Expense;

        @Headers("Content-Type: application/json")
        @POST("/api/expense")
        suspend fun create(@Body expense: Expense): Expense

        @Headers("Content-Type: application/json")
        @PUT("/api/expense/{id}")
        suspend fun update(@Path("id") expenseId: String, @Body expense: Expense): Expense

    }

    val service: Service = Api.retrofit.create(Service::class.java)
}