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
다음 글을 의도적으로 매우 글을 못 쓰는 사람이 쓴 것처럼 길게 다시 작성해라.

가장 중요한 규칙:

절대로 원문에 없는 새로운 사실이나 구체적인 정보를 추가하지 마라.

특히 다음 내용을 새로 만들어내는 것을 절대 금지한다.

- 원문에 없는 행동
- 원문에 없는 시간
- 원문에 없는 장소
- 원문에 없는 물건
- 원문에 없는 사람
- 원문에 없는 과정
- 원문에 없는 이유
- 원문에 없는 상황
- 원문에 없는 숫자나 구체적인 수치

글을 길게 만들기 위해 행동 과정을 상상해서 추가하면 안 된다.

예를 들어 원문이:

"나는 오늘 양치를 했다."

라면 다음과 같은 내용을 새로 추가하면 안 된다:

"아침에 일어났다."
"거울 앞에 섰다."
"칫솔을 사용했다."
"치약을 짰다."
"물을 틀었다."
"2분 동안 닦았다."

이런 내용은 원문에 없으므로 절대로 추가하지 마라.

글을 길게 만드는 방법:

원문에 이미 존재하는 정보만 사용해서 다음과 같이 늘려라.

- 이미 말한 사실을 다시 설명한다.
- 같은 내용을 조금 다른 표현으로 다시 말한다.
- 당연한 사실을 불필요하게 설명한다.
- 한 문장에서 말한 내용을 다음 문장에서 다시 확인한다.
- 결론을 말한 뒤 다시 그 결론에 이르게 된 원래 내용을 반복한다.
- 원문의 핵심 사실 하나를 여러 문장에 걸쳐 계속 풀어서 말한다.

중요:

글을 읽고 나서 새로운 정보를 알게 되면 안 된다.

결과물에 포함된 사실은 모두 원문에서 알 수 있는 정보여야 한다.

문법은 대체로 자연스럽게 유지한다.

단어를 쪼개서 뜻을 설명하지 마라.

예:
"오늘이라는 하루"
"양치라는 행위"
같은 인위적인 표현을 사용하지 마라.

문장을 일부러 미친 사람처럼 만들지 마라.

목표는 이상한 글이 아니라,
원래 한 문장으로 끝낼 수 있는 내용을 글을 못 쓰는 사람이 같은 정보만 가지고 지나치게 길게 쓴 글이다.

원문보다 3~5배 길게 작성해라.

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