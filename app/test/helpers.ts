import type { Page, Response } from '@playwright/test'

import type { OrganizationCreate, ProjectCreate, ProjectCreateParams } from '@oxide/api'

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
}

// --- Projects --------------

export async function createProject(
  page: Page,
  params: ProjectCreateParams,
  body: ProjectCreate
) {
  if (!checkIfExists(page, `/orgs/${params.orgName}`)) {
    await createOrg(page, { name: params.orgName, description: '' })
  }
  const [back, err] = await goto(page, `/orgs/${params.orgName}/projects/new`)
  if (err) {
    throw new Error(err.msg)
  }
  await page.fill('role=textbox[name="Name"]', body.name)
  await page.fill('role=textbox[name="Description"]', body.description)
  await back!()
}
