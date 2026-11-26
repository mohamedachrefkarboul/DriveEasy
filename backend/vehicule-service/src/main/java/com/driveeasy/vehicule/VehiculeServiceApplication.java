package com.driveeasy.vehicule;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Microservice Vehicule - DriveEasy
 * Port : 8081
 * Gère le parc automobile, les catégories et la disponibilité des véhicules.
 * Données en RAM (interdiction de base de données externe).
 */
@SpringBootApplication
@EnableDiscoveryClient
public class VehiculeServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(VehiculeServiceApplication.class, args);
    }
}
