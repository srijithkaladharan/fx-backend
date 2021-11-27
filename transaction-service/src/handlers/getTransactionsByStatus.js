import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import { STATUSES } from '../lib/models/createTransaction.model';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getTransactionsByStatus(event, context) {
    const { status } = event.pathParameters;
    let transactions;

    const isStatusValid = STATUSES.hasOwnProperty(status.toUpperCase());
    if (!isStatusValid) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid Status Value!" }),
        };
    }

    const params = {
        TableName: process.env.TRANSACTIONS_TABLE_NAME,
        IndexName: 'statusAndBranchId',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeValues: {
            ':status': STATUSES[status.toUpperCase()],
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        }
    };

    try {
        let result = await dynamodb.query(params).promise();
        transactions = result.Items;
    }
    catch (err) {
        throw new createError.InternalServerError(err);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ data: transactions }),
    };
}

export const handler = commonMiddleware(getTransactionsByStatus);
