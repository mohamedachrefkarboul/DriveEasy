package com.driveeasy.client;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Microservice Client - DriveEasy
 * Port : 8082
 * Gère les clients, leurs informations d'identité et la validité du permis.
 * Données en RAM (interdiction de base de données externe).
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ClientServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClientServiceApplication.class, args);
    }
}
