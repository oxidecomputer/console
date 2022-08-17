import type { Page, Response } from '@playwright/test'

import type {
  OrganizationCreate,
  OrganizationDeleteParams,
  ProjectCreate,
  ProjectCreateParams,
  ProjectDeleteParams,
} from '@oxide/api'

import { expectNotVisible } from 'app/util/e2e'

type Ok<T> = [T, null]
type Err<E> = [null, E]
type Result<T, E = string> = Ok<T> | Err<E>
type ReturnFn = () => Promise<Response | null>

// imitate Rust's Result constructors
const Ok = <T>(o: T): Ok<T> => [o, null]
const Err = <E>(err: E): Err<E> => [null, err]

interface ReqError {
  code: number
  msg: string
}

const goto = async (page: Page, url: string): Promise<Result<ReturnFn, ReqError>> => {
  const currentUrl = page.url()
  const response = await page.goto(url)
  if (!response) throw new Error(`No response recieved for request to ${url}`)
  const status = response.status()
  if (status < 200 || status > 299) {
    return Err({
      msg: `Loading ${url} failed with a status code of ${status}`,
      code: status,
    })
  }
  return Ok(() => page.goto(currentUrl))
}

export async function checkIfExists(page: Page, path: string) {
  const res = await page.request.get(path)
  const status = res.status()
  if (status >= 500) {
    throw new Error(`${path} failed to load with a ${status} response code`)
  }
  return status >= 200 && status < 300
}

// --- Organizations ---------

/**
 * Creates an Organization and returns to the page it was called from.
 */
export async function createOrg(page: Page, body: OrganizationCreate) {
  const [back, err] = await goto(page, '/orgs/new')
  if (err) {
    throw new Error(err.msg)
  }
  await page.fill('role=textbox[name="Name"]', body.name)
  await page.fill('role=textbox[name="Description"]', body.description)
  await page.click('role=button[name="Create organization"]')
  await page.waitForNavigation()
  await back()
  return () => deleteOrg(page, { orgName: body.name })
}

export async function deleteOrg(page: Page, params: OrganizationDeleteParams) {
  const [back, err] = await goto(page, '/orgs')
  if (err) {
    throw new Error(err.msg)
  }

  await page
    .locator('role=row', { hasText: params.orgName })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, [`role=cell[name="${params.orgName}"]`])

  await back()
}

// --- Projects --------------

/*
 * Creates a project (and its parent org if it doesn't already exist) then returns
 * to the page it was called from.
 */
export async function createProject(
  page: Page,
  params: ProjectCreateParams,
  body: ProjectCreate
) {
  let orgCreated = false
  if (!checkIfExists(page, `/orgs/${params.orgName}`)) {
    await createOrg(page, { name: params.orgName, description: '' })
    orgCreated = true
  }
  const [back, err] = await goto(page, `/orgs/${params.orgName}/projects/new`)
  if (err) {
    throw new Error(err.msg)
  }
  await page.fill('role=textbox[name="Name"]', body.name)
  await page.fill('role=textbox[name="Description"]', body.description)
  await back!()

  return async () => {
    await deleteProject(page, { ...params, projectName: body.name })
    if (orgCreated) {
      await deleteOrg(page, params)
    }
  }
}

export async function deleteProject(page: Page, params: ProjectDeleteParams) {
  const [back, err] = await goto(page, `/orgs/${params.orgName}/projects`)
  if (err) {
    throw new Error(err.msg)
  }

  await page
    .locator('role=row', { hasText: params.projectName })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, [`role=cell[name="${params.projectName}"]`])

  await back()
}
