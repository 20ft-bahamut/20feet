<?php

namespace App\Http\Requests\Admin;

use App\Extension\HookManager;
use App\Extension\PluginManager;
use Illuminate\Foundation\Http\FormRequest;

/**
 * 플러그인 설정 업데이트 요청 검증
 *
 * 플러그인의 설정 스키마를 기반으로 동적으로 유효성 검사 규칙을 생성합니다.
 */
class UpdatePluginSettingsRequest extends FormRequest
{
    /**
     * 사용자가 이 요청을 수행할 권한이 있는지 확인합니다.
     *
     * 권한 체크는 라우트의 permission 미들웨어에서 수행됩니다.
     *
     * @return bool 항상 true
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * 요청에 적용할 검증 규칙을 반환합니다.
     *
     * 플러그인의 설정 스키마를 기반으로 동적으로 규칙을 생성합니다.
     *
     * @return array 검증 규칙 배열
     */
    public function rules(): array
    {
        $identifier = $this->route('identifier');
        $pluginManager = app(PluginManager::class);
        $plugin = $pluginManager->getPlugin($identifier);

        if (! $plugin) {
            return [];
        }

        $schema = $plugin->getSettingsSchema();
        $rules = [];

        foreach ($schema as $field => $config) {
            $fieldRules = [];

            // 필수 여부
            if ($config['required'] ?? false) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }

            // 타입별 규칙 추가
            $type = $config['type'] ?? 'string';

            switch ($type) {
                case 'string':
                    $fieldRules[] = 'string';
                    if (isset($config['max'])) {
                        $fieldRules[] = 'max:'.$config['max'];
                    }
                    if (isset($config['min'])) {
                        $fieldRules[] = 'min:'.$config['min'];
                    }
                    break;

                case 'integer':
                    $fieldRules[] = 'integer';
                    if (isset($config['min'])) {
                        $fieldRules[] = 'min:'.$config['min'];
                    }
                    if (isset($config['max'])) {
                        $fieldRules[] = 'max:'.$config['max'];
                    }
                    break;

                case 'boolean':
                    $fieldRules[] = 'boolean';
                    break;

                case 'enum':
                    $options = $config['options'] ?? [];
                    if (! empty($options)) {
                        $fieldRules[] = 'in:'.implode(',', $options);
                    }
                    break;

                case 'url':
                    $fieldRules[] = 'url';
                    break;

                case 'email':
                    $fieldRules[] = 'email';
                    break;

                case 'array':
                    $fieldRules[] = 'array';
                    break;
            }

            $rules[$field] = $fieldRules;
        }

        // audit:allow core-formrequest-hook-filter reason: 훅 이름이 표준(`{대상}.{동작}_validation_rules`)과
        // 어긋난 상태로 이미 공개되어 있다(`core.plugin_settings.update_rules`). 같은 이탈이 코어에
        // 6개 더 있으며(core.auth.validate_reset_token_rules / core.auth.verify_password_rules /
        // core.extension.changelog_rules / core.layout.get_validation_messages /
        // core.search.validation_rules / core.user.upload_avatar_rules), 이름을 바꾸면 이 훅을
        // 구독 중인 제3자 확장이 조용히 동작을 멈춘다. 일괄 개명은 PO 판단 사항이라 여기서
        // 단독으로 바꾸지 않는다.
        //
        // 3번째 인자로 이번 요청의 입력값을 함께 넘긴다. 확장이 "현재 입력한 모드에 따라
        // 다른 필드를 필수로 만드는" 조건부 규칙을 만들려면 입력값이 필요한데, 그것이 없어
        // 확장이 request() 를 직접 들여다보던 것을 없애기 위함이다.
        // 기존 2인자 구독자는 그대로 동작한다(초과 인자는 무시된다).
        return HookManager::applyFilters(
            'core.plugin_settings.update_rules',
            $rules,
            $identifier,
            $this->all(),
        );
    }

    /**
     * 검증 에러 메시지를 반환합니다.
     *
     * @return array 에러 메시지 배열
     */
    public function messages(): array
    {
        return [
            'required' => __('validation.required'),
            'string' => __('validation.string'),
            'integer' => __('validation.integer'),
            'boolean' => __('validation.boolean'),
            'in' => __('validation.in'),
            'url' => __('validation.url'),
            'email' => __('validation.email'),
            'array' => __('validation.array'),
            'max' => __('validation.max'),
            'min' => __('validation.min'),
        ];
    }
}
