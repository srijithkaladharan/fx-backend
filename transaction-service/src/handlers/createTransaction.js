import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import validator from '@middy/validator';
import createTransactionSchema from '../lib/schema/createTransactionSchema';
import { isPositionValid } from '../lib/validateConstants';
import { STATUSES, POSITIONS } from '../lib/models/createTransaction.model';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createTransaction(event, context) {

  const transactionDetails = event.body;
  const now = new Date();

  const checkPosition = isPositionValid(transactionDetails.position);

  if (!checkPosition) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid Position' }),
    };
  }

  const transaction = {
    id: uuid(),
    transactionDateTime: now.toISOString(),
    clientName: transactionDetails.clientName,
    position: POSITIONS[transactionDetails.position.toUpperCase()],
    currency: transactionDetails.currency,
    fxRateFromHq: transactionDetails.fxRateFromHq,
    rate: transactionDetails.rate,
    amount: transactionDetails.amount,
    branchId: transactionDetails.branchId,
    status: STATUSES["REQUESTED"],
    timeline: [{
      event: STATUSES["REQUESTED"],
      empId: transactionDetails.submittedBy,
      at: now.toISOString(),
      reason: "Requested on behalf of client"
    }],
    lastUpdatedAt: now.toISOString()
  };

  try {
    await dynamodb.put({
      TableName: process.env.TRANSACTIONS_TABLE_NAME,
      Item: transaction,
    }).promise();
  }
  catch (err) {
    throw new createError.InternalServerError(err);
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ data: transaction }),
  };
}

export const handler = commonMiddleware(createTransaction)
  .use(validator({ inputSchema: createTransactionSchema }));


