import { getEnv } from "../../config/env.js";
import { getLogger } from "../../lib/logger.js";
import { DOCUMENT_EXTRACTION_PROMPT, buildExtractionPrompt } from "./prompts.js";

export interface ExtractionResult {
  category: string;
  confidence: number;
  structured: Record<string, unknown>;
  summary: string;
  rawText: string;
}

export interface IDocumentAI {
  extractDocument(
    documentBase64: string,
    mimeType: string,
    category?: string,
  ): Promise<ExtractionResult>;

  classifyDocument(
    documentBase64: string,
    mimeType: string,
  ): Promise<{ category: string; confidence: number }>;
}

class AnthropicDocumentAI implements IDocumentAI {
  private apiKey: string;
  private logger = getLogger();
  private baseUrl = "https://api.anthropic.com/v1/messages";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async extractDocument(
    documentBase64: string,
    mimeType: string,
    category?: string,
  ): Promise<ExtractionResult> {
    const prompt = buildExtractionPrompt(category);

    const mediaType = mimeType as
      | "image/jpeg"
      | "image/png"
      | "image/gif"
      | "image/webp"
      | "application/pdf";

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: documentBase64,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
        system: DOCUMENT_EXTRACTION_PROMPT,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(
        { status: response.status, body: errorBody },
        "Anthropic API error",
      );
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const result = (await response.json()) as {
      content: { type: string; text: string }[];
    };
    const textContent = result.content.find((c) => c.type === "text");
    if (!textContent) {
      throw new Error("No text content in Anthropic response");
    }

    const parsed = JSON.parse(textContent.text) as ExtractionResult;
    return parsed;
  }

  async classifyDocument(
    documentBase64: string,
    mimeType: string,
  ): Promise<{ category: string; confidence: number }> {
    const result = await this.extractDocument(documentBase64, mimeType);
    return {
      category: result.category,
      confidence: result.confidence,
    };
  }
}

