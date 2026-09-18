#!/usr/bin/env bash
# PinkBro 자산 최적화. 원본은 _workspace/pinkbro/assets/raw/ 에서 읽고,
# 템플릿 자산으로 변환해 넣는다. 멱등.
set -euo pipefail

# tools/ → 템플릿 루트 → _bundled → templates → 저장소 루트 (4단계)
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
SRC="$ROOT/_workspace/pinkbro/assets/raw"
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

echo "--- 결과 ---"
ls -la "$DST"
du -sh "$DST"
