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
if ($args.Count -gt 0) {
  $Limit = $args[0]
} else {
  $Limit = "30"
}

& $Git -C $RepoRoot rev-parse --is-inside-work-tree *> $null

Write-Host "Recent checkpoints:"
Write-Host ""

& $Git -C $RepoRoot log "-$Limit" --date=format:"%Y-%m-%d %H:%M" --pretty=format:"%h  %cd  %s"

Write-Host ""
Write-Host ""
Write-Host "Restore example:"
Write-Host "npm run restore-checkpoint -- <commit-id>"
