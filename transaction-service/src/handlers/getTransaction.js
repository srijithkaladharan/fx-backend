import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getTransactionById(id) {
    let transaction;

    try {
        const result = await dynamodb.get({
            TableName: process.env.TRANSACTIONS_TABLE_NAME,
            Key: { id }
        }).promise();

        transaction = result.Item;
    }
    catch (err) {
        throw new createError.NotFound(`Transaction with ${id} not found!`);
    }

    return transaction;
}

async function getTransaction(event, context) {
    const { id } = event.pathParameters;
    const transaction = await getTransactionById(id);

    return {
        statusCode: 200,
        body: JSON.stringify({ data: transaction }),
    };
}

export const handler = commonMiddleware(getTransaction);
