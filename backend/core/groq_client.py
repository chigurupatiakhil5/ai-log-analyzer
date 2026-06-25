import os
from collections.abc import Iterator

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

SYSTEM_PROMPT = """You are a server log analysis expert.
You will be given relevant excerpts from a server log file and a question about them.
Answer concisely and clearly based only on the provided log excerpts.
If the answer is not in the excerpts, say so."""


def stream_answer(question: str, chunks: list[dict]) -> Iterator[str]:
    client = Groq(api_key=os.environ["GROQ_API_KEY"])

    context = "\n\n---\n\n".join(
        f"[Lines {c['chunk_index']}]\n{c['content']}" for c in chunks
    )

    prompt = f"Log excerpts:\n\n{context}\n\nQuestion: {question}"

    stream = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        stream=True,
    )

    for chunk in stream:
        token = chunk.choices[0].delta.content
        if token:
            yield token
