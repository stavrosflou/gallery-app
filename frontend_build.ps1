Write-Host "=============================="
Write-Host "Building Angular frontend..."

# Πήγαινε στον φάκελο του Angular project
Set-Location -Path ".\gallery-app"

# Εγκατάσταση dependencies και build
npm install
ng build --configuration production

Write-Host "Frontend build done."

# Build Docker image για Angular/Nginx
Write-Host "=============================="
Write-Host "Building Nginx Docker image..."
docker build -t playground-nginx .\gallery-app
Write-Host "Frontend/Nginx Docker image built."

# Επιστροφή στον root φάκελο
Set-Location -Path ".."

# Διαγραφή παλιού container αν υπάρχει
Write-Host "=============================="
$nginxContainer = docker ps -aq -f "name=gallery_nginx"
if ($nginxContainer) {
    Write-Host "Removing existing container gallery_nginx..."
    docker rm -f $nginxContainer
}

# Εκκίνηση containers μέσω docker-compose
Write-Host "Starting containers with docker-compose..."
docker-compose up -d --build --remove-orphans
Write-Host "Frontend deployment finished."
