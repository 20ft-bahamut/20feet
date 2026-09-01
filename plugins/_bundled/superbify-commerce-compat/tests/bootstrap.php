<?php

/**
 * Compat 플러그인 테스트 네임스페이스 부트스트랩.
 *
 * 코어 tests/bootstrap.php 는 _bundled 플러그인의 테스트 PSR-4 를
 * `Plugins\Sirsoft\Commerce\Tests\` 로 hardcode 등록한다
 * (vendor=SuperBify + name=commerce-compat 의 3-segment name 으로 vendor-name 만 분리).
 * 본 Compat 플러그인의 진짜 PSR-4 prefix 는 `Plugins\Superbify\Commerce\Compat\Tests\` 이므로
 * 코어 매핑이 일치하지 않는다.
 *
 * 본 파일을 plugin composer.json `autoload.files` 에 등록하면:
 *   - 코어 tests/bootstrap.php 가 디렉토리 스캔 중 require_once 한다 (테스트 환경).
 *   - 프로덕션 부팅 경로에서는 본 파일이 require 되지 않는다 (루트 composer 가 본 플러그인을
 *     require 하지 않으므로 plugin composer.json autoload.files 도 로드되지 않음).
 *
 * 부수 안전망: app() 컨테이너가 미존재하는 환경 (composer dump-autoload 등) 에서는
 * spl_autoload_register 만 등록하고 즉시 종료한다.
 */

if (! defined('SUPERBIFY_COMPAT_TESTS_AUTOLOAD_BOOTSTRAPPED')) {
    define('SUPERBIFY_COMPAT_TESTS_AUTOLOAD_BOOTSTRAPPED', true);

    $baseDir = __DIR__;
    $prefix = 'Plugins\\Superbify\\Commerce\\Compat\\Tests\\';
    $prefixLen = strlen($prefix);

    spl_autoload_register(static function (string $class) use ($prefix, $prefixLen, $baseDir): void {
        if (strncmp($prefix, $class, $prefixLen) !== 0) {
            return;
        }
        $relative = substr($class, $prefixLen);
        $file = $baseDir.'/'.str_replace('\\', '/', $relative).'.php';
        if (file_exists($file) && ! class_exists($class, false)) {
            require_once $file;
        }
    }, prepend: true);
}
