/**
 * PinkBro CleanCare Gnuboard7 User Template
 *
 * 랜딩 페이지 골격 — Basic 컴포넌트만 포함(Div).
 * 이후 태스크가 섹션 컴포넌트를 추가한다.
 *
 * 스타일시트 import 는 필수다: `resources/views/app.blade.php` 가 활성 사용자
 * 템플릿의 `css/components.css` 를 무조건 링크하므로, CSS import 가 없으면
 * `vite build` 가 `dist/css/components.css` 를 만들지 않아 모든 페이지가 404 를 낸다.
 */

import './styles/design-tokens.css';

// Logger (G7Core 초기화 전에도 동작하도록 폴백 포함)
const logger = ((window as any).G7Core?.createLogger?.('Template:pinkbro-cleancare')) ?? {
    log: (...args: unknown[]) => console.log('[Template:pinkbro-cleancare]', ...args),
    warn: (...args: unknown[]) => console.warn('[Template:pinkbro-cleancare]', ...args),
    error: (...args: unknown[]) => console.error('[Template:pinkbro-cleancare]', ...args),
};

// Basic 컴포넌트
export { Div, type DivProps } from './components/basic/Div';

// 컴포넌트 레지스트리 자동 등록
import { Div } from './components/basic/Div';

const registry = (window as any).G7Core?.templateEngine?.ComponentRegistry?.getInstance?.();
if (registry) {
    registry.register({ component: Div, metadata: { name: 'Div', type: 'basic' } });
    logger.log('Registered 1 basic component');
} else {
    logger.warn('ComponentRegistry not available — skipping auto-registration');
}
