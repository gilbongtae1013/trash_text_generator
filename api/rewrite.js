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
다음 글을 의도적으로 매우 못 쓴 글처럼 다시 작성해라.

중요:
글의 내용 자체를 완전히 이상하게 만들거나 철학적인 이야기를 추가하는 것이 목적이 아니다.
원래 한두 문장으로 말할 수 있는 내용을 쓸데없이 길고 난잡하게 설명해서,
읽는 사람이 "그래서 결국 무슨 말이야?"라고 느끼게 만드는 것이 목적이다.

조건:

- 문장 구조를 어색하고 난잡하게 만들 것.
- 같은 단어나 표현을 불필요하게 여러 번 반복할 것.
- 앞에서 한 말을 조금 바꿔서 다시 말할 것.
- 쓸데없이 긴 문장을 많이 사용할 것.
- 중요한 내용과 중요하지 않은 내용을 뒤섞을 것.
- 핵심 내용을 바로 말하지 않고 주변 설명을 먼저 길게 할 것.
- 너무 당연한 사실까지 굳이 자세하게 설명할 것.
- 같은 내용을 여러 번 확인하거나 다시 설명할 것.
- 앞뒤 내용의 연결이 약해지도록 만들되 완전히 의미 없는 글은 만들지 말 것.
- "아무튼", "그래서", "근데", "그러다가", "생각해보니까", "그런데", "그러니까", "다시 말해서" 같은 접속 표현을 자주 사용할 것.
- 읽는 사람이 끝까지 읽고 나서 "그래서 무슨 말이야?"라고 느끼게 할 것.
- 완전히 의미 없는 단어를 나열하지 말 것.
- 사람이 실제로 글을 못 써서 쓸데없이 길어진 것처럼 보이게 할 것.
- 문법과 맞춤법은 완전히 망가뜨리지 말 것.
- 원문의 핵심 내용은 유지할 것.
- 원문에 없는 새로운 중요한 사건이나 사실을 과도하게 추가하지 말 것.
- 글이 이상해졌다는 사실을 글 안에서 설명하지 말 것.
- 글을 왜 이렇게 작성했는지 설명하지 말 것.
- 아재개그, 교훈, 감성적인 마무리는 넣지 말 것.

분량:
원문보다 최소 3배에서 최대 6배 정도 길게 작성해라.
원문이 짧을수록 더욱 불필요하게 자세히 늘려라.

가장 중요한 목표:
내용을 새롭게 만드는 것이 아니라,
원래 내용을 제대로 간단하게 말하지 못하고
쓸데없이 길고 난잡하게 풀어서 작성하는 것이다.

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