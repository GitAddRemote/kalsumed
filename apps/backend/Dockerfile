FROM gradle:8.10.2-jdk21 AS build
WORKDIR /app
COPY ../../settings.gradle.kts ../../build.gradle.kts ../../gradlew* ./
COPY ../../gradle ./gradle
COPY ../../libs/common ./libs/common
COPY . ./apps/backend
RUN ./gradlew :apps:backend:bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/apps/backend/build/libs/kalsumed-backend.jar app.jar
ENV JAVA_OPTS=""
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
