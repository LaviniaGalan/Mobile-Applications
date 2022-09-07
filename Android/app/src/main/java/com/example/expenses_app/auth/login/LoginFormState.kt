package com.example.expenses_app.auth.login

data class LoginFormState(
    val usernameError: Int? = null,
    val passwordError: Int? = null,
    val isDataValid: Boolean = false
)