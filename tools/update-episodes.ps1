# Regenere data/episodes.js a partir du flux RSS et de la chaine YouTube.
# A relancer a chaque nouvel episode :
#   powershell -ExecutionPolicy Bypass -File tools\update-episodes.ps1
# Ce fichier reste en ASCII : Windows PowerShell 5.1 lit mal l'UTF-8 sans BOM.

param([switch]$SkipImages)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = 'Tls12'
Add-Type -AssemblyName System.Drawing, System.Web

$root = Split-Path -Parent $PSScriptRoot
$rssUrl = 'https://anchor.fm/s/2d912044/podcast/rss'
$channelId = 'UCSgQIvviSJxLwGPS3sgcnlA'
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'

# Corrections manuelles quand le flux se trompe ou que la video n'est pas trouvee.
# Cle : id d'episode (ex. S15E2). 'video' force un id YouTube ; '' = pas de video.
# La chaine contient souvent deux uploads : la vraie video (titre retravaille) et
# l'import automatique du flux audio (meme titre que le RSS). On force la vraie video.
$videoOverrides = @{
  'S15E5' = 'gqPMKZO8atk'; 'S15E4' = '2rhhQe_N4-0'; 'S15E3' = 'Z910uVW_W7o'; 'S15E2' = 'px_Gp03rikw'; 'S15E1' = 'v7XQ5UYQgr0'
  'SNDE2' = '86619a9rNco'; 'SNDE1' = 'i3B4FaWjLDs'
  'S14E11' = 'spjKJlSabj8'; 'S14E10' = '7HUaKruVNZw'; 'S14E9' = 's9rQjRvMPiM'; 'S14E8' = 'i5fpiZWTZyQ'; 'S14E7' = 'MVXaP0FHi-c'
  'S14E6' = '1DbdLqKucSM'; 'S14A6' = 'tcSI2RgyCUg'; 'S14E5' = '1WlErPYJ-D0'; 'S14E3' = 'UBZhJMyXMLw'; 'S14E2' = 'lYz75qU2s-U'
  'S13E5' = 'P00ECbM1cYw'; 'S13E3' = '35dwpbLTDus'; 'S13E2' = 'sXBy0FuWEbA'; 'S13E1' = 'w8o4i0wjzNY'
  'S11E13' = 'VdBk-A6-6Jg'; 'S12E3' = 'ZV2751BlQfM'; 'S11E12' = '90UWNxn0FSs'; 'S12E1' = 'e9qsLldviCA'; 'S10E3' = 'owC9EuXSY98'
}

