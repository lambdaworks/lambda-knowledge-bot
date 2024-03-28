import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { LLMResult } from '@langchain/core/outputs';
import { Response } from 'express';

import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { HumanMessage, AIMessage } from 'langchain/schema';

@Injectable()
export class LLMService {
  private llm = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
  });

  private ClassificationPromptTemplate: string = `
If the whole text is asking for more context or it is a negative sentence, return a single NO. Otherwise return a single YES.

Input: {text}

Classification:
`;

  private llmChain = new LLMChain({
    llm: this.llm,
    prompt: PromptTemplate.fromTemplate(this.ClassificationPromptTemplate),
    outputParser: new StringOutputParser(),
  });

  private parser = new HttpResponseOutputParser({
    contentType: 'text/event-stream',
  });

  private promptTemplate(withMemory: boolean): string {
    let template =
      `Use the following pieces of context about the company to answer the question at the end. ` +
      `Every answer to a question you give should be in the language it was asked in, same if you don't know the answer. ` +
      `If the context doesn't contain the answer, just say that you don't know, don't try to make up an answer. ` +
      `Don't give opinionated answers.`;

    if (withMemory) {
      template += `\nChat History: {history}\n`;
    }

    template += `\nQuestion: {question}\nHelpful Answer:`;

    return template;
  }

  async retrieve(res: Response, query: string): Promise<void> {
    const pastMessages = [
      new HumanMessage('Do you know our WiFi password?'),
      new AIMessage('No, I do not'),
      new HumanMessage('Our WiFi password is admin123'),
    ];

    const memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(pastMessages),
    });

    const prompt = PromptTemplate.fromTemplate(
      this.promptTemplate(pastMessages.length > 0),
    );

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const chat = {
      chat: {
        createdAt: '2024-03-27T10:47:51Z',
        id: '55d81bc1-9546-441a-bba5-8c56c3cb22b0',
        title: 'What is a Wifi password?',
        userId: 'google-oauth2|102026784250201720394',
      },
      messageToken: '',
      relevantDocuments: [],
    };

    const streamingLlm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
      streaming: true,
      callbacks: [
        {
          async handleLLMNewToken(token: string) {
            res.write(`event: data\ndata: ${token}\n\n`);
          },
          async handleLLMEnd(output: LLMResult) {
            const resultText = output.generations
              .flatMap((x) => x.map((y) => y.text))
              .join('');
            // TODO put resultText into DB
            res.write(`event: end\ndata: ${JSON.stringify(chat)}\n\n`);
          },
        },
      ],
    });

    const qaChain = new LLMChain({
      llm: streamingLlm,
      prompt,
      outputParser: this.parser,
      memory,
    });

    await qaChain.invoke({
      question: query,
    });
  }
}
