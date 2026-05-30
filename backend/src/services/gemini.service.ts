import { geminiModel } from '../config/gemini';
import { AppError } from '../utils/errors';

export class GeminiService {
  private ensureModel() {
    if (!geminiModel) {
      throw new AppError('Gemini model is not configured. Set GEMINI_API_KEY and restart.', 501);
    }
    return geminiModel;
  }

  private async generateText(prompt: string) {
    const model = this.ensureModel();
    try {
      const result = await model.generateContent(prompt);
      if (!result?.response || typeof result.response.text !== 'function') {
        throw new AppError('Unexpected response from Gemini client', 500);
      }
      return result.response.text();
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw new AppError('Gemini generation failed: ' + (error as Error).message, 500);
    }
  }

  private convertJsLikeToJson(text: string) {
    let converted = text
      .replace(/^```(?:json)?\s*/gi, '')
      .replace(/\s*```$/gi, '')
      .trim();

    converted = converted.replace(/`([^`]+)`/g, '"$1"');
    converted = converted.replace(/([{,]\s*)([A-Za-z0-9_\- ]+)\s*:/g, '$1"$2":');
    converted = converted.replace(/'([^']*)'/g, (_, value) => {
      return '"' + value.replace(/"/g, '\\"') + '"';
    });
    converted = converted.replace(/,\s*([}\]])/g, '$1');
    return converted.trim();
  }

  private parseJsonResponse<T>(responseText: string): T {
    const tryParse = (text: string) => {
      try {
        return JSON.parse(text);
      } catch (_error) {
        return null;
      }
    };

    const cleaned = responseText
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const extractJsonLike = (text: string) => {
      const objectMatch = text.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return objectMatch[0];
      }
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      return arrayMatch ? arrayMatch[0] : null;
    };

    const cleanedJson = cleaned.replace(/^(?:output:|response:)/i, "").trim();

    const candidates = [
      cleanedJson,
      extractJsonLike(cleanedJson) ?? cleanedJson,
      this.convertJsLikeToJson(cleanedJson),
    ];

    for (const candidate of candidates) {
      const parsed = tryParse(candidate);
      if (parsed !== null) {
        return parsed;
      }
    }

    const extracted = extractJsonLike(cleanedJson);
    if (extracted) {
      const jsConvertedExtracted = this.convertJsLikeToJson(extracted);
      const parsed = tryParse(jsConvertedExtracted);
      if (parsed !== null) {
        return parsed;
      }
    }

    const strippedQuotes = cleanedJson.replace(/^['"`\s]+|['"`\s]+$/g, "").trim();
    const strippedParsed = tryParse(strippedQuotes);
    if (strippedParsed !== null) {
      return strippedParsed;
    }

    console.error("Unable to parse JSON from Gemini response:", responseText);
    console.error("Cleaned response:", cleanedJson);
    throw new AppError("Unable to parse Gemini JSON response from model output", 500);
  }

  private normalizeArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.normalizeArray(item));
    }
    if (typeof value === "object" && value !== null) {
      return Object.values(value).flatMap((item) => this.normalizeArray(item));
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return [];
      }
      try {
        const parsed = this.parseJsonResponse<any>(trimmed);
        if (Array.isArray(parsed)) {
          return this.normalizeArray(parsed);
        }
      } catch {
        // Fall back to plain text list parsing if JSON parsing fails.
      }

      return trimmed
        .split(/\r?\n|,|;/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  private normalizeAnalysisResult(raw: any) {
    return {
      skills: this.normalizeArray(raw.skills),
      atsScore: typeof raw.atsScore === "number" ? raw.atsScore : Number(raw.atsScore) || 0,
      suggestions: this.normalizeArray(raw.suggestions),
      missingKeywords: this.normalizeArray(raw.missingKeywords),
      improvedSummary: typeof raw.improvedSummary === "string"
        ? raw.improvedSummary.trim()
        : typeof raw.summary === "string"
        ? raw.summary.trim()
        : "",
      experienceSuggestions: raw.experienceSuggestions ?? raw.experience ?? []
    };
  }

  public async analyzeResumeText(resumeText: string) {
    try {
      const responseText = await this.generateText(`
          Respond with only raw JSON. Do not include markdown fences, backticks, or any explanatory text.
          Return exactly one JSON object and nothing else.
          Analyze the following resume text and extract the core skills, compute an ATS score (0-100), identify suggestions for improvements, identify missing keywords, rewrite a highly polished professional summary, and suggest concrete description/achievements enhancements.
          Return an object with keys: skills, atsScore, suggestions, missingKeywords, improvedSummary, experienceSuggestions.
          Ensure skills is an array of strings, suggestions and missingKeywords are arrays of strings, atsScore is a number, and improvedSummary is a string.

          Resume Content:
          "${resumeText}"
        `);

      const parsed = this.parseJsonResponse<any>(responseText);
      return this.normalizeAnalysisResult(parsed);
    } catch (error) {
      console.error("Gemini Resume Analysis Error:", error);
      throw new AppError("Failed to analyze resume via Gemini API: " + (error as Error).message, 500);
    }
  }  public async matchResumeWithJD(resumeJSON: any, jdText: string) {
    try {
      const responseText = await this.generateText(`
          Respond with only raw JSON. Do not include markdown fences, backticks, or any explanatory text.
          Compare the candidate's parsed resume details with the provided Job Description (JD).
          Calculate the overall job match percentage (0-100), list matched skills, highlight missing skills, and provide custom recommendations for profile changes to fit the job role.
          Return an object with keys: matchPercentage, matchedSkills, missingSkills, recommendations.

          Candidate Resume JSON:
          ${JSON.stringify(resumeJSON)}

          Job Description (JD):
          "${jdText}"
        `);

      return this.parseJsonResponse(responseText);
    } catch (error) {
      console.error('Gemini JD Match Error:', error);
      throw new AppError('Failed to run job matching via Gemini API: ' + (error as Error).message, 500);
    }
  }

  public async tailorResumeForJD(resumeJSON: any, jdText: string) {
    try {
      const responseText = await this.generateText(`
          Respond with only raw JSON. Do not include markdown fences, backticks, or any explanatory text.
          Review the candidate's resume JSON and the target Job Description (JD).
          Perform the following customizations to optimize the resume for ATS filters:
          1. Rewrite the professional summary using keywords and phrases matching the JD.
          2. Edit the skills section ensuring maximum overlaps with JD requirements.
          3. Tailor experience descriptions and achievements using the STAR method.
          4. Align project descriptions to showcase requested technologies.
          Return an object with keys: summary, skills, experience, projects, atsScore.

          Original Resume:
          ${JSON.stringify(resumeJSON)}

          Target Job Description (JD):
          "${jdText}"
        `);

      return this.parseJsonResponse(responseText);
    } catch (error) {
      console.error('Gemini Resume Customizer Error:', error);
      throw new AppError('Failed to customize resume via Gemini API: ' + (error as Error).message, 500);
    }
  }

  public async generateCoverLetter(resumeJSON: any, jdText: string, companyName?: string) {
    try {
      const responseText = await this.generateText(`
          Respond with only raw JSON. Do not include markdown fences, backticks, or any explanatory text.
          Generate a tailored, ATS-friendly cover letter matching the candidate's resume achievements with the Job Description.
          Return an object with keys: subject, salutation, bodyParagraphs, signOff.

          Candidate Resume:
          ${JSON.stringify(resumeJSON)}

          Job Description:
          "${jdText}"

          ${companyName ? `Company Name: "${companyName}"` : ''}
        `);

      return this.parseJsonResponse(responseText);
    } catch (error) {
      console.error('Gemini Cover Letter Error:', error);
      throw new AppError('Failed to generate cover letter via Gemini API: ' + (error as Error).message, 500);
    }
  }

  public async generateInterviewQuestions(resumeJSON: any) {
    try {
      const responseText = await this.generateText(`
          Respond with only raw JSON. Do not include markdown fences, backticks, or any explanatory text.
          Generate a list of 5 behavior-based and technical interview questions tailored to the candidate's skills and experience. Include suggested guidelines on how to answer each.
          Return an object with key questions.

          Candidate Resume:
          ${JSON.stringify(resumeJSON)}
        `);

      return this.parseJsonResponse(responseText);
    } catch (error) {
      console.error('Gemini Interview Questions Error:', error);
      throw new AppError('Failed to generate interview questions via Gemini API: ' + (error as Error).message, 500);
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService
