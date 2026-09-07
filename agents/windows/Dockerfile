# ✅ FIX 19: Fixed Windows agent Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY NexoraAgent.csproj .
RUN dotnet restore

# Copy source and build
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/runtime:8.0 AS runtime
WORKDIR /app

# Copy published files
COPY --from=build /app/publish .

# Set environment variables
ENV SERVER_ID=windows-server-01
ENV MAIN_SERVER=https://nexora.yourdomain.com
ENV API_KEY=your-api-key-here
ENV INTERVAL=30

# Create config directory
RUN mkdir -p /app/config

# Entry point
ENTRYPOINT ["dotnet", "NexoraAgent.dll"]