# =========================================================================
# Stage 1: Build and compile the application
# =========================================================================
FROM maven:3.9.6-eclipse-temurin-21-jammy AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy only the pom.xml to cache dependencies
COPY pom.xml .

# Download dependencies (this layer is cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy the source code
COPY src ./src

# Build and package the application without running tests
RUN mvn clean package -DskipTests

# =========================================================================
# Stage 2: Minimal runtime environment
# =========================================================================
FROM eclipse-temurin:21-jre-jammy

# Create a non-root system user for security
RUN addgroup --system spring && adduser --system --ingroup spring spring

# Set working directory
WORKDIR /app

# Copy the built JAR artifact from the builder stage
# Adjust 'demo-0.0.1-SNAPSHOT.jar' to match your actual artifact name
COPY --from=builder /app/target/*.jar app.jar

# Run the container as the non-root user
USER spring:spring

# Expose default Spring Boot port
EXPOSE 8080

# Execute the application
ENTRYPOINT ["java", "-jar", "app.jar"]
