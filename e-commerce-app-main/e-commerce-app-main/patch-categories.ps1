# PowerShell script to patch product categories
$API_BASE_URL = "http://localhost:3000/api"

# Authentication tokens for each seller
$sellerTokens = @{
    atomberg = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODljY2IyYzk4NmI4ODQ4MGY3OTY0MGMiLCJyb2xlIjoic2VsbGVyIiwiaWF0IjoxNzU1MTA2MzIwLCJleHAiOjE3NTUxOTI3MjB9.9wbwRFHUqXXQ9PRtrp2MtZgMBHfz2-ZD9vNPQDUxx7o"
    bajaj = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODljY2IzMDk4NmI4ODQ4MGY3OTY0MjMiLCJyb2xlIjoic2VsbGVyIiwiaWF0IjoxNzU1MTA2MzE5LCJleHAiOjE3NTUxOTI3MTl9.Temdc66n-zzhtglG-gY5VkHE58KCbQs1ycPcA-YeYrM"
    phillips = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODljY2IzOTk4NmI4ODQ4MGY3OTY0NDYiLCJyb2xlIjoic2VsbGVyIiwiaWF0IjoxNzU1MTA2MzIwLCJleHAiOjE3NTUxOTI3MjB9.VXGLJG5B8ZGVoLw0lLDsoa5kzVgmx4LinOXhnJpBER0"
    tata = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODljY2IzZTk4NmI4ODQ4MGY3OTY0NWQiLCJyb2xlIjoic2VsbGVyIiwiaWF0IjoxNzU1MTA2MzIwLCJleHAiOjE3NTUxOTI3MjB9.dNUtPVHgUm6FnpW5HJdOKRWtsg3vc2dh1cTaDSY6BK0"
}

# Product category mappings
$categoryUpdates = @{
    # Atomberg products
    "689ccb2c986b88480f796410" = @{ title = "Fan"; newCategory = "electronics"; seller = "atomberg" }
    "689ccb2d986b88480f796416" = @{ title = "Mixer Grinder"; newCategory = "home"; seller = "atomberg" }
    "689ccb2f986b88480f79641c" = @{ title = "Smart Lock"; newCategory = "electronics"; seller = "atomberg" }
    
    # Bajaj products
    "689ccb31986b88480f796427" = @{ title = "Ceiling Fan"; newCategory = "electronics"; seller = "bajaj" }
    "689ccb32986b88480f79642d" = @{ title = "LED Bulb"; newCategory = "electronics"; seller = "bajaj" }
    "689ccb34986b88480f796433" = @{ title = "Mixer Grinder"; newCategory = "home"; seller = "bajaj" }
    "689ccb37986b88480f79643f" = @{ title = "Water Heater"; newCategory = "electronics"; seller = "bajaj" }
    
    # Phillips products
    "689ccb39986b88480f79644a" = @{ title = "Hair Dryer"; newCategory = "beauty"; seller = "phillips" }
    "689ccb3c986b88480f796456" = @{ title = "Steam Iron"; newCategory = "electronics"; seller = "phillips" }
    
    # Tata products
    "689ccb3e986b88480f796461" = @{ title = "Salt Lite"; newCategory = "grocery"; seller = "tata" }
    "689ccb40986b88480f796467" = @{ title = "Salt"; newCategory = "grocery"; seller = "tata" }
    "689ccb41986b88480f79646d" = @{ title = "Tea"; newCategory = "grocery"; seller = "tata" }
    "689ccb43986b88480f796473" = @{ title = "Water Purifier"; newCategory = "electronics"; seller = "tata" }
}

function Update-ProductCategory {
    param(
        [string]$ProductId,
        [string]$NewCategory,
        [string]$Title,
        [string]$Seller
    )
    
    try {
        $token = $sellerTokens[$Seller]
        if (-not $token) {
            Write-Host "❌ No token found for seller: $Seller" -ForegroundColor Red
            return $false
        }

        $headers = @{
            "Cookie" = "authToken=$token"
            "Content-Type" = "application/json"
        }
        
        $body = @{
            category = $NewCategory
        } | ConvertTo-Json
        
        $uri = "$API_BASE_URL/product/$ProductId"
        
        $response = Invoke-RestMethod -Uri $uri -Method PATCH -Headers $headers -Body $body
        
        if ($response.success) {
            Write-Host "✅ Updated `"$Title`" ($ProductId) → $NewCategory [$Seller]" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Failed to update `"$Title`": $($response.message)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error updating `"$Title`": $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Start-CategoryPatching {
    Write-Host "🚀 Starting category updates...`n" -ForegroundColor Cyan
    
    $successful = 0
    $failed = 0
    
    foreach ($productId in $categoryUpdates.Keys) {
        $update = $categoryUpdates[$productId]
        $result = Update-ProductCategory -ProductId $productId -NewCategory $update.newCategory -Title $update.title -Seller $update.seller
        
        if ($result) {
            $successful++
        } else {
            $failed++
        }
        
        # Add a small delay
        Start-Sleep -Milliseconds 200
    }
    
    Write-Host "`n📊 Summary:" -ForegroundColor Cyan
    Write-Host "✅ Successfully updated: $successful products" -ForegroundColor Green
    Write-Host "❌ Failed updates: $failed products" -ForegroundColor Red
    
    if ($failed -eq 0) {
        Write-Host "🎉 All categories have been updated successfully!" -ForegroundColor Green
    }
}

# Run the patch script
Start-CategoryPatching
