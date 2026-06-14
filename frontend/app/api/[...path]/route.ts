import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';
const MOCK_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MOCK_API === 'true';

// When MSW is enabled, return 404 to let MSW handle the request on the client
function mockResponse() {
  return NextResponse.json({ detail: 'MSW mock mode — request should be handled by client-side mock' }, { status: 404 });
}

export async function GET(request: NextRequest) {
  if (MOCK_ENABLED) return mockResponse();
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  if (MOCK_ENABLED) return mockResponse();
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  if (MOCK_ENABLED) return mockResponse();
  return proxyRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  if (MOCK_ENABLED) return mockResponse();
  return proxyRequest(request, 'DELETE');
}

export async function OPTIONS(request: NextRequest) {
  return proxyRequest(request, 'OPTIONS');
}

async function proxyRequest(request: NextRequest, method: string) {
  const pathname = new URL(request.url).pathname.replace(/\/+$/, ''); // remove trailing slashes
  const apiPath = pathname.replace(/^\/api/, '');
  const targetUrl = `${BACKEND_URL}/api${apiPath}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
      headers.set(key, value);
    }
  });
  headers.set('host', new URL(BACKEND_URL).host);
  headers.set('ngrok-skip-browser-warning', 'true');

  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      body = await request.arrayBuffer();
    } catch {
      // ignore
    }
  }

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
  });

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'transfer-encoding') {
      responseHeaders.set(key, value);
    }
  });

  responseHeaders.set('Access-Control-Allow-Origin', '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
