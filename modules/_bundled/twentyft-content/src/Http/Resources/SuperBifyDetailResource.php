<?php

namespace Modules\Twentyft\Content\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SuperBify 상세용 Public DTO
 */
class SuperBifyDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['public_id'],
            'slug' => $this->resource['slug'],
            'title' => $this->resource['title'],
            'summary' => $this->resource['summary'],
            'description' => $this->resource['description'],
            'type' => $this->resource['type'],
            'status' => $this->resource['status'],
            'version' => $this->resource['version'],
            'compatibility' => $this->resource['g7_compatibility'],
            'license' => $this->resource['license'],
            'featured' => $this->resource['is_featured'],
            'links' => [
                'github' => $this->resource['github_url'],
                'sir' => $this->resource['sir_url'],
                'docs' => $this->resource['docs_url'],
                'release' => $this->resource['release_url'],
                'download' => $this->resource['download_url'] ?? null,
                'purchase' => $this->resource['purchase_url'] ?? null,
                'demo' => $this->resource['demo_url'],
            ],
            'coverImageUrl' => $this->resource['cover_image_url'],
            'screenshotImageUrls' => $this->resource['screenshot_image_urls'],
        ];
    }
}
