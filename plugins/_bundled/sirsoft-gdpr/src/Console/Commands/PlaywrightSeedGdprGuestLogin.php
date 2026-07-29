<?php

namespace Plugins\Sirsoft\Gdpr\Console\Commands;

use App\Models\User;
use App\Services\PluginSettingsService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use Plugins\Sirsoft\Gdpr\Concerns\IssuesGuestSessionCookie;
use Plugins\Sirsoft\Gdpr\Services\GdprConsentService;

/**
 * Playwright E2E 용 GDPR "게스트로 배너 닫음 → 다른 계정 로그인" 시나리오 시드 커맨드.
 *
 * 배너 노출 조건 회귀(cookie_banner.json 의 gdprBannerDismissedFor)를 실제 로그인 폼
 * 제출을 거쳐 재현하기 위해 다음을 준비한다:
 *   1. banner_enabled=true 저장 (배너 자체가 꺼져 있으면 시나리오 자체가 성립하지 않음)
 *   2. 서명된 게스트 세션 쿠키 값 발급 + 그 세션 ID 로 "모두 동의" 이력을 실제로 기록
 *      (spec 이 쿠키를 심어 "이미 게스트로 배너를 닫은 상태"를 재현)
 *   3. 로그인 폼에 실제로 제출할 미동의 회원 계정(email/password 고정) 1명 생성
 *      (이 계정은 신규 유저라 동의 이력이 전혀 없음 — 로그인 시 배너가 다시 떠야 정상)
 *
 * 보안 가드 (코어 PlaywrightIssueToken 과 동일 3중 패턴):
 *   ① CLI 한정 — `php_sapi_name() === 'cli'`
 *   ② G7_PLAYWRIGHT_BYPASS=1 환경변수 옵트인
 *   ③ APP_DEBUG=true inline override
 *
 * 호출 예시:
 *   $env:G7_PLAYWRIGHT_BYPASS='1'; php artisan playwright:seed-gdpr-guest-login --json
 */
class PlaywrightSeedGdprGuestLogin extends Command
{
    use IssuesGuestSessionCookie;

    /**
     * 시나리오에서 로그인 폼에 실제로 입력할 고정 비밀번호.
     */
    private const MEMBER_PASSWORD = 'e2e-test-password-1234';

    protected $signature = 'playwright:seed-gdpr-guest-login
        {--json : 결과를 JSON 으로 출력}';

    protected $description = 'Playwright E2E 용 GDPR 게스트→로그인 배너 재노출 시나리오 데이터 시드 (CLI + G7_PLAYWRIGHT_BYPASS 가드)';

    /**
     * 커맨드를 실행합니다.
     *
     * @param  GdprConsentService  $consentService  게스트 동의 이력 기록용
     * @param  PluginSettingsService  $pluginSettings  banner_enabled 저장용
     * @return int 종료 코드
     */
    public function handle(GdprConsentService $consentService, PluginSettingsService $pluginSettings): int
    {
        // ① CLI 한정
        if (php_sapi_name() !== 'cli') {
            $this->error('CLI 전용 커맨드입니다.');

            return self::FAILURE;
        }

        // ② 명시 옵트인
        if (env('G7_PLAYWRIGHT_BYPASS') !== '1') {
            $this->error('G7_PLAYWRIGHT_BYPASS=1 환경변수가 필요합니다.');

            return self::FAILURE;
        }

        // ③ APP_DEBUG 강제
        Config::set('app.debug', true);

        // 배너 자체가 꺼져 있으면 재현이 불가능하므로 명시적으로 켠다.
        $pluginSettings->save('sirsoft-gdpr', ['banner_enabled' => true]);

        // 게스트 세션: 서명된 쿠키 값을 발급하고, 동일 session_id 로 "모두 동의" 이력을 기록한다.
        $guestSessionId = (string) Str::uuid();
        $signedCookieValue = $this->signGuestSessionId($guestSessionId);
        $consentService->updateConsents(
            null,
            $guestSessionId,
            ['cookie_necessary' => true, 'cookie_functional' => true, 'cookie_analytics' => true, 'cookie_marketing' => true],
            'banner'
        );

        // 로그인 대상 회원: 동의 이력이 전혀 없는 신규 계정.
        $email = 'e2e-gdpr-guest-login-'.uniqid().'@example.test';
        $member = User::factory()->create([
            'email' => $email,
            'password' => bcrypt(self::MEMBER_PASSWORD),
        ]);

        $result = [
            'guest_session_cookie_value' => $signedCookieValue,
            'member_email' => $member->email,
            'member_password' => self::MEMBER_PASSWORD,
        ];

        if ($this->option('json')) {
            $this->line(json_encode($result, JSON_UNESCAPED_UNICODE));
        } else {
            $this->info('GDPR 게스트→로그인 시나리오 시드 완료: '.$member->email);
        }

        return self::SUCCESS;
    }
}