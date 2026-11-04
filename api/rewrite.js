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

목표는 원문을 분석하거나 해설하는 것이 아니다.

원문에 있는 문장을 단어별로 풀어서 설명하지 마라.
원문의 의미를 설명하는 글을 쓰지 마라.
"이것은 ~라는 뜻이다" 같은 방식으로 원문을 해설하지 마라.

절대로 다음과 같은 AI식 표현을 사용하지 마라.

- "~라는 뜻이다"
- "~라는 사실을 말하고 있는 것이다"
- "~라고 할 수 있다"
- "다시 말해 원문을 반복하면"
- "이 문장은 ~를 의미한다"
- "결국 이것은"
- "여러 번 되풀이해서 강조하고 있다"
- "오늘이라는 하루"
- "~라는 행위"
- "~라는 순간"

글을 작성하는 방법:

원문에 있는 사건이나 사실을 중심으로,
그 사건과 관련해서 별로 중요하지 않은 말이나
굳이 하지 않아도 되는 설명을 덧붙여라.

하지만 원문에 없는 구체적인 사건을 만들어내지는 마라.

글을 길게 만드는 방법은
새로운 행동이나 상황을 추가하는 것이 아니라
다음과 같은 방식으로 한다.

- 특별하지 않은 일을 특별하지 않다고 길게 말한다.
- 굳이 설명하지 않아도 되는 부분을 한 번 더 언급한다.
- 이미 말한 내용을 자연스럽게 다시 꺼낸다.
- "굳이 말하자면", "어쨌든", "사실", "뭐", "그냥" 같은 일상적인 말을 자연스럽게 사용한다.
- 한참 주변 이야기를 한 뒤 원래 내용으로 돌아온다.

중요:

글을 읽었을 때
"문장을 분석하고 있네"라는 느낌이 들면 실패다.

"글을 그냥 엄청 못 쓰네"라는 느낌이 들어야 한다.

원문에 없는 구체적인 행동, 시간, 장소, 물건, 숫자 등을 새로 만들지 마라.

글 전체의 핵심 정보는 원문과 동일해야 한다.

마지막에 글의 작성 방식이나 반복 여부를 설명하지 마라.

원문보다 약 3~5배 길게 작성해라.

원문:
${text}

오직 변환된 글만 출력해라.
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