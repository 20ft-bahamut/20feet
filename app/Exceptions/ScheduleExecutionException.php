<?php

namespace App\Exceptions;

use Exception;

/**
 * 스케줄 실행 실패 예외
 *
 * 저장된 스케줄을 실행하는 시점에 차단 목록에 걸리거나(artisan/shell 화이트리스트, 내부망 URL),
 * 실행 자체가 실패했을 때 발생합니다. `ScheduleService` 가 이 예외를 잡아 실행 이력에 기록합니다.
 */
class ScheduleExecutionException extends Exception
{
    /**
     * 허용되지 않은 Artisan 명령
     *
     * @return self 생성된 예외
     */
    public static function artisanNotAllowed(): self
    {
        return new self(__('schedule.artisan_not_allowed'));
    }

    /**
     * 허용되지 않은 쉘 명령
     *
     * @return self 생성된 예외
     */
    public static function shellNotAllowed(): self
    {
        return new self(__('schedule.shell_not_allowed'));
    }

    /**
     * 쉘 명령 실행 실패
     *
     * @param  string  $errorOutput  프로세스 표준 에러 출력
     * @param  int  $exitCode  프로세스 종료 코드
     * @return self 생성된 예외
     */
    public static function shellCommandFailed(string $errorOutput, int $exitCode): self
    {
        return new self($errorOutput !== '' ? $errorOutput : __('schedule.shell_command_failed'), $exitCode);
    }

    /**
     * 공개되지 않은(내부망) URL 호출 차단
     *
     * @return self 생성된 예외
     */
    public static function urlNotPublic(): self
    {
        return new self(__('schedule.url_not_public'));
    }

    /**
     * HTTP 요청 실패
     *
     * @param  int  $status  응답 상태 코드
     * @return self 생성된 예외
     */
    public static function httpRequestFailed(int $status): self
    {
        return new self(__('schedule.http_request_failed', ['status' => $status]), $status);
    }
}
