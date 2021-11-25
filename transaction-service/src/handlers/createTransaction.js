async function createTransaction(event, context) {
  let tableName = process.env.TRANSACTIONS_TABLE_NAME;
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello Srijith!' + tableName }),
  };
}

export const handler = createTransaction;


