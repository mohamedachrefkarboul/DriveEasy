# DriveEasy — Plateforme de Location de Véhicules

> Projet Web — LIM3 B
> SESAME University  

## Architecture
- **Backend**:Spring Boot + Spring Cloud (Eureka, Config Server, API Gateway, OpenFeign)
- **Frontend**:Angular 19 Standalone Components

## Services
| Service | Port |
|---------|------|
| Eureka Server | 8761 |
| Config Server | 8888 |
| Véhicule Service | 8081 |
| Client Service | 8082 |
| Location Service | 8083 |
| API Gateway | 8080 |

## Règles métier
- Stockage RAM uniquement (ConcurrentHashMap)
- Âge minimum : 21 ans
- Remise FIDELE 5% · VIP 10%
- Pénalité retard : +20%/jour
