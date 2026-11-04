module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST 요청만 허용됩니다."
    });
  }

  try {
    const { text } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "글을 입력해주세요."
      });
    }

    const prompt = `
다음 글을 의도적으로 글을 매우 못 쓰는 사람이 쓴 것처럼 다시 작성해라.

중요:
문장을 일부러 해체하거나 단어 하나하나를 설명하지 마라.
"안녕"이라는 단어의 의미를 설명하거나, "오늘이라는 하루"처럼 단어 자체를 억지로 풀어 설명하지 마라.

이 글의 목표는 문장이 이상하거나 미친 사람처럼 보이는 것이 아니다.

정상적인 한국어 문법으로 글을 쓰지만, 글을 쓰는 능력이 부족해서 원래 간단하게 말할 수 있는 내용을 쓸데없이 길게 설명하는 사람처럼 작성하는 것이 목표다.

반드시 다음 방식을 사용해라.

- 원문의 핵심 내용을 유지한다.
- 문장 하나로 끝낼 수 있는 내용을 여러 문장으로 늘린다.
- 핵심과 직접적인 관련이 없는 평범한 과정이나 상황을 덧붙인다.
- 이미 말한 내용을 자연스럽게 다시 설명한다.
- 같은 사실을 조금 다른 표현으로 여러 번 언급한다.
- 당연한 내용을 굳이 설명한다.
- 한 가지 사실을 말한 뒤 그 사실이 왜 그런지 불필요하게 다시 설명한다.
- 특별하지 않은 행동도 그 행동을 하게 된 과정처럼 길게 설명한다.
- 글 전체를 읽으면 내용은 결국 원문과 거의 같아야 한다.
- 새로운 중요한 사건이나 사실은 만들지 않는다.

문체 규칙:

- 문법과 맞춤법은 대체로 자연스럽게 유지한다.
- 단어를 쪼개서 뜻을 설명하지 않는다.
- "오늘이라는 하루", "양치라는 행위"처럼 인위적으로 단어를 분석하지 않는다.
- 같은 접속사를 기계적으로 반복하지 않는다.
- "아무튼", "그래서", "근데" 같은 표현은 자연스럽게 필요한 경우에만 사용한다.
- 일부러 미친 사람처럼 쓰지 않는다.
- 철학적인 고민을 추가하지 않는다.
- 억지 순환논리를 만들지 않는다.
- 이야기를 전혀 다른 주제로 크게 바꾸지 않는다.

가장 중요한 규칙:

결과를 읽었을 때 "글을 이상하게 만들었네"가 아니라
"아니 이걸 왜 이렇게 길게 설명하지?"라는 느낌이 들어야 한다.

원문보다 3~6배 정도 길게 작성한다.

원문:
${text}

설명하지 말고 변환된 글만 출력해라.
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
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content:
                "사용자의 글을 의도적으로 매우 못 쓴 것처럼 장황하고 난잡하게 재작성한다. 설명이나 분석 없이 결과만 출력한다."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 1.2,
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

    const result = data?.choices?.[0]?.message?.content;

    if (!result) {
      return res.status(500).json({
        error: "AI가 결과를 생성하지 않았습니다."
      });
    }

    return res.status(200).json({
      result
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "서버 오류"
    });
  }
};