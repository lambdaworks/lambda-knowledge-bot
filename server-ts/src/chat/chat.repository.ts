import { Injectable } from '@nestjs/common';
import { dynamoDBClient } from 'src/aws-config/dynamoDBClient';
import { v4 as uuid } from 'uuid';
import { Chat } from './chat.interface';

import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const { DYNAMODB_TABLE_NAME, DYNAMODB_MAIN_TABLE_NAME } = process.env;
@Injectable()
export class ChatRepository {
  async newChat(dto: Chat, userId: string) {
    return await dynamoDBClient()
      .put({
        TableName: DYNAMODB_MAIN_TABLE_NAME,
        Item: {
          pk: `USER#${userId}`,
          sk: `CHAT#${dto.createdAt.toISOString()}`,
          id: uuid(),
          userId,
          title: dto.title,
          createdAt: dto.createdAt.toISOString(),
        },
      })
      .promise();
  }
  async getUserAllChats(
    userId: string,
    limit: number,
    lastKey: string,
  ): Promise<Chat[]> {
    const params: DocumentClient.QueryInput = {
      TableName: DYNAMODB_MAIN_TABLE_NAME,
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':skPrefix': 'CHAT#',
      },
      Limit: limit,
      ScanIndexForward: false,
      ExclusiveStartKey: lastKey
        ? {
            pk: `USER#${userId}`,
            sk: `CHAT#${lastKey}`,
          }
        : undefined,
    };
    const response = await dynamoDBClient().query(params).promise();
    return (
      response.Items?.map((item) => ({
        id: item.id,
        userId: item.userId,
        title: item.title,
        createdAt: new Date(item.createdAt),
      })) || []
    );
  }
}
