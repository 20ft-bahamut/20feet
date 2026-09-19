import { default as React } from 'react';
import { PackageItem } from '../lib/types';
export interface PackageListProps {
    /** 섹션 도입 문구. copy 데이터에서 온다 — 하드코딩하지 않는다. */
    intro: string | null;
    /** 패키지 목록. null = 로딩 중, [] = 데이터 없음. */
    items: PackageItem[] | null;
}
/**
 * 패키지 그리드 — 3카드. is_featured 면 강조(다크) 카드.
 */
export declare function PackageList({ intro, items }: PackageListProps): React.ReactElement;
export default PackageList;
