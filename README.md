# Clynic Service Application

This project is a comprehensive microservice-based system for managing patient records and handling user authentication. It offers a RESTful API interface with robust validation, error handling, JWT-based authentication, secure gateway routing, and integration with external services like Kafka and gRPC.

---

## 🚀 Features

### 🧑‍⚕️ **Patient Management APIs**
- Create, update, delete, and fetch patient records
- Email validation with UUID checks
- Data integrity with unique constraints
- Integrated Kafka producer to emit patient-related events

### 🔐 **Authentication & Authorization**
- **Auth-Service** microservice for:
  - User registration
  - Login with JWT token generation
- JWT-based security with Spring Security
- Password encryption using `BCryptPasswordEncoder`
- Global exception handling for secure and clean error messages

### 🛡️ **API Gateway**
- All services are routed through **API-Gateway**
- JWT token validation at gateway level using `JWTValidationGatewayFilter`
- Auth service is only accessible via the API Gateway

### 📦 **Microservices & Integration**
- Modular architecture with clearly separated services:
  - Clynic-Service (Patient Management)
  - Auth-Service (Authentication)
  - Billing-Service (via gRPC)
  - Analytics-Service (under development)
- gRPC integration for inter-service communication
- Kafka event publishing for patient service operations

### 🧪 **Testing & Monitoring**
- Basic HTTP test methods available
- Integrated SLF4J logging for debugging and monitoring

### 🛢️ **Database Support**
- PostgreSQL for production (deployed via Docker)
- H2 in-memory DB with dummy data for local testing

### 🐳 **Containerization**
- Dockerfile for each microservice
- Docker Compose ready environment for spinning up services and databases
- PostgreSQL and Auth-DB run in isolated Docker containers

---

## 🚀 Deployment Notes

- Environment variables can be configured for DB credentials, JWT secret keys, etc.
- Separate Docker containers for PostgreSQL and Auth-DB.
- Kafka and gRPC integrated in service communication.

---

## 🧠 Acknowledgments

Built with ❤️ by me as a showcase of how to design and build a modern Spring Boot microservice system using:
- Spring Security
- JWT
- Docker & Docker Compose
- Kafka
- gRPC
- PostgreSQL
- CI/CD (GitHub Actions)

Feel free to explore, or contribute!
