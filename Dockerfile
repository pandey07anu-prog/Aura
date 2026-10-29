# Root Dockerfile for Spring Boot Backend (handles builds when Root Directory is repo root)
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENV PORT=8080
ENV JAVA_OPTS="-Xms256m -Xmx512m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
