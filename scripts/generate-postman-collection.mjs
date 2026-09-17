/**
 * Converts the Nest Swagger OpenAPI document into a Postman Collection v2.1.
 * Usage (API must be running):
 *   node scripts/generate-postman-collection.mjs
 *   node scripts/generate-postman-collection.mjs http://localhost:3000
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const openApiUrl = `${baseUrl}/api-json`;
const outFile = path.join(__dirname, '..', 'postman', 'ClearIt-API.postman_collection.json');

function folderName(tag) {
  const map = {
    customer: '01 · Customer Mobile',
    agent: '02 · Agent Mobile',
    admin: '03 · Admin Web',
    health: '00 · Health',
  };
  return map[tag] || tag || 'Other';
}

function authForPath(apiPath) {
  if (apiPath.startsWith('/api/v1/customer')) return '{{customerAccessToken}}';
  if (apiPath.startsWith('/api/v1/agent')) return '{{agentAccessToken}}';
  if (apiPath.startsWith('/api/v1/admin')) return '{{adminAccessToken}}';
  return null;
}

function isPublic(apiPath, method) {
  const m = method.toLowerCase();
  const publics = [
    ['POST', '/api/v1/customer/auth/send-otp'],
    ['POST', '/api/v1/customer/auth/resend-otp'],
    ['POST', '/api/v1/customer/auth/verify-otp'],
    ['POST', '/api/v1/customer/auth/refresh-token'],
    ['POST', '/api/v1/agent/auth/send-otp'],
    ['POST', '/api/v1/agent/auth/resend-otp'],
    ['POST', '/api/v1/agent/auth/verify-otp'],
    ['POST', '/api/v1/agent/auth/refresh-token'],
    ['POST', '/api/v1/admin/auth/login'],
    ['POST', '/api/v1/admin/auth/refresh-token'],
    ['POST', '/api/v1/webhooks/payments'],
    ['GET', '/api/v1/health'],
    ['GET', '/'],
  ];
  return publics.some(([pm, p]) => pm.toLowerCase() === m && p === apiPath);
}

function sampleBody(apiPath, method, op) {
  const m = method.toLowerCase();
  if (m === 'get' || m === 'delete') return undefined;

  const examples = {
    '/api/v1/admin/auth/login': {
      email: 'admin@clearit.in',
      password: 'ChangeMe#1234',
    },
    '/api/v1/admin/auth/refresh-token': {
      refreshToken: '{{adminRefreshToken}}',
    },
    '/api/v1/admin/auth/change-password': {
      currentPassword: 'ChangeMe#1234',
      newPassword: 'ChangeMe#5678',
    },
    '/api/v1/customer/auth/send-otp': { mobile: '9876543210' },
    '/api/v1/customer/auth/resend-otp': { mobile: '9876543210' },
    '/api/v1/customer/auth/verify-otp': {
      mobile: '9876543210',
      otp: '1234',
    },
    '/api/v1/customer/auth/refresh-token': {
      refreshToken: '{{customerRefreshToken}}',
    },
    '/api/v1/agent/auth/send-otp': { mobile: '9876501234' },
    '/api/v1/agent/auth/resend-otp': { mobile: '9876501234' },
    '/api/v1/agent/auth/verify-otp': {
      mobile: '9876501234',
      otp: '1234',
    },
    '/api/v1/agent/auth/refresh-token': {
      refreshToken: '{{agentRefreshToken}}',
    },
  };

  if (examples[apiPath]) return examples[apiPath];

  // Fall back to first example / schema properties from OpenAPI if present
  const content = op.requestBody?.content?.['application/json'];
  if (content?.example) return content.example;
  if (content?.examples) {
    const first = Object.values(content.examples)[0];
    if (first?.value) return first.value;
  }
  return {};
}

function buildUrl(apiPath, op) {
  const rawPath = apiPath.replace(/^\//, '');
  const segments = rawPath.split('/').map((seg) => {
    if (seg.startsWith('{') && seg.endsWith('}')) {
      const name = seg.slice(1, -1);
      return `{{${name}}}`;
    }
    return seg;
  });

  const query = (op.parameters || [])
    .filter((p) => p.in === 'query')
    .map((p) => ({
      key: p.name,
      value: p.schema?.default != null ? String(p.schema.default) : '',
      description: p.description || '',
      disabled: !p.required,
    }));

  return {
    raw: `{{baseUrl}}/${segments.join('/')}${
      query.length
        ? '?' +
          query
            .filter((q) => !q.disabled && q.value !== '')
            .map((q) => `${q.key}=${encodeURIComponent(q.value)}`)
            .join('&')
        : ''
    }`,
    host: ['{{baseUrl}}'],
    path: segments,
    query,
  };
}

function toItem(apiPath, method, op) {
  const name = op.summary || `${method.toUpperCase()} ${apiPath}`;
  const body = sampleBody(apiPath, method, op);
  const tokenVar = authForPath(apiPath);
  const publicRoute = isPublic(apiPath, method);

  const headers = [{ key: 'Content-Type', value: 'application/json' }];
  if (tokenVar && !publicRoute) {
    headers.push({
      key: 'Authorization',
      value: `Bearer ${tokenVar}`,
    });
  }

  const request = {
    method: method.toUpperCase(),
    header: headers,
    url: buildUrl(apiPath, op),
    description: op.description || op.summary || '',
  };

  if (body !== undefined && method.toLowerCase() !== 'get') {
    request.body = {
      mode: 'raw',
      raw: JSON.stringify(body, null, 2),
      options: { raw: { language: 'json' } },
    };
  }

  // Capture tokens after login / verify-otp
  const events = [];
  if (
    apiPath === '/api/v1/admin/auth/login' ||
    apiPath === '/api/v1/admin/auth/refresh-token'
  ) {
    events.push({
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: [
          'if (pm.response.code === 200 || pm.response.code === 201) {',
          '  const j = pm.response.json();',
          "  if (j.accessToken) pm.collectionVariables.set('adminAccessToken', j.accessToken);",
          "  if (j.refreshToken) pm.collectionVariables.set('adminRefreshToken', j.refreshToken);",
          '}',
        ],
      },
    });
  }
  if (
    apiPath === '/api/v1/customer/auth/verify-otp' ||
    apiPath === '/api/v1/customer/auth/refresh-token'
  ) {
    events.push({
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: [
          'if (pm.response.code === 200 || pm.response.code === 201) {',
          '  const j = pm.response.json();',
          "  if (j.accessToken) pm.collectionVariables.set('customerAccessToken', j.accessToken);",
          "  if (j.refreshToken) pm.collectionVariables.set('customerRefreshToken', j.refreshToken);",
          '}',
        ],
      },
    });
  }
  if (
    apiPath === '/api/v1/agent/auth/verify-otp' ||
    apiPath === '/api/v1/agent/auth/refresh-token'
  ) {
    events.push({
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: [
          'if (pm.response.code === 200 || pm.response.code === 201) {',
          '  const j = pm.response.json();',
          "  if (j.accessToken) pm.collectionVariables.set('agentAccessToken', j.accessToken);",
          "  if (j.refreshToken) pm.collectionVariables.set('agentRefreshToken', j.refreshToken);",
          '}',
        ],
      },
    });
  }

  return {
    name,
    request,
    event: events.length ? events : undefined,
    response: [],
  };
}

const res = await fetch(openApiUrl);
if (!res.ok) {
  console.error(`Failed to fetch ${openApiUrl}: ${res.status}`);
  console.error('Start the API first: npm run start:dev');
  process.exit(1);
}

const spec = await res.json();
const folders = new Map();

for (const [apiPath, methods] of Object.entries(spec.paths || {})) {
  for (const [method, op] of Object.entries(methods)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
    const tag = (op.tags && op.tags[0]) || 'other';
    const folder = folderName(tag);
    if (!folders.has(folder)) folders.set(folder, []);
    folders.get(folder).push(toItem(apiPath, method, op));
  }
}

// Stable folder order
const order = [
  '00 · Health',
  '01 · Customer Mobile',
  '02 · Agent Mobile',
  '03 · Admin Web',
];
const item = [
  ...order.filter((k) => folders.has(k)).map((k) => ({ name: k, item: folders.get(k) })),
  ...[...folders.keys()]
    .filter((k) => !order.includes(k))
    .sort()
    .map((k) => ({ name: k, item: folders.get(k) })),
];

const collection = {
  info: {
    name: 'ClearIt API',
    description:
      'Full ClearIt NestJS API — Customer Mobile, Agent Mobile, Admin Web.\n\n' +
      '**Swagger UI:** {{baseUrl}}/api\n' +
      '**OpenAPI JSON:** {{baseUrl}}/api-json\n\n' +
      '1. Run Admin → Auth → login (saves adminAccessToken).\n' +
      '2. For mobile: send-otp → verify-otp (OTP logged when OTP_DEMO_MODE=true).\n' +
      '3. Replace {{id}} / {{bookingId}} etc. with real UUIDs from list responses.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    _postman_id: 'clearit-api-collection',
  },
  variable: [
    { key: 'baseUrl', value: baseUrl },
    { key: 'adminAccessToken', value: '' },
    { key: 'adminRefreshToken', value: '' },
    { key: 'customerAccessToken', value: '' },
    { key: 'customerRefreshToken', value: '' },
    { key: 'agentAccessToken', value: '' },
    { key: 'agentRefreshToken', value: '' },
    { key: 'id', value: '' },
    { key: 'bookingId', value: '' },
    { key: 'customerId', value: '' },
    { key: 'agentId', value: '' },
    { key: 'documentId', value: '' },
    { key: 'key', value: 'booking_tax_percent' },
  ],
  item,
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(collection, null, 2));

const count = item.reduce((n, f) => n + f.item.length, 0);
console.log(`Wrote ${count} requests → ${outFile}`);
console.log(`Swagger UI: ${baseUrl}/api`);
