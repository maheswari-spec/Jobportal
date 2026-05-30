import mongoose from "mongoose"
import dns from "dns"
import { config } from "./environment"

dns.setDefaultResultOrder("ipv4first")
// When using an SRV connection string (mongodb+srv://) some environments
// block DNS SRV lookups. Force well-known public DNS servers before
// connecting as a fallback so Atlas SRV resolution succeeds in those cases.
export const connectDB = async (): Promise<void> => {
  try {
    if (config.mongodbUri && config.mongodbUri.startsWith("mongodb+srv://")) {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"])
      } catch (dnsErr) {
        // non-fatal: continue and let mongoose attempt resolution with system DNS
        console.warn("Warning: could not set DNS servers for SRV lookup:", dnsErr)
      }
    }

    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 30000,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error: any) {
    console.error("Database connection error:", error)
    if (error && String(error).includes("querySrv")) {
      console.error(
        "SRV DNS lookup failed. If you're behind a restrictive network, try using a standard (non-SRV) MongoDB connection string from Atlas or allow DNS SRV lookups."
      )
    }
    process.exit(1)
  }
}