import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import validator from '@middy/validator';
import updateTransactionStatusSchema from '../lib/schema/updateTransactionStatusSchema';
import { STATUSES } from '../lib/models/createTransaction.model';
import { isStatusValid } from '../lib/validateConstants';
import { getTransactionById } from './getTransaction';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function updateTransaction(values) {

    const { id, status, empId, reason, timeline } = values;
    const at = new Date();

    const timelineObj = { empId, event: status, empId, at, reason }
    timeline.push(timelineObj);

    const params = {
        TableName: process.env.TRANSACTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set #status = :status, timeline = :timeline',
        ExpressionAttributeValues: {
            ':status': status,
            ':timeline': timeline
        },
        ExpressionAttributeNames: {
            '#status': 'status',
            // '#timeline': 'timeline'
        },
        ReturnValues: 'ALL_NEW',
    };

    console.log("TIMELINE:", timeline);

    let updatedTransaction;

    try {
        const result = await dynamodb.update(params).promise();
        updatedTransaction = result.Attributes;
    }
    catch (err) {
        throw new createError.InternalServerError(err);
    }
    console.log("UPDATED TRANS:", updatedTransaction);
    return updatedTransaction;
}

async function updateTransactionByStatus(event, context) {
    const { id } = event.pathParameters;
    const { status, empId, reason } = event.body;
    const checkStatus = isStatusValid(status);

    if (!checkStatus) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid Status Value!" }),
        };
    }

    let transaction = await getTransactionById(id);
    let transactionTimeline = transaction.timeline ? transaction.timeline : [];

    if (transaction.status === status) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: `Transaction with ID ${id} has already been ${status}` }),
        };
    }

    let updatedTransaction;

    if (transaction.status === STATUSES['REQUESTED'] && (status === STATUSES['APPROVED'] || status === STATUSES['AMENDED'] || status === STATUSES['REJECTED'])) {
        updatedTransaction = await updateTransaction({ id, status, empId, reason, timeline: transactionTimeline });
    }
    else if (transaction.status === STATUSES['AMENDED'] && (status === STATUSES['APPROVED'] || status === STATUSES['REJECTED'])) {
        updatedTransaction = await updateTransaction({ id, status, empId, reason, timeline: transactionTimeline });
    }
    else {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: `Can not update a ${transaction.status} transaction to ${status}` }),
        };
    }
    return {
        statusCode: 201,
        body: JSON.stringify({ data: updatedTransaction }),
    };
}

export const handler = commonMiddleware(updateTransactionByStatus)
    .use(validator({ inputSchema: updateTransactionStatusSchema }));


