import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../../common/images/images.module';
import { ProductsService } from '../owner/products/products.service';
import { HousesService } from '../owner/houses/houses.service';
import { BrandsService } from '../owner/brands/brands.service';
import { UserEntity } from '../admin/users/model/user.entity';
import { BrowserBrandsController } from './brands/browserBrands.controller';
import { BrowserProductsController } from './products/browserProducts.controller';
import { BrowserHousesController } from './houses/browserHouses.controller';
import { CatalogsController } from './catalogs/catalogs.controller';
import { FlavorsService } from '../admin/catalogs/flavors/flavors.service';
import { AgavesService } from '../admin/catalogs/agaves/agaves.service';
import { RegionsService } from '../admin/catalogs/regions/regions.service';
import { MezcalTypesService } from '../admin/catalogs/mezcalTypes/mezcalTypes.service';
import { ProcessesService } from '../admin/catalogs/processes/processes.service';
import { MastersService } from '../owner/masters/masters.service';
import { ShopsService } from '../owner/shops/shops.service';
import { BrowseUserController } from './user/browseUser.controller';
import { UsersModule } from '../admin/users/users.module';
import { BrowseAvatarController } from './images/images.controller';
import { MastersController } from './masters/masters.controller';
import { CookingModule } from '../admin/catalogs/cooking/cooking.module';
import { DistillingModule } from '../admin/catalogs/distilling/distilling.module';
import { MillingModule } from '../admin/catalogs/milling/milling.module';
import { FermentingModule } from '../admin/catalogs/fermenting/fermenting.module';
import { CloudvisionModule } from '../cloudvision/cloudvision.module';
import { CloudvisionService } from '../cloudvision/cloudvision.service';
/**
 * La intencion de este modulo es que se pueda navegar todos los endpoints de las casas,
 * marcas y productos; todo desde una perspectiva de sesion de usuario publico unicamente.
 *
 * Para acceder a mezcalier se debera poder navegar sin sesion? o se tiene que acceder por
 * medio de facebook, google, twitter ? para asi, autenticar estos endpoints con esa sesion
 *
 * si es ambos casos se debera hacer un guard que permita navegar sin sesion, pero al momento
 * de darle un me gusta, califirar, comentar, que pida en el front que inicie sesion para poder
 * efectuar ese tipo de operaciones (sin ocultar los botones de la funcionalidad);
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ImagesModule,
    UsersModule,
    CookingModule,
    DistillingModule,
    MillingModule,
    FermentingModule,
    CloudvisionModule,
  ],
  controllers: [
    BrowserProductsController,
    BrowserBrandsController,
    BrowserHousesController,
    CatalogsController,
    BrowseAvatarController,
    BrowseUserController,
    MastersController,
  ],
  providers: [
    ProductsService,
    BrandsService,
    HousesService,
    FlavorsService,
    AgavesService,
    RegionsService,
    MezcalTypesService,
    ProcessesService,
    MastersService,
    ShopsService,
    CloudvisionService,
  ],
})
export class BrowserModule {}
