export default {
  extractDomain: (url) => {
    try {
      const urlObject = new URL(url)
      return urlObject.origin
    } catch (error) {
      console.error('Invalid URL:', error)
      return null
    }
  }
}
