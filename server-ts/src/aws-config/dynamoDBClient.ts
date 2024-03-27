import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as dotenv from 'dotenv';

dotenv.config();

const { DYNAMODB_REGION } = process.env;

export const dynamoDBClient = (): DocumentClient => {
  return new AWS.DynamoDB.DocumentClient({
    region: DYNAMODB_REGION,
    // DEV MODE
    endpoint: `http://localhost:8001`,
  });
};
