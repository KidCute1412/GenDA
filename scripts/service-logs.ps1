param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('frontend', 'backend')]
    [string]$Service
)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Join-Path $PSScriptRoot '..')
while ($true) {
    & docker compose logs --follow --tail 30 $Service
    if ($LASTEXITCODE -ne 0) { throw 'Unable to follow service logs.' }
    $running = & docker compose ps --status running --services $Service
    if (-not $running) { break }
    Start-Sleep -Milliseconds 500
}
