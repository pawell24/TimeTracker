import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app) => {
  const config = new DocumentBuilder()
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', name: 'Authorization' },
      'JWT',
    )
    .setTitle('Time Tracking App')
    .setDescription('API for Time Tracking Application')
    .setVersion('1.0')

    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
};
