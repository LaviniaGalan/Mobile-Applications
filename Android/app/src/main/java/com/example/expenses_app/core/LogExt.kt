package com.example.expenses_app.core

val Any.TAG: String
    get() {
        val tag = javaClass.simpleName
        return if (tag.length <= 25) tag else tag.substring(0, 25)
    }