<?php

namespace Plugins\Superbify\Commerce\Compat\Tests;

use Plugins\Superbify\Commerce\Compat\Listeners\OptionGroupsDerivationListener;

/**
 * OPT-020 회귀 가드 — option_groups 가 비어있는 상품에 대해 in-memory 로 파생.
 */
class OptionGroupsDerivationListenerTest extends CompatTestCase
{
    public function test_empty_option_groups_gets_derived_from_active_options(): void
    {
        $listener = new OptionGroupsDerivationListener();
        $product = $this->makeProduct(null);

        $result = $listener->handleProductAfterRead($product);

        $this->assertTrue($result->getAttribute('has_options'));
        $groups = $result->getAttribute('option_groups');
        $this->assertIsArray($groups);
        $this->assertNotEmpty($groups);
        $this->assertSame('Color', $groups[0]['name']);
        $this->assertContains('Red', $groups[0]['values']);
    }

    public function test_populated_option_groups_not_overwritten(): void
    {
        $listener = new OptionGroupsDerivationListener();
        $product = $this->makeProduct([['name' => 'Preset', 'values' => ['A']]]);

        $result = $listener->handleProductAfterRead($product);

        $groups = $result->getAttribute('option_groups');
        $this->assertSame('Preset', $groups[0]['name']);
        $this->assertSame(['A'], $groups[0]['values']);
    }

    public function test_array_format_option_values(): void
    {
        $listener = new OptionGroupsDerivationListener();
        $product = $this->makeProductWithArrayValues();

        $result = $listener->handleProductAfterRead($product);

        $groups = $result->getAttribute('option_groups');
        $this->assertSame('색상', $groups[0]['name']);
        $this->assertContains('빨강', $groups[0]['values']);
    }

    protected function makeProduct($existingGroups): object
    {
        return new class($existingGroups) {
            public $option_groups;
            public $has_options;
            public $activeOptions;

            public function __construct($g)
            {
                $this->option_groups = $g;
                $this->has_options = false;

                $opt1 = new class {
                    public $option_values = ['Color' => 'Red'];
                };
                $opt2 = new class {
                    public $option_values = ['Color' => 'Blue'];
                };
                $this->activeOptions = collect([$opt1, $opt2]);
            }

            public function setAttribute(string $key, $value)
            {
                $this->{$key} = $value;
                return $this;
            }

            public function getAttribute(string $key)
            {
                return $this->{$key} ?? null;
            }

            public function loadMissing($relation)
            {
                return $this;
            }

            public function getRelation(string $name)
            {
                return $this->{$name} ?? null;
            }
        };
    }

    protected function makeProductWithArrayValues(): object
    {
        return new class {
            public $option_groups = null;
            public $has_options = false;
            public $activeOptions;

            public function __construct()
            {
                $opt = new class {
                    public $option_values = [
                        ['key' => '색상', 'value' => '빨강'],
                    ];
                };
                $this->activeOptions = collect([$opt]);
            }

            public function setAttribute(string $key, $value)
            {
                $this->{$key} = $value;
                return $this;
            }

            public function getAttribute(string $key)
            {
                return $this->{$key} ?? null;
            }

            public function loadMissing($relation)
            {
                return $this;
            }

            public function getRelation(string $name)
            {
                return $this->{$name} ?? null;
            }
        };
    }
}