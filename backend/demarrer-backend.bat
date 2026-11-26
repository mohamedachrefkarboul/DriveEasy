@echo off
title DriveEasy - Lancement Global Backend
echo ========================================================
echo   DriveEasy - Demarrage des Microservices Backend
echo ========================================================

echo 1. Lancement de Zipkin (Docker)...
docker compose up -d

echo 2. Lancement du Service Registry (Eureka : 8761)...
start "Service Registry (8761)" cmd /k "cd service-registry && mvn spring-boot:run"
timeout /t 12 /nobreak >nul

echo 3. Lancement du Config Server (8888)...
start "Config Server (8888)" cmd /k "cd config-server && mvn spring-boot:run"
timeout /t 10 /nobreak >nul

echo 4. Lancement des Microservices Metier...
start "Vehicule Service (8081)" cmd /k "cd vehicule-service && mvn spring-boot:run"
start "Client Service (8082)" cmd /k "cd client-service && mvn spring-boot:run"
start "Location Service (8083)" cmd /k "cd location-service && mvn spring-boot:run"
timeout /t 12 /nobreak >nul

echo 5. Lancement de l'API Gateway (8080)...
start "API Gateway (8080)" cmd /k "cd api-gateway && mvn spring-boot:run"

echo ========================================================
echo Tous les services sont en cours de demarrage !
echo - Eureka Dashboard : http://localhost:8761
echo - API Gateway      : http://localhost:8080
echo - Zipkin UI        : http://localhost:9411
echo ========================================================
pause
