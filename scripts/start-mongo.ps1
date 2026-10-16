$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$projectRoot = (Get-Location).Path
$databasePath = Join-Path $projectRoot '.local\mongodb-rs0-v2'
$marker = Join-Path $databasePath 'project1-instance.txt'
$expectedMarker = 'project1 dedicated rs0 localhost:27018 v2'
$listener = Get-NetTCPConnection -State Listen -LocalPort 27018 -ErrorAction SilentlyContinue
if ($listener) {
  $processInfo = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $listener[0].OwningProcess)
  if (!(Test-Path -LiteralPath $marker) -or (Get-Content -LiteralPath $marker -Raw).Trim() -ne $expectedMarker -or !$processInfo.CommandLine.Contains($databasePath)) {
    throw 'Port 27018 belongs to an unrecognized instance. No process or data was modified.'
  }
  Write-Host 'Recognized project MongoDB is already running.'
} else {
  if ((Test-Path -LiteralPath $databasePath) -and !(Test-Path -LiteralPath $marker) -and (Get-ChildItem -LiteralPath $databasePath -Force | Select-Object -First 1)) { throw 'Refusing an unknown nonempty data directory.' }
  New-Item -ItemType Directory -Path $databasePath -Force | Out-Null
  if (!(Test-Path -LiteralPath $marker)) { Set-Content -LiteralPath $marker -Value $expectedMarker -Encoding UTF8 }
  if ((Get-Content -LiteralPath $marker -Raw).Trim() -ne $expectedMarker) { throw 'Instance marker mismatch' }
  $mongodExe = (Get-Command mongod.exe -ErrorAction Stop).Source
  $logPath = Join-Path $databasePath 'mongod.log'
  Start-Process -FilePath $mongodExe -ArgumentList @('--dbpath', ('"' + $databasePath + '"'), '--replSet', 'rs0', '--bind_ip', 'localhost', '--port', '27018', '--logpath', ('"' + $logPath + '"'), '--logappend') -WindowStyle Hidden | Out-Null
  Write-Host 'Started dedicated MongoDB in .local\mongodb-rs0-v2 (localhost only).'
}
node --import tsx scripts/init-replica.ts
if ($LASTEXITCODE -ne 0) { throw 'Replica-set setup failed; inspect the project MongoDB log.' }
