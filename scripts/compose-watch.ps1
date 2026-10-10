param([switch]$Stop)
$ErrorActionPreference = 'Stop'
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$statePath = Join-Path $repoRoot 'output/genda-compose-watch.json'
if (Test-Path -LiteralPath $statePath) {
    $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
    $running = Get-Process -Id $state.processId -ErrorAction SilentlyContinue
    if ($running) {
        $command = (Get-CimInstance Win32_Process -Filter ("ProcessId = " + $state.processId)).CommandLine
        if ($running.StartTime.ToUniversalTime().ToString('o') -ne $state.startedAt -or $command.Trim() -notmatch 'compose watch --no-up$') {
            throw 'Recorded watcher PID no longer identifies this project watcher; refusing to stop it.'
        }
        & taskkill.exe /PID $state.processId /T /F | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'Could not stop the previous Compose watcher.' }
    }
    Remove-Item -LiteralPath $statePath
}
if ($Stop) { exit 0 }
[System.IO.Directory]::CreateDirectory((Join-Path $repoRoot 'output')) | Out-Null
$watcher = Start-Process -FilePath 'docker.exe' -ArgumentList @('compose', 'watch', '--no-up') -WorkingDirectory $repoRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $repoRoot 'output/genda-compose-watch.log') -RedirectStandardError (Join-Path $repoRoot 'output/genda-compose-watch.error.log') -PassThru
@{ processId = $watcher.Id; startedAt = $watcher.StartTime.ToUniversalTime().ToString('o') } |
    ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding UTF8
Start-Sleep -Seconds 2
$watcher.Refresh()
if ($watcher.HasExited) {
    Remove-Item -LiteralPath $statePath
    throw 'Compose Watch exited. Inspect output/genda-compose-watch.error.log.'
}
Write-Output '[INFO] Automatic frontend sync and backend rebuild are running in the background.'
