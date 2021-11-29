import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
// import sendErrorResponse from '../lib/sendErrorResponse';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getEmpInfoByEmail(email) {
    let empInfo;

    try {
        const result = await dynamodb.query({
            TableName: process.env.EMPLOYEES_TABLE_NAME,
            IndexName: 'emailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email,
            },
        }).promise();

        empInfo = result.Items[0];
    }
    catch (err) {
        throw new createError.InternalServerError(err);
    }

    if (!empInfo) {
        throw new createError.NotFound(`Employee with email ${email} not found!`);
    }

    return empInfo;
}

async function getEmployeeInformation(event, context) {
    const { email } = event.queryStringParameters;
    const empInfo = await getEmpInfoByEmail(email.toLowerCase());

    return {
        statusCode: 200,
        body: JSON.stringify({ data: empInfo }),
    };
}


export const handler = commonMiddleware(getEmployeeInformation);
