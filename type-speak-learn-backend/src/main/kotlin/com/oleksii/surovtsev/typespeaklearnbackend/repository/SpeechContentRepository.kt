package com.oleksii.surovtsev.typespeaklearnbackend.repository

import com.oleksii.surovtsev.typespeaklearnbackend.model.SpeechBlock
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface SpeechContentRepository {
    fun findAll(): Flux<SpeechBlock>
    fun findById(id: String): Mono<SpeechBlock>
}
