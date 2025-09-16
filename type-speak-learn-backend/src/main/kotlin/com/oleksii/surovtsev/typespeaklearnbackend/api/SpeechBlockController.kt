package com.oleksii.surovtsev.typespeaklearnbackend.api

import com.oleksii.surovtsev.typespeaklearnbackend.model.SpeechBlock
import com.oleksii.surovtsev.typespeaklearnbackend.repository.SpeechContentRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/blocks")
class SpeechBlockController(
    private val repository: SpeechContentRepository,
) {
    @GetMapping
    fun getBlocks(): Flux<SpeechBlock> = repository.findAll()

    @GetMapping("/{id}")
    fun getBlockById(@PathVariable id: String): Mono<ResponseEntity<SpeechBlock>> =
        repository.findById(id)
            .map { ResponseEntity.ok(it) }
            .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()))
}
