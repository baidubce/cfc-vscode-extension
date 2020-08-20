
export let endpointMap = new Map<string, string>();

const ENDPOINT_BJ = 'https://cfc.bj.baidubce.com';
const ENDPOINT_GZ = 'https://cfc.gz.baidubce.com';
const ENDPOINT_SU = 'https://cfc.su.baidubce.com';

endpointMap.set('bj', ENDPOINT_BJ);
endpointMap.set('gz', ENDPOINT_GZ);
endpointMap.set('su', ENDPOINT_SU);

export function parserRegionFromEndpoint(endpoint: string): string {
  switch (endpoint) {
    case ENDPOINT_BJ:
      return '北京';
    case ENDPOINT_GZ:
      return '广州';
    case ENDPOINT_SU:
      return '苏州';
    default:
      return '私有地域';
  }
}