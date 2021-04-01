import { ApiInstanceState } from '../generated'
import type {
  ApiProjectInstancesGetInstanceRequest,
  ApiInstanceView1,
} from '../generated'

export default {
  apiProjectInstancesGetInstance(
    params: ApiProjectInstancesGetInstanceRequest
  ): Promise<ApiInstanceView1> {
    return Promise.resolve({
      id: '96507040-23f1-4a2d-90d5-4d195f25a7d1',
      name: params.instanceName,
      description: `an instance called ${params.instanceName}`,
      timeCreated: new Date(),
      timeModified: new Date(),
      projectId: '6a7f3faa-df71-4255-8b37-362a91809f6e',
      ncpus: 1,
      memory: 256,
      bootDiskSize: 1,
      hostname: 'prod-online',
      runState: ApiInstanceState.Running,
      timeRunStateUpdated: new Date(),
    })
  },
}
