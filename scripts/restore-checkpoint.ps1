$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$GitCandidates = @(
  "git",
  "C:\Program Files\Git\cmd\git.exe",
  "C:\Program Files\Git\bin\git.exe"
)

function Get-GitCommand {
  foreach ($Candidate in $GitCandidates) {
    try {
      & $Candidate --version *> $null
      return $Candidate
    } catch {
      continue
    }
  }

  throw "Git was not found. Install Git or check PATH."
}

$Git = Get-GitCommand
$Yes = $false
$Target = $null

foreach ($Arg in $args) {
  if ($Arg -eq "--yes" -or $Arg -eq "-yes") {
    $Yes = $true
    continue
  }

  if (-not $Target) {
    $Target = $Arg
  }
}

if (-not $Target) {
  Write-Host "Specify the checkpoint commit id to restore."
  Write-Host "Example: npm run restore-checkpoint -- b94100e"
  exit 1
}

& $Git -C $RepoRoot rev-parse --is-inside-work-tree *> $null

try {
  $Subject = & $Git -C $RepoRoot log -1 --pretty=format:"%h %s" $Target
} catch {
  Write-Host "Checkpoint was not found: $Target"
  exit 1
}

$Status = & $Git -C $RepoRoot status --porcelain
if ($Status -and -not $Yes) {
  Write-Host "There are uncommitted changes. Restore will replace current working changes."
  Write-Host "Target: $Subject"
  Write-Host ""
  Write-Host "Save current state first:"
  Write-Host 'npm run checkpoint -- "before restore"'
  Write-Host ""
  Write-Host "Restore anyway:"
  Write-Host "npm run restore-checkpoint -- $Target --yes"
  exit 1
}

& $Git -C $RepoRoot restore --source $Target -- .
if ($LASTEXITCODE -ne 0) {
  throw "git restore failed."
}

Write-Host "Restored checkpoint: $Subject"
Write-Host "To keep this restored state as latest, run:"
Write-Host 'npm run checkpoint -- "restore checkpoint"'
