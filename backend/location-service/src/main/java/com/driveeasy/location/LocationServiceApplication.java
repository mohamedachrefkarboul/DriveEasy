package com.driveeasy.location;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * Microservice Location - DriveEasy
 * Port : 8083
 * Gère le cycle de vie des locations et orchestre les appels vers vehicule-service et client-service.
 * Données en RAM (interdiction de base de données externe).
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class LocationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LocationServiceApplication.class, args);
    }
}
