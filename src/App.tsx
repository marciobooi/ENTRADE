import { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import MapComponent from './components/MapComponent'
import CountryInfo from './components/CountryInfo'
import ChartContainer from './components/ChartContainer'
import { MapProvider } from './context/MapContext'

const AppContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
`

const App = () => {
  return (
    <MapProvider>
      <AppContainer>
        <MapComponent />
        <ChartContainer />
      </AppContainer>
    </MapProvider>
  )
}

export default App 