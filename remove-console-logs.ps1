# Remove all console statements from Admin Client for production
# Run this script from the project root

$files = Get-ChildItem -Path "src" -Recurse -Include *.js

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove standalone console.log statements (entire lines)
    $content = $content -replace '(?m)^\s*console\.(log|error|warn|info|debug)\([^)]*\);\s*$', ''
    
    # Remove inline console statements but keep the line
    $content = $content -replace 'console\.(log|error|warn|info|debug)\([^)]*\);\s*', ''
    
    # Remove console statements without semicolon
    $content = $content -replace 'console\.(log|error|warn|info|debug)\([^)]*\)\s*(?=\n|$)', ''
    
    # Remove multiple consecutive blank lines
    $content = $content -replace '(?m)^\s*$(\r?\n){2,}', "`r`n"
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Host "Cleaned: $($file.FullName)"
    }
}

Write-Host "`n✅ All console statements removed from production build"
