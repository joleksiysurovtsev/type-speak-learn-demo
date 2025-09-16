package com.oleksii.surovtsev.typespeaklearnbackend.model

data class AlphabetLetter(
    val letter: String,
    val uppercase: String? = null,
    val lowercase: String? = null,
    val transliteration: String? = null,
    val audioUrl: String? = null,
)
