$body = @{
    userId = 1
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/premium/activate-vip" -Method POST -Headers @{"Content-Type" = "application/json"} -Body $body
    Write-Host "Response Status: $($response.StatusCode)"
    Write-Host "Response Content: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}
