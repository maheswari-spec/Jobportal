import { GoogleGenerativeAI } from "@google/generative-ai"
import { config } from "./environment"

let geminiModel: any = null

if (config.geminiApiKey) {
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey)
    const geminiModelName = config.geminiModelName || 'models/gemini-2.5-flash'
    geminiModel = genAI.getGenerativeModel({ model: geminiModelName })

    console.log(`Gemini AI SDK Client created. Using model: ${geminiModelName}`)
    try {
      console.log('Gemini model methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(geminiModel)).join(', '))
    } catch (e) {
      // ignore
    }
  } catch (error) {
    console.error("Failed to create Gemini AI client:", error)
  }
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set.")
}

export { geminiModel }
export default geminiModel