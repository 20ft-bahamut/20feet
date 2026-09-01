<?php

namespace Plugins\Superbify\Commerce\Compat\Listeners;

use App\Contracts\Extension\HookListenerInterface;

/**
 * OptionGroupsDerivationListener
 *
 * WHY: ProductService::rebuildOptionGroups (ProductService.php:898-958) 는 옵션 생성/수정/삭제
 * 시에만 호출된다. 그 이전에 생성된 상품이나 일괄 임포트된 상품의 option_groups 컬럼이
 * null/[]/'' 인 채로 남아 있으면, getDetail() 호출 시 option_groups 가 비어 채워진 1D 회귀가
 * 발생한다 (OPT-020). 본 리스너는 product.after_read 에서 옵션 데이터를 사용해 option_groups
 * 를 in-memory 로 파생한다 (저장 금지 — 관리자 시드 우선). ProductService::rebuildOptionGroups
 * 의 규칙과 동일하게 normalized key + values 를 만들어 setAttribute 로 적용한다.
 *
 * TARGET DEFECT: OPT-020.
 *
 * DETECTION: Product.option_groups == null OR [] OR '' (string) && activeOptions.count >= 1.
 *
 * REMOVE WHEN: sirsoft-ecommerce 가 getDetail() 내에서 누락 시 자동 rebuildOptionGroups 를
 * 호출하는 버전이 릴리스되면.
 */
class OptionGroupsDerivationListener implements HookListenerInterface
{
    /**
     * Hook: sirsoft-ecommerce.product.after_read (doAction sync).
     *
     * 액션 시그니처: ($product). ProductService.php:209 에서 doAction 으로 발화.
     * type=action + sync=true → 동기 실행 (in-memory mutation 임무).
     */
    public static function getSubscribedHooks(): array
    {
        return [
            'sirsoft-ecommerce.product.after_read' => [
                'method' => 'handleProductAfterRead',
                'priority' => 20,
                'type' => 'action',
                'sync' => true,
            ],
        ];
    }

    /**
     * HookListenerInterface::handle — 단일 액션 구독이므로 호출되지 않음.
     *
     * @param  mixed  ...$args
     * @return void
     */
    public function handle(...$args): void
    {
        // 단일 액션 구독 — HookListenerRegistrar 가 method 키로 직접 호출한다.
    }

    /**
     * Hook entry point — option_groups 컬럼이 비어있을 때 activeOptions 로 in-memory 파생.
     *
     * @param  mixed  $product
     * @param  mixed  ...$args
     * @return mixed 입력 product (in-place mutation)
     */
    public function handleProductAfterRead($product = null, ...$args)
    {
        if (! is_object($product) || ! method_exists($product, 'getAttribute')) {
            return $product;
        }

        $current = $product->getAttribute('option_groups');

        // 컬럼이 채워진 경우 — 관리자 시드 우선 (건드리지 않음)
        if ($this->isPopulated($current)) {
            return $product;
        }

        // activeOptions 로드 (없으면 빈 collection)
        if (method_exists($product, 'loadMissing')) {
            $product->loadMissing('activeOptions');
        }

        $options = $product->getRelation('activeOptions') ?? $product->options ?? collect();

        if (! is_iterable($options)) {
            return $product;
        }

        $options = collect($options);
        if ($options->isEmpty()) {
            return $product;
        }

        $derived = $this->deriveOptionGroups($options);

        if (empty($derived)) {
            return $product;
        }

        // in-memory mutation — 저장하지 않는다
        $product->setAttribute('option_groups', $derived);
        $product->setAttribute('has_options', true);

        return $product;
    }

    /**
     * 컬럼이 채워졌는지 판정 — null/[]/''/false 모두 "비어있음"으로 간주.
     */
    protected function isPopulated($value): bool
    {
        if ($value === null) {
            return false;
        }
        if (is_string($value) && trim($value) === '') {
            return false;
        }
        if (is_array($value) && empty($value)) {
            return false;
        }

        return true;
    }

    /**
     * ProductService::rebuildOptionGroups 와 동일한 규칙으로 option_groups 재구성.
     */
    public function deriveOptionGroups(iterable $options): array
    {
        $grouped = [];

        foreach ($options as $option) {
            $optionValues = $option->option_values ?? null;
            if ($optionValues === null) {
                continue;
            }

            if ($this->isOptionValuesArrayFormat($optionValues)) {
                foreach ($optionValues as $item) {
                    if (! is_array($item)) {
                        continue;
                    }
                    $key = $item['key'] ?? null;
                    $value = $item['value'] ?? null;
                    if ($key === null || $value === null) {
                        continue;
                    }
                    $normalizedKey = $this->normalizeOptionKey($key);
                    if (! isset($grouped[$normalizedKey])) {
                        $grouped[$normalizedKey] = [
                            'name' => $key,
                            'values' => [],
                        ];
                    }
                    $normalizedValue = $this->normalizeOptionValue($value);
                    $existingNormalized = array_map([$this, 'normalizeOptionValue'], $grouped[$normalizedKey]['values']);
                    if (! in_array($normalizedValue, $existingNormalized, true)) {
                        $grouped[$normalizedKey]['values'][] = $value;
                    }
                }
            } else {
                foreach ($optionValues as $key => $value) {
                    if (! isset($grouped[$key])) {
                        $grouped[$key] = [
                            'name' => $key,
                            'values' => [],
                        ];
                    }
                    if (! in_array($value, $grouped[$key]['values'], true)) {
                        $grouped[$key]['values'][] = $value;
                    }
                }
            }
        }

        return array_values($grouped);
    }

    protected function isOptionValuesArrayFormat($optionValues): bool
    {
        if (! is_array($optionValues) || empty($optionValues)) {
            return false;
        }
        $first = reset($optionValues);

        return is_array($first) && (isset($first['key']) || isset($first['value']));
    }

    protected function normalizeOptionKey($key): string
    {
        if (is_string($key)) {
            return $key;
        }
        if (is_array($key)) {
            foreach ($key as $v) {
                if (is_string($v) && $v !== '') {
                    return $v;
                }
            }
        }

        return (string) $key;
    }

    protected function normalizeOptionValue($value): string
    {
        if (is_string($value)) {
            return $value;
        }
        if (is_array($value)) {
            foreach ($value as $v) {
                if (is_string($v) && $v !== '') {
                    return $v;
                }
            }
        }

        return (string) $value;
    }
}
