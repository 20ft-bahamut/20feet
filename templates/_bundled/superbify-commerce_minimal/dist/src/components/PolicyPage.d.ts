import { default as React } from 'react';
import { PolicyDocumentKey } from '../config/businessInfo';
/**
 * PolicyPage — template policy document renderer (terms / privacy / shipping).
 *
 * Content comes ONLY from `config/business-info.json` via one import site
 * (`src/config/businessInfo.ts`). The layout JSON passes a `documentKey`
 * prop plus lang-resolved chrome text (eyebrow / note) and nothing else,
 * so the JSON file stays the single edit point.
 */
export interface PolicyPageProps {
    /** Which policy document to render from config/business-info.json. */
    documentKey?: PolicyDocumentKey;
    /** Uppercase eyebrow label above the page title (from lang). */
    eyebrow?: string;
    /** Honest template-scaffolding notice rendered at the bottom (from lang). */
    note?: string;
    className?: string;
}
export declare function PolicyPage({ documentKey, eyebrow, note, className, }: PolicyPageProps): React.ReactElement;
export default PolicyPage;
