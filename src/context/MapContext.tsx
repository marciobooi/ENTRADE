import { createContext, useContext, useState, ReactNode } from 'react'

interface MapContextType {
  selectedCountry: any
  setSelectedCountry: (country: any) => void
  countryData: any
  setCountryData: (data: any) => void
  isChartOpen: boolean
  setIsChartOpen: (isOpen: boolean) => void
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [countryData, setCountryData] = useState(null)
  const [isChartOpen, setIsChartOpen] = useState(false)

  return (
    <MapContext.Provider 
      value={{
        selectedCountry,
        setSelectedCountry,
        countryData,
        setCountryData,
        isChartOpen,
        setIsChartOpen
      }}
    >
      {children}
    </MapContext.Provider>
  )
}

export const useMapContext = () => {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider')
  }
  return context
} 