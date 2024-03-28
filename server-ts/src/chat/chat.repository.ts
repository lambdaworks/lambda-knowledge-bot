import { Injectable } from '@nestjs/common';
import { dynamoDBDocumentClient } from 'src/aws-config/dynamoDBClient';
import { Chat } from './chat.interface';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const { DYNAMODB_TABLE_NAME, DYNAMODB_MAIN_TABLE_NAME } = process.env;
@Injectable()
export class ChatRepository {
  async put(dto: Chat) {
    const command = new PutCommand({
      TableName: DYNAMODB_MAIN_TABLE_NAME,
      Item: {
        pk: `USER#${dto.userId}`,
        sk: `CHAT#${dto.createdAt.toISOString()}`,
        id: dto.id,
        userId: dto.userId,
        title: dto.title,
        createdAt: dto.createdAt.toISOString(),
      },
    });
    return await dynamoDBDocumentClient.send(command);
  }
  async getUserAllChats(
    userId: string,
    limit: number,
    lastKey: string,
  ): Promise<Chat[]> {
    const command = new QueryCommand({
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
    });
    const response = await dynamoDBDocumentClient.send(command);
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
