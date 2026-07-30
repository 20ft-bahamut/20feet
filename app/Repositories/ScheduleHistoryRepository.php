<?php

namespace App\Repositories;

use App\Contracts\Repositories\ScheduleHistoryRepositoryInterface;
use App\Models\ScheduleHistory;
use App\Repositories\Concerns\PaginatesWithDeferredJoin;
use App\Repositories\Concerns\ResolvesSortSpec;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ScheduleHistoryRepository implements ScheduleHistoryRepositoryInterface
{
    use PaginatesWithDeferredJoin;
    use ResolvesSortSpec;

    /**
     * ID로 실행 이력을 찾습니다.
     *
     * @param  int  $id  이력 ID
     * @return ScheduleHistory|null 찾은 이력 모델 또는 null
     */
    public function findById(int $id): ?ScheduleHistory
    {
        return ScheduleHistory::with(['schedule', 'triggeredBy'])->find($id);
    }

    /**
     * 새로운 실행 이력을 생성합니다.
     *
     * @param  array  $data  이력 생성 데이터
     * @return ScheduleHistory 생성된 이력 모델
     */
    public function create(array $data): ScheduleHistory
    {
        return ScheduleHistory::create($data);
    }

    /**
     * 기존 실행 이력을 업데이트합니다.
     *
     * @param  ScheduleHistory  $history  업데이트할 이력 모델
     * @param  array  $data  업데이트할 데이터
     * @return bool 업데이트 성공 여부
     */
    public function update(ScheduleHistory $history, array $data): bool
    {
        return $history->update($data);
    }

    /**
     * 실행 이력을 삭제합니다.
     *
     * @param  ScheduleHistory  $history  삭제할 이력 모델
     * @return bool 삭제 성공 여부
     */
    public function delete(ScheduleHistory $history): bool
    {
        return $history->delete();
    }

    /**
     * 특정 스케줄의 실행 이력을 페이지네이션하여 조회합니다.
     *
     * @param  int  $scheduleId  스케줄 ID
     * @param  array  $filters  필터 조건 배열
     * @return LengthAwarePaginator 페이지네이션된 이력 목록
     */
    public function getPaginatedByScheduleId(int $scheduleId, array $filters = []): LengthAwarePaginator
    {
        $query = ScheduleHistory::with('triggeredBy')
            ->where('schedule_id', $scheduleId);

        // 상태 필터
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // 트리거 유형 필터
        if (! empty($filters['trigger_type'])) {
            $query->where('trigger_type', $filters['trigger_type']);
        }

        // 날짜 필터
        if (! empty($filters['started_from'])) {
            $query->whereDate('started_at', '>=', $filters['started_from']);
        }

        if (! empty($filters['started_to'])) {
            $query->whereDate('started_at', '<=', $filters['started_to']);
        }

        // 정렬 — 요청 값은 허용 목록으로만 해석한다.
        // 허용 집합은 ScheduleHistoryListRequest 의 `in:` 규칙과 동일해야 한다. 저장소 목록이
        // 그보다 좁으면 게이트를 통과한 정렬이 조용히 기본값으로 되돌아간다 (종료시각/소요시간).
        $sort = $this->resolveSortSpec(
            $filters,
            ['started_at', 'ended_at', 'duration', 'status'],
            'started_at'
        );

        $perPage = (int) ($filters['per_page'] ?? 15);

        // 실행 이력은 계속 쌓이며 출력/에러 메시지를 그대로 노출하므로, 컬럼은 좁히지 않고
        // 지연 조인으로 넓은 컬럼을 읽는 행 수만 이번 페이지 분량으로 고정한다.
        return $this->paginateWithDeferredJoin(
            query: $query,
            columns: ['*'],
            sort: $sort,
            perPage: $perPage,
        );
    }

    /**
     * 특정 스케줄의 최근 실행 이력을 조회합니다.
     *
     * @param  int  $scheduleId  스케줄 ID
     * @param  int  $limit  조회 개수
     * @return Collection 최근 이력 컬렉션
     */
    public function getRecentByScheduleId(int $scheduleId, int $limit = 10): Collection
    {
        return ScheduleHistory::with('triggeredBy')
            ->where('schedule_id', $scheduleId)
            ->orderByDesc('started_at')
            ->limit($limit)
            ->get();
    }

    /**
     * 여러 이력을 일괄 삭제합니다.
     *
     * @param  array  $ids  이력 ID 배열
     * @return int 삭제된 레코드 수
     */
    public function bulkDelete(array $ids): int
    {
        return ScheduleHistory::whereIn('id', $ids)->delete();
    }

    /**
     * 특정 스케줄의 모든 이력을 삭제합니다.
     *
     * @param  int  $scheduleId  스케줄 ID
     * @return int 삭제된 레코드 수
     */
    public function deleteByScheduleId(int $scheduleId): int
    {
        return ScheduleHistory::where('schedule_id', $scheduleId)->delete();
    }

    /**
     * 특정 기간 이전의 이력을 삭제합니다.
     *
     * @param  int  $days  보관 기간 (일)
     * @return int 삭제된 레코드 수
     */
    public function deleteOlderThan(int $days): int
    {
        return ScheduleHistory::where('started_at', '<', now()->subDays($days))->delete();
    }
}
