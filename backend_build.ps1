Write-Host "=============================="
Write-Host "Building Django backend Docker image..."

# Build Django backend Docker image
docker build -t playground-backend .\gallery_backend
Write-Host "Backend Docker image built."

# Διαγραφή παλιού container αν υπάρχει
Write-Host "=============================="
$backendContainer = docker ps -aq -f "name=gallery_backend"
if ($backendContainer) {
    Write-Host "Removing existing container gallery_backend..."
    docker rm -f $backendContainer
}

# Εκκίνηση containers μέσω docker-compose
Write-Host "Starting containers with docker-compose..."
docker-compose up -d --build --remove-orphans
Write-Host "Backend deployment finished."
