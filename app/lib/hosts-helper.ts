/**
 * Utility to help users troubleshoot DNS resolution issues
 * This provides guidance on how to modify the hosts file to resolve Reloadly domains
 */

// Define Reloadly domains and their IP addresses
export const RELOADLY_DOMAINS = [
  { domain: "auth.reloadly.com", ip: "52.203.68.55" },
  { domain: "giftcards-sandbox.reloadly.com", ip: "52.203.68.55" },
  { domain: "giftcards.reloadly.com", ip: "52.203.68.55" },
  { domain: "topups-sandbox.reloadly.com", ip: "52.203.68.55" },
  { domain: "topups.reloadly.com", ip: "52.203.68.55" },
  { domain: "utilities-sandbox.reloadly.com", ip: "52.203.68.55" },
  { domain: "utilities.reloadly.com", ip: "52.203.68.55" },
]

// Generate hosts file entries for Reloadly domains
export function generateHostsEntries(): string {
  return RELOADLY_DOMAINS.map(({ ip, domain }) => `${ip} ${domain}`).join("\n")
}

// Get hosts file location based on OS
export function getHostsFilePath(): string {
  if (typeof window === "undefined") return "" // Server-side

  const platform = window.navigator.platform.toLowerCase()

  if (platform.includes("win")) {
    return "C:\\Windows\\System32\\drivers\\etc\\hosts"
  } else if (platform.includes("mac") || platform.includes("darwin")) {
    return "/etc/hosts"
  } else if (platform.includes("linux")) {
    return "/etc/hosts"
  }

  return "/etc/hosts" // Default to Unix-like systems
}

// Get instructions for modifying hosts file based on OS
export function getHostsFileInstructions(): string {
  if (typeof window === "undefined") return "" // Server-side

  const platform = window.navigator.platform.toLowerCase()
  const hostsPath = getHostsFilePath()

  if (platform.includes("win")) {
    return `
1. Open Notepad as Administrator (right-click Notepad and select "Run as administrator")
2. Open the file: ${hostsPath}
3. Add the following lines at the end of the file:

${generateHostsEntries()}

4. Save the file and close Notepad
5. Open Command Prompt as Administrator and run: ipconfig /flushdns
6. Restart your browser and try again
`
  } else {
    return `
1. Open Terminal
2. Run the following command to edit the hosts file:
   sudo nano ${hostsPath}
3. Add the following lines at the end of the file:

${generateHostsEntries()}

4. Press Ctrl+O to save, then Ctrl+X to exit
5. Run the following command to flush DNS cache:
   sudo killall -HUP mDNSResponder
6. Restart your browser and try again
`
  }
}

// Check if a domain is resolvable
export async function isDomainResolvable(domain: string): Promise<boolean> {
  try {
    await fetch(`https://${domain}`, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
    })
    return true
  } catch {
    return false
  }
}

// Check if all Reloadly domains are resolvable
export async function checkReloadlyDomains(): Promise<{
  allResolvable: boolean
  results: Record<string, boolean>
}> {
  const results: Record<string, boolean> = {}

  await Promise.all(
    RELOADLY_DOMAINS.map(async ({ domain }) => {
      results[domain] = await isDomainResolvable(domain)
    }),
  )

  const allResolvable = Object.values(results).every(Boolean)

  return {
    allResolvable,
    results,
  }
}
