package com.oleksii.surovtsev.typespeaklearnbackend.mock

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import com.oleksii.surovtsev.typespeaklearnbackend.model.AlphabetExerciseItem
import com.oleksii.surovtsev.typespeaklearnbackend.model.AlphabetLetter
import com.oleksii.surovtsev.typespeaklearnbackend.model.DictionaryExerciseItem
import com.oleksii.surovtsev.typespeaklearnbackend.model.ExerciseItem
import com.oleksii.surovtsev.typespeaklearnbackend.model.ExerciseType
import com.oleksii.surovtsev.typespeaklearnbackend.model.LanguageVariant
import com.oleksii.surovtsev.typespeaklearnbackend.model.SpeechBlock
import com.oleksii.surovtsev.typespeaklearnbackend.repository.SpeechContentRepository
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
class SpeechContentMockRepository(
    objectMapper: ObjectMapper,
) : SpeechContentRepository {

    private val blocks: List<SpeechBlock>
    private val blocksIndex: Map<String, SpeechBlock>

    init {
        val mapper = objectMapper.copy().registerModule(KotlinModule.Builder().build())
        val resourceStream = requireNotNull(javaClass.classLoader.getResourceAsStream(BLOCKS_RESOURCE)) {
            "Resource $BLOCKS_RESOURCE not found"
        }

        resourceStream.use {
            val document: BlocksDocument = mapper.readValue(it)
            blocks = document.summaries.map { summary ->
                val content = document.content[summary.id]
                summary.toDomain(content)
            }
        }

        blocksIndex = blocks.associateBy { it.id }
    }

    override fun findAll(): Flux<SpeechBlock> = Flux.fromIterable(blocks)

    override fun findById(id: String): Mono<SpeechBlock> = Mono.justOrEmpty(blocksIndex[id])

    private fun BlockSummaryResource.toDomain(content: BlockContentResource?): SpeechBlock {
        val blockType = ExerciseType.fromValue(content?.type ?: type)
        val effectiveTitle = content?.title ?: title
        val effectiveDescription = content?.description ?: description
        val exercises = content?.exercises?.map { it.toDomain() } ?: emptyList()

        return SpeechBlock(
            id = id,
            type = blockType,
            title = effectiveTitle.toLanguageVariant(),
            description = effectiveDescription.toLanguageVariant(),
            unlocked = unlocked,
            progress = progress,
            exercises = exercises,
        )
    }

    private fun ExerciseResource.toDomain(): ExerciseItem {
        return when (ExerciseType.fromValue(type)) {
            ExerciseType.DICTIONARY -> DictionaryExerciseItem(
                id = id,
                title = title.toLanguageVariant(),
                instructions = instructions.toLanguageVariant(),
                successMessages = successMessages.toLanguageVariantOrNull(),
                words = words.toLanguageVariantOrEmpty(),
            )

            ExerciseType.ALPHABET -> AlphabetExerciseItem(
                id = id,
                title = title.toLanguageVariant(),
                instructions = instructions.toLanguageVariant(),
                successMessages = successMessages.toLanguageVariantOrNull(),
                letters = letters.toLanguageVariantOrEmpty { list ->
                    list.map { it.toDomain() }
                },
            )
        }
    }

    private fun AlphabetLetterResource.toDomain(): AlphabetLetter = AlphabetLetter(
        letter = letter,
        uppercase = uppercase,
        lowercase = lowercase,
        transliteration = transliteration,
        audioUrl = audioUrl,
    )

    private fun <T> Map<String, T>.toLanguageVariant(): LanguageVariant<T> = LanguageVariant(
        uk = this["uk"],
        en = this["en"],
        ru = this["ru"],
        pl = this["pl"],
    )

    private fun <T> Map<String, T>?.toLanguageVariantOrNull(): LanguageVariant<T>? = this?.toLanguageVariant()

    private fun <T> Map<String, T>?.toLanguageVariantOrEmpty(): LanguageVariant<T> =
        this?.toLanguageVariant() ?: LanguageVariant()

    private fun <T, R> Map<String, T>?.toLanguageVariantOrEmpty(mapper: (T) -> R): LanguageVariant<R> =
        this?.mapValues { mapper(it.value) }?.toLanguageVariant() ?: LanguageVariant()

    private data class BlocksDocument(
        val summaries: List<BlockSummaryResource>,
        val content: Map<String, BlockContentResource> = emptyMap(),
    )

    private data class BlockSummaryResource(
        val id: String,
        val type: String,
        val title: Map<String, String>,
        val description: Map<String, String>,
        val unlocked: Boolean,
        val progress: Double,
    )

    private data class BlockContentResource(
        val id: String,
        val type: String,
        val title: Map<String, String>,
        val description: Map<String, String>,
        val exercises: List<ExerciseResource>,
    )

    private data class ExerciseResource(
        val id: String,
        val type: String,
        val title: Map<String, String>,
        val instructions: Map<String, String>,
        val successMessages: Map<String, String>?,
        val words: Map<String, List<String>>? = null,
        val letters: Map<String, List<AlphabetLetterResource>>? = null,
    )

    private data class AlphabetLetterResource(
        val letter: String,
        val uppercase: String? = null,
        val lowercase: String? = null,
        val transliteration: String? = null,
        val audioUrl: String? = null,
    )

    companion object {
        private const val BLOCKS_RESOURCE = "mock/blocks.json"
    }
}
