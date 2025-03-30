# For getting the Maven as Dependency
FROM maven:3.9.9-eclipse-temurin-21 AS builder

# Setting up our Working Directory
WORKDIR /app

# Copying our Pom File
COPY pom.xml .

# Running the Maven Command to Load the Dependencies & Cache them Offline unless changes are not detected
RUN mvn dependency:go-offline -B

# Copying our Source Folder to build the app
COPY src ./src

# Running the Maven CMD for Packaging everything into a single JAR File
RUN mvn clean package

# This is the line where we set our RUNNER which actually runs the code from the Build File (JAR) made using Build Tool (Maven)
FROM openjdk:21-jdk AS runner

WORKDIR /app

# We are copying the JAR file from the Taregt Folder to another Folder
COPY --from=builder ./app/target/clynic-api-gateway-0.0.1-SNAPSHOT.jar ./app.jar

# Exposing/Opening the PORT number where our project is actually running
EXPOSE 4004

# Running the JAR file using Java CMD
ENTRYPOINT ["java","-jar","/app/app.jar"]