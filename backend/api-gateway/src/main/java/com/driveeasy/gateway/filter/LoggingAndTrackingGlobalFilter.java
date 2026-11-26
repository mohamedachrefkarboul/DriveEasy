package com.driveeasy.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Filtre personnalisé Spring Cloud Gateway.
 * Intercepte chaque requête entrante, lui attribue un identifiant unique (X-Request-Trace-Id)
 * et mesure le temps de réponse pour l'observabilité.
 */
@Component
public class LoggingAndTrackingGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(LoggingAndTrackingGlobalFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis();
        String traceId = UUID.randomUUID().toString();

        ServerHttpRequest request = exchange.getRequest().mutate()
                .header("X-Request-Trace-Id", traceId)
                .build();

        log.info("[GATEWAY-IN] TraceId: {} | {} {}",
                traceId, request.getMethod(), request.getURI().getPath());

        return chain.filter(exchange.mutate().request(request).build()).then(Mono.fromRunnable(() -> {
            long duration = System.currentTimeMillis() - startTime;
            log.info("[GATEWAY-OUT] TraceId: {} | Status: {} | Durée: {} ms",
                    traceId, exchange.getResponse().getStatusCode(), duration);
        }));
    }

    @Override
    public int getOrder() {
        return -1; // Priorité élevée pour s'exécuter avant les autres filtres
    }
}
