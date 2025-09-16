package com.oleksii.surovtsev.typespeaklearnbackend.model

data class LanguageVariant<T>(
    val uk: T? = null,
    val en: T? = null,
    val ru: T? = null,
    val pl: T? = null,
) {
    fun asMap(): Map<String, T> = buildMap {
        uk?.let { put("uk", it) }
        en?.let { put("en", it) }
        ru?.let { put("ru", it) }
        pl?.let { put("pl", it) }
    }
}
