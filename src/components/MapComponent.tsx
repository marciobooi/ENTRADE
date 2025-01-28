import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import styled from '@emotion/styled'
import { useMapContext } from '../context/MapContext'
import { fetchMapData } from '../services/api'
import { drawLines, clearLines } from '../utils/mapUtils'

const MapWrapper = styled.div`
  flex: ${props => props.isExpanded ? '1' : '0.5'};
  height: 100%;
  transition: flex 0.3s ease;
`

const MapComponent = () => {
  const mapRef = useRef(null)
  const { 
    selectedCountry, 
    setSelectedCountry,
    isChartOpen 
  } = useMapContext()

  useEffect(() => {
    const loadMapData = async () => {
      const data = await fetchMapData()
      // Initialize map with data
    }
    loadMapData()
  }, [])

  const handleCountryClick = (country) => {
    setSelectedCountry(country)
    if (country) {
      drawLines(mapRef.current, country)
    } else {
      clearLines(mapRef.current)
    }
  }

  return (
    <MapWrapper isExpanded={!isChartOpen}>
      <MapContainer
        ref={mapRef}
        center={[50, 10]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Add GeoJSON layer here */}
      </MapContainer>
    </MapWrapper>
  )
}

export default MapComponent 