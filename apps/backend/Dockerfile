FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY ../../pom.xml ./
COPY ../../libs/common ./libs/common
COPY . ./apps/backend
RUN mvn -q -T 1C -DskipTests package -pl apps/backend -am

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/apps/backend/target/kalsumed-backend-*.jar app.jar
ENV JAVA_OPTS=""
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
