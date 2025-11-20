# Maven to Gradle Migration Guide

This project has been migrated from Maven to Gradle with Kotlin DSL.

## What Changed

### Build Files
- **Removed**: `pom.xml` files (root, backend, common)
- **Added**:
  - `settings.gradle.kts` - Multi-module configuration
  - `build.gradle.kts` - Root build configuration
  - `apps/backend/build.gradle.kts` - Backend module build
  - `libs/common/build.gradle.kts` - Common library build
  - `gradlew` and `gradlew.bat` - Gradle wrapper scripts
  - `gradle/wrapper/` - Gradle wrapper files

### Command Changes

| Maven | Gradle |
|-------|--------|
| `mvn clean` | `./gradlew clean` |
| `mvn test` | `./gradlew test` |
| `mvn package` | `./gradlew build` |
| `mvn spring-boot:run` | `./gradlew :apps:backend:bootRun` |
| `mvn install` | `./gradlew publishToMavenLocal` |

### Module References
- Maven: `<artifactId>kalsumed-common</artifactId>`
- Gradle: `implementation(project(":libs:common"))`

## Quick Start with Gradle

```bash
# Run the backend
./gradlew :apps:backend:bootRun

# Build all modules
./gradlew build

# Run tests
./gradlew test

# Build backend JAR only
./gradlew :apps:backend:bootJar

# Clean build artifacts
./gradlew clean
```

## IDE Setup

### IntelliJ IDEA
1. Open the project
2. IntelliJ will auto-detect the Gradle build
3. Click "Load Gradle Project" if prompted
4. Gradle will automatically download dependencies

### VS Code
1. Install the "Gradle for Java" extension
2. Open the project
3. The extension will detect the Gradle build automatically

## Docker Build
The Dockerfile has been updated to use Gradle:
```bash
docker build -t kalsumed-backend -f apps/backend/Dockerfile .
```

## Benefits of Gradle

1. **Faster Builds**: Gradle's incremental compilation and build cache
2. **Kotlin DSL**: Type-safe, IDE-friendly build scripts
3. **Better Dependency Management**: Easier to manage transitive dependencies
4. **Modern Tooling**: Better support for modern Java features
5. **Parallel Execution**: Gradle can build modules in parallel

## Troubleshooting

### Gradle Wrapper Not Executable
```bash
chmod +x gradlew
```

### Clean Gradle Cache
```bash
./gradlew clean --no-daemon
rm -rf .gradle
```

### Force Dependency Refresh
```bash
./gradlew build --refresh-dependencies
```

## Legacy Maven Files

The old Maven POM files have been kept for reference but are no longer used. You can safely delete them:
- `/pom.xml`
- `/apps/backend/pom.xml`
- `/libs/common/pom.xml`
- `/scripts/mvnw.sh`

They will be removed in a future commit once the migration is fully validated.