class MockDocumentAI implements IDocumentAI {
  async extractDocument(
    _documentBase64: string,
    _mimeType: string,
    category?: string,
  ): Promise<ExtractionResult> {
    const resolvedCategory = category ?? "VET_RECORD";

    const mockResults: Record<string, ExtractionResult> = {
      VET_RECORD: {
        category: "VET_RECORD",
        confidence: 0.95,
        summary:
          "Pre-race veterinary examination for Midnight Thunder. All vital signs normal. Horse cleared for race day competition.",
        rawText:
          "Veterinary Examination Report\nHorse: Midnight Thunder\nDate: 2026-03-15\nVeterinarian: Dr. Sarah Mitchell, DVM\n\nVital Signs:\n- Heart Rate: 32 bpm (normal)\n- Respiratory Rate: 12 breaths/min (normal)\n- Temperature: 99.8°F (normal)\n- Weight: 1,150 lbs\n\nMusculoskeletal: No lameness detected. Flexion tests negative.\nCardiovascular: Regular rhythm, no murmurs.\nRespiratory: Clear lung sounds bilaterally.\n\nConclusion: Horse is fit and cleared for competition.",
        structured: {
          horseName: "Midnight Thunder",
          examDate: "2026-03-15",
          veterinarian: "Dr. Sarah Mitchell, DVM",
          heartRate: 32,
          respiratoryRate: 12,
          temperature: 99.8,
          weight: 1150,
          musculoskeletal: "No lameness detected. Flexion tests negative.",
          cardiovascular: "Regular rhythm, no murmurs.",
          respiratory: "Clear lung sounds bilaterally.",
          cleared: true,
        },
      },
      RACE_RESULT: {
        category: "RACE_RESULT",
        confidence: 0.92,
        summary:
          "Official race result chart for Race 7 at Gulfstream Park. Grade II Stakes, 1 1/8 Miles on Dirt. Winner: Silver Streak.",
        rawText:
          "OFFICIAL RACE RESULT\nGulfstream Park - Race 7\nGrade II - The Fountain of Youth Stakes\n1 1/8 Miles (Dirt) - Purse: $400,000\n\n1st: Silver Streak (J. Velazquez) - 1:49.32\n2nd: Iron Will (I. Ortiz Jr.) - neck\n3rd: Dark Rebel (L. Saez) - 2 lengths\n\nWin: $12.40, Place: $5.60, Show: $3.80",
        structured: {
          track: "Gulfstream Park",
          raceNumber: 7,
          stakesName: "The Fountain of Youth Stakes",
          grade: "II",
          distance: "1 1/8 Miles",
          surface: "DIRT",
          purse: 400000,
          winner: "Silver Streak",
          winJockey: "J. Velazquez",
          winTime: "1:49.32",
          finishOrder: [
            { position: 1, horse: "Silver Streak", margin: "-" },
            { position: 2, horse: "Iron Will", margin: "neck" },
            { position: 3, horse: "Dark Rebel", margin: "2 lengths" },
          ],
          payouts: { win: 12.4, place: 5.6, show: 3.8 },
        },
      },
      REGISTRATION: {
        category: "REGISTRATION",
        confidence: 0.97,
        summary:
          "Jockey Club registration certificate for Golden Sunrise. Foal of 2022, by Tapit out of Starlight Dream.",
        rawText:
          "THE JOCKEY CLUB\nCERTIFICATE OF FOAL REGISTRATION\n\nRegistered Name: Golden Sunrise\nRegistration Number: JC-2022-184729\nFoal Date: March 12, 2022\nSex: Colt\nColor: Chestnut\nSire: Tapit\nDam: Starlight Dream\nDam's Sire: Curlin\nBreeder: Stonestreet Farm\nState Bred: KY",
        structured: {
          registeredName: "Golden Sunrise",
          registrationNumber: "JC-2022-184729",
          foalDate: "2022-03-12",
          sex: "Colt",
          color: "Chestnut",
          sire: "Tapit",
          dam: "Starlight Dream",
          damSire: "Curlin",
          breeder: "Stonestreet Farm",
          stateBred: "KY",
        },
      },
      INSURANCE: {
        category: "INSURANCE",
        confidence: 0.91,
        summary:
          "Equine mortality and major medical insurance policy for Desert Storm. Coverage: $500,000. Policy period: 2026-01-01 to 2026-12-31.",
        rawText:
          "EQUINE INSURANCE POLICY\nPolicy Number: EQ-2026-00834\nInsured: Desert Storm\nOwner: Blue Sky Racing LLC\n\nCoverage:\n- Mortality: $500,000\n- Major Medical/Surgical: $100,000\n- Loss of Use: $250,000\n\nPremium: $22,500/year\nPolicy Period: January 1, 2026 - December 31, 2026\nUnderwriter: Great American Insurance Group",
        structured: {
          policyNumber: "EQ-2026-00834",
          horseName: "Desert Storm",
          owner: "Blue Sky Racing LLC",
          mortalityCoverage: 500000,
          majorMedicalCoverage: 100000,
          lossOfUseCoverage: 250000,
          annualPremium: 22500,
          policyStart: "2026-01-01",
          policyEnd: "2026-12-31",
          underwriter: "Great American Insurance Group",
        },
      },
      PURCHASE_AGREEMENT: {
        category: "PURCHASE_AGREEMENT",
        confidence: 0.93,
        summary:
          "Private purchase agreement for Storm Chaser. Sale price: $350,000. Buyer: Nuestable Racing Stable.",
        rawText:
          "PRIVATE PURCHASE AGREEMENT\n\nSeller: Claiborne Farm\nBuyer: Nuestable Racing Stable LLC\n\nHorse: Storm Chaser\nAge: 3\nSex: Colt\nSire: Into Mischief\nDam: Wind Song\n\nPurchase Price: $350,000\nDeposit: $35,000\nBalance Due: Upon delivery\n\nVet Inspection: Passed (3/10/2026)\nDelivery Date: March 20, 2026",
        structured: {
          seller: "Claiborne Farm",
          buyer: "Nuestable Racing Stable LLC",
          horseName: "Storm Chaser",
          age: 3,
          sex: "Colt",
          sire: "Into Mischief",
          dam: "Wind Song",
          purchasePrice: 350000,
          deposit: 35000,
          vetInspectionPassed: true,
          vetInspectionDate: "2026-03-10",
          deliveryDate: "2026-03-20",
        },
      },
      TRAINING_LOG: {
        category: "TRAINING_LOG",
        confidence: 0.89,
        summary:
          "Weekly training log for Brave Heart. Five workouts recorded. Notable breeze: 4 furlongs in 47.2 seconds at Keeneland.",
        rawText:
          "TRAINING LOG - WEEK OF 3/10/2026\nHorse: Brave Heart\nTrainer: T. Pletcher\nTrack: Keeneland\n\nMon 3/10: Jog 2 miles\nTue 3/11: Gallop 1.5 miles, strong\nWed 3/12: Breeze 4F in :47.2 (handily)\nThu 3/13: Walk day\nFri 3/14: Gallop 1.5 miles\nSat 3/15: Breeze 5F in :59.8 (breezing)\n\nNotes: Horse training forwardly. Moving well over the Keeneland surface.",
        structured: {
          horseName: "Brave Heart",
          trainer: "T. Pletcher",
          track: "Keeneland",
          weekOf: "2026-03-10",
          workouts: [
            { date: "2026-03-10", type: "Jog", distance: "2 miles" },
            {
              date: "2026-03-11",
              type: "Gallop",
              distance: "1.5 miles",
              intensity: "strong",
            },
            {
              date: "2026-03-12",
              type: "Breeze",
              distance: "4F",
              time: "47.2",
              style: "handily",
            },
            { date: "2026-03-13", type: "Walk", distance: "N/A" },
            { date: "2026-03-14", type: "Gallop", distance: "1.5 miles" },
            {
              date: "2026-03-15",
              type: "Breeze",
              distance: "5F",
              time: "59.8",
              style: "breezing",
            },
          ],
          trainerNotes:
            "Horse training forwardly. Moving well over the Keeneland surface.",
        },
      },
    };

    const result = mockResults[resolvedCategory] ?? mockResults["VET_RECORD"]!;
    return result;
  }

  async classifyDocument(
    _documentBase64: string,
    _mimeType: string,
  ): Promise<{ category: string; confidence: number }> {
    return { category: "VET_RECORD", confidence: 0.95 };
  }
}

export function createDocumentAI(): IDocumentAI {
  const env = getEnv();

  if (env.ANTHROPIC_API_KEY) {
    return new AnthropicDocumentAI(env.ANTHROPIC_API_KEY);
  }

  return new MockDocumentAI();
}
