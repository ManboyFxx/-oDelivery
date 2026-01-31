# Robust Build Script using Robocopy
# No special characters to avoid encoding issues

$staging = "deploy_staging"
$zipFile = "deploy.zip"

Write-Host "Starting Robust Build..."

# 1. Cleanup
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
New-Item -ItemType Directory -Path $staging | Out-Null

# 2. Robocopy content (Mirror mode /MIR but excluding dev stuff)
# Robocopy is external, so we check exit codes (0-7 is success)
$excludeDirs = @(".git", "node_modules", "tests", "deploy_staging", ".idea", ".vscode")
$excludeFiles = @(".gitattributes", "deploy.zip", "build_for_hosting.js", "build_native.ps1", "build_robust.ps1")

# We copy everything to staging first
Write-Host "Copying files using Robocopy..."
$log = robocopy . $staging /E /XD $excludeDirs /XF $excludeFiles /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -gt 7) { Write-Error "Robocopy failed with code $LASTEXITCODE"; exit }

# 3. Flatten Public (Copy contents of public to root of staging)
Write-Host "Flattening public folder..."
Copy-Item -Path "$staging\public\*" -Destination $staging -Recurse -Force

# 4. Fix index.php (Overwrite with verified root version)
Write-Host "Applying public_html_index.php..."
Copy-Item -Path "public_html_index.php" -Destination "$staging\index.php" -Force

# 5. Create Storage Directories (if empty)
$storageDirs = @(
    "storage\app\public",
    "storage\framework\cache",
    "storage\framework\sessions",
    "storage\framework\testing",
    "storage\framework\views",
    "storage\logs"
)
foreach ($dir in $storageDirs) {
    New-Item -ItemType Directory -Path "$staging\$dir" -Force | Out-Null
}

# 6. Compress
Write-Host "Compressing to deploy.zip (this may take a minute)..."
Compress-Archive -Path "$staging\*" -DestinationPath $zipFile -CompressionLevel Optimal -Force

# 7. Cleanup
Remove-Item $staging -Recurse -Force

Write-Host "DONE. Check deploy.zip size."
