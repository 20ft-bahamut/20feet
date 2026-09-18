import { default as React } from 'react';
export interface DetailsProps extends React.HTMLAttributes<HTMLDetailsElement> {
}
/**
 * 기본 details(접기/펼치기) 컴포넌트
 */
export declare const Details: React.ForwardRefExoticComponent<DetailsProps & React.RefAttributes<HTMLDetailsElement>>;
