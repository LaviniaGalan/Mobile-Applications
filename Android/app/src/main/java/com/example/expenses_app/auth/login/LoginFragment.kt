package com.example.expenses_app.auth.login

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.example.expenses_app.MainActivity
import com.example.expenses_app.R
import com.example.expenses_app.core.TAG
import com.example.expenses_app.databinding.FragmentLoginBinding
import com.example.expenses_app.core.Result

class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: LoginViewModel

    val CHANNEL_ID = "CHANNEL_ID"

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        Log.i(TAG, "onCreateView")
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")
        viewModel = ViewModelProvider(this).get(LoginViewModel::class.java)
        setupLoginForm()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        Log.i(TAG, "onDestroyView")
        _binding = null
    }

    private fun setupLoginForm() {
        viewModel.loginFormState.observe(viewLifecycleOwner, { loginState ->
            binding.login.isEnabled = loginState.isDataValid
            if (loginState.usernameError != null) {
                binding.username.error = getString(loginState.usernameError)
            }
            if (loginState.passwordError != null) {
                binding.password.error = getString(loginState.passwordError)
            }
        })
        viewModel.loginResult.observe(viewLifecycleOwner, { loginResult ->
            binding.loading.visibility = View.GONE
            if (loginResult is Result.Success<*>) {
                findNavController().navigate(R.id.ExpenseListFragment)
                createNotificationChannel()
                createNotification()
            } else if (loginResult is Result.Error) {
                binding.errorText.text = "Login error ${loginResult.exception.message}"
                binding.errorText.visibility = View.VISIBLE
            }
        })
        binding.username.afterTextChanged {
            viewModel.loginDataChanged(
                binding.username.text.toString(),
                binding.password.text.toString()
            )
        }
        binding.password.afterTextChanged {
            viewModel.loginDataChanged(
                binding.username.text.toString(),
                binding.password.text.toString()
            )
        }
        binding.login.setOnClickListener {
            binding.loading.visibility = View.VISIBLE
            binding.errorText.visibility = View.GONE
            viewModel.login(binding.username.text.toString(), binding.password.text.toString())
        }
    }



    fun createNotification() {
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

    fun createNotificationChannel() {
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

fun EditText.afterTextChanged(afterTextChanged: (String) -> Unit) {
    this.addTextChangedListener(object : TextWatcher {
        override fun afterTextChanged(editable: Editable?) {
            afterTextChanged.invoke(editable.toString())
        }

        override fun beforeTextChanged(s: CharSequence, start: Int, count: Int, after: Int) {}
        override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {}
    })
}
