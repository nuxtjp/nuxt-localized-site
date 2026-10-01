import type { DocumentId, LocaleContent } from '../../contracts/types.js'
import { DOCUMENT_IDS } from '../../contracts/types.js'

function sameIds(
  left: readonly { id: string }[],
  right: readonly { id: string }[],
  path: string,
  issues: string[]
): void {
  const leftIds = left.map(item => item.id)
  const rightIds = right.map(item => item.id)
  if (JSON.stringify(leftIds) !== JSON.stringify(rightIds)) {
    issues.push(`${path} must use the same ids and order in ja and en`)
  }
}

function compareDocument(
  id: DocumentId,
  ja: LocaleContent,
  en: LocaleContent,
  issues: string[]
): void {
  const jaDocument = ja.docs[id]
  const enDocument = en.docs[id]
  if (jaDocument.slug !== enDocument.slug) {
    issues.push(`content.${id}.slug must match in ja and en`)
  }
  sameIds(
    jaDocument.sections,
    enDocument.sections,
    `content.${id}.sections`,
    issues
  )
}

export function validateCompleteness(
  ja: LocaleContent,
  en: LocaleContent,
  issues: string[]
): void {
  sameIds(ja.features, en.features, 'content.features', issues)
  for (const id of DOCUMENT_IDS) compareDocument(id, ja, en, issues)
}
