import { seeder } from 'nestjs-seeder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { AgaveEntity } from '@mezcal/modules/admin/catalogs/agaves/model/agave.entity';
import { ConfigKeys } from '@mezcal/common/enum/configkeys.enum';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { BrandEntity } from '@mezcal/modules/brand.entity';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { ProfileEntity } from '@mezcal/modules/admin/profiles/model/profile.entity';
import { RuleEntity } from '@mezcal/modules/admin/rules/model/rule.entity';
import { DefinitionsEntity } from '@mezcal/modules/admin/definitions/definitions.entity';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { RegionEntity } from '@mezcal/modules/admin/catalogs/regions/model/region.entity';
import { ProcesseEntity } from '@mezcal/modules/admin/catalogs/processes/model/processe.entity';
import { FlavorEntity } from '@mezcal/modules/admin/catalogs/flavors/model/flavor.entity';
import { MezcalTypeEntity } from '@mezcal/modules/admin/catalogs/mezcalTypes/model/mezcalType.entity';
import { ShopEntity } from '@mezcal/modules/owner/shops/model/shop.entity';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { ProductRatingEntity } from './modules/browser/models/productRatings.entity';
import { ProductCommentsEntity } from './modules/browser/models/productComments.entity';
import { ProductLikesEntity } from './modules/browser/models/productLikes.entity';
import { MasterEntity } from './modules/owner/masters/model/master.entity';
import { StarterSeeder } from './modules/starter.seeder';
import { BrandCommentsEntity } from './modules/browser/brands/brandComments.entity';
import { BrandLikesEntity } from './modules/browser/brands/brandLikes.entity';
import { BrandRatingEntity } from './modules/browser/brands/brandRatings.entity';
import { HouseCommentsEntity } from './modules/browser/houses/models/houseComments.entity';
import { HouseLikesEntity } from './modules/browser/houses/models/houseLikes.entity';
import { HouseRatingEntity } from './modules/browser/houses/models/houseRatings.entity';
import { ProductFavoritesEntity } from './modules/browser/models/productFavorites.entity';
import { ProductTastingsEntity } from './modules/browser/models/productTastings.entity';
import { FermentingEntity } from './modules/admin/catalogs/fermenting/fermenting.entity';
import { CookingEntity } from './modules/admin/catalogs/cooking/cooking.entity';
import { DistillingEntity } from './modules/admin/catalogs/distilling/distilling.entity';
import { MillingEntity } from './modules/admin/catalogs/milling/milling.entity';

seeder({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        MYSQL_DB: Joi.string().required(),
        MYSQL_HOST: Joi.string().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PORT: Joi.number().default(3306),
        MYSQL_PASSWORD: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (_configService: ConfigService) => ({
        type: 'mysql',
        host: _configService.get<string>(ConfigKeys.MYSQL_HOST),
        port: parseInt(_configService.get<string>(ConfigKeys.MYSQL_PORT)),
        username: _configService.get<string>(ConfigKeys.MYSQL_USER),
        password: _configService.get<string>(ConfigKeys.MYSQL_PASSWORD),
        database: _configService.get<string>(ConfigKeys.MYSQL_DB),
        entities: [
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
          FermentingEntity,
          DistillingEntity,
        ],
        synchronize: false,
      }),
    }),
  ],
}).run([StarterSeeder]);
