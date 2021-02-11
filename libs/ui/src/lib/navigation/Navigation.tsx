import React, { FC, useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as Logo } from '../../assets/logo-dark.svg'
import { ReactComponent as Dashboard } from '../../assets/dashboard.svg'
import { ReactComponent as Resources } from '../../assets/resources.svg'
import { ReactComponent as SubMenuItem } from '../../assets/sub-menu-item.svg'
import { ReactComponent as LastSubMenuItem } from '../../assets/last-sub-menu-item.svg'
import { ReactComponent as Organizations } from '../../assets/organizations.svg'
import Text from '../text/Text'

/* eslint-disable-next-line */
export interface NavigationProps {}

const StyledNavigation = styled.div`
  font-family: ${(props) => props.theme.fonts.sans};

  background-color: ${(props) => props.theme.themeColors.gray800};
  color: ${(props) => props.theme.colors.mainTextDimmed};

  padding-top: ${(props) => props.theme.spacing(5)};
  padding-left: ${(props) => props.theme.spacing(4)};
  padding-right: ${(props) => props.theme.spacing(4)};
`

export interface Project {
  title: string
}
export interface ProjectListProps {
  projects: Project[]
}

const Projects = styled.section`
  margin: ${(props) => props.theme.spacing(8)} 0;

  header {
    color: ${(props) => props.theme.themeColors.green500};
    text-transform: uppercase;

    .count {
      color: ${(props) => props.theme.themeColors.green300};
    }
  }

  main {
    margin: ${(props) => props.theme.spacing(3)} 0;

    article {
      margin-top: ${(props) => props.theme.spacing(3)};
      margin-bottom: ${(props) => props.theme.spacing(3)};
      text-transform: uppercase;
    }
  }
`

const StyledLogo = styled(Logo)`
  height: 1.25em;
`

const ProjectList: FC<ProjectListProps> = ({ projects }) => (
  <Projects>
    <header>
      Projects <span className="count">{projects.length}</span>
    </header>
    <main>
      {projects.map((p) => (
        <Project key={p.title} project={p} />
      ))}
    </main>
    <footer>
      Create a new project
      {/* FIXME: Replace with "+" icon */}
      {' +'}
    </footer>
  </Projects>
)

interface ProjectProps {
  project: Project
}

const Project: FC<ProjectProps> = ({ project }) => (
  <article>{project.title}</article>
)

const IconItem = styled(Text)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  .icon {
    flex: 0 0 auto;
    margin-right: ${(props) => props.theme.spacing(4)};
    height: 1em;
    width: 1em;
  }

  span {
    flex: 1;
  }
`

const SubMenu = styled.article`
  margin-left: ${(props) => props.theme.spacing(8)};
`

export const Navigation = (props: NavigationProps) => {
  const [projects, setProjects] = useState<Project[]>([
    { title: 'prod-online' },
    { title: 'release-infrastructure' },
    { title: 'rendering' },
    { title: 'test-infrastructure' },
    { title: 'oxide-demo' },
  ])

  return (
    <StyledNavigation>
      <StyledLogo />
      <ProjectList projects={projects} />
      <Projects>
        <header>Operations</header>
        <main>
          <IconItem as="article" size="lg">
            <Dashboard className="icon" />
            System
          </IconItem>
          <IconItem as="article" size="lg">
            <Resources className="icon" />
            Resources
          </IconItem>
          <SubMenu>
            <IconItem>
              <SubMenuItem />
              Instances
            </IconItem>
            <IconItem>
              <LastSubMenuItem />
              VPCs
            </IconItem>
          </SubMenu>
          <IconItem as="article" size="lg">
            <Organizations className="icon" />
            Organizations
          </IconItem>
        </main>
      </Projects>
    </StyledNavigation>
  )
}

export default Navigation
