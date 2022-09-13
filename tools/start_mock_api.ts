import runMockAPI from '../app/test/e2e/global-setup'

// TODO: take port argument
runMockAPI()

console.log('Mock Nexus API running at http://localhost:12220')

// TODO: request logging. I tried adding this as a full express server with
// logging middleware and it only logged 404s, not good requests
