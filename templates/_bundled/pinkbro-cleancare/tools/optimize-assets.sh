#!/usr/bin/env bash
# PinkBro 자산 최적화. 원본은 _workspace/pinkbro/assets/raw/ 에서 읽고,
# 템플릿 자산으로 변환해 넣는다. 멱등.
set -euo pipefail

# tools/ → 템플릿 루트 → _bundled → templates → 저장소 루트 (4단계)
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
SRC="$ROOT/_workspace/pinkbro/assets/raw"
SRC_US="$ROOT/_workspace/pinkbro/assets/unsplash"
DST="$(cd "$(dirname "$0")/.." && pwd)/public/images"

mkdir -p "$DST"

# 로고 — 표시 폭 186px(데스크톱) / 150px(모바일) → 600px면 충분
ffmpeg -y -loglevel error -i "$SRC/brand-logo.png" -vf scale=600:-1 -quality 90 "$DST/brand-logo.webp"

# og:image 는 원본 크기 유지 (PNG → 그대로 복사, 압축만)
cp "$SRC/brand-logo.png" "$DST/og-image.png"

# 서비스 사진 6장 — 표시 413x220 → 2배수 720x540
# 기본 품질 80 실측: 4장이 60~66KB 대역에 들고, 세부가 많은 2장만 대역을 넘는다.
# 그래서 그 2장만 품질을 낮춘다 — 전역으로 낮추면 나머지 4장이 60KB 아래로 내려간다.
for f in service-floor-care service-glass-care service-awning-care \
         service-sign-care service-kitchen-care service-air-care; do
  case "$f" in
    service-sign-care)   q=75 ;;  # 간판 문자·반사 등 고주파 디테일
    service-awning-care) q=78 ;;
    *)                   q=80 ;;
  esac
  ffmpeg -y -loglevel error -i "$SRC/$f.png" -vf scale=720:540 -quality "$q" "$DST/$f.webp"
done

# 원본 Unsplash 배경 사진 5장 — _workspace/pinkbro/assets/unsplash/*.jpg 를 webp 로 변환.
# 출처(_workspace/pinkbro/source/styles.css):
#   hero-shell.jpg     :70  .hero-shell::before     photo-1552566626-52f8b828add9
#   hero-visual.jpg    :101 .hero-visual-clean      photo-1517248135467-4c7edcad34c4
#   why-stage.jpg      :116 .why-stage::before      photo-1466978913421-dad2ebd01d17
#   package-stage.jpg  :158 .package-stage::before  photo-1507915135761-41a0a222c709
#   estimate-bg.jpg    :225 .estimate-shell::before photo-1481833761820-0509d3217039
# 화면 표시(1440x1000 실측): hero-shell 1280x791, hero-visual 544x663,
# why-stage 595x620, package-stage 1280x1270, estimate-bg 1280x509. CSS center/cover 크롭.
# 크기 목표는 서비스 사진과 같은 60~75KB 대역이지만, 이 사진은 전신 풍경 사진이라
# hero-shell/package-stage 는 대역 진입 시 q≈40 이하로 떨어져 원본과 눈에 띄게 달라진다.
# 그래서 둘은 대역을 벗어나더라도 원본 대비 손실을 최소화하는 폭을 택했다(실측 주석).
#   hero-shell     1280w(표시 1.0x) q65 → 137,660B (q38이면 75KB, 눈에 띄는 뭉개짐)
#   hero-visual    1000w(세로 크롭 커버 1x 최소폭 994) q58 → 72,116B
#   why-stage       950w(표시 1.6x) q58 → 72,900B
#   package-stage 1800w(원본 핫링크 w1800과 동일) q58 → 84,746B (1600w q58=62KB, 1.19x 업스케일)
#   estimate-bg    1600w(표시 1.25x) q80 → 61,008B
for spec in "hero-shell 1280 65" "hero-visual 1000 58" "why-stage 950 58" \
            "package-stage 1800 58" "estimate-bg 1600 80"; do
  set -- $spec
  ffmpeg -y -loglevel error -i "$SRC_US/$1.jpg" -vf scale="$2":-2 -quality "$3" "$DST/$1.webp"
done

echo "--- 결과 ---"
ls -la "$DST"
du -sh "$DST"
