import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/signup(.*)',
  '/how-it-works',
  '/faq',
  '/privacy',
  '/terms',
  '/quiz',
  '/services',
  '/resources',
  '/request-availability',
  '/about',
  '/annual-report',
  // The page is gone; next.config.js redirects this to the blog post. That
  // redirect resolves before middleware runs, so this entry is belt-and-braces
  // — it keeps the old path from ever hitting auth.protect() if that changes.
  '/wildlife-exemption',
  '/blog(.*)',
  '/sitemap.xml',
  '/robots.txt',
  '/api/(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
