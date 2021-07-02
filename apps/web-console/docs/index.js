import spec from './nexus-openapi.json'

// eslint-disable-next-line
Redoc.init(
  spec,
  {
    jsonSampleExpandLevel: 3,
    theme: {
      colors: {
        primary: { main: '#23684A' },
      },
      spacing: {
        unit: 4,
        sectionVertical: 24,
      },
      typography: {
        fontSize: '13px',
        fontFamily: 'Inter, sans-serif',
        headings: {
          fontFamily: 'Roboto Mono, monospace',
        },
        code: {
          fontFamily: 'Roboto Mono, monospace',
          fontSize: '12px',
        },
      },
      sidebar: {
        width: '275px',
        textColor: '#111',
      },
    },
  },
  document.body // eslint-disable-line
)
