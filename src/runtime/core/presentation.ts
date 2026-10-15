export const presentationThemes = {
  coela: { accent: '#007e78', paper: '#f3fbf9', ink: '#102d46' },
  nuxtjp: { accent: '#00875f', paper: '#f4fbf8', ink: '#102d46' },
  vpremises: { accent: '#087f78', paper: '#f3fbfa', ink: '#102d46' },
  zixcel: { accent: '#0866cd', paper: '#f4f8ff', ink: '#102d46' },
  crowsi: { accent: '#1464a4', paper: '#f4f8fc', ink: '#102d46' },
  incusjp: { accent: '#7041a4', paper: '#faf7fd', ink: '#30243e' },
  tparty: { accent: '#087e79', paper: '#f3faf8', ink: '#102d46' },
  hibee: { accent: '#956518', paper: '#fffbf0', ink: '#393023' },
  constillo: { accent: '#6435c9', paper: '#faf8ff', ink: '#102d46' },
  hathq: { accent: '#007baa', paper: '#f4faff', ink: '#102d46' },
  nerp: { accent: '#6740c7', paper: '#faf8ff', ink: '#102d46' },
  semantic: { accent: '#0866cd', paper: '#f4f8ff', ink: '#102d46' }
} as const
export type PresentationTheme = keyof typeof presentationThemes
export interface PresentationOptions { theme: PresentationTheme; scope: 'portfolio' | 'organization' }
export function validatePresentation(input: PresentationOptions | undefined) {
  if (!input) return null
  if (!Object.hasOwn(presentationThemes, input.theme) || !['portfolio', 'organization'].includes(input.scope)
    || Object.keys(input).some(key => !['theme', 'scope'].includes(key))) throw new Error('Invalid presentation options')
  return { theme: input.theme, scope: input.scope }
}
