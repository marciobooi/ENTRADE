import axios from 'axios'

export const fetchMapData = async () => {
  try {
    const response = await axios.get('data/data.json')
    return response.data
  } catch (error) {
    console.error('Error loading map data:', error)
    return null
  }
}

export const fetchCountryData = async (countryId) => {
  // Implement API call for country data
} 