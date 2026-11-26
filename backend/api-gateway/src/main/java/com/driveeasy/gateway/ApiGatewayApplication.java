package com.driveeasy.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

/**
 * API Gateway - Point d'entrée unique de la plateforme DriveEasy
 * Port : 8080
 * Assure le routage vers les microservices, la gestion du CORS pour Angular et les filtres d'observabilité.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // --- VEHICULE SERVICE (port 8081) ---
                .route("vehicules-api-sub", r -> r.path("/api/vehicules/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8081"))
                .route("vehicules-api-base", r -> r.path("/api/vehicules")
                        .filters(f -> f.setPath("/vehicules"))
                        .uri("http://localhost:8081"))
                .route("vehicules-direct", r -> r.path("/vehicules/**", "/vehicules")
                        .uri("http://localhost:8081"))

                // --- CLIENT SERVICE (port 8082) ---
                .route("clients-api-sub", r -> r.path("/api/clients/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8082"))
                .route("clients-api-base", r -> r.path("/api/clients")
                        .filters(f -> f.setPath("/clients"))
                        .uri("http://localhost:8082"))
                .route("clients-direct", r -> r.path("/clients/**", "/clients")
                        .uri("http://localhost:8082"))

                // --- LOCATION SERVICE (port 8083) ---
                .route("locations-api-sub", r -> r.path("/api/locations/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8083"))
                .route("locations-api-base", r -> r.path("/api/locations")
                        .filters(f -> f.setPath("/locations"))
                        .uri("http://localhost:8083"))
                .route("locations-direct", r -> r.path("/locations/**", "/locations")
                        .uri("http://localhost:8083"))

                .build();
    }
}
