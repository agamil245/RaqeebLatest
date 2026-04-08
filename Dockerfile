# Stage 1: Build the React frontend
FROM node:22-alpine AS web-build
WORKDIR /app/traccar-web
COPY traccar-web/package.json traccar-web/package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY traccar-web/ ./
RUN npm run build

# Stage 2: Build the Java backend
FROM eclipse-temurin:17-jdk AS server-build
WORKDIR /app
COPY gradle/ gradle/
COPY gradlew build.gradle settings.gradle ./
COPY src/ src/
COPY schema/ schema/
COPY templates/ templates/
RUN chmod +x gradlew && ./gradlew assemble -x test

# Stage 3: Runtime image
FROM eclipse-temurin:17-jre
WORKDIR /opt/traccar

# Copy server jar and dependencies
COPY --from=server-build /app/target/tracker-server.jar .
COPY --from=server-build /app/target/lib/ lib/

# Copy web frontend
COPY --from=web-build /app/traccar-web/build/ web/

# Copy schema and templates
COPY --from=server-build /app/schema/ schema/
COPY --from=server-build /app/templates/ templates/

# Copy localization files for the web UI
COPY --from=web-build /app/traccar-web/src/resources/l10n/ templates/translations/

# Create directories for runtime data
RUN mkdir -p conf data logs media

# Default config (H2 embedded database)
RUN echo '<?xml version="1.0" encoding="UTF-8"?>\n\
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">\n\
<properties>\n\
    <entry key="web.port">8082</entry>\n\
    <entry key="web.path">./web</entry>\n\
    <entry key="geocoder.type">pluscodes</entry>\n\
    <entry key="media.path">./media</entry>\n\
    <entry key="database.driver">org.h2.Driver</entry>\n\
    <entry key="database.url">jdbc:h2:./data/database</entry>\n\
    <entry key="database.user">sa</entry>\n\
    <entry key="database.password"></entry>\n\
</properties>' > conf/traccar.xml

# Expose the web UI port
EXPOSE 8082

# Expose common GPS tracker protocol ports (TCP + UDP)
# You can add more as needed based on which protocols you use
EXPOSE 5001-5255

# Persist database + media across restarts
VOLUME ["/opt/traccar/data", "/opt/traccar/media", "/opt/traccar/conf"]

ENTRYPOINT ["java", "-jar", "tracker-server.jar", "conf/traccar.xml"]