function Get-Url([string]$url) {
  $r = Invoke-WebRequest -UseBasicParsing -Uri $url -Headers @{ 'User-Agent' = $ua }
  return [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
}

function Get-YoutubeVideos {
  $client = @{ client = @{ clientName = 'WEB'; clientVersion = '2.20240101.00.00'; hl = 'fr' } }
  $list = New-Object System.Collections.ArrayList
  foreach ($params in @('EgZ2aWRlb3PyBgQKAjoA', 'EgdzdHJlYW1z8gYECgJ6AA==')) {
    $body = @{ context = $client; browseId = $channelId; params = $params } | ConvertTo-Json -Depth 6 -Compress
    for ($page = 0; $page -lt 30; $page++) {
      $r = Invoke-WebRequest -UseBasicParsing -Method Post -ContentType 'application/json' `
        -Uri 'https://www.youtube.com/youtubei/v1/browse?prettyPrint=false' `
        -Body ([Text.Encoding]::UTF8.GetBytes($body)) -Headers @{ 'User-Agent' = $ua }
      $txt = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
      foreach ($seg in ($txt -split '"lockupViewModel":')) {
        $id = [regex]::Match($seg, '"contentId":"([A-Za-z0-9_-]{11})"')
        $t = [regex]::Match($seg, '"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"')
        if (-not $id.Success -or -not $t.Success) { continue }
        $dur = [regex]::Match($seg, '"text":"(\d{1,2}(?::\d{2}){1,2})"')
        [void]$list.Add([pscustomobject]@{
          id = $id.Groups[1].Value
          title = [regex]::Unescape($t.Groups[1].Value)
          seconds = $(if ($dur.Success) { ConvertTo-Seconds $dur.Groups[1].Value } else { 0 })
        })
      }
      $c = [regex]::Match($txt, '"continuationCommand":\{"token":"([^"]+)"')
      if (-not $c.Success) { break }
      $body = @{ context = $client; continuation = $c.Groups[1].Value } | ConvertTo-Json -Depth 6 -Compress
    }
  }
  # L'ordre est conserve (du plus recent au plus ancien) : a score egal, Find-Video garde le plus ancien.
  $seen = @{}
  return $list | Where-Object { if ($seen[$_.id]) { $false } else { $seen[$_.id] = $true; $true } }
}

# Flux officiel de la chaine : 15 dernieres videos seulement, sans la duree.
function Get-YoutubeFeed {
  [xml]$feed = Get-Url "https://www.youtube.com/feeds/videos.xml?channel_id=$channelId"
  return $feed.feed.entry | ForEach-Object {
    [pscustomobject]@{ id = $_.GetElementsByTagName('yt:videoId')[0].InnerText; title = $_.title; seconds = 0 }
  }
}

function ConvertTo-Seconds([string]$s) {
  $total = 0
  foreach ($p in ($s -split ':')) { $total = $total * 60 + [int]$p }
  return $total
}

function Get-Tokens([string]$s) {
  $n = $s.Normalize([Text.NormalizationForm]::FormD)
  $n = [regex]::Replace($n, '\p{Mn}', '').ToLowerInvariant()
  $stop = 'les','des','une','dans','pour','avec','sur','que','qui','est','aux','par','son','ses','ces','quoi','comment','parlons','nous','vous','wolof','tech','woloftech','episode','saison'
  return [regex]::Matches($n, '[a-z0-9]{3,}') | ForEach-Object { $_.Value } | Where-Object { $stop -notcontains $_ } | Select-Object -Unique
}

function Find-Video($ep, $tokens, $videos, $used) {
  $best = $null; $bestScore = 0
  foreach ($v in $videos) {
    if ($used.ContainsKey($v.id)) { continue }
    $code = $ep.id -replace 'P\d$', ''
    $score = 0
    if ($v.title -match "(?i)\b$code\b") { $score += 0.6 }
    $vt = @(Get-Tokens $v.title)
    if ($vt.Count -and $tokens.Count) {
      $common = @($tokens | Where-Object { $vt -contains $_ }).Count
      $score += $common / [Math]::Min($tokens.Count, $vt.Count)
    }
    if ($v.seconds -gt 0 -and $ep.seconds -gt 0) {
      $ratio = [Math]::Abs($v.seconds - $ep.seconds) / $ep.seconds
      if ($ratio -lt 0.05) { $score += 0.35 } elseif ($ratio -gt 0.5) { $score -= 0.5 }
    }
    if ($score -ge $bestScore -and $score -gt 0) { $bestScore = $score; $best = $v }
  }
  if ($bestScore -ge 0.75) { return $best }
  return $null
}

function Get-Numbering($rawTitle, $tagSeason, $tagEpisode) {
  $season = 0; $episode = 0; $part = 0; $kind = 'episode'; $title = $rawTitle.Trim()

  if ($title -match '^SNDTE\d+\s*-\s*') {
    # Serie speciale New Deal Technologique : numerotee par date dans le flux.
    $kind = 'special'; $season = 0; $title = $title -replace '^SNDTE\d+\s*-\s*', ''
    $episode = $(if ($title -match '(?i)souverainet') { 1 } else { 2 })
  }
  elseif ($title -match '^S1467\s*-\s*') {
    $season = 14; $episode = 7; $title = $title -replace '^S1467\s*-\s*', ''
  }
  elseif ($title -match '^S(\d+)(?:P\d+)?E(\d+)(?:P(\d+))?(?:\s*-\s*P(\d+))?\s*[-:]\s*') {
    $season = [int]$Matches[1]; $episode = [int]$Matches[2]
    if ($Matches[3]) { $part = [int]$Matches[3] }
    if ($Matches[4]) { $part = [int]$Matches[4] }
    $title = $title -replace '^S\d+(?:P\d+)?E\d+(?:P\d+)?(?:\s*-\s*P\d+)?\s*[-:]\s*', ''
  }
  else {
    $season = [int]$(if ($tagSeason) { $tagSeason } else { 1 })
    $episode = [int]$(if ($tagEpisode) { $tagEpisode } else { 0 })
    if ($title -match '^Annonce\s*-\s*') { $kind = 'annonce'; $title = $title -replace '^Annonce\s*-\s*', '' }
    if ($title -match '^WOLOF TECH\s*-\s*FLASH\s*-\s*') { $kind = 'flash'; $title = $title -replace '^WOLOF TECH\s*-\s*FLASH\s*-\s*', '' }
    if ($title -match '(?i)^Comment .pargner') { $episode = 2 }  # tague E1 par erreur dans le flux
    if ($title -match '(?i)_Partie_?0?(\d)') { $part = [int]$Matches[1]; $title = $title -replace '\s*_Partie_?\d+', '' }
  }

  $id = $(if ($season -eq 0) { "SNDE$episode" } elseif ($kind -eq 'annonce') { "S${season}A$episode" } else { "S${season}E$episode" })
  if ($part) { $id += "P$part" }
  return @{ id = $id; season = $season; episode = $episode; part = $part; kind = $kind; title = $title.Trim() }
}

function Get-CleanDescription([string]$html) {
  $t = $html -replace '</p>|<br\s*/?>|</li>', "`n" -replace '<[^>]+>', ''
  $t = [Web.HttpUtility]::HtmlDecode($t)
  # On coupe tout ce qui suit les mentions repetees (soutien, vocalcast, reseaux, sponsors).
  $cutMarkers = '(?im)^\s*(Support the show|Chers auditeurs|Vocalcast|Participez a la rubrique|Pour participer au VOCALCAST|Wolof Tech sur les r|Nous contacter|Sponsors\s*:|Send us a text).*$'
  $m = [regex]::Match($t, $cutMarkers)
  if ($m.Success -and $m.Index -gt 40) { $t = $t.Substring(0, $m.Index) }
  $t = $t -replace 'Chers auditeurs[\s\S]*$', ''
  # Coordonnees personnelles des invites : elles ne sont pas republiees sur le site.
  $t = $t -replace '(?:\+?221\s*)?\b7[05678](?:[ .]?\d){7}\b', ''
  $t = $t -replace '[\w.+-]+@[\w-]+\.[\w.-]+', ''
  $t = $t -replace '[ \t]+', ' '
  $lines = $t -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -and $_ -notmatch '^(Whatsapp|Contacts)\s*:?\s*$' }
  return ($lines -join "`n")
}

