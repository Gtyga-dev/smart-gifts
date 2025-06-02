// Define Next.js 15 page props types
import type { ReactNode } from "react"

// Define the PageProps type for Next.js 15
export interface PageProps {
  params: { [key: string]: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

// Define the LayoutProps type for Next.js 15
export interface LayoutProps {
  children: ReactNode
  params: { [key: string]: string }
}

