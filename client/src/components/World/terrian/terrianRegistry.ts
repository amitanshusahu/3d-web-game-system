export const terrianRegistry = {
  default: {
    url: '/texture/ground/soil',
  },
  grass: {
    url: '/texture/ground/grass',
  },
  soil: {
    url: '/texture/ground/soil',
  },
  snow: {
    url: '/texture/ground/snow',
  },
  sand: {
    url: '/texture/ground/sand',
  },
  mud: {
    url: '/texture/ground/mud',
  }
}

export type TerrainKind = keyof typeof terrianRegistry