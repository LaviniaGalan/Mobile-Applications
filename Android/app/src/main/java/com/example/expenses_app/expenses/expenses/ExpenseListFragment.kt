package com.example.expenses_app.expenses.expenses

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat.getSystemService
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.expenses_app.MainActivity
import com.example.expenses_app.R
import com.example.expenses_app.auth.data.AuthRepository
import com.example.expenses_app.core.TAG
import com.example.expenses_app.databinding.FragmentExpenseListBinding

/**
 * A simple [Fragment] subclass as the default destination in the navigation.
 */
class ExpenseListFragment : Fragment() {

    private lateinit var expensesListAdapter: ExpensesListAdapter
    private lateinit var expensesModel: ExpenseListViewModel

    private var _binding: FragmentExpenseListBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    val CHANNEL_ID = "CHANNEL_ID"
    var onStart = true

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        Log.i(TAG, "onCreateView")
        _binding = FragmentExpenseListBinding.inflate(inflater, container, false)
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        Log.i(TAG, "onViewCreated")
        if (!AuthRepository.isLoggedIn) {
            findNavController().navigate(R.id.FragmentLogin)
            return;
        }
        setupExpenseList()
        binding.fab.setOnClickListener {
            Log.v(TAG, "Add new expense")
            findNavController().navigate(R.id.action_ExpenseListFragment_to_ExpenseEditFragment)
        }


        //createNotificationChannel()
        //createNotification()


    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
        Log.i(TAG, "onDestroyView")
    }

    private fun setupExpenseList() {
        expensesListAdapter = ExpensesListAdapter(this)
        binding.expensesList.adapter = expensesListAdapter
        expensesModel = ViewModelProvider(this).get(ExpenseListViewModel::class.java)

        expensesModel.expenses.observe(viewLifecycleOwner, { value ->
            Log.i(TAG, "update expenses")
            expensesListAdapter.expenses = value
        })

        expensesModel.loading.observe(viewLifecycleOwner, { loading ->
            Log.i(TAG, "update loading")
            binding.progress.visibility = if (loading) View.VISIBLE else View.GONE
        })

        expensesModel.loadingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.i(TAG, "update loading error")
                val message = "Loading exception ${exception.message}"
                Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
            }
        })

        expensesModel.refresh()

    }

    private fun createNotification() {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent: PendingIntent = PendingIntent.getActivity(activity, 0, intent, 0)
        val builder = context?.let {
            NotificationCompat.Builder(it, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentTitle("Welcome!")
                .setContentText("Bine ai venit!")
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                //.setContentIntent(pendingIntent)
                .setAutoCancel(true)
        }
        with(NotificationManagerCompat.from(requireContext())) {
            if (builder != null) {
                notify(1, builder.build())
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "My channel name"
            val descriptionText = "My channel description"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            val notificationManager: NotificationManager =
                activity?.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}