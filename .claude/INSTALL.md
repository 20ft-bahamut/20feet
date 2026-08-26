# 설치 / 복구

Claude Code는 `20feet/` 프로젝트 루트에서 실행한다.

Source Guard Hook은 사용하지 않는다.
기존 버전에 `.claude/hooks/`가 남아 있다면 삭제한다.

```bash
cd ~/20feet
rm -rf .claude/hooks
```

그 후 새 Harness 파일을 덮어쓴다.

확인:

```bash
cd ~/20feet
find .claude -maxdepth 2 -type d -name hooks -print
cat .claude/settings.json
```

`find` 결과에 `.claude/hooks`가 나오지 않아야 한다.
