import React from 'react'
import { render } from '../../../../test-utils'

import { ProjectList } from './ProjectList'

describe('ProjectList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ProjectList
        projects={[]}
        onProjectCreate={jest.fn()}
        onProjectSelect={jest.fn()}
      />
    )
    expect(baseElement).toBeTruthy()
  })
})
