import { describe, expect, it } from 'vitest';
import { splitFaqAnswer } from '../../src/lib/faqAnswer';

/**
 * 원문(body.html 333~361행)의 첫 문장 강조를 표시 계층에서 복원하는 규칙.
 *
 * 이 유틸의 유일한 불변식: `lead + rest` 가 입력과 **글자 단위로** 같아야 한다
 * (문구를 만들지도, 부호를 바꾸지도, 공백을 다듬지도 않는다).
 */
describe('splitFaqAnswer', () => {
  it('splits at the first period followed by whitespace and more text', () => {
    const answer =
      '바닥 기계세척은 기본 250,000원부터 시작합니다. 데코타일, 20평 미만, 기본 오염 조건 기준이며 면적에 따라 달라질 수 있습니다.';

    const { lead, rest } = splitFaqAnswer(answer);

    expect(lead).toBe('바닥 기계세척은 기본 250,000원부터 시작합니다.');
    expect(rest).toBe(' 데코타일, 20평 미만, 기본 오염 조건 기준이며 면적에 따라 달라질 수 있습니다.');
    expect(lead! + rest).toBe(answer);
  });

  it('uses the FIRST boundary, not the last', () => {
    const answer = '첫 문장입니다. 둘째 문장입니다. 셋째 문장입니다.';

    const { lead, rest } = splitFaqAnswer(answer);

    expect(lead).toBe('첫 문장입니다.');
    expect(rest).toBe(' 둘째 문장입니다. 셋째 문장입니다.');
    expect(lead! + rest).toBe(answer);
  });

  it('does not split a single-sentence answer (문장 끝 마침표 뒤에 텍스트가 없다)', () => {
    const answer = '전화로 상담해 주시면 안내드립니다.';

    expect(splitFaqAnswer(answer)).toEqual({ lead: null, rest: answer });
  });

  it('does not split when the period is the last character', () => {
    const answer = '문의는 카카오채널로 보내주세요.';
    expect(splitFaqAnswer(answer).lead).toBeNull();
  });

  it('does not split when only whitespace follows the period', () => {
    const answer = '첫 문장입니다.  ';
    expect(splitFaqAnswer(answer)).toEqual({ lead: null, rest: answer });
  });

  it('ignores a period that is not followed by whitespace (숫자·단위 안의 마침표)', () => {
    // 예: "80,000원~입니다.기종" 처럼 공백 없이 이어지면 경계가 아니다
    const answer = '80,000원부터입니다.기종에 따라 다릅니다. 뒤 문장입니다.';

    const { lead, rest } = splitFaqAnswer(answer);

    expect(lead).toBe('80,000원부터입니다.기종에 따라 다릅니다.');
    expect(rest).toBe(' 뒤 문장입니다.');
    expect(lead! + rest).toBe(answer);
  });

  it('does not fall back to splitting on another character', () => {
    // 물음표·느낌표로는 나누지 않는다 (규칙은 마침표 전용)
    const answers = [
      '사진 첨부가 필요하신가요? 카카오채널로 보내주세요',
      '정말 그렇습니다! 다음 문장입니다',
      '줄바꿈으로만 나뉜 문장\n두 번째 줄입니다',
    ];

    for (const answer of answers) {
      expect(splitFaqAnswer(answer), answer).toEqual({ lead: null, rest: answer });
    }
  });

  it('handles an empty answer without inventing an emphasis', () => {
    expect(splitFaqAnswer('')).toEqual({ lead: null, rest: '' });
  });

  it('keeps the text byte-identical for every seeded answer', () => {
    // 시더가 넣는 여덟 답변을 그대로 넣어 두 조각을 이어 붙인다.
    const seeded = [
      '바닥 기계세척은 기본 250,000원부터 시작합니다. 데코타일, 20평 미만, 기본 오염 조건 기준이며 면적, 집기 이동, 특수오염, 코팅·박리 여부 등에 따라 최종 금액이 달라질 수 있습니다.',
      '유리창 세척은 기본 100,000원부터 시작합니다. 1층, 총 가로 10m × 높이 2m 이내, 기본 오염 기준이며 심한 물때·석회, 시트지·본드 제거, 창틀 집중세척, 고소작업은 추가비용이 발생할 수 있습니다.',
      '상업용 후드 세척은 기본 250,000원부터 시작합니다. 일반 규모 후드의 기본 기름오염과 기본 내부·외부 세척 기준이며 후드 길이, 필터 수량, 누적 기름때, 덕트·팬·추가 분해 범위에 따라 달라질 수 있습니다.',
      '네. 기본가는 벽걸이 80,000원~, 스탠드 120,000원~, 천장형 1WAY 100,000원~, 천장형 4WAY 150,000원~입니다. 기종, 대수, 분해 난도, 오염 상태와 접근성에 따라 확정 견적이 달라질 수 있습니다.',
      '아닙니다. 홈페이지 금액은 기본 작업 기준가입니다. 실제 확정 견적은 면적, 수량, 오염도, 작업 구조, 접근성, 고소장비 및 추가 작업 범위를 확인한 뒤 안내합니다.',
      '같은 매장·같은 일정 기준으로 2개 항목 3%, 3~4개 항목 5%, 5개 이상 10% 할인이 적용됩니다. 할인은 기본 작업금액 합계 기준이며 특수오염, 추가면적, 고소장비, 장비대여 등 추가비용은 제외됩니다.',
      '부산·울산·경남 전 지역을 기본 출장지역으로 안내하고 있습니다. 현장 위치와 작업 내용에 따라 일정 및 출장 가능 여부를 상담 단계에서 확인해 드립니다.',
      '현장 사진은 카카오채널로 보내주시면 가장 편리합니다. 휴대폰으로 촬영한 매장 전체와 관리가 필요한 부분 사진을 카카오채널로 보내주세요. 홈페이지에서는 사진 없이 업종, 필요 서비스, 규모, 연락처와 요청사항만 남겨도 문의할 수 있습니다.',
    ];

    for (const answer of seeded) {
      const { lead, rest } = splitFaqAnswer(answer);
      expect(lead, answer).not.toBeNull();
      expect(lead! + rest, answer).toBe(answer);
      // 강조가 사라지지 않는다 — 첫 문장은 답변의 접두부다
      expect(answer.startsWith(lead!), answer).toBe(true);
      // 나머지가 비어 있으면 강조만 남는 답변이 된다 — 그런 답변은 없다
      expect(rest.trim().length, answer).toBeGreaterThan(0);
    }
  });
});
