import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getBranchInfoById(id) {
    let branchInfo;

    try {
        const result = await dynamodb.get({
            TableName: process.env.BRANCHES_TABLE_NAME,
            Key: { id }
        }).promise();

        branchInfo = result.Item;
    }
    catch (err) {
        throw new createError.InternalServerError(err);
    }

    if (!branchInfo) {
        throw new createError.NotFound(`Branch with ${id} not found!`);
    }

    return branchInfo;
}

async function getBranchInformation(event, context) {
    const { id } = event.pathParameters;
    const branchInfo = await getBranchInfoById(id.toUpperCase());

    return {
        statusCode: 200,
        body: JSON.stringify({ data: branchInfo }),
    };
}

export const handler = commonMiddleware(getBranchInformation);
