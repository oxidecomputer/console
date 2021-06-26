const makeRM = (name: string) => ({
  name,
  lastAccessed: 'Never',
  access: {
    read: true,
    modify: true,
    create: false,
    admin: false,
  },
})

export const users = [
  {
    name: 'Cameron Howe',
    lastAccessed: 'Just now',
    access: {
      read: true,
      modify: true,
      create: true,
      admin: false,
    },
  },
  makeRM('Ryan Ray'),
  makeRM('Frosty Turek'),
  makeRM('Donna Clark'),
  makeRM('Wonder Boy'),
  makeRM('Malcolm Levitan'),
  makeRM('Yoyo Engberk'),
  makeRM('Tom Renden'),
]
