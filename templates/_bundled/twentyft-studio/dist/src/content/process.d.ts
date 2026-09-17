/**
 * 진행 절차와 자주 묻는 질문.
 *
 * 고객용 페이지이므로 각 단계는 제목과 한 문장으로만 정리한다.
 * 내부 작업 목록(상담 메모, 확인 항목)은 고객 산출물이 아니므로 화면에 두지 않는다.
 * 확인되지 않은 무료 횟수·기한·응답 시간·지원 범위는 넣지 않는다.
 */
export interface ProcessStep {
    /** 단계 이름 */
    title: string;
    /** 이 단계에서 고객이 거치는 일 한 문장 */
    summary: string;
}
export declare const PROCESS_STEPS: ProcessStep[];
export interface FaqItem {
    question: string;
    answer: string;
}
export declare const FAQ_ITEMS: FaqItem[];
