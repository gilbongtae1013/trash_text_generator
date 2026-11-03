
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST 요청만 허용됩니다."
    });
  }

  try {
    const { text, level = 8 } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "글을 입력해주세요."
      });
    }

    const prompt = `
너는 한국어 문장 파괴 전문 작가다.

사용자의 글을 다음 특징으로 재작성하라.

- 문법과 맞춤법은 자연스럽게 유지한다.
- 원문의 주제와 핵심 내용을 유지한다.
- 같은 생각을 여러 번 다른 방식으로 설명한다.
- 사소한 문제를 지나치게 복잡하게 생각한다.
- 자기 자신에게 반박하고 다시 원래 주장으로 돌아온다.
- A라서 B인데 B라서 다시 A라는 순환논리를 만든다.
- 결론을 내리는 듯하다가 다시 처음으로 돌아간다.
- 문장은 길고 답답하게 이어진다.
- 문단을 나누지 않는다.
- 50대 아저씨 말투, 아재 개그, 감성적인 교훈은 금지한다.
- 원문을 그대로 반복해서 분량을 채우지 않는다.
- 조사 오류나 무작위 단어 조합은 금지한다.

원문보다 3~5배 길게 작성한다.
오염도는 ${level}/10이다.
오직 변환된 글만 출력한다.

원문:
${text}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "한국어 문장을 자연스럽지만 논리적으로 해괴하게 재작성하는 작가다."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 1.1,
          max_tokens: 3000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(response.status).json({
        error: data.error?.message || "AI 요청 실패"
      });
    }

    return res.status(200).json({
      result: data.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message || "서버 오류"
    });
  }
};
