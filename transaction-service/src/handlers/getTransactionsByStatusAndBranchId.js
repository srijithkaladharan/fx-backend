import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import { STATUSES } from '../lib/models/createTransaction.model';
import { isStatusValid } from '../lib/validateConstants';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getTransactionsByStatusAndBranchId(event, context) {
    const { status, branchId } = event.queryStringParameters;
    let transactions;

    const checkStatus = isStatusValid(status);
    if (!checkStatus || branchId === undefined || branchId === null) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid Value in Path Params" }),
        };
    }

    const params = {
        TableName: process.env.TRANSACTIONS_TABLE_NAME,
        FilterExpression: '#status = :status AND #branchId = :branchId',
        ExpressionAttributeValues: {
            ':status': STATUSES[status.toUpperCase()],
            ':branchId': branchId
        },
        ExpressionAttributeNames: {
            '#status': 'status',
            '#branchId': 'branchId'
        }
    };

    try {
        let result = await dynamodb.scan(params).promise();
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

export const handler = commonMiddleware(getTransactionsByStatusAndBranchId);
