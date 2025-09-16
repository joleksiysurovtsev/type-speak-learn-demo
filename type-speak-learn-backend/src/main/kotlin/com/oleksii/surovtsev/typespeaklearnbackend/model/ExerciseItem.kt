package com.oleksii.surovtsev.typespeaklearnbackend.model

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type",
    visible = true,
)
@JsonSubTypes(
    JsonSubTypes.Type(value = DictionaryExerciseItem::class, name = "dictionary"),
    JsonSubTypes.Type(value = AlphabetExerciseItem::class, name = "alphabet"),
)
sealed interface ExerciseItem {
    val id: String
    val type: ExerciseType
    val title: LanguageVariant<String>
    val instructions: LanguageVariant<String>
    val successMessages: LanguageVariant<String>?
}

data class DictionaryExerciseItem(
    override val id: String,
    override val type: ExerciseType = ExerciseType.DICTIONARY,
    override val title: LanguageVariant<String>,
    override val instructions: LanguageVariant<String>,
    override val successMessages: LanguageVariant<String>? = null,
    val words: LanguageVariant<List<String>>,
) : ExerciseItem

data class AlphabetExerciseItem(
    override val id: String,
    override val type: ExerciseType = ExerciseType.ALPHABET,
    override val title: LanguageVariant<String>,
    override val instructions: LanguageVariant<String>,
    override val successMessages: LanguageVariant<String>? = null,
    val letters: LanguageVariant<List<AlphabetLetter>>,
) : ExerciseItem
