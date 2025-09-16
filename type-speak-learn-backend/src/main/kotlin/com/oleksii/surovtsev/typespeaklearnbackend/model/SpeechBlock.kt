package com.oleksii.surovtsev.typespeaklearnbackend.model

data class SpeechBlock(
    val id: String,
    val type: ExerciseType,
    val title: LanguageVariant<String>,
    val description: LanguageVariant<String>,
    val unlocked: Boolean,
    val progress: Double,
    val exercises: List<ExerciseItem>,
)
