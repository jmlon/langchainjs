import { Document } from "@langchain/core/documents";
import { FakeEmbeddings } from "../../embeddings/fake.js";
import { MemoryVectorStore } from "../../vectorstores/memory.js";

test("Test Memory Retriever with Callback", async () => {
  const pageContent = "Hello world";
  const embeddings = new FakeEmbeddings();

  const vectorStore = new MemoryVectorStore(embeddings);

  expect(vectorStore).toBeDefined();

  await vectorStore.addDocuments([
    { pageContent, metadata: { a: 1 } },
    { pageContent, metadata: { a: 1 } },
    { pageContent, metadata: { a: 1 } },
    { pageContent, metadata: { a: 1 } },
  ]);

  const queryStr = "testing testing";
  let startRun = 0;
  let endRun = 0;

  const retriever = vectorStore.asRetriever({
    k: 1,
    vectorStore,
    callbacks: [
      {
        handleRetrieverStart: async (_, query) => {
          expect(query).toBe(queryStr);
          startRun += 1;
        },
        handleRetrieverEnd: async (documents) => {
          expect(documents[0].pageContent).toBe(pageContent);
          endRun += 1;
        },
      },
    ],
  });

  const results = await retriever.getRelevantDocuments(queryStr);

  expect(results).toEqual([new Document({ metadata: { a: 1 }, pageContent })]);
  expect(startRun).toBe(1);
  expect(endRun).toBe(1);
});
