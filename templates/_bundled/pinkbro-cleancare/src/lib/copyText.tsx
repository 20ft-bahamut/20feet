import React from 'react';

/**
 * 카피 원문을 React 노드로 렌더한다 (COPY POLICY — 문구는 전부 props).
 *
 * 시더가 저장한 값에는 원문 마크업이 그대로 남아 있다:
 *   - `\n`  : 원문 `<br>` (추출기가 보존)
 *   - `<em>` / `<strong>` : 원문 인라인 강조
 * 태그를 지우지도, 문자열로 노출하지도 않고 해당 요소로 렌더한다.
 * 여기서 다루는 마크업은 이 3종뿐이며 별도 템플릿 엔진을 쓰지 않는다.
 *
 * copy 도메인 문자열을 화면에 내보내는 모든 컴포넌트가 이 함수를 쓴다 —
 * 원본(_workspace/pinkbro/source/body.html)에서 `<br>` 로 줄바꾼 문구는
 * 시더 값의 `\n` 이 `<br>` 요소가 되어야 한다. 날 newline 은 HTML 에서
 * 공백으로 접히므로 원본과 줄바꿈이 어긋난다.
 */
const EMPHASIS = /(<em>[\s\S]*?<\/em>|<strong>[\s\S]*?<\/strong>)/g;
const EMPHASIS_TAG = /^<(em|strong)>([\s\S]*)<\/\1>$/;

function renderInline(line: string, keyPrefix: string): React.ReactNode[] {
    return line
        .split(EMPHASIS)
        .filter((part) => part !== '')
        .map((part, index) => {
            const match = EMPHASIS_TAG.exec(part);
            if (!match) {
                return part;
            }
            const Tag = match[1] === 'em' ? 'em' : 'strong';
            return <Tag key={`${keyPrefix}-${index}`}>{match[2]}</Tag>;
        });
}

export function renderCopyText(text: string): React.ReactNode[] {
    return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
            {index > 0 && <br />}
            {renderInline(line, `l${index}`)}
        </React.Fragment>
    ));
}