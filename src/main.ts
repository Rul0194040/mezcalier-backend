import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import * as moduleAlias from 'module-alias';
import { AppModule } from '@mezcal/app.module';
import { ConfigKeys } from '@mezcal/common/enum/configkeys.enum';
import { HttpExceptionFilter } from '@mezcal/common/filters/http-exceptions.filter';
import { TypeORMExceptionFilter } from '@mezcal/common/filters/typeorm-exceptions.filter';
import * as morgan from 'morgan';

moduleAlias.addAliases({
  '@mezcal': path.resolve(__dirname),
});
/**
 * Arrancan!
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.disable('x-powered-by');

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Authorization', 'content-type'],
  });
  const engine = app.getHttpServer();
  //sentry.io
  Sentry.init({
    dsn: configService.get<string>(ConfigKeys.SENTRY_DSN),
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({
        app: engine,
      }),
    ],
    tracesSampleRate: 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());

  //preparar para loadbalancer
  app.set('trust proxy', 1);

  //prefijo global para todas las apis, configurado en app.module en los valores config default
  app.setGlobalPrefix(configService.get<string>(ConfigKeys.API_ROUTE));

  //obtener valores del package.json
  const appPackage = JSON.parse(readFileSync('package.json').toString());

  //preparar la generacion de la documentación del api con los valores de json
  const options = new DocumentBuilder()
    .setTitle(appPackage.name)
    .setDescription(appPackage.description)
    .setVersion(appPackage.version)
    .setContact(
      appPackage.author.name,
      appPackage.author.url,
      appPackage.author.email,
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  //ruta de acceso a la documentación del api
  SwaggerModule.setup(
    `${configService.get<string>(
      ConfigKeys.API_ROUTE,
    )}/${configService.get<string>(ConfigKeys.API_SWAGGER)}`,
    app,
    document,
  );

  //filter global para las excepciones del orm y http
  app.useGlobalFilters(
    new TypeORMExceptionFilter(configService),
    new HttpExceptionFilter(configService),
  );

  //validacion pipe en todos los puntos!
  app.useGlobalPipes(new ValidationPipe());

  //logs de los requests recibidos, con morgan
  app.use(morgan(configService.get<string>(ConfigKeys.MORGAN_TYPE)));

  //vamonos!
  await app.listen(configService.get<string>(ConfigKeys.PORT));
}

bootstrap();
