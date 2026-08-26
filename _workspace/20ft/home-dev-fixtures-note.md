# Home 개발용 Fixture 전환 기록

- 위치: `templates/_bundled/twentyft-studio/layouts/home.json`
- 전환: `SelectedPortfolio` / `SuperBifyPreview` 의 `props.useFixtures` 를 `true` 로 설정.
- 목적: 디자인 검증을 위해 실제 data source 가 비어 있어도 채워진 상태 UI 를 볼 수 있게 함.
- Fixture 파일:
  - `src/fixtures/portfolio.ts` (isFixture: true)
  - `src/fixtures/superbify.ts` (isFixture: true)
- 조치: 운영 데이터 연동 전/디자인 승인 후에는 `useFixtures: true` 를 제거하여 실제 data source 가 노출되도록 해야 함.
