package com.example.expenses_app.expenses.expenses

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.expenses_app.R
import com.example.expenses_app.core.TAG
import com.example.expenses_app.expenses.data.Expense
import com.example.expenses_app.expenses.expense.ExpenseEditFragment
import java.time.Year
import java.util.*

class ExpensesListAdapter(
    private val fragment: Fragment,
) : RecyclerView.Adapter<ExpensesListAdapter.ViewHolder>() {

    var expenses = emptyList<Expense>()
        set(value) {
            field = value
            notifyDataSetChanged();
        }

    private var onExpenseClick: View.OnClickListener = View.OnClickListener { view ->
        val expense = view.tag as Expense

        fragment.findNavController().navigate(R.id.action_ExpenseListFragment_to_ExpenseEditFragment, Bundle().apply {
            putString(ExpenseEditFragment.EXPENSE_ID, expense._id)
        })
    };

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.view_expense, parent, false)
        Log.v(TAG, "onCreateViewHolder")
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        Log.v(TAG, "onBindViewHolder $position")

        val expense = expenses[position]
        holder.productView.text = expense.product
        holder.priceView.text = expense.price.toString()

        val calendar = Calendar.getInstance()
        calendar.time = expense.date
        val dateString = calendar.get(Calendar.DAY_OF_MONTH).toString() + " " +
                calendar.getDisplayName(Calendar.MONTH, Calendar.LONG, Locale.getDefault()) + " " +
                calendar.get(Calendar.YEAR).toString()

        holder.date.text = dateString

        holder.withCreditCardView.text = if (expense.withCreditCard) "With credit card" else "With cash"

        holder.itemView.tag = expense
        holder.itemView.setOnClickListener(onExpenseClick)
    }

    override fun getItemCount() = expenses.size

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val productView: TextView
        val priceView: TextView
        val withCreditCardView: TextView
        val date: TextView

        init {
            productView = view.findViewById(R.id.product)
            priceView = view.findViewById(R.id.price)
            withCreditCardView = view.findViewById(R.id.with_credit_card)
            date = view.findViewById(R.id.date)
        }
    }
}