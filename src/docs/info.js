import swaggerJSDoc from 'swagger-jsdoc';

export const info = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API',
            version: '1.0.0',
            description: 'Documentación de mi proyecto',
        },
    },
    apis: ['./src/docs/*.yml'],
}


export const apiDoc = swaggerJSDoc(info);