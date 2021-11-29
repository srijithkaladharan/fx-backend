const schema = {
    type: 'object',
    properties: {
        body: {
            type: 'object',
            properties: {
                clientName: {
                    type: 'string',
                },
                position: {
                    type: 'string',
                },
                currency: {
                    type: 'string',
                },
                fxRateFromHq: {
                    type: 'number',
                },
                spread: {
                    type: 'number',
                },
                quantity: {
                    type: 'number'
                },
                branchId: {
                    type: 'string',
                },
                submittedBy: {
                    type: 'string'
                }
            },
            required: [
                'clientName',
                'position',
                'currency',
                'fxRateFromHq',
                'quantity',
                'spread',
                'branchId',
                'submittedBy'
            ],
        },
    },
    required: ['body'],
};


export default schema;