import { Module } from '@nestjs/common';
import { OwnerBrandsController } from './brands/ownerBrands.controller';
import { OwnerHousesController } from './houses/ownerHouses.controller';
import { OwnerProductsController } from './products/ownerProducts.controller';
import { HousesService } from './houses/houses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandEntity } from '../brand.entity';
import { ProductEntity } from '../product.entity';
import { HouseEntity } from '../house.entity';
import { BrandsService } from './brands/brands.service';
import { ProductsService } from './products/products.service';
import { ImagesService } from '../../common/images/images.service';
import { OwnerUsersController } from './users/users.controller';
import { UsersModule } from '../admin/users/users.module';
import { CloudvisionModule } from '../cloudvision/cloudvision.module';
import { CloudvisionService } from '../cloudvision/cloudvision.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BrandEntity, ProductEntity, HouseEntity]),
    UsersModule,
    CloudvisionModule,
  ],
  providers: [
    BrandsService,
    ProductsService,
    HousesService,
    ImagesService,
    CloudvisionService,
  ],
  controllers: [
    OwnerBrandsController,
    OwnerProductsController,
    OwnerHousesController,
    OwnerUsersController,
  ],
})
export class OwnerModule {}

/**
 * Superadmin
 *  Users
 *    CRUD (administradores de sistema)
 * Admin del sistema
 *  Houses
 *    Owners(Users)
 *      Reset password
 *      Desactivar la cuenta
 *    Autorizacion
 *      Establecer limites de marcas y productos
 *      Activar la cuenta default del admin
 *    Desactivacion (casa y cuentas)
 *
 * Owner - modulo
 *  Shops
 *    CRUD
 *  Masters
 *    CRUD
 *  Users
 *    No puedo borrar al usuario admin por default
 *    Puedo crear mas usuarios para mi casa, con permisos diferentes
 *  House - controller
 *    Editar algunos datos de su casa
 *    Cambiar la imagen de la casa
 *    Responder comentarios
 *    Brands - controller
 *     CRUD (obedecer limites)
 *     Responder comentarios
 *     Products(tiene un shop, tiene un master) - controller
 *       CRUD (obedecer limites)
 *       Responder comentarios
 *
 * Browser
 *  Houses - controller
 *    Suscripcion (Crea la casa y el usuario admin)
 *    Rating
 *    Like
 *    Comentar
 *  Brands
 *    Rating
 *    Like
 *    Comentar
 *  Products - controller
 *    Rating
 *    Like
 *    Comentar
 */

/* pantalla principal del owner
 Detalles de la casa
 Imagenes de la casa
 Guardar
 -----------
 Listado de Marcas (agregar marca)
*/

/* pantalla de marcas en el owner
 Marca X
 Descripcion
 Imagenes
 Guardar
 ----------
 Listado de productos (agregar producto)
*/

/* pantalla de producto
  Detalles del producto
  Guardar
  -------
  listado de imagenes
 */
