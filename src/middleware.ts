import NextAuth from "next-auth"
import authConfig from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isPublicPage = pathname === "/"
  const isApiAuth = pathname.startsWith("/api/auth")
  const isApiRegister = pathname.startsWith("/api/register")
  const isApiInvite = pathname.startsWith("/api/invite")
  const isJoinPage = pathname.startsWith("/join/")

  if (isApiAuth || isApiRegister || isApiInvite || isPublicPage) {
    return NextResponse.next()
  }

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    if (isJoinPage) {
      const token = pathname.split("/join/")[1]
      return NextResponse.redirect(new URL(`/register?invite=${token}`, req.url))
    }
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|images).*)"],
}
