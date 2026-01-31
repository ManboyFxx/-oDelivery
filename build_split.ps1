# Split Build Script (Vendor vs App)
# Helps with unstable uploads

$staging = "deploy_staging"
$vendorZip = "deploy_part1_vendor.zip"
$appZip = "deploy_part2_app.zip"

Write-Host "Starting Split Build..."

# 1. Cleanup
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
if (Test-Path $vendorZip) { Remove-Item $vendorZip -Force }
if (Test-Path $appZip) { Remove-Item $appZip -Force }
New-Item -ItemType Directory -Path $staging | Out-Null

# 2. Extract PART 1: Vendor ONLY
Write-Host "Creating Part 1: Vendor..."
# Just zip the vendor folder directly?
# Better to copy to staging/vendor then zip, to keep structure
New-Item -ItemType Directory -Path "$staging\vendor" | Out-Null
robocopy vendor "$staging\vendor" /E /NFL /NDL /NJH /NJS
Compress-Archive -Path "$staging\vendor" -DestinationPath $vendorZip -CompressionLevel Optimal -Force

# Clear staging for Part 2
Remove-Item "$staging\vendor" -Recurse -Force

# 3. Create PART 2: App Code
Write-Host "Creating Part 2: App Code..."

$excludeDirs = @(".git", "node_modules", "tests", "deploy_staging", ".idea", ".vscode", "vendor") # Exclude vendor!
$excludeFiles = @(".gitattributes", "deploy.zip", "deploy_part1_vendor.zip", "deploy_part2_app.zip", "*.ps1", "*.js")

robocopy . $staging /E /XD $excludeDirs /XF $excludeFiles /NFL /NDL /NJH /NJS

# Flatten Public
Copy-Item -Path "$staging\public\*" -Destination $staging -Recurse -Force

# Fix Index
Copy-Item -Path "public_html_index.php" -Destination "$staging\index.php" -Force

# Create Storage Dirs
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

Compress-Archive -Path "$staging\*" -DestinationPath $appZip -CompressionLevel Optimal -Force

# Cleanup
Remove-Item $staging -Recurse -Force

Write-Host "✅ DONE. Upload $vendorZip first, then $appZip."
