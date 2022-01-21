import { NextResponse, NextRequest } from 'next/server'
import { getPersonalizedRewrite } from '@builder.io/personalization-utils'

const excludededPrefixes = ['/favicon', '/api']

export default function middleware(request: NextRequest) {
  const url = request.nextUrl
  let response = NextResponse.next()
  if (!excludededPrefixes.find((path) => url.pathname?.startsWith(path))) {
    const domain = request.headers.get('Host');
    const rewrite = getPersonalizedRewrite(
      url?.pathname!,
      {
        ...request.cookies,
        'builder.userAttributes.doman': domain || '',
      }
    )
    if (rewrite) {
      response = NextResponse.rewrite(rewrite)
    }
  }
  return response;
}
