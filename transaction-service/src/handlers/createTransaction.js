import commonMiddleware from '../lib/commonMiddleware';


async function createTransaction(event, context) {
  let tableName = process.env.TRANSACTIONS_TABLE_NAME;
  return {
    statusCode: 200,
    body: JSON.stringify(event.body),
  };
}

export const handler = commonMiddleware(createTransaction);


