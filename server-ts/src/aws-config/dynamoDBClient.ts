import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config();

const { DYNAMODB_REGION } = process.env;

const dynamoSetup = () => {
  const client = new DynamoDBClient({
    region: DYNAMODB_REGION,
    // DEV MODE
    endpoint: `http://localhost:8001`,
  });
  return DynamoDBDocumentClient.from(client);
};

export const dynamoDBDocumentClient = dynamoSetup();
