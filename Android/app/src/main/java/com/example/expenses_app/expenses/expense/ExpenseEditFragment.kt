package com.example.expenses_app.expenses.expense

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import androidx.work.WorkInfo
import androidx.work.WorkManager
import com.example.expenses_app.auth.login.afterTextChanged
import com.example.expenses_app.core.TAG
import com.example.expenses_app.databinding.FragmentExpenseEditBinding
import com.example.expenses_app.expenses.data.Expense
import java.util.*
import java.util.Calendar.*
import androidx.lifecycle.Observer
import com.example.expenses_app.R


/**
 * A simple [Fragment] subclass as the second destination in the navigation.
 */
class ExpenseEditFragment : Fragment() {

    companion object {
        const val EXPENSE_ID = "EXPENSE_ID"
    }

    private lateinit var viewModel: ExpenseEditViewModel
    private var expenseId: String? = null
    private var expense: Expense? = null

    private var _binding: FragmentExpenseEditBinding? = null

    private val binding get() = _binding!!


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        Log.i(TAG, "onCreateView")
        arguments?.let {
            if (it.containsKey(EXPENSE_ID)) {
                expenseId = it.getString(EXPENSE_ID).toString()
            }
        }

        _binding = FragmentExpenseEditBinding.inflate(inflater, container, false)
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        Log.i(TAG, "onViewCreated")
        setupViewModel()
        binding.fab.setOnClickListener {
            Log.v(TAG, "Save expense")

            val product = binding.expenseProduct.text.toString()

            if(product.isEmpty()){
                Toast.makeText(activity, "Product cannot be empty!", Toast.LENGTH_LONG).show()
                animateProductView()
                return@setOnClickListener
            }

            val priceString = binding.expensePrice.text.toString()
            val onlyDigits = priceString.all { it in '0'..'9'}
            if(! onlyDigits || Integer.parseInt(priceString) == 0){

                Toast.makeText(activity, "Invalid price - it must contain only digits and be greater than 0!", Toast.LENGTH_LONG).show()
                animatePriceView()
            }
            else{
                val price = Integer.parseInt(priceString)
                val day: Int = binding.expenseDate.dayOfMonth
                val month: Int = binding.expenseDate.month
                val year: Int = binding.expenseDate.year
                val calendar: Calendar = Calendar.getInstance()
                calendar.set(year, month, day)
                val date = calendar.time
                val withCreditCard = binding.expenseWithCreditCard.isChecked

                val e = expense
                if(e != null){
                    e.product = product
                    e.price = price
                    e.date = date
                    e.withCreditCard = withCreditCard

                    viewModel.saveOrUpdateExpense(e)
                }

            }

        }

    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
        Log.i(TAG, "onDestroyView")
    }


    private fun animatePriceView() {
        ValueAnimator.ofFloat(0f, 200f, 0f).apply {
            duration = 500
            repeatCount = 3
            start()
            addUpdateListener {
                binding.expensePrice.translationX = it.animatedValue as Float
            }
        }
    }

    private fun animateProductView(){
        binding.expenseProduct.apply {
            translationX = 0f
            visibility = View.VISIBLE
            animate().rotation(36000f)
                .setDuration(1000)
                .setListener(null)
        }
    }


    private fun setupViewModel() {
        viewModel = ViewModelProvider(this).get(ExpenseEditViewModel::class.java)

        viewModel.expense.observe(viewLifecycleOwner, { expense ->
            Log.v(TAG, "update items")
            binding.expenseProduct.setText(expense.product)
            binding.expensePrice.setText(expense.price.toString())
            binding.expenseWithCreditCard.isChecked = expense.withCreditCard


            val calendar = Calendar.getInstance()
            calendar.time = expense.date

            binding.expenseDate.updateDate(calendar.get(YEAR), calendar.get(MONTH), calendar.get(
                DAY_OF_MONTH))

        })

        viewModel.fetching.observe(viewLifecycleOwner, { fetching ->
            Log.v(TAG, "update fetching")
            binding.progress.visibility = if (fetching) View.VISIBLE else View.GONE
        })

        viewModel.fetchingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.v(TAG, "update fetching error")
                val message = "Fetching exception ${exception.message}"
                val parentActivity = activity?.parent
                if (parentActivity != null) {
                    Toast.makeText(parentActivity, message, Toast.LENGTH_SHORT).show()
                }
            }
        })

        viewModel.completed.observe(viewLifecycleOwner, { completed ->
            if (completed) {
                Log.v(TAG, "completed, navigate back")
                findNavController().navigate(R.id.action_ExpenseEditFragment_to_ExpenseListFragment)
            }
        })


        val id = expenseId
        if (id == null) {
            expense = Expense("", "", 0, Date(), false)
        } else {
            viewModel.getExpenseById(id).observe(viewLifecycleOwner, { exp ->
                Log.v(TAG, "update expenses")
                if (exp != null) {
                    expense = exp
                    binding.expenseProduct.setText(exp.product)
                    binding.expensePrice.setText(exp.price.toString())
                    binding.expenseWithCreditCard.isChecked = exp.withCreditCard
                    val calendar = Calendar.getInstance()
                    calendar.time = exp.date

                    binding.expenseDate.updateDate(calendar.get(YEAR), calendar.get(MONTH), calendar.get(
                        DAY_OF_MONTH))
                }
            })
        }
    }


}