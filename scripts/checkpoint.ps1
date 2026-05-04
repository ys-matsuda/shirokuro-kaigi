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

& $Git -C $RepoRoot rev-parse --is-inside-work-tree *> $null

$UserName = (& $Git -C $RepoRoot config --get user.name) 2>$null
$UserEmail = (& $Git -C $RepoRoot config --get user.email) 2>$null

if (-not $UserName) {
  & $Git -C $RepoRoot config user.name "owoox"
}

if (-not $UserEmail) {
  & $Git -C $RepoRoot config user.email "owoox@example.local"
}

$Status = & $Git -C $RepoRoot status --porcelain
if (-not $Status) {
  $Current = & $Git -C $RepoRoot rev-parse --short HEAD
  Write-Host "No changes. Checkpoint was not created. Current: $Current"
  exit 0
}

$Count = [int](& $Git -C $RepoRoot rev-list --count HEAD)
$Version = "v1.{0:D3}" -f ($Count + 1)
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$Note = ($args -join " ").Trim()
$Message = "checkpoint: $Version $Timestamp"

if ($Note) {
  $Message = "$Message - $Note"
}

& $Git -C $RepoRoot add -A
if ($LASTEXITCODE -ne 0) {
  throw "git add failed."
}

& $Git -C $RepoRoot commit -m $Message
if ($LASTEXITCODE -ne 0) {
  throw "git commit failed."
}

$Current = & $Git -C $RepoRoot rev-parse --short HEAD
Write-Host "Created checkpoint: $Version ($Current)"
