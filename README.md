### Project: **Clynic** – A Microservices-based Backend System using Spring Boot

Clynic is a production-ready backend system designed to simulate the architecture of a real-world healthcare platform. Built using Spring Boot and a microservices approach, the project demonstrates secure, scalable, and maintainable service coordination using industry-standard tools and protocols.

---

### 📌 Project Components

**Microservices Architecture:**

**Authentication Service**
- Unit tests for login and registration logic
- JWT generation and validation tested with mock secrets
- Integration tests for protected routes with valid/invalid tokens

**API Gateway**
- Gateway route mapping tested using mock services
- JWT validation filters verified for token rejection and success cases
- Endpoint authorization tested against role-based access

**Clynic Service**
- CRUD operations tested via integration tests using MockMVC
- Service layer unit tested for business logic and exception flows
- Kafka producer events verified using embedded Kafka

**Billing Service**
- gRPC server methods unit tested for request-response integrity
- gRPC client tested via Clynic Service with mocked server stubs
- End-to-end billing event tested from Clynic → Kafka → gRPC → DB

**Analytics Service**
- Kafka consumer tested for correct deserialization and processing
- Aggregation logic unit tested using test datasets
- Data storage validated through integration with test DB containers

**Infrastructure & IaC**
- LocalStack setup verified for ECS, VPC, RDS, MKS provisioning
- Deployment shell scripts tested for idempotency and proper resource creation
- Service discovery and health check endpoints verified post-provisioning

**CI/CD**
- All test suites executed in CI workflow on each PR and push
- Coverage thresholds enforced with failure on low coverage
- Artifacts and build tested post CI with deploy-to-LocalStack step

---

### 🧰 Technologies Used

- **Languages & Frameworks:** Java 21, Spring Boot 3.x
- **Security:** Spring Security, JWT
- **Communication:** gRPC, Kafka
- **Database:** PostgreSQL (Dockerized)
- **Infrastructure & Deployment:** Docker, Docker Compose, LocalStack (AWS simulation)
- **CI/CD:** GitHub Actions
- **Infrastructure-as-Code:** Shell-based automation for deploying mock AWS services

---

### ✅ Features

- Secure JWT authentication and route-level access control
- gRPC-based communication between microservices
- Kafka-based asynchronous data processing for analytics
- LocalStack-based infrastructure for simulating AWS services locally
- Fully containerized environment with Docker Compose
- CI/CD pipeline configured for testing and builds

---

### 📂 Directory Structure

```
/Clynic-Auth-Service
/Clynic-Service
/billing-service
/analytics-service
/clynic-api-gateway
/clynic-tests
/infrastructure
```

---

### 🚀 How to Run Locally

1. **Clone the Repository**

2. **Start Infrastructure (LocalStack):**  
   Navigate to the infrastructure directory and execute:
   `./localstack-deploy.sh`

3. **Wait till All Containers Start:**  
   Check on Docker Desktop whether all containers are running

4. **Test API Endpoints:**
   At the end of the build copy the ENDPOINT & Use Postman or CURL to interact with each microservice through the gateway.

---

### 👤 Author

**Aadarsh Pandey**  
Backend Developer | Software Engineer  
LinkedIn: [linkedin.com/in/beingadish](https://linkedin.com/in/beingadish)  
GitHub: [github.com/beingadish](https://github.com/beingadish)