function Get-Summary([string]$text) {
  $flat = ($text -split "`n" | Select-Object -First 3) -join ' '
  if ($flat.Length -le 170) { return $flat }
  $cut = $flat.Substring(0, 170)
  return $cut.Substring(0, $cut.LastIndexOf(' ')) + [char]0x2026
}

function Save-Thumbnail([string]$url, [string]$path) {
  $bytes = (Invoke-WebRequest -UseBasicParsing -Uri $url).Content
  $ms = New-Object IO.MemoryStream(, $bytes)
  $img = [Drawing.Image]::FromStream($ms)
  $bmp = New-Object Drawing.Bitmap 480, 480
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($img, 0, 0, 480, 480)
  $codec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $params = New-Object Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality, [long]78)
  $bmp.Save($path, $codec, $params)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose(); $ms.Dispose()
}

Write-Host 'Lecture du flux RSS...'
[xml]$rss = Get-Url $rssUrl

# Les videos deja associees ne changent plus : seuls les nouveaux episodes sont recherches.
$episodesFile = Join-Path $root 'data\episodes.js'
$prevVideos = @{}
$prevIds = @{}
if (Test-Path $episodesFile) {
  $prevText = [IO.File]::ReadAllText($episodesFile, [Text.Encoding]::UTF8)
  $prevJson = [regex]::Match($prevText, 'window\.WT_EPISODES = ([\s\S]*);\s*$').Groups[1].Value
  foreach ($old in (ConvertFrom-Json $prevJson)) {
    $prevIds[$old.id] = $true
    if ($old.video) { $prevVideos[$old.id] = $old.video }
  }
}

# Sans YouTube, le site se met quand meme a jour : la video sera cherchee au prochain passage.
Write-Host 'Lecture de la chaine YouTube...'
$videos = @()
try { $videos = @(Get-YoutubeVideos) } catch { Write-Warning "Liste complete indisponible : $($_.Exception.Message)" }
if (-not $videos.Count) {
  try { $videos = @(Get-YoutubeFeed) } catch { Write-Warning "Flux YouTube indisponible : $($_.Exception.Message)" }
}
Write-Host "  $($videos.Count) videos"

$episodes = New-Object System.Collections.ArrayList
foreach ($item in $rss.rss.channel.item) {
  $num = Get-Numbering $item.title.InnerText `
    $item.GetElementsByTagName('itunes:season')[0].InnerText `
    $item.GetElementsByTagName('itunes:episode')[0].InnerText
  $dur = $item.GetElementsByTagName('itunes:duration')[0].InnerText
  $desc = Get-CleanDescription $item.description.InnerText
  [void]$episodes.Add([pscustomobject][ordered]@{
    id = $num.id; season = $num.season; episode = $num.episode; part = $num.part; kind = $num.kind
    title = $num.title
    date = ([datetime]$item.pubDate).ToUniversalTime().ToString('yyyy-MM-dd')
    duration = $dur
    seconds = ConvertTo-Seconds $dur
    summary = Get-Summary $desc
    description = $desc
    audio = $item.enclosure.url
    spotify = ($item.link -replace 'podcasters\.spotify\.com', 'creators.spotify.com')
    video = ''
    remoteImage = $item.GetElementsByTagName('itunes:image')[0].GetAttribute('href')
    image = ''
  })
}

