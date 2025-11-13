import axios from "axios";
const API_KEY = process.env.API_KEY


const removeCharacterCount = (text: string): string => {
  /**
   * remove  [+8592 chars] string from input text. 
   * return the trimmed text
   */
  if (!text) return '';
  return text.replace(/\[\+\d+ chars\]/g, '').trim();
}



const getArticles = async (category="general") => {
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`)
    console.log(response.data.articles)
    return response.data.articles
  } catch (error) {
    console.log("Error fetching articles", error)
  }
}

export {
    removeCharacterCount,
    getArticles
}