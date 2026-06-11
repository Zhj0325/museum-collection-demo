# 一键恢复线上后端（电脑重启后运行此脚本即可）
# 做三件事：启动 Spring Boot 后端 → 开 Cloudflare 隧道 → 把新隧道地址推送给线上前端
# 用法: 先设置令牌，再运行
#   $env:GH_TOKEN='<你的 GitHub 令牌>'
#   .\start-public-backend.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not $env:GH_TOKEN) { Write-Host '请先设置 $env:GH_TOKEN' -ForegroundColor Red; exit 1 }

# 1. 后端（已在运行则跳过）
$up = $false
try { Invoke-RestMethod 'http://localhost:8080/api/auth/health' -TimeoutSec 3 | Out-Null; $up = $true } catch {}
if (-not $up) {
    Write-Host '启动后端...'
    Start-Process java -ArgumentList '-jar', (Join-Path $root '..\museum-server\target\museum-server-1.0.0.jar') -WindowStyle Hidden
    for ($i = 0; $i -lt 40; $i++) {
        Start-Sleep -Seconds 2
        try { Invoke-RestMethod 'http://localhost:8080/api/auth/health' -TimeoutSec 3 | Out-Null; $up = $true; break } catch {}
    }
    if (-not $up) { Write-Host '后端启动失败，请检查 MySQL 是否运行' -ForegroundColor Red; exit 1 }
}
Write-Host '后端在线 ✓'

# 2. 隧道（注意：本机代理环境必须用 http2 协议）
$log = Join-Path $env:TEMP 'museum-tunnel.log'
Remove-Item $log -ErrorAction SilentlyContinue
Set-Location $root
Start-Process npx -ArgumentList 'cloudflared', 'tunnel', '--url', 'http://localhost:8080', '--protocol', 'http2' `
    -WindowStyle Hidden -RedirectStandardError $log
$url = $null
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    if (Test-Path $log) {
        $m = Select-String -Path $log -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1
        if ($m) { $url = $m.Matches[0].Value; break }
    }
}
if (-not $url) { Write-Host '未获取到隧道地址，查看日志: ' $log -ForegroundColor Red; exit 1 }
Write-Host "隧道地址: $url ✓"

# 3. 推送配置给线上前端
node (Join-Path $root 'update-config.mjs') $url
Write-Host '完成！线上站点约 1 分钟内自动切换到新后端地址。' -ForegroundColor Green
Write-Host '站点: https://zhj0325.github.io/museum-collection-demo/'
