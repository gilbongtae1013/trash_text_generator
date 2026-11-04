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
다음 글을 실제로 글을 잘 못 쓰는 사람이 쓴 것처럼 다시 작성해라.

중요:
문학적으로 이상한 글을 만드는 것이 아니다.
AI가 일부러 이상하게 쓴 것처럼 보이게 하지 마라.

실제로 글을 잘 못 쓰는 사람이 사건을 설명하면서 문장을 제대로 정리하지 못하고, 앞 문장과 다음 문장을 접속사로 억지로 계속 연결하는 느낌으로 작성해라.

가장 중요한 특징:

"그리고", "그래서", "그런데", "근데", "그러다가", "다시", "그러고 나서", "그러니까" 같은 접속 표현을 매우 자주 사용해라.

앞 문장과 완벽하게 자연스럽게 연결되지 않아도 된다.

문장이 끝났는데도 다음 이야기를 어떻게 시작해야 할지 몰라서 "그래서", "그리고", "그런데" 같은 말로 계속 이어 붙이는 느낌을 만들어라.

같은 사건을 설명하면서도 불필요하게 앞의 내용을 다시 언급해라.

문장 구조가 약간 어색해도 괜찮다.

예를 들어 다음과 같은 느낌이다:

"남자가 집에 갔는데 그래서 여자가 없어서 다시 봤는데 그런데 여자가 밖에 있어서 그래서 남자가 다시 나갔다."

이처럼 접속사가 앞뒤 문맥에 완벽하게 맞지 않아도 괜찮다.

원문에 있는 사건의 순서와 핵심 내용은 유지해라.

글을 읽었을 때 새로운 중요한 사건이 생기지 않도록 해라.

하지만 원문에 이미 있는 사건을 설명하기 위해 불필요하게 앞의 사건을 다시 말하거나, 같은 상황을 조금 다르게 반복하는 것은 허용된다.

문장 규칙:

- 문장을 너무 깔끔하게 정리하지 마라.
- 모든 문장을 자연스럽게 다듬지 마라.
- 접속사를 자주 사용해라.
- 같은 접속사를 가까운 위치에서 다시 사용해도 된다.
- "그리고 그래서", "그래서 그런데", "그러다가 다시"처럼 어색하게 이어지는 연결도 허용된다.
- 문장이 길어졌다가 갑자기 짧아져도 된다.
- 앞에서 말한 내용을 다시 말해도 된다.
- 사건 설명이 약간 빙빙 돌아가도 된다.

하지만 완전히 의미 없는 단어를 나열하지 마라.

독자가 대략 무슨 일이 일어났는지는 이해할 수 있어야 한다.

중요한 목표:

"일부러 이상한 글을 썼다"가 아니라

"이 사람은 글을 진짜 못 쓰는데 어떻게든 사건을 설명하려고 계속 그리고, 그래서, 그런데를 붙이고 있다"

라는 느낌이 들어야 한다.

출력하기 전에 문장을 지나치게 자연스럽게 수정하지 마라.

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