$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
Set-Location "C:\Users\Ale\Documents\ProjetoIA\Advisor"
gh repo create advisors-club-vertex --private --source=. --remote=origin --push
