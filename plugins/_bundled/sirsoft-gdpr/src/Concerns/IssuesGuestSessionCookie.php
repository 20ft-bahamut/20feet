<?php

declare(strict_types=1);

namespace Plugins\Sirsoft\Gdpr\Concerns;

/**
 * 게스트 세션 식별 쿠키(gdpr_session) 발급/검증 트레이트
 *
 * api 미들웨어 그룹에는 EncryptCookies 가 등록되지 않아 쿠키가 평문으로 오간다.
 * 서버가 발급하지 않은 값을 그대로 신뢰하면 임의로 조작한 session_id 로 타인의
 * 게스트 동의 이력을 조회/철회할 수 있으므로, HMAC 서명을 붙여 위조를 차단한다.
 *
 * sirsoft-pay_nicepayments 등 결제 플러그인의 IssuesReceiptCookie 트레이트와
 * 동일한 서명 컨벤션(hash_hmac + config('app.key'))을 사용한다.
 */
trait IssuesGuestSessionCookie
{
    /**
     * 쿠키 값에 서명을 붙입니다.
     *
     * @param  string  $sessionId  UUID v4 게스트 세션 식별자
     * @return string  "{sessionId}|{signature}" 형태의 쿠키 값
     */
    protected function signGuestSessionId(string $sessionId): string
    {
        return $sessionId.'|'.$this->computeGuestSessionSignature($sessionId);
    }

    /**
     * 쿠키 값에서 서명을 검증하고 원본 session_id 를 반환합니다.
     *
     * 서명이 없거나 위조된 값은 신뢰하지 않고 null 을 반환합니다
     * (호출자는 미식별 게스트로 취급해야 함).
     *
     * @param  string|null  $cookieValue  요청 쿠키 원본 값
     * @return string|null  검증된 session_id, 위조/형식 오류 시 null
     */
    protected function verifyGuestSessionId(?string $cookieValue): ?string
    {
        if (! is_string($cookieValue) || $cookieValue === '') {
            return null;
        }

        $parts = explode('|', $cookieValue, 2);
        if (count($parts) !== 2) {
            return null;
        }

        [$sessionId, $signature] = $parts;

        if ($sessionId === '' || ! ctype_xdigit($signature) || strlen($signature) !== 64) {
            return null;
        }

        if (! hash_equals($this->computeGuestSessionSignature($sessionId), $signature)) {
            return null;
        }

        return substr($sessionId, 0, 100);
    }

    /**
     * session_id 에 대한 HMAC-SHA256 서명을 계산합니다.
     *
     * @param  string  $sessionId  게스트 세션 식별자
     * @return string  64자 hex 서명
     */
    private function computeGuestSessionSignature(string $sessionId): string
    {
        return hash_hmac('sha256', $sessionId, (string) config('app.key', ''));
    }
}
