<?php

namespace App\Upgrades;

use App\Extension\AbstractUpgradeStep;

/**
 * 코어 7.0.6 업그레이드 스텝
 *
 * 모든 비즈니스 로직은 본 클래스 파일이 아닌 `upgrades/data/7.0.6/` 안에 격리된다:
 *
 *   - migrations/
 *       01_NullifyUntouchedSeoCacheOverrides.php
 *         SEO 캐시 설정을 "미설정(null) = 고급 탭 값 사용" 의미로 이행 (결정 D19).
 *         옛 기본값 그대로인 키는 null 로 비우고, 다른 값이면 오버라이드로 보존한다.
 *       02_ClearSeoPageCacheAfterRendererParityFix.php
 *         봇용 페이지 캐시를 1회 전량 무효화한다. 7.0.6 이전 렌더러가 빈 본문으로
 *         저장한 결과물이 캐시 수명 동안 계속 서빙되는 것을 막는다.
 *       03_BackfillForeignKeyColumnComments.php
 *         외래키 컬럼의 비어 있는 한국어 comment 를 채운다. `->comment()` 가
 *         `->constrained()` 뒤에 체인되어 컬럼이 아닌 FK 정의에 부착되던 문제를
 *         소스에서 교정했으나, 기설치본은 마이그레이션이 재실행되지 않아 남는다.
 *
 * 본 클래스는 `AbstractUpgradeStep` 의 default `run()` 에 위임 — 별도 override 없음.
 *
 * @upgrade-path 7.0.x → 7.0.6
 *
 * 의존성 제약: 본 스텝은 변환/핫픽스를 `data/7.0.6/migrations/` 의 버전 namespace
 * 클래스에 위임한다. 미래 버전에서 *그 디렉토리는 동결* (수정 금지) 되어 "각 스텝별 동작
 * 100% 동일 보장" invariant 가 성립.
 *
 * 상세: docs/extension/upgrade-step-guide.md §13 "버전별 데이터 스냅샷"
 */
class Upgrade_7_0_6 extends AbstractUpgradeStep
{
    // 모든 로직 위임 — data/7.0.6/ 가 SSoT.
}
