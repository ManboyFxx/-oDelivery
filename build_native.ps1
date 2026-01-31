# Build script using native PowerShell and Tar for robustness

Write-Host "🚀 Starting Native Build Process..." -ForegroundColor Cyan

$staging = "deploy_staging"
$zipFile = "deploy.zip"

# 1. Clean up previous
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }

New-Item -ItemType Directory -Path $staging | Out-Null

# 2. Copy Files
$excludes = @(
    ".git", 
    ".gitattributes", 
    "node_modules", 
    "tests", 
    "storage/*.key", 
    "deploy.zip", 
    "build_for_hosting.js",
    "deploy_staging"
)

Write-Host "📂 Copying application files..."
# Robocopy is reliable for excluding and copying
# We copy basic structure first
$folders = @("app", "bootstrap", "config", "database", "resources", "routes", "vendor")
foreach ($f in $folders) {
    Copy-Item -Path $f -Destination "$staging\$f" -Recurse
}

# Copy specific files
$files = @("composer.json", "composer.lock", "package.json", "vite.config.js", "artisan", "check_server.php", "DEPLOY_INSTRUCTIONS.txt", ".env.production")
foreach ($f in $files) {
    if (Test-Path $f) { Copy-Item -Path $f -Destination "$staging\$f" }
}

# 3. Create Storage Structure (Empty folders)
Write-Host "📁 Creating storage structure..."
New-Item -ItemType Directory -Path "$staging\storage\app\public" -Force | Out-Null
New-Item -ItemType Directory -Path "$staging\storage\framework\cache" -Force | Out-Null
New-Item -ItemType Directory -Path "$staging\storage\framework\sessions" -Force | Out-Null
New-Item -ItemType Directory -Path "$staging\storage\framework\testing" -Force | Out-Null
New-Item -ItemType Directory -Path "$staging\storage\framework\views" -Force | Out-Null
New-Item -ItemType Directory -Path "$staging\storage\logs" -Force | Out-Null

# 4. Flatten Public
Write-Host "📂 Flattening public folder..."
Copy-Item -Path "public\*" -Destination $staging -Recurse

# 5. Fix index.php (Overwrite with our verified root version)
Write-Host "🔧 Applying Root index.php..."
Copy-Item -Path "public_html_index.php" -Destination "$staging\index.php" -Force

# 6. Compress using Compress-Archive (Native PowerShell)
Write-Host "📦 Zipping..."
$compressionLevel = "Optimal"
# Compress content OF the folder, not the folder itself
Compress-Archive -Path "$staging\*" -DestinationPath $zipFile -Force -CompressionLevel $compressionLevel

# 7. Cleanup
Remove-Item $staging -Recurse -Force

Write-Host "✅ Success! deploy.zip created using native tools." -ForegroundColor Green
Write-Host "📊 Verify size manually."
