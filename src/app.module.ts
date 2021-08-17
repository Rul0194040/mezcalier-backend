import {
  Module,
  OnModuleInit,
  HttpException,
  MiddlewareConsumer,
} from '@nestjs/common';
import { RateLimiterInterceptor, RateLimiterModule } from 'nestjs-rate-limiter';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';

import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

//entities
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { ProfileEntity } from '@mezcal/modules/admin/profiles/model/profile.entity';
import { RuleEntity } from '@mezcal/modules/admin/rules/model/rule.entity';
import { DefinitionsEntity } from '@mezcal/modules/admin/definitions/definitions.entity';

//modules
import { AuthModule } from '@mezcal/auth/auth.module';
import { ProfilesModule } from '@mezcal/modules/admin/profiles/profiles.module';
import { RulesModule } from '@mezcal/modules/admin/rules/rules.module';
import { UsersModule } from '@mezcal/modules/admin/users/users.module';
import { DefinitionsModule } from '@mezcal/modules/admin/definitions/definitions.module';
import { AvatarModule } from '@mezcal/modules/admin/avatar/avatar.module';
import { HousesModule } from './modules/admin/houses/houses.module';

//services
import { AppService } from '@mezcal/app.service';
import { MyLogger } from '@mezcal/common/services/logger.service';
import { SentryInterceptor } from '@mezcal/common/sentry/sentry.interceptor';
import { ConfigKeys } from '@mezcal/common/enum/configkeys.enum';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { BrandEntity } from '@mezcal/modules/brand.entity';
import { RegionEntity } from '@mezcal/modules/admin/catalogs/regions/model/region.entity';
import { RegionsModule } from '@mezcal/modules/admin/catalogs/regions/regions.module';
import { ProcesseEntity } from '@mezcal/modules/admin/catalogs/processes/model/processe.entity';
import { ProcessesModule } from '@mezcal/modules/admin/catalogs/processes/processes.module';
import { FlavorEntity } from '@mezcal/modules/admin/catalogs/flavors/model/flavor.entity';
import { FlavorsModule } from '@mezcal/modules/admin/catalogs/flavors/flavors.module';
import { AgaveEntity } from '@mezcal/modules/admin/catalogs/agaves/model/agave.entity';
import { AgavesModule } from '@mezcal/modules/admin/catalogs/agaves/agaves.module';
import { MezcalTypeEntity } from '@mezcal/modules/admin/catalogs/mezcalTypes/model/mezcalType.entity';
import { mezcalTypesModule } from '@mezcal/modules/admin/catalogs/mezcalTypes/mezcalTypes.module';
import { ShopEntity } from '@mezcal/modules/owner/shops/model/shop.entity';
import { ShopsModule } from '@mezcal/modules/owner/shops/shops.module';
import { SuscriptionModule } from '@mezcal/modules/browser/suscription/suscription.module';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { ImagesModule } from '@mezcal/common/images/images.module';
import { ProductRatingEntity } from '@mezcal/modules/browser/models/productRatings.entity';
import { BrandLikesEntity } from '@mezcal/modules/browser/brands/brandLikes.entity';
import { HouseLikesEntity } from '@mezcal/modules/browser/houses/models/houseLikes.entity';
import { BrowserModule } from '@mezcal/modules/browser/browser.module';
import { BrandRatingEntity } from '@mezcal/modules/browser/brands/brandRatings.entity';
import { HouseRatingEntity } from '@mezcal/modules/browser/houses/models/houseRatings.entity';
import { ResponseTimeMiddleware } from '@nest-middlewares/response-time';
import { BrandCommentsEntity } from '@mezcal/modules/browser/brands/brandComments.entity';
import { HouseCommentsEntity } from '@mezcal/modules/browser/houses/models/houseComments.entity';
import { ProductCommentsEntity } from '@mezcal/modules/browser/models/productComments.entity';
import { ProductFavoritesEntity } from '@mezcal/modules/browser/models/productFavorites.entity';
import { ProductLikesEntity } from '@mezcal/modules/browser/models/productLikes.entity';
import { ProductTastingsEntity } from '@mezcal/modules/browser/models/productTastings.entity';
import { MastersModule } from '@mezcal/modules/owner/masters/masters.module';
import { MasterEntity } from '@mezcal/modules/owner/masters/model/master.entity';
import { OwnerModule } from './modules/owner/owner.module';
import { CloudvisionModule } from './modules/cloudvision/cloudvision.module';
import { CookingEntity } from './modules/admin/catalogs/cooking/cooking.entity';
import { CookingModule } from './modules/admin/catalogs/cooking/cooking.module';
import { DistillingEntity } from './modules/admin/catalogs/distilling/distilling.entity';
import { FermentingEntity } from './modules/admin/catalogs/fermenting/fermenting.entity';
import { MillingEntity } from './modules/admin/catalogs/milling/milling.entity';
import { DistillingModule } from './modules/admin/catalogs/distilling/distilling.module';
import { MillingModule } from './modules/admin/catalogs/milling/milling.module';
import { FermentingModule } from './modules/admin/catalogs/fermenting/fermenting.module';
import { EmailEntity } from './modules/browser/contact/email.entity';
import { EmailModule } from './modules/browser/contact/email.module';
import { RateLimitOptions } from './common/rate-limit.options';
import { ConfigKeysOptions } from './common/config-keys.options';
import { AdminShopsModule } from './modules/admin/shops/shops.module';
import { ProductsModule } from './modules/admin/products/products.module';
import { DashboardModule } from './modules/admin/dashboard/dashboard.module';

