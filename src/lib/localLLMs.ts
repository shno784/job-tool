import { pipeline, TextGenerationPipeline } from "@xenova/transformers";

const MODEL_ID = "Xenova/distilgpt2";

let generator: TextGenerationPipeline | null = null;

export async function getGenerator () {
    if (!generator) {
    generator = await pipeline("text-generation", MODEL_ID);
  }
  return generator;
}