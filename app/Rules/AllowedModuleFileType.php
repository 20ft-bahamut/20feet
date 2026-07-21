<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class AllowedModuleFileType implements ValidationRule
{
    /**
     * 허용된 파일 확장자 목록
     */
    private const ALLOWED_EXTENSIONS = [
        // Scripts
        'js', 'mjs',

        // Styles
        'css',

        // Data
        'json',

        // Source maps — dev 빌드의 `//# sourceMappingURL` 이 개별 에셋 서빙 URL 을
        // 가리키므로 허용 필요. prod 는 ExtensionBundleService 가 참조 자체를 strip 한다.
        'map',

        // Images
        'png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'ico',

        // Fonts
        'woff', 'woff2', 'ttf', 'otf', 'eot',
    ];

    /**
     * 허용된 파일 타입인지 검증
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail(__('validation.module_path.must_be_string'));

            return;
        }

        $extension = strtolower(pathinfo($value, PATHINFO_EXTENSION));

        if (! in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            $fail(__('validation.module_path.file_type_not_allowed', [
                'extension' => $extension,
                'allowed' => implode(', ', self::ALLOWED_EXTENSIONS),
            ]));

            return;
        }
    }

    /**
     * 허용된 확장자 목록 반환
     *
     * @return array<string>
     */
    public static function getAllowedExtensions(): array
    {
        return self::ALLOWED_EXTENSIONS;
    }
}