$dups = $episodes | Group-Object id | Where-Object { $_.Count -gt 1 }
if ($dups) { throw "Identifiants en double : $(($dups | ForEach-Object { $_.Name }) -join ', ')" }
# Un flux tronque ne doit pas effacer des episodes du site.
if ($episodes.Count -lt $prevIds.Count * 0.9) { throw "Flux suspect : $($episodes.Count) episodes contre $($prevIds.Count) sur le site." }

# Association video : en commencant par les plus recents.
$used = @{}
foreach ($ep in ($episodes | Sort-Object date -Descending)) {
  if ($videoOverrides.ContainsKey($ep.id)) {
    $ep.video = $videoOverrides[$ep.id]
  } elseif ($prevVideos.ContainsKey($ep.id)) {
    $ep.video = $prevVideos[$ep.id]
  }
  if ($ep.video) { $used[$ep.video] = $true }
}
foreach ($ep in ($episodes | Sort-Object date -Descending)) {
  if ($videoOverrides.ContainsKey($ep.id) -or $ep.video -or $ep.kind -eq 'annonce') { continue }
  $tokens = @(Get-Tokens $ep.title)
  $match = Find-Video $ep $tokens $videos $used
  if ($match) { $ep.video = $match.id; $used[$match.id] = $true }
}

if (-not $SkipImages) {
  $dir = Join-Path $root 'assets\episodes'
  New-Item -ItemType Directory -Force $dir | Out-Null
  foreach ($ep in $episodes) {
    $file = Join-Path $dir "$($ep.id.ToLower()).jpg"
    if (-not (Test-Path $file)) {
      Write-Host "  image $($ep.id)"
      Save-Thumbnail $ep.remoteImage $file
    }
  }
}
foreach ($ep in $episodes) { $ep.image = "assets/episodes/$($ep.id.ToLower()).jpg" }

$clean = $episodes | Select-Object id, season, episode, part, kind, title, date, duration, summary, description, audio, spotify, video, image
$json = $clean | ConvertTo-Json -Depth 4
$out = "// Fichier genere par tools/update-episodes.ps1 - ne pas modifier a la main.`nwindow.WT_EPISODES = $json;`n"
New-Item -ItemType Directory -Force (Join-Path $root 'data') | Out-Null
[IO.File]::WriteAllText((Join-Path $root 'data\episodes.js'), $out, (New-Object Text.UTF8Encoding $false))

# Ce qui reste a completer a la main pour chaque nouvel episode.
$invitesText = [IO.File]::ReadAllText((Join-Path $root 'data\invites.js'), [Text.Encoding]::UTF8)
$saisonsText = [IO.File]::ReadAllText((Join-Path $root 'data\saisons.js'), [Text.Encoding]::UTF8)
$report = New-Object System.Collections.ArrayList
foreach ($ep in ($episodes | Where-Object { -not $prevIds.ContainsKey($_.id) })) {
  [void]$report.Add("### Nouvel episode $($ep.id) : $($ep.title)")
  if ($ep.video) { [void]$report.Add("- Video choisie, a verifier : https://www.youtube.com/watch?v=$($ep.video)") } else { [void]$report.Add('- Aucune video trouvee pour le moment') }
  if ($invitesText -notmatch "'$($ep.id)'") { [void]$report.Add('- Invite a ajouter dans data/invites.js') }
  if ($ep.season -gt 0 -and $saisonsText -notmatch "numero: $($ep.season)\b") { [void]$report.Add("- Saison $($ep.season) a decrire dans data/saisons.js") }
}
if ($report.Count) {
  $report | ForEach-Object { Write-Host $_ }
  if ($env:GITHUB_STEP_SUMMARY) { [IO.File]::AppendAllLines($env:GITHUB_STEP_SUMMARY, [string[]]$report) }
}

$withVideo = @($episodes | Where-Object { $_.video }).Count
Write-Host "$($episodes.Count) episodes, $withVideo avec video."
Write-Host 'Sans video :'
$episodes | Where-Object { -not $_.video } | ForEach-Object { Write-Host "  $($_.id)  $($_.title)" }
Write-Host 'Videos non rattachees a un episode :'
$videos | Where-Object { -not $used.ContainsKey($_.id) } | ForEach-Object { Write-Host "  $($_.id)  $($_.title)" }
Write-Host 'Associations :'
foreach ($ep in $episodes | Where-Object { $_.video }) {
  $v = $videos | Where-Object { $_.id -eq $ep.video } | Select-Object -First 1
  Write-Host "  $($ep.id) | $($ep.title) => $($v.title)"
}
