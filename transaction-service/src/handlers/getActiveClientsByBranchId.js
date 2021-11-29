import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getActiveClientsByBranchId(event, context) {
    const { status, branchId } = event.queryStringParameters;
    let clients;

    const params = {
        TableName: process.env.CLIENTS_TABLE_NAME,
        IndexName: "statusAndBranchId",
        KeyConditionExpression: '#status = :status AND #branchId = :branchId',
        ExpressionAttributeValues: {
            ':status': status.toUpperCase(),
            ':branchId': branchId.toUpperCase()
        },
        ExpressionAttributeNames: {
            '#status': 'status',
            '#branchId': 'branchId'
        }
    };

    try {
        let result = await dynamodb.query(params).promise();
        clients = result.Items;
    }
    catch (err) {
        throw new createError.InternalServerError(err);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ data: clients }),
    };
}

export const handler = commonMiddleware(getActiveClientsByBranchId);
