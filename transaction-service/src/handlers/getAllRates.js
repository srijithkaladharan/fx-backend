import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAllRates(event, context) {

    let rates;

    try {
        const result = await dynamodb.scan({
            TableName: process.env.RATES_TABLE_NAME,
        }).promise();

        rates = result.Items;
    }
    catch (err) {
        throw new createError.InternalServerError(err);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ data: rates }),
    };
}

export const handler = commonMiddleware(getAllRates);
