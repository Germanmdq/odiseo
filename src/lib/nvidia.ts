import "server-only"

type NvidiaEmbeddingResponse = {
  data?: Array<{
    embedding?: number[]
  }>
}

export async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.NVIDIA_API_KEY

  if (!apiKey) {
    throw new Error("Missing NVIDIA_API_KEY")
  }

  const response = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/llama-nemotron-embed-1b-v2",
      input: [text],
      encoding_format: "float",
      input_type: "query",
      truncate: "END",
      dimensions: 1024,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`NVIDIA embeddings request failed: ${response.status} ${errorText}`)
  }

  const payload = (await response.json()) as NvidiaEmbeddingResponse
  const embedding = payload.data?.[0]?.embedding

  if (!embedding) {
    throw new Error("NVIDIA embeddings response did not include an embedding")
  }

  return embedding
}
