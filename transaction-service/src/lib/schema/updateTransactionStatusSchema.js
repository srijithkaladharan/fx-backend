const schema = {
    type: 'object',
    properties: {
        body: {
            type: 'object',
            properties: {
                empId: {
                    type: 'string',
                },
                status: {
                    type: 'string',
                },
                reason: {
                    type: 'string'
                }
            },
            required: [
                'empId',
                'status',
                'reason'
            ],
        },
    },
    required: ['body'],
};


export default schema;