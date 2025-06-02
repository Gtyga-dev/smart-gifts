"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface PhoneInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  defaultCountry?: string
  label?: string
  placeholder?: string
  className?: string
  error?: string
}

interface Country {
  isoName: string
  name: string
  flagUrl: string
  callingCode: string
}

// Common countries with Malawi first, then alphabetical
const COMMON_COUNTRIES: Country[] = [
  {
    isoName: "MW",
    name: "Malawi",
    flagUrl: "https://flagcdn.com/w40/mw.png",
    callingCode: "+265",
  },
  {
    isoName: "ZA",
    name: "South Africa",
    flagUrl: "https://flagcdn.com/w40/za.png",
    callingCode: "+27",
  },
  {
    isoName: "ZM",
    name: "Zambia",
    flagUrl: "https://flagcdn.com/w40/zm.png",
    callingCode: "+260",
  },
  {
    isoName: "TZ",
    name: "Tanzania",
    flagUrl: "https://flagcdn.com/w40/tz.png",
    callingCode: "+255",
  },
  {
    isoName: "MZ",
    name: "Mozambique",
    flagUrl: "https://flagcdn.com/w40/mz.png",
    callingCode: "+258",
  },
  {
    isoName: "GB",
    name: "United Kingdom",
    flagUrl: "https://flagcdn.com/w40/gb.png",
    callingCode: "+44",
  },
  {
    isoName: "US",
    name: "United States",
    flagUrl: "https://flagcdn.com/w40/us.png",
    callingCode: "+1",
  },
]

export function PhoneInput({
  id,
  value,
  onChange,
  defaultCountry = "MW",
  label,
  placeholder = "Enter phone number",
  className = "",
  error,
}: PhoneInputProps) {
  const [countries, setCountries] = useState<Country[]>(COMMON_COUNTRIES)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize selected country based on defaultCountry
  useEffect(() => {
    const country = countries.find((c) => c.isoName === defaultCountry) || countries[0]
    setSelectedCountry(country)
  }, [defaultCountry, countries])

  // Fetch all countries on mount - with error handling
  useEffect(() => {
    async function fetchCountries() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/reloadly/countries")

        if (response.ok) {
          const data = (await fetch("/api/reloadly/countries").then((res) => res.json())) as Country[]

          // Map the API response to our Country interface
          const mappedCountries = data.map((country: Country) => ({
            isoName: country.isoName,
            name: country.name,
            flagUrl: country.flagUrl || `https://flagcdn.com/w40/${country.isoName.toLowerCase()}.png`,
            callingCode: country.callingCode && country.callingCode.length > 0 ? `+${country.callingCode[0]}` : "",
          }))

          // Sort with Malawi first, then alphabetically
          const sortedCountries = mappedCountries.sort((a: Country, b: Country) => {
            if (a.isoName === "MW") return -1
            if (b.isoName === "MW") return 1
            return a.name.localeCompare(b.name)
          })

          setCountries(sortedCountries)
        }
      } catch (error) {
        console.error("Error fetching countries:", error)
        // Keep using the common countries if there's an error
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if we only have the common countries
    if (countries.length <= COMMON_COUNTRIES.length) {
      fetchCountries()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally omitting countries.length from deps to avoid refetching

  // Parse the input value when it changes externally
  useEffect(() => {
    if (!value) {
      setPhoneNumber("")
      return
    }

    // If the value starts with a +, try to find the country code
    if (value.startsWith("+")) {
      // Find the longest matching country code
      let matchedCountry = null
      let longestMatch = 0

      for (const country of countries) {
        const code = country.callingCode
        if (value.startsWith(code) && code.length > longestMatch) {
          matchedCountry = country
          longestMatch = code.length
        }
      }

      if (matchedCountry) {
        setSelectedCountry(matchedCountry)
        setPhoneNumber(value.substring(matchedCountry.callingCode.length).trim())
        return
      }
    }

    // If no country code is found, just set the phone number
    setPhoneNumber(value)
  }, [value, countries])

  // Format and combine the phone number with country code
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-numeric characters
    const rawValue = e.target.value.replace(/[^\d]/g, "")
    setPhoneNumber(rawValue)

    if (selectedCountry) {
      onChange(`${selectedCountry.callingCode}${rawValue}`)
    } else {
      onChange(rawValue)
    }
  }

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    onChange(`${country.callingCode}${phoneNumber}`)
    setIsOpen(false)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="flex">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-1 px-3 rounded-r-none border-r-0 hover:bg-muted/80 focus:ring-primary/20"
            >
              {selectedCountry ? (
                <>
                  {selectedCountry.flagUrl ? (
                    <Image
                      src={selectedCountry.flagUrl || "/placeholder.svg"}
                      alt={selectedCountry.name}
                      width={20}
                      height={15}
                      className="rounded-sm mr-1"
                    />
                  ) : (
                    <Globe className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-xs font-medium">{selectedCountry.callingCode}</span>
                </>
              ) : (
                <Globe className="h-4 w-4" />
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent ref={dropdownRef} align="start" className="w-[220px] max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                <span className="ml-2 text-sm">Loading countries...</span>
              </div>
            ) : (
              countries.map((country) => (
                <DropdownMenuItem
                  key={country.isoName}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    selectedCountry?.isoName === country.isoName && "bg-muted",
                  )}
                  onClick={() => handleCountrySelect(country)}
                >
                  {country.flagUrl ? (
                    <Image
                      src={country.flagUrl || "/placeholder.svg"}
                      alt={country.name}
                      width={20}
                      height={15}
                      className="rounded-sm"
                    />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-xs text-muted-foreground">{country.callingCode}</span>
                  {selectedCountry?.isoName === country.isoName && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          id={id}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          className={cn("rounded-l-none flex-1", error && "border-destructive focus-visible:ring-destructive")}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {selectedCountry?.isoName === "MW" && !error && (
        <p className="text-xs text-muted-foreground">
          For Malawi numbers, enter 9 digits without the leading zero (e.g., 888123456)
        </p>
      )}
    </div>
  )
}
