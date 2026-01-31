# Unified Build Script (One Zip to Rule Them All)
# Copies everything to a staging folder first to ensure structure is perfect, then zips.

$staging = "deploy_staging"
$zipFile = "deploy.zip"

Write-Host "Starting Unified Build..."

# 1. CLEANUP
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
New-Item -ItemType Directory -Path $staging | Out-Null

# 2. COPY FILES
Write-Host "Copying files to staging..."

# A. Copy everything excluding heavy/useless folders
$excludeDirs = @(".git", "node_modules", "tests", "deploy_staging", ".idea", ".vscode", "storage") 
$excludeFiles = @(".gitattributes", "deploy.zip", "*.zip", "*.ps1", "*.js", "*.log")

robocopy . $staging /E /XD $excludeDirs /XF $excludeFiles /NFL /NDL /NJH /NJS

# B. Create clean Storage structure (empty dirs)
$storageDirs = @(
    "storage\app\public",
    "storage\framework\cache",
    "storage\framework\sessions",
    "storage\framework\views",
    "storage\logs"
)
foreach ($dir in $storageDirs) {
    New-Item -ItemType Directory -Path "$staging\$dir" -Force | Out-Null
}
New-Item -ItemType File -Path "$staging\storage\logs\laravel.log" -Force | Out-Null

# C. FLATTEN PUBLIC (Crucial for Hostinger)
Write-Host "Flattening public folder..."
Copy-Item -Path "$staging\public\*" -Destination $staging -Recurse -Force
# Overwrite index.php with the specific Hostinger loader
Copy-Item -Path "public_html_index.php" -Destination "$staging\index.php" -Force

# D. COPY VENDOR (Robust Copy)
Write-Host "Copying Vendor (this may take a moment)..."
robocopy vendor "$staging\vendor" /E /NFL /NDL /NJH /NJS

# 3. ZIP EVERYTHING
Write-Host "Zipping everything into $zipFile..."
Compress-Archive -Path "$staging\*" -DestinationPath $zipFile -CompressionLevel Optimal -Force

# 4. CLEANUP STAGING
Remove-Item $staging -Recurse -Force

Write-Host "SUCCESS! Upload $zipFile to Hostinger public_html."
