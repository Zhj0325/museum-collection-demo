# 一键恢复线上后端（电脑重启后运行此脚本即可）
# 1) 启动 Spring Boot 后端  2) 取得公网隧道地址（优先 cpolar 服务，兜底 cloudflared）
# 3) 把地址推送给线上前端（约 10 秒生效，无需重新构建）
# 用法:
#   $env:GH_TOKEN='<你的 GitHub 令牌>'
#   .\start-public-backend.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not $env:GH_TOKEN) { Write-Host '请先设置 $env:GH_TOKEN' -ForegroundColor Red; exit 1 }

# ---- 1. 后端（已在运行则跳过）----
$up = $false
try { Invoke-RestMethod 'http://localhost:8080/api/auth/health' -TimeoutSec 3 | Out-Null; $up = $true } catch {}
if (-not $up) {
    Write-Host '启动后端...'
    Start-Process java -ArgumentList '-jar', (Join-Path $root '..\museum-server\target\museum-server-1.0.0.jar') `
        -WorkingDirectory (Join-Path $root '..\museum-server') -WindowStyle Hidden
    for ($i = 0; $i -lt 40; $i++) {
        Start-Sleep -Seconds 2
        try { Invoke-RestMethod 'http://localhost:8080/api/auth/health' -TimeoutSec 3 | Out-Null; $up = $true; break } catch {}
    }
    if (-not $up) { Write-Host '后端启动失败，请检查 MySQL 是否运行' -ForegroundColor Red; exit 1 }
}
Write-Host '后端在线 ✓'

# ---- 2. 公网地址：优先 cpolar（Windows 服务自启，配置里已有指向 8080 的隧道）----
$url = $null
$cpolarLog = Get-ChildItem "$env:USERPROFILE\.cpolar\logs" -Filter 'cpolar_service.log*' -ErrorAction SilentlyContinue |
    Where-Object Length -gt 0 | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($cpolarLog) {
    # 取最新的「Tunnel established at https://…」（两条 http 隧道都指向 8080；
    # 日志里 JSON 引号带转义，直接匹配 established 行最可靠）
    $m = Select-String -Path $cpolarLog.FullName -Pattern 'Tunnel established at (https://[a-z0-9.-]+)' |
        Select-Object -Last 1
    if ($m) { $url = $m.Matches[0].Groups[1].Value }
}
if ($url) {
    # 确认 cpolar 隧道确实能打到后端
    try {
        $h = Invoke-RestMethod "$url/api/auth/health" -TimeoutSec 10
        if ($h.code -ne 200) { $url = $null }
    } catch { $url = $null }
}
if ($url) {
    Write-Host "cpolar 隧道: $url ✓"
} else {
    # ---- 兜底：cloudflared 快速隧道（本机代理环境必须 http2 协议）----
    Write-Host 'cpolar 不可用，改用 cloudflared...'
    $log = Join-Path $env:TEMP 'museum-tunnel.log'
    Remove-Item $log -ErrorAction SilentlyContinue
    Set-Location $root
    Start-Process npx -ArgumentList 'cloudflared', 'tunnel', '--url', 'http://localhost:8080', '--protocol', 'http2' `
        -WindowStyle Hidden -RedirectStandardError $log
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 2
        if (Test-Path $log) {
            $m = Select-String -Path $log -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1
            if ($m) { $url = $m.Matches[0].Value; break }
        }
    }
    if (-not $url) { Write-Host '未获取到隧道地址' -ForegroundColor Red; exit 1 }
    Write-Host "cloudflared 隧道: $url ✓"
}

# ---- 3. 推送配置给线上前端 ----
node (Join-Path $root 'update-config.mjs') $url
Write-Host '完成！线上站点约 1 分钟内自动连接新后端。' -ForegroundColor Green
Write-Host '站点: https://zhj0325.github.io/museum-collection-demo/'
