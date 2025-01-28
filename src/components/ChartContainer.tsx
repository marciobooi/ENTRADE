import { useEffect } from 'react'
import styled from '@emotion/styled'
import { useMapContext } from '../context/MapContext'

const ChartWrapper = styled.div`
  flex: 0.5;
  height: 100%;
  background: white;
  padding: 20px;
  display: ${props => props.isVisible ? 'block' : 'none'};
`

const ChartContainer = () => {
  const { 
    selectedCountry, 
    countryData,
    isChartOpen 
  } = useMapContext()

  useEffect(() => {
    if (selectedCountry) {
      // Fetch and process country data
    }
  }, [selectedCountry])

  if (!isChartOpen) return null

  return (
    <ChartWrapper isVisible={isChartOpen}>
      {/* Add chart components here */}
    </ChartWrapper>
  )
}

export default ChartContainer 