import { NextResponse, NextRequest } from 'next/server'
import { getPersonalizedRewrite } from '@builder.io/personalization-utils'

const excludededPrefixes = ['/favicon', '/api']

export default function middleware(request: NextRequest) {
  const url = request.nextUrl
  let response = NextResponse.next()
  if (!excludededPrefixes.find((path) => url.pathname?.startsWith(path))) {
    const rewrite = getPersonalizedRewrite(url?.pathname!, {
      'builder.userAttributes.domain': request.headers.get('Host') || '',
      'builder.userAttributes.city': request.geo?.city || '',
      'builder.userAttributes.country': request.geo?.country || '',
      'builder.userAttributes.region': request.geo?.region || '',
      'builder.userAttributes.isBot': String(request.ua?.isBot),
      // allow overriding by cookies for testint with the configurator UI, press ctrl + right click for details
      ...request.cookies,
    })
    if (rewrite) {
      response = NextResponse.rewrite(rewrite)
    }
  }
  return response
}