package com.oleksii.surovtsev.typespeaklearnbackend.model

import com.fasterxml.jackson.annotation.JsonValue

enum class ExerciseType(@get:JsonValue val value: String) {
    DICTIONARY("dictionary"),
    ALPHABET("alphabet");

    companion object {
        fun fromValue(value: String): ExerciseType =
            entries.firstOrNull { it.value == value }
                ?: error("Unsupported exercise type: $value")
    }
}
