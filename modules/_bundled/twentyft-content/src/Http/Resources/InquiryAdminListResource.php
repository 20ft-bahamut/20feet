<?php

namespace Modules\Twentyft\Content\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 프로젝트 문의 관리자 목록 아이템
 */
class InquiryAdminListResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'postId' => $this->resource['post_id'],
            'title' => $this->resource['title'],
            'name' => $this->resource['name'],
            'email' => $this->resource['email'],
            'phone' => $this->resource['phone'],
            'company' => $this->resource['company'],
            'projectType' => $this->resource['project_type'],
            'budgetRange' => $this->resource['budget_range'],
            'internalStatus' => $this->resource['internal_status'],
            'createdAt' => $this->resource['created_at'],
        ];
    }
}
