import type {
  DocumentContent,
  DocumentId,
  DocumentSection,
  FeatureContent,
  LocaleContent,
  NoticeContent
} from '../../contracts/types.js'
import { DOCUMENT_IDS } from '../../contracts/types.js'
import {
  identifier,
  onlyKeys,
  record,
  text,
  textList
} from './primitives.js'

const documentSlugs: Record<DocumentId, string> = {
  overview: '/docs',
  gettingStarted: '/docs/getting-started',
  security: '/docs/security'
}

function feature(value: unknown, path: string, issues: string[]): FeatureContent {
  const item = record(value, path, issues)
  onlyKeys(item, ['id', 'title', 'summary'], path, issues)
  return {
    id: identifier(item.id, `${path}.id`, issues),
    title: text(item.title, `${path}.title`, issues, 160),
    summary: text(item.summary, `${path}.summary`, issues, 500)
  }
}

function features(value: unknown, path: string, issues: string[]): FeatureContent[] {
  if (!Array.isArray(value) || value.length !== 3) {
    issues.push(`${path} must contain exactly three features`)
  }
  const result = Array.isArray(value)
    ? value.map((item, index) => feature(item, `${path}[${index}]`, issues))
    : []
  if (new Set(result.map(item => item.id)).size !== result.length) {
    issues.push(`${path} feature ids must be unique`)
  }
  return result
}

function section(value: unknown, path: string, issues: string[]): DocumentSection {
  const item = record(value, path, issues)
  onlyKeys(item, ['id', 'title', 'body'], path, issues)
  return {
    id: identifier(item.id, `${path}.id`, issues),
    title: text(item.title, `${path}.title`, issues, 160),
    body: textList(item.body, `${path}.body`, issues)
  }
}

function document(
  value: unknown,
  id: DocumentId,
  path: string,
  issues: string[]
): DocumentContent {
  const item = record(value, path, issues)
  onlyKeys(item, ['slug', 'title', 'summary', 'sections'], path, issues)
  const slug = text(item.slug, `${path}.slug`, issues, 80)
  if (slug !== documentSlugs[id]) {
    issues.push(`${path}.slug must be ${documentSlugs[id]}`)
  }
  const sections = Array.isArray(item.sections)
    ? item.sections.map((entry, index) => section(entry, `${path}.sections[${index}]`, issues))
    : []
  if (sections.length === 0) issues.push(`${path}.sections must be a non-empty array`)
  if (new Set(sections.map(item => item.id)).size !== sections.length) {
    issues.push(`${path}.section ids must be unique`)
  }
  return {
    slug,
    title: text(item.title, `${path}.title`, issues, 160),
    summary: text(item.summary, `${path}.summary`, issues, 500),
    sections
  }
}

function notice(value: unknown, path: string, issues: string[]): NoticeContent {
  const item = record(value, path, issues)
  onlyKeys(item, ['label', 'summary'], path, issues)
  return {
    label: text(item.label, `${path}.label`, issues, 160),
    summary: text(item.summary, `${path}.summary`, issues, 1000)
  }
}

export function localeContent(
  value: unknown,
  path: string,
  issues: string[]
): LocaleContent {
  const item = record(value, path, issues)
  onlyKeys(
    item,
    ['brand', 'tagline', 'summary', 'features', 'docs', 'privacy', 'contact'],
    path,
    issues
  )
  const docs = record(item.docs, `${path}.docs`, issues)
  onlyKeys(docs, DOCUMENT_IDS, `${path}.docs`, issues)
  return {
    brand: text(item.brand, `${path}.brand`, issues, 160),
    tagline: text(item.tagline, `${path}.tagline`, issues, 240),
    summary: text(item.summary, `${path}.summary`, issues, 1000),
    features: features(item.features, `${path}.features`, issues),
    docs: {
      overview: document(docs.overview, 'overview', `${path}.docs.overview`, issues),
      gettingStarted: document(
        docs.gettingStarted,
        'gettingStarted',
        `${path}.docs.gettingStarted`,
        issues
      ),
      security: document(docs.security, 'security', `${path}.docs.security`, issues)
    },
    privacy: notice(item.privacy, `${path}.privacy`, issues),
    contact: notice(item.contact, `${path}.contact`, issues)
  }
}
