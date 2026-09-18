const IDENTIFIER = 'pinkbro-cleancare';

/**
 * G7 템플릿 자산 서빙 경로를 만든다.
 * 실제 파일은 templates/{identifier}/dist/{path} 에 있어야 한다.
 */
export function templateAsset(path: string): string {
  const clean = path.replace(/^\/+/, '');
  if (!clean) return '';

  return `/api/templates/assets/${IDENTIFIER}?file=${clean}`;
}
