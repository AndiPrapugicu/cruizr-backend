# Test script pentru rewind functionality

# Primul request - să obținem un token valid
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    Write-Host "🔐 Attempting to login..."
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/auth/login" -Method POST -Headers @{"Content-Type" = "application/json"} -Body $loginBody
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.access_token
    Write-Host "✅ Login successful, token obtained"
    
    # Test rewind endpoint
    Write-Host "↩️ Testing rewind endpoint..."
    $rewindResponse = Invoke-WebRequest -Uri "http://localhost:3000/store/actions/swipe-rewind" -Method POST -Headers @{"Content-Type" = "application/json"; "Authorization" = "Bearer $token"} -Body "{}"
    Write-Host "✅ Rewind Response Status: $($rewindResponse.StatusCode)"
    Write-Host "✅ Rewind Response Content: $($rewindResponse.Content)"
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "❌ Response Body: $responseBody"
    }
}