/**
 * Módulo principal de la app
 */
@Module({
  imports: [
    RateLimiterModule.register(RateLimitOptions),
    //cargar configuracion de .env
    ConfigModule.forRoot({
      validationSchema: Joi.object(ConfigKeysOptions),
      validationOptions: {
        allowUnknown: true, //permitir valores no definidos en validationSchema dentro del .env
        abortEarly: true, //abortar al primer error encontrado
      },
      isGlobal: true, // permitirlo de manera globaL
    }),
    // mailer
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (_configService: ConfigService) => ({
        transport: {
          host: _configService.get<string>(ConfigKeys.SMTP_HOST),
          port: _configService.get<string>(ConfigKeys.SMTP_PORT),
          ignoreTLS: _configService.get<string>(ConfigKeys.SMTP_IGNORE_TLS),
          secure: _configService.get<string>(ConfigKeys.SMTP_SECURE),
          auth: {
            user: _configService.get<string>(ConfigKeys.SMTP_USER),
            pass: _configService.get<string>(ConfigKeys.SMTP_PASSWORD),
          },
        },
        defaults: {
          from: `"${_configService.get<string>(
            ConfigKeys.SMTP_FROM_NAME,
          )}" <${_configService.get<string>(ConfigKeys.SMTP_FROM_EMAIL)}>`,
        },
        template: {
          dir: __dirname + '/templates/email',
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
    }),

    // TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (_configService: ConfigService) => ({
        //conectar a la bd
        type: 'mysql',
        host: _configService.get<string>(ConfigKeys.MYSQL_HOST),
        port: parseInt(_configService.get<string>(ConfigKeys.MYSQL_PORT)),
        username: _configService.get<string>(ConfigKeys.MYSQL_USER),
        password: _configService.get<string>(ConfigKeys.MYSQL_PASSWORD),
        database: _configService.get<string>(ConfigKeys.MYSQL_DB),
        entities: [
          //entidades en esa base de datos
          UserEntity,
          ProfileEntity,
          RuleEntity,
          DefinitionsEntity,
          HouseEntity,
          ProductEntity,
          BrandEntity,
          RegionEntity,
          ProcesseEntity,
          FlavorEntity,
          MasterEntity,
          AgaveEntity,
          MezcalTypeEntity,
          ShopEntity,
          ImageEntity,
          ProductRatingEntity,
          ProductCommentsEntity,
          ProductLikesEntity,
          BrandLikesEntity,
          HouseLikesEntity,
          BrandRatingEntity,
          HouseRatingEntity,
          BrandCommentsEntity,
          HouseCommentsEntity,
          ProductFavoritesEntity,
          ProductTastingsEntity,
          CookingEntity,
          MillingEntity,
          DistillingEntity,
          FermentingEntity,
          EmailEntity,
        ],
        synchronize: false, //generación  y sincronización de las tablas segun el entity
      }),
    }),
    //Módulos a inicializar al arranque
    AuthModule,
    RulesModule,
    UsersModule,
    ProfilesModule,
    DefinitionsModule,
    AvatarModule,
    RegionsModule,
    ProcessesModule,
    FlavorsModule,
    MastersModule,
    AgavesModule,
    mezcalTypesModule,
    ShopsModule,
    SuscriptionModule,
    ImagesModule,
    BrowserModule,
    HousesModule,
    OwnerModule,
    CloudvisionModule,
    CookingModule,
    DistillingModule,
    MillingModule,
    FermentingModule,
    EmailModule,
    AdminShopsModule,
    ProductsModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [
    //sentry.interceptor
    {
      provide: APP_INTERCEPTOR,
      useValue: new SentryInterceptor({
        filters: [
          // filtrar exceptions de tipo HttpException. ignorar aquellas
          // con status code menor a 500
          {
            type: HttpException,
            filter: (exception: HttpException): boolean =>
              500 > exception.getStatus(),
          },
        ],
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimiterInterceptor,
    },

    MyLogger,
    AppService,
    ConfigService,
  ],
})
export class AppModule implements OnModuleInit {
  configure(consumer: MiddlewareConsumer): void {
    ResponseTimeMiddleware.configure({});
    consumer.apply(ResponseTimeMiddleware).forRoutes('*');
  }
  constructor(
    private readonly _logger: MyLogger,
    private readonly _app: AppService,
  ) {}
  async onModuleInit(): Promise<boolean> {
    //llamar al servicio de inicialización de la base de datos
    await this._app.initDatabase();
    //la aplicación ha iniciado
    this._logger.log('App initialized.');
    return true;
  }
}
