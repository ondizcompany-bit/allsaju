// =====================================================
// LLM 프로바이더 스위치
// =====================================================
// LLM_PROVIDER 환경변수로 openai | anthropic | gemini 선택.
// 각 SDK는 lazy import 하여 미사용 패키지의 init 비용을 줄임.

import { serverEnv } from "@/lib/env";

export type LlmRequest = {
  system: string;
  user: string;
};

export type LlmResponse = {
  text: string;
  provider: string;
  model: string;
};

export async function generateInterpretation(req: LlmRequest): Promise<LlmResponse> {
  const env = serverEnv();
  switch (env.LLM_PROVIDER) {
    case "openai":
      return callOpenAI(req, env.LLM_MODEL, env.OPENAI_API_KEY);
    case "anthropic":
      return callAnthropic(req, env.LLM_MODEL, env.ANTHROPIC_API_KEY);
    case "gemini":
      return callGemini(req, env.LLM_MODEL, env.GOOGLE_GENERATIVE_AI_API_KEY);
  }
}

// 타임아웃·일시적 오류 등 낱개 LLM 호출 실패가 전체 결과지를 날려버리지 않도록
// 짧은 대기 후 한 번 재시도한다.
export async function generateInterpretationWithRetry(
  req: LlmRequest,
  retries = 1,
): Promise<LlmResponse> {
  try {
    return await generateInterpretation(req);
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, 500));
    return generateInterpretationWithRetry(req, retries - 1);
  }
}

async function callOpenAI(req: LlmRequest, model: string, key: string | undefined): Promise<LlmResponse> {
  if (!key) throw new Error("OPENAI_API_KEY is required when LLM_PROVIDER=openai");
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: key });
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: req.system },
      { role: "user", content: req.user },
    ],
    temperature: 0.7,
    max_completion_tokens: 8000,
  });
  const choice = completion.choices[0];
  const text = choice?.message?.content ?? "";
  // 토큰 한도에 걸려 문장이 중간에 끊기면, 짤린 결과를 그대로 내보내는 대신
  // 에러로 처리해 재시도 로직(generateInterpretationWithRetry)이 다시 시도하게 한다.
  if (choice?.finish_reason === "length") {
    throw new Error("OpenAI 응답이 토큰 한도에 걸려 중간에 끊겼습니다 (finish_reason=length)");
  }
  if (!text.trim()) throw new Error("OpenAI 응답이 비어 있습니다");
  return { text, provider: "openai", model };
}

async function callAnthropic(req: LlmRequest, model: string, key: string | undefined): Promise<LlmResponse> {
  if (!key) throw new Error("ANTHROPIC_API_KEY is required when LLM_PROVIDER=anthropic");
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: key });
  const message = await client.messages.create({
    model,
    max_tokens: 8000,
    system: req.system,
    messages: [{ role: "user", content: req.user }],
  });
  const text = message.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n");
  if (message.stop_reason === "max_tokens") {
    throw new Error("Anthropic 응답이 토큰 한도에 걸려 중간에 끊겼습니다 (stop_reason=max_tokens)");
  }
  if (!text.trim()) throw new Error("Anthropic 응답이 비어 있습니다");
  return { text, provider: "anthropic", model };
}

async function callGemini(req: LlmRequest, model: string, key: string | undefined): Promise<LlmResponse> {
  if (!key) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required when LLM_PROVIDER=gemini");
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const client = new GoogleGenerativeAI(key);
  const m = client.getGenerativeModel({
    model,
    systemInstruction: req.system,
    generationConfig: { maxOutputTokens: 8000 },
  });
  const result = await m.generateContent(req.user);
  const text = result.response.text();
  const finishReason = result.response.candidates?.[0]?.finishReason;
  if (finishReason === "MAX_TOKENS") {
    throw new Error("Gemini 응답이 토큰 한도에 걸려 중간에 끊겼습니다 (finishReason=MAX_TOKENS)");
  }
  if (!text.trim()) throw new Error("Gemini 응답이 비어 있습니다");
  return { text, provider: "gemini", model };
}
