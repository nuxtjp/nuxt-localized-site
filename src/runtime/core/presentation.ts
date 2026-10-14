export const presentationThemes = {
  coela: { accent: '#304dcb', paper: '#faf8f3', ink: '#242823' },
  nuxtjp: { accent: '#087c54', paper: '#f5faf7', ink: '#172e26' },
  vpremises: { accent: '#87562d', paper: '#faf6ef', ink: '#302a25' },
  zixcel: { accent: '#375bc3', paper: '#f6f7fc', ink: '#242d42' },
  crowsi: { accent: '#46753a', paper: '#f5f8f1', ink: '#253023' },
  incusjp: { accent: '#7041a4', paper: '#faf7fd', ink: '#30243e' },
  tparty: { accent: '#aa3b44', paper: '#fff7f4', ink: '#3c2528' },
  hibee: { accent: '#956518', paper: '#fffbf0', ink: '#393023' },
  constillo: { accent: '#426a7c', paper: '#f5f9fa', ink: '#26343b' },
  hathq: { accent: '#985236', paper: '#faf7f3', ink: '#342922' },
  nerp: { accent: '#306d81', paper: '#f4f9fb', ink: '#24353d' },
  semantic: { accent: '#755795', paper: '#faf7fc', ink: '#31283d' }
} as const
export type PresentationTheme = keyof typeof presentationThemes
export interface PresentationOptions { theme: PresentationTheme; scope: 'portfolio' | 'organization' }
export function validatePresentation(input: PresentationOptions | undefined) {
  if (!input) return null
  if (!Object.hasOwn(presentationThemes, input.theme) || !['portfolio', 'organization'].includes(input.scope)
    || Object.keys(input).some(key => !['theme', 'scope'].includes(key))) throw new Error('Invalid presentation options')
  return { theme: input.theme, scope: input.scope }
}
