import { AppModule } from '@mezcal/app.module';
import { LoginIdentityDTO } from '@mezcal/auth/dto/loginIdentity.dto';
import { RegTypes } from '@mezcal/common/enum/regTypes.enum';
import { HttpExceptionFilter } from '@mezcal/common/filters/http-exceptions.filter';
import { TypeORMExceptionFilter } from '@mezcal/common/filters/typeorm-exceptions.filter';
import { ProfileTypes } from '@mezcal/modules/admin/profiles/model/profiles.enum';
import { createUserDTO } from '@mezcal/modules/admin/users/model/createUser.dto';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import * as request from 'supertest';
import { UpdateResult } from 'typeorm';
import * as sharp from 'sharp';
import { ProcessesToCreate } from '@mezcal/modules/admin/catalogs/processes/processes.collection';
import { FlavorsToCreate } from '@mezcal/modules/admin/catalogs/flavors/flavors.collection';
import { AgavesToCreate } from '@mezcal/modules/admin/catalogs/agaves/agaves.collection';
//import { ProcesseEntity } from '@mezcal/modules/admin/catalogs/processes/model/processe.entity';
//import { FlavorEntity } from '@mezcal/modules/admin/catalogs/flavors/model/flavor.entity';
//import { AgaveEntity } from '@mezcal/modules/admin/catalogs/agaves/model/agave.entity';
//import { MezcalTypeEntity } from '@mezcal/modules/admin/catalogs/mezcalTypes/model/mezcalType.entity';
import { CookingsToCreate } from '@mezcal/modules/admin/catalogs/cooking/cooking.collection';
//import { CookingEntity } from '@mezcal/modules/admin/catalogs/cooking/cooking.entity';
import { DistillingsToCreate } from '@mezcal/modules/admin/catalogs/distilling/distilling.collection';
//import { DistillingEntity } from '@mezcal/modules/admin/catalogs/distilling/distilling.entity';
import { FermentingsToCreate } from '@mezcal/modules/admin/catalogs/fermenting/fermenting.collection';
//import { FermentingEntity } from '@mezcal/modules/admin/catalogs/fermenting/fermenting.entity';
import { MezcalTypesToCreate } from '@mezcal/modules/admin/catalogs/mezcalTypes/mezcalTypes.collection';
import { MillingsToCreate } from '@mezcal/modules/admin/catalogs/milling/milling.collection';
//import { MillingEntity } from '@mezcal/modules/admin/catalogs/milling/milling.entity';
import { LimitesHouseDTO } from '@mezcal/modules/admin/houses/limitesHouse.dto';
import { HouseDTO } from '@mezcal/modules/browser/houses/dtos/house.dto';
import { SubscriptionDTO } from '@mezcal/modules/browser/suscription/dto/suscription.dto';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { ShopDTO } from '@mezcal/modules/owner/shops/model/shop.dto';
import { ShopEntity } from '@mezcal/modules/owner/shops/model/shop.entity';
import { createProductDTO } from '@mezcal/modules/owner/products/dtos/createProduct.dto';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { BrandEntity } from '@mezcal/modules/brand.entity';
import { BrandDTO } from '@mezcal/modules/owner/brands/brand.dto';
import { createBrandDTO } from '@mezcal/modules/owner/brands/createBrand.dto';
import { MasterDTO } from '@mezcal/modules/owner/masters/model/master.dto';
import { MasterEntity } from '@mezcal/modules/owner/masters/model/master.entity';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { PaginationPrimeNgProducts } from '@mezcal/common/dto/pagination/paginationPrimeProducts.dto';
import { SortTypes } from '@mezcal/common/enum/sortTypes.enum';
import { PaginationPrimeNgBrands } from '@mezcal/common/dto/pagination/paginationPrimeBrands.dto';
import { PaginationPrimeNgHouses } from '@mezcal/common/dto/pagination/paginationPrimeHouses.dto';
import { BrandsSortTypes } from '@mezcal/common/enum/brandsSortTypes.enum';
import { BrandCommentsEntity } from '@mezcal/modules/browser/brands/brandComments.entity';
import { HouseCommentDTO } from '@mezcal/modules/browser/houses/dtos/houseComment.dto';
import { HouseCommentsEntity } from '@mezcal/modules/browser/houses/models/houseComments.entity';
import { ProductCommentsEntity } from '@mezcal/modules/browser/models/productComments.entity';
import { ProductFavoritesEntity } from '@mezcal/modules/browser/models/productFavorites.entity';
import { ProductTastingsEntity } from '@mezcal/modules/browser/models/productTastings.entity';
import { CompareProductsDTO } from '@mezcal/modules/browser/products/dtos/compareProducts.dto';
import { ProductCommentDTO } from '@mezcal/modules/browser/products/dtos/productComment.dto';
import { ProductTastingDTO } from '@mezcal/modules/browser/products/dtos/productTasting.dto';
import { RateDTO } from '@mezcal/modules/browser/products/dtos/rate.dto';
import { MezcalTypeEntity } from '@mezcal/modules/admin/catalogs/mezcalTypes/model/mezcalType.entity';
import { RegionEntity } from '@mezcal/modules/admin/catalogs/regions/model/region.entity';
import { RegionsToCreate } from '@mezcal/modules/admin/catalogs/regions/regions.collection';
import { ConfigService } from '@nestjs/config';
import { ProcesseEntity } from '@mezcal/modules/admin/catalogs/processes/model/processe.entity';
import { AgaveEntity } from '@mezcal/modules/admin/catalogs/agaves/model/agave.entity';

let super_access_token = '';
let admin_access_token = '';
let admin2_access_token = '';
let owner_access_token = '';
let owner2_access_token = '';

//admin que sera creado por el superadmin
const newAdminUser: createUserDTO = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@dominio.com',
  password: 'password',
};
let createdAdminUser: UserEntity;
let adminRules: string[];

const newAdminUser2: createUserDTO = {
  firstName: 'Admin2',
  lastName: 'User2',
  email: 'admin2@dominio.com',
  password: 'password',
};
let createdAdminUser2: UserEntity;

//usuario publico que se "suscribe" solito
const newPublicUser: createUserDTO = {
  firstName: 'Public',
  lastName: 'User',
  email: 'public@dominio.com',
  password: 'password',
};
let createdPublicUser: UserEntity;
let public_access_token = '';

//let catFermentings: FermentingEntity[] = [];
//let catDistillings: DistillingEntity[] = [];
//let catMillings: MillingEntity[] = [];
let catProcesses: ProcesseEntity[] = [];
//let catFlavors: FlavorEntity[] = [];
//let catAgaves: AgaveEntity[] = [];
//let catCookings: CookingEntity[] = [];
let catMezcalTypes: MezcalTypeEntity[] = [];
let catRegions: RegionEntity[] = [];
let catAgaves: AgaveEntity[] = [];

const newHouse1: HouseDTO = {
  email: 'email@dominio.com',
  descripcion: 'Casa mezcalera Oro de Oaxaca',
  nombre: 'Oro de Oaxaca',
  calle: 'calle',
  estado: 'Oaxaca',
  html: '<div></div>',
};
let createdHouse1: HouseEntity;

const limitesHouse1: LimitesHouseDTO = {
  products: 5,
  brands: 5,
};

//usuario que se da de alta en conjunto con la casa que se suscribe
const newHouse1User1: createUserDTO = {
  firstName: 'Owner',
  lastName: 'User',
  email: 'owner@dominio.com',
  password: 'password',
};

let createdOwner1User1: UserEntity;
let createdOwner1User2: UserEntity;

//usuario 2 de la casa 1
const newHouse1User2: createUserDTO = {
  firstName: 'Owner',
  lastName: 'Secundario de la casa 1',
  email: 'owner2@dominio.com',
  password: 'password',
};

let owner1Rules = [];

const suscriptionForm1: SubscriptionDTO = {
  user: newHouse1User1,
  house: newHouse1,
};

const newHouse2: HouseDTO = {
  email: 'emailcasa2@dominio.com',
  descripcion: 'Casa mezcalera Ruina sie7e',
  nombre: 'Ruina Sie7e',
  calle: 'calle',
  estado: 'Oaxaca',
  html: '<div></div>',
};
let createdHouse2: HouseEntity;
//usuario que se da de alta en conjunto con la casa que se suscribe
const newHouse2User1: createUserDTO = {
  firstName: 'Owner Casa 2',
  lastName: 'User Casa 2',
  email: 'ownercasa2@dominio.com',
  password: 'password',
};
let createdOwnerUserHouse2: UserEntity;
const suscriptionFormHouse2: SubscriptionDTO = {
  user: newHouse2User1,
  house: newHouse2,
};
const limitesHouse2: LimitesHouseDTO = {
  products: 5,
  brands: 5,
};

const newHouse1Shop1: ShopDTO = {
  nombre: 'Mezcalería Ideal',
  descripcion: 'Venta de mezcal',
};
let createdShop1: ShopEntity;

const newHouse2Shop1: ShopDTO = {
  nombre: 'Mezcalería Suelta la sopa',
  descripcion: 'Venta de mezcal',
};
let createdShop2: ShopEntity;

const newProduct: createProductDTO = {
  nombre: 'Crema de coco 750ml',
  descripcion: 'descripcion nuevo producto',
  brand: 0,
  region: 0,
  mezcalType: 0,
  price: 100,
  html: '<div></div>',
};
let createdProduct: ProductEntity;

const newProduct2: createProductDTO = {
  nombre: 'Oro de Oaxaca Añejo de 500ml',
  descripcion: 'descripcion nuevo producto 2',
  brand: 0,
  region: 0,
  mezcalType: 0,
  price: 200,
  html: '<div></div>',
};
let createdProduct2: ProductEntity;

let createdHouseImage: ImageEntity;
let createdBrandImage: ImageEntity;
let createdTastingImage: ImageEntity;
let createdProductImage: ImageEntity;
let createdRegionImage: ImageEntity;
let createdAgaveImage: ImageEntity;
let createdprocesseImage: ImageEntity;
let createdLogoImage: ImageEntity;

const newBrand: createBrandDTO = {
  nombre: 'Fruticrem',
  descripcion: 'Descripcion de nueva marca',
  html: '<div></div>',
};
const newBrand2: createBrandDTO = {
  nombre: 'asoc santaella',
  descripcion: 'Descripcion de nueva marca',
  html: '<div></div>',
};
let createdBrand: BrandEntity;
let createdBrand2: BrandEntity;

const brandToUpdate: BrandDTO = {
  descripcion: 'Nueva descripcion de la marca Oro de Oaxaca',
  nombre: 'Marca Oro de Oaxaca',
  active: true,
};

const newMaster: MasterDTO = {
  nombre: 'Maestro mezcalero',
  descripcion: 'descripcion del maestro',
  html: '<div></div>',
};
let createdMaster: MasterEntity;

const newMaster2: MasterDTO = {
  nombre: 'Maestro mezcalero num2',
  descripcion: 'descripcion del maestro',
  html: '<div></div>',
};
let createdMaster2: MasterEntity;

const newMasterHouse2: MasterDTO = {
  nombre: 'Maestro mezcalero num2',
  descripcion: 'descripcion del maestro',
  html: '<div></div>',
};
let createdMasterHouse2: MasterEntity;

const rateForm: RateDTO = { rating: 4.5 };
const commentForm: ProductCommentDTO = {
  comment: 'Este es un comentario sobre un producto',
};

const tasteForm: ProductTastingDTO = {
  experience: 'Este mezcal me gusto mucho!',
  // sabores
  // rating
};

const commentHouseForm: HouseCommentDTO = {
  comment: 'Este es un comentario sobre una casa',
};

const commentBrandForm: HouseCommentDTO = {
  comment: 'Este es un comentario sobre una marca',
};

let createdTasting: ProductTastingsEntity;

describe('Pruebas de SuperAdmin', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const configService = app.get(ConfigService);

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    app.useGlobalFilters(
      new TypeORMExceptionFilter(configService),
      new HttpExceptionFilter(configService),
    );
    await app.init();
    return;
  });

  describe('SuperAdmin', () => {
    /*
    ##     ######  ##     ## ########  ######## ########     ###    ########  ##     ## #### ##    ## 
    ##    ##    ## ##     ## ##     ## ##       ##     ##   ## ##   ##     ## ###   ###  ##  ###   ## 
    ##    ##       ##     ## ##     ## ##       ##     ##  ##   ##  ##     ## #### ####  ##  ####  ## 
    ##     ######  ##     ## ########  ######   ########  ##     ## ##     ## ## ### ##  ##  ## ## ## 
    ##          ## ##     ## ##        ##       ##   ##   ######### ##     ## ##     ##  ##  ##  #### 
    ##    ##    ## ##     ## ##        ##       ##    ##  ##     ## ##     ## ##     ##  ##  ##   ### 
    ##     ######   #######  ##        ######## ##     ## ##     ## ########  ##     ## #### ##    ## 
    */
    describe('Login', () => {
      it(`1:- POST /auth/login - Super admin login`, (done) => {
        request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'super@dominio.com', password: 'password' })
          .expect(201)
          .end(function (err, res: request.Response) {
            if (err) {
              throw err;
            }
            expect(res.body.access_token).toBeDefined();
            super_access_token = `Bearer ${res.body.access_token}`;
            //superAdminIdentity = res.body.identity;
            return done();
          });
      });
    });

    describe('Create Admin', () => {
      it(`Crear usuario Admin (desde super)`, (done) => {
        request(app.getHttpServer())
          .post('/admin/users')
          .send(newAdminUser)
          .set('Authorization', super_access_token)
          .expect(201)
          .end(function (err, res: request.Response) {
            if (err) {
              throw err;
            }
            createdAdminUser = res.body;
            expect(createdAdminUser.email).toBe(createdAdminUser.email);
            expect(createdAdminUser.isMain).toBe(true);
            expect(createdAdminUser.active).toBe(false);
            return done();
          });
      });

      it(`Crear usuario admin duplicado`, (done) => {
        request(app.getHttpServer())
          .post('/admin/users')
          .send(newAdminUser)
          .set('Authorization', super_access_token)
          .expect(500)
          .end(function (err, res: request.Response) {
            if (err) {
              throw err;
            }
            expect(res.body.message).toBeDefined();
            expect(res.body.message).toContain('ER_DUP_ENTRY');
            return done();
          });
      });
    });

    describe('View Admin', () => {
      it(`Listar usuarios desde super, debe regresar un array de admins`, (done) => {
        request(app.getHttpServer())
          .get('/admin/users')
          .set('Authorization', super_access_token)
          .expect(200)
          .end(function (err, res: request.Response) {
            if (err) {
              throw err;
            }
            const usuarios: UserEntity[] = res.body;
            const sonAdmins = usuarios.filter((u) => {
              return u.profile.name === ProfileTypes.ADMIN;
            });
            expect(usuarios.length).toBe(sonAdmins.length);
            return done();
          });
      });

      it(`Obtener el usuario admin desde super`, (done) => {
        request(app.getHttpServer())
          .get(`/admin/users/${createdAdminUser.id}`)
          .set('Authorization', super_access_token)
          .expect(200)
          .end(function (err, res: request.Response) {
            if (err) {
              throw err;
            }
            const usuario: UserEntity = res.body;
            expect(usuario.profile.name).toBe(ProfileTypes.ADMIN);
            return done();
          });
      });
    });
  });

  describe('Admin login', () => {
    /*
    ##       ###    ########  ##     ## #### ##    ## 
    ##      ## ##   ##     ## ###   ###  ##  ###   ## 
    ##     ##   ##  ##     ## #### ####  ##  ####  ## 
    ##    ##     ## ##     ## ## ### ##  ##  ## ## ## 
    ##    ######### ##     ## ##     ##  ##  ##  #### 
    ##    ##     ## ##     ## ##     ##  ##  ##   ### 
    ##    ##     ## ########  ##     ## #### ##    ## 
    */
    it(`Admin login no debe suceder, el admin esta inactivo`, (done) => {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: newAdminUser.email, password: newAdminUser.password })
        .expect(401)
        .end(function (err, res: request.Response) {
          if (err) {
            console.log(res.body);
            throw err;
          }
          return done();
        });
    });

    it(`Activar usuario admin (con super)`, (done) => {
      request(app.getHttpServer())
        .put(`/admin/users/${createdAdminUser.id}/status`)
        .set('Authorization', super_access_token)
        .send({ active: true })
        .expect(200)
        .end(function (err, res: request.Response) {
          if (err) {
            console.log(res.body);
            throw err;
          }
          const result: UpdateResult = res.body;
          expect(result.affected).toBe(1);
          return done();
        });
    });

    it(`Admin login con usuario activado`, (done) => {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: newAdminUser.email, password: newAdminUser.password })
        .expect(201)
        .end(function (err, res: request.Response) {
          if (err) {
            console.log(res.body);
            throw err;
          }
          expect(res.body.access_token).toBeDefined();
          admin_access_token = `Bearer ${res.body.access_token}`;
          const identity: LoginIdentityDTO = res.body.identity;
          adminRules = res.body.identity.rules;
          expect(identity.isMain).toBe(true);
          return done();
        });
    });

    it('Admin puede cambiar su avatar', function (done) {
      const avatarFile = 'test/images/avatar.jpg';
      request(app.getHttpServer())
        .put(`/avatar`)
        .set('Authorization', admin_access_token)
        .attach('avatar', avatarFile)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const createdAvatarImage: {
            fieldname: string;
            originalname: string;
            encoding: string;
            mimetype: string;
            destination: string;
            filename: string;
            path: string;
            size: number;
          } = res.body;
          expect(createdAvatarImage.originalname).toBe('avatar.jpg');
          expect(createdAvatarImage.path).toBeDefined();
          expect(createdAvatarImage.filename).toBeDefined();
          expect(createdAvatarImage.mimetype).toBe('image/jpeg');
          return done();
        });
    });

    it('Verificar el avatar del Admin', (done) => {
      request(app.getHttpServer())
        .get(`/browse/avatar/${createdAdminUser.uuid}`)
        .expect(200)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw err;
          }
          const image = await sharp(res.body).metadata();
          expect(image.format).toBe('jpeg');
          return done();
        });
    });

    it(`Crear usuario admin (desde admin) y sea secundario`, (done) => {
      request(app.getHttpServer())
        .post('/admin/users')
        .send(newAdminUser2)
        .set('Authorization', admin_access_token)
        .expect(201)
        .end(function (err, res: request.Response) {
          if (err) {
            console.log(res.body);
            throw err;
          }
          createdAdminUser2 = res.body;
          expect(createdAdminUser2.email).toBe(createdAdminUser2.email);
          expect(createdAdminUser2.isMain).toBe(false); //no debe ser main
          expect(createdAdminUser2.active).toBe(false);
          return done();
        });
    });

    it(`Hacer login con el admin secundario, no puede, está desactivado`, (done) => {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: newAdminUser2.email,
          password: newAdminUser2.password,
        })
        .expect(401)
        .end(function (err, res: request.Response) {
          if (err) {
            console.log(res.body);
            throw err;
          }
          return done();
        });
    });

    it(`Activar admin secundario (con admin principal)`, (done) => {
      request(app.getHttpServer())
        .put(`/admin/users/${createdAdminUser2.id}/status`)
        .set('Authorization', admin_access_token)
        .send({ active: true })
        .expect(200)
        .end(function (err, res: request.Response) {
          if (err) {
            console.log(res.body);
            throw err;
          }
          const result: UpdateResult = res.body;
          expect(result.affected).toBe(1);
          return done();
        });
    });

    it('Modificar los permisos del admin secundario', function (done) {
      request(app.getHttpServer())
        .put(`/admin/users/${createdAdminUser2.id}/rules`)
        .set('Authorization', admin_access_token)
        .send({
          rules: ['view:user', 'noexi:storule', 'update:user'],
        })
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          const result: UpdateResult = res.body;
          expect(result.affected).toBe(1);
          return done();
        });
    });

    it(`Hacer login con el admin secundario, solo debe tener 2 permisos`, (done) => {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: newAdminUser2.email,
          password: newAdminUser2.password,
        })
        .expect(201)
        .end(function (err, res: request.Response) {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          expect(res.body.access_token).toBeDefined();
          expect(res.body.identity.rules.length).toBe(2);
          return done();
        });
    });

    it('Resetear los permisos del usuario secundario', function (done) {
      request(app.getHttpServer())
        .put(`/admin/users/${createdAdminUser2.id}/reset-rules`)
        .set('Authorization', admin_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          const result: UpdateResult = res.body;
          expect(result.affected).toBe(1);
          return done();
        });
    });

    it(`Login de admin secundario, debe tener todos los permisos`, (done) => {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: newAdminUser2.email,
          password: newAdminUser2.password,
        })
        .expect(201)
        .end(function (err, res: request.Response) {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          expect(res.body.access_token).toBeDefined();
          expect(res.body.identity.rules.length).toBe(adminRules.length);
          admin2_access_token = res.body.access_token;
          return done();
        });
    });

    it(`Desactivar admin secundario (con admin principal)`, (done) => {
      request(app.getHttpServer())
        .put(`/admin/users/${createdAdminUser2.id}/status`)
        .set('Authorization', admin_access_token)
        .send({ active: false })
        .expect(200)
        .end(function (err, res: request.Response) {
          if (err) {
            console.log(res.body);
            throw err;
          }
          const result: UpdateResult = res.body;
          expect(result.affected).toBe(1);
          return done();
        });
    });

    it(`Hacer login con el admin secundario, no puede, está desactivado`, (done) => {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: newAdminUser2.email,
          password: newAdminUser2.password,
        })
        .expect(401)
        .end(function (err, res: request.Response) {
          if (err) {
            console.log(res.body);
            throw err;
          }
          return done();
        });
    });

    it(`Aactivar nuevamente admin secundario (con admin principal)`, (done) => {
      request(app.getHttpServer())
        .put(`/admin/users/${createdAdminUser2.id}/status`)
        .set('Authorization', admin_access_token)
        .send({ active: true })
        .expect(200)
        .end(function (err, res: request.Response) {
          if (err) {
            console.log(res.body);
            throw err;
          }
          const result: UpdateResult = res.body;
          expect(result.affected).toBe(1);
          return done();
        });
    });

    it(`Hacer login con el admin secundario`, (done) => {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: newAdminUser2.email,
          password: newAdminUser2.password,
        })
        .expect(201)
        .end(function (err, res: request.Response) {
          if (err) {
            console.log(res.body);
            throw err;
          }
          expect(res.body.access_token).toBeDefined();
          admin2_access_token = `Bearer ${res.body.access_token}`;
          return done();
        });
    });

    it(`Usuario admin secundario no puede crear mas admins`, (done) => {
      const newUserAdmin3: createUserDTO = {
        email: 'admin3@dominio.com',
        password: 'password',
        firstName: 'Admin3',
        lastName: 'Admin4',
      };
      request(app.getHttpServer())
        .post('/admin/users')
        .send(newUserAdmin3)
        .set('Authorization', admin2_access_token)
        .expect(403)
        .end(function (err, res: request.Response) {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it(`Admin secundario no puede activar/desactivar a otros`, (done) => {
      request(app.getHttpServer())
        .put(`/admin/users/${createdAdminUser.id}/status`)
        .set('Authorization', admin2_access_token)
        .send({ active: false })
        .expect(403)
        .end(function (err, res: request.Response) {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it(`Admin principal no puede desactivar al admin principal`, (done) => {
      request(app.getHttpServer())
        .put(`/admin/users/${createdAdminUser.id}/status`)
        .set('Authorization', admin_access_token)
        .send({ active: false })
        .expect(403)
        .end(function (err, res: request.Response) {
          if (err) {
            console.log(res.body);
            throw err;
          }
          return done();
        });
    });

    it('Admin secundario no puede cambiar permisos', function (done) {
      request(app.getHttpServer())
        .put(`/admin/users/${createdAdminUser.id}/rules`)
        .set('Authorization', admin2_access_token)
        .send({
          rules: ['view:user', 'noexi:storule', 'update:user'],
        })
        .expect(403)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it('Admin secundario no puede resetear permisos', function (done) {
      request(app.getHttpServer())
        .put(`/admin/users/${createdAdminUser.id}/reset-rules`)
        .set('Authorization', admin2_access_token)
        .expect(403)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it(`Admin secundario no puede desactivar admin principal`, (done) => {
      request(app.getHttpServer())
        .put(`/admin/users/${createdAdminUser.id}/status`)
        .set('Authorization', admin2_access_token)
        .send({ active: false })
        .expect(403)
        .end(function (err, res: request.Response) {
          if (err) {
            console.log(res.body);
            throw err;
          }
          return done();
        });
    });
  });

  describe('Public Suscription', () => {
    /*
    ##    ########  ##     ## ########      ######  ##     ## ########  
    ##    ##     ## ##     ## ##     ##    ##    ## ##     ## ##     ## 
    ##    ##     ## ##     ## ##     ##    ##       ##     ## ##     ## 
    ##    ########  ##     ## ########      ######  ##     ## ########  
    ##    ##        ##     ## ##     ##          ## ##     ## ##     ## 
    ##    ##        ##     ## ##     ##    ##    ## ##     ## ##     ## 
    ##    ##         #######  ########      ######   #######  ########  
    */
    it(`Suscripción de usuario público`, (done) => {
      request(app.getHttpServer())
        .post('/browse/suscription/user')
        .send(newPublicUser)
        .expect(201)
        .end(function (err, res: request.Response) {
          if (err) {
            throw err;
          }
          createdPublicUser = res.body;
          expect(createdPublicUser.email).toBe(createdPublicUser.email);
          expect(createdPublicUser.regType).toBe(RegTypes.SYSTEM);
          return done();
        });
    });

    it(`Suscripción de usuario público duplicado`, (done) => {
      request(app.getHttpServer())
        .post('/browse/suscription/user')
        .send(newPublicUser)
        .expect(500)
        .end(function (err, res: request.Response) {
          if (err) {
            throw err;
          }
          expect(res.body.message).toBeDefined();
          expect(res.body.message).toContain('ER_DUP_ENTRY');
          return done();
        });
    });
    it(`Login del usuario publico`, (done) => {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: newPublicUser.email, password: newPublicUser.password })
        .expect(201)
        .end(function (err, res: request.Response) {
          if (err) {
            throw err;
          }
          expect(res.body.access_token).toBeDefined();
          public_access_token = `Bearer ${res.body.access_token}`;
          return done();
        });
    });
  });

  describe('Catálogos', () => {
    /*
    ##     ######     ###    ########    ###    ##        #######   ######    #######   ######  
    ##    ##    ##   ## ##      ##      ## ##   ##       ##     ## ##    ##  ##     ## ##    ## 
    ##    ##        ##   ##     ##     ##   ##  ##       ##     ## ##        ##     ## ##       
    ##    ##       ##     ##    ##    ##     ## ##       ##     ## ##   #### ##     ##  ######  
    ##    ##       #########    ##    ######### ##       ##     ## ##    ##  ##     ##       ## 
    ##    ##    ## ##     ##    ##    ##     ## ##       ##     ## ##    ##  ##     ## ##    ## 
    ##     ######  ##     ##    ##    ##     ## ########  #######   ######    #######   ######  
    */
    it('Obtener los procesos (public)', function (done) {
      request(app.getHttpServer())
        .get(`/browse/catalogs/processes`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(ProcessesToCreate.length);
          catProcesses = res.body;
          return done();
        });
    });

    it('Obtener los sabores (public)', function (done) {
      request(app.getHttpServer())
        .get(`/browse/catalogs/flavors`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(FlavorsToCreate.length);
          //catFlavors = res.body;
          return done();
        });
    });

    it('Obtener los hornos (public)', function (done) {
      request(app.getHttpServer())
        .get(`/browse/catalogs/cookings`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(CookingsToCreate.length);
          //catCookings = res.body;
          return done();
        });
    });

    it('Obtener los tipos de mezcal (public)', function (done) {
      request(app.getHttpServer())
        .get(`/browse/catalogs/mezcaltypes`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(MezcalTypesToCreate.length);
          catMezcalTypes = res.body;
          newProduct.mezcalType = catMezcalTypes[0].id;
          newProduct2.mezcalType = catMezcalTypes[0].id;
          return done();
        });
    });
    it('Obtener todas las regiones (public)', function (done) {
      request(app.getHttpServer())
        .get(`/browse/catalogs/regions`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(RegionsToCreate.length);
          catRegions = res.body;
          newProduct.region = catRegions[0].id;
          newProduct2.region = catRegions[0].id;
          return done();
        });
    });

    it('Obtener los agaves (public)', function (done) {
      request(app.getHttpServer())
        .get(`/browse/catalogs/agaves`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(AgavesToCreate.length);
          catAgaves = res.body;
          return done();
        });
    });

    it('Obtener los molinos (public)', function (done) {
      request(app.getHttpServer())
        .get(`/browse/catalogs/millings`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(MillingsToCreate.length);
          //catMillings = res.body;
          return done();
        });
    });

    it('Obtener los destilados (public)', function (done) {
      request(app.getHttpServer())
        .get(`/browse/catalogs/distillings`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(DistillingsToCreate.length);
          //catDistillings = res.body;
          return done();
        });
    });

    it('Obtener los fermentados (public)', function (done) {
      request(app.getHttpServer())
        .get(`/browse/catalogs/fermentings`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(FermentingsToCreate.length);
          //catFermentings = res.body;
          return done();
        });
    });

    it('POST /admin/catalogs/regions/:id/image - Subir imagen a la region', function (done) {
      const regionFile = 'test/images/test-product.jpg';
      request(app.getHttpServer())
        .post(`/admin/catalogs/regions/${catRegions[0].id}/image`)
        .set('Authorization', admin_access_token)
        .attach('image', regionFile)
        .field('title', 'Foto de la region')
        .field('description', 'Descripcion de la foto de la region.')
        .expect(201)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          createdRegionImage = res.body;
          expect(createdRegionImage.region).toBeInstanceOf(Object); //trae la estructura basica del nuevo Producto
          expect(createdRegionImage.region.id).toBe(catRegions[0].id);
          expect(createdRegionImage.path).toBeDefined();
          return done();
        });
    });

    it('POST /admin/catalogs/agaves/:id/image - Subir imagen a un agave', function (done) {
      const agaveFile = 'test/images/test-product.jpg';
      request(app.getHttpServer())
        .post(`/admin/catalogs/agaves/1/image`)
        .set('Authorization', admin_access_token)
        .attach('image', agaveFile)
        .field('title', 'Foto del agave')
        .field('description', 'Descripcion de la foto del agave.')
        .expect(201)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          createdAgaveImage = res.body;
          expect(createdAgaveImage.agave).toBeInstanceOf(Object); //trae la estructura basica del nuevo agave
          expect(createdAgaveImage.path).toBeDefined();
          return done();
        });
    });

    it('Delete /admin/catalogs/agaves/:uuid/image - Borrar imagen a un agave', function (done) {
      request(app.getHttpServer())
        .delete(`/admin/catalogs/agaves/${createdAgaveImage.uuid}/image`)
        .set('Authorization', admin_access_token)
        .expect(200)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const imageDeleted = res.body;
          expect(imageDeleted).toBeInstanceOf(Object);
          return done();
        });
    });

    it('Delete /admin/catalogs/regions/:uuid/image - Borrar imagen a una region', function (done) {
      request(app.getHttpServer())
        .delete(`/admin/catalogs/regions/${createdRegionImage.uuid}/image`)
        .set('Authorization', admin_access_token)
        .expect(200)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const imageDeleted = res.body;
          expect(imageDeleted).toBeInstanceOf(Object);
          return done();
        });
    });

    it('POST /admin/catalogs/processes/:id/image - Subir imagen a un proceso', function (done) {
      const processeFile = 'test/images/test-product.jpg';
      request(app.getHttpServer())
        .post(`/admin/catalogs/processes/${catProcesses[0].id}/image`)
        .set('Authorization', admin_access_token)
        .attach('image', processeFile)
        .field('title', 'Foto de la processe')
        .field('description', 'Descripcion de la foto de la processe.')
        .expect(201)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          createdprocesseImage = res.body;
          console.log(createdprocesseImage);
          console.log(createdprocesseImage.processe);
          //expect(createdprocesseImage.processe).toBeInstanceOf(Object);
          expect(createdprocesseImage.processe.id).toBe(catProcesses[0].id);
          expect(createdprocesseImage.path).toBeDefined();
          return done();
        });
    });
  });

  describe('Houses', () => {
    /*
    ##    ##     ##  #######  ##     ##  ######  ########  ######  
    ##    ##     ## ##     ## ##     ## ##    ## ##       ##    ## 
    ##    ##     ## ##     ## ##     ## ##       ##       ##       
    ##    ######### ##     ## ##     ##  ######  ######    ######  
    ##    ##     ## ##     ## ##     ##       ## ##             ## 
    ##    ##     ## ##     ## ##     ## ##    ## ##       ##    ## 
    ##    ##     ##  #######   #######   ######  ########  ######  
    */
    describe('Suscripción', () => {
      it(`Suscripción de casa 1`, (done) => {
        request(app.getHttpServer())
          .post('/browse/suscription/house')
          .send(suscriptionForm1)
          .expect(201)
          .end(function (err, res: request.Response) {
            if (err) {
              console.log(res.body);
              throw err;
            }
            expect(res.body.house).toBeInstanceOf(Object);
            expect(res.body.user).toBeInstanceOf(Object);
            createdOwner1User1 = res.body.user;
            createdHouse1 = res.body.house;
            expect(createdHouse1.nombre).toBe(newHouse1.nombre);
            expect(createdHouse1.active).toBe(false);
            expect(createdOwner1User1.email).toBe(newHouse1User1.email);
            expect(createdOwner1User1.active).toBe(false);
            return done();
          });
      });

      it(`Suscripción de casa 2`, (done) => {
        request(app.getHttpServer())
          .post('/browse/suscription/house')
          .send(suscriptionFormHouse2)
          .expect(201)
          .end(function (err, res: request.Response) {
            if (err) {
              console.log(res.body);
              throw err;
            }
            expect(res.body.house).toBeInstanceOf(Object);
            expect(res.body.user).toBeInstanceOf(Object);
            createdOwnerUserHouse2 = res.body.user;
            createdHouse2 = res.body.house;
            expect(createdHouse2.nombre).toBe(newHouse2.nombre);
            expect(createdHouse2.active).toBe(false);
            expect(createdOwnerUserHouse2.email).toBe(newHouse2User1.email);
            expect(createdOwnerUserHouse2.active).toBe(false);
            return done();
          });
      });

      it('Obtener con admin la casa uno, debe estar desactivada', function (done) {
        request(app.getHttpServer())
          .get(`/admin/houses/${createdHouse1.id}`)
          .set('Authorization', admin_access_token)
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.log(res.body);
              throw err;
            }
            const obtainedHouse: HouseEntity = res.body;
            expect(obtainedHouse).toBeInstanceOf(Object);
            expect(obtainedHouse.nombre).toBe(newHouse1.nombre);
            expect(obtainedHouse.active).toBe(false);
            return done();
          });
      });

      it('Obtener con admin la casa dos, debe estar desactivada', function (done) {
        request(app.getHttpServer())
          .get(`/admin/houses/${createdHouse2.id}`)
          .set('Authorization', admin_access_token)
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.log(res.body);
              throw err;
            }
            const createdHouse2 = res.body;
            expect(createdHouse2).toBeInstanceOf(Object);
            expect(createdHouse2.nombre).toBe(newHouse2.nombre);
            expect(createdHouse2.active).toBe(false);
            return done();
          });
      });
    });
    describe('Sesiones Fallidas', () => {
      it(`Intentar iniciar sesion con la casa uno, no debe poder, está desactivada`, (done) => {
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: newHouse1User1.email,
            password: newHouse1User1.password,
          })
          .expect(401)
          .end(function (err, res: request.Response) {
            if (err) {
              console.log(res.body);
              throw err;
            }
            return done();
          });
      });

      it(`Intentar iniciar sesion con la casa dos, no debe poder, está desactivada`, (done) => {
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: newHouse2User1.email,
            password: newHouse2User1.password,
          })
          .expect(401)
          .end(function (err, res: request.Response) {
            if (err) {
              console.log(res.body);
              throw err;
            }
            return done();
          });
      });
    });
    describe('Autorizar Casas', () => {
      it('Autorizar casa uno', function (done) {
        request(app.getHttpServer())
          .put(`/admin/houses/${createdHouse1.id}/authorize`)
          .set('Authorization', admin_access_token)
          .send(limitesHouse1)
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.log(res.body);
              throw new Error(err);
            }
            const authorizeResponse: UpdateResult = res.body;
            expect(authorizeResponse.affected).toBe(1);
            return done();
          });
      });

      it('Autorizar casa dos', function (done) {
        request(app.getHttpServer())
          .put(`/admin/houses/${createdHouse2.id}/authorize`)
          .set('Authorization', admin_access_token)
          .send(limitesHouse2)
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.log(res.body);
              throw new Error(err);
            }
            const authorizeResponseHouse2: UpdateResult = res.body;
            expect(authorizeResponseHouse2.affected).toBe(1);
            return done();
          });
      });
    });
    describe('Sesiones autorizadas', () => {
      it(`Inicio de sesion correcto con la casa uno`, (done) => {
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: newHouse1User1.email,
            password: newHouse1User1.password,
          })
          .expect(201)
          .end(function (err, res: request.Response) {
            expect(res.body.access_token).toBeDefined();
            expect(res.body.identity.house.nombre).toBe(createdHouse1.nombre);
            owner1Rules = res.body.identity.rules; //almacenamos las rules originales
            owner_access_token = `Bearer ${res.body.access_token}`;
            return done();
          });
      });

      it(`Inicio de sesion correcto con la casa dos`, (done) => {
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: newHouse2User1.email,
            password: newHouse2User1.password,
          })
          .expect(201)
          .end(function (err, res: request.Response) {
            expect(res.body.access_token).toBeDefined();
            expect(res.body.identity.house.nombre).toBe(createdHouse2.nombre);
            owner2_access_token = `Bearer ${res.body.access_token}`;
            return done();
          });
      });
    });
    describe('Casa uno', () => {
      it('Desde owner, crear otro usuario owner, debe ser secundario', function (done) {
        request(app.getHttpServer())
          .post('/owner/users')
          .set('Authorization', owner_access_token)
          .send(newHouse1User2)
          .expect(201)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            createdOwner1User2 = res.body;
            expect(createdOwner1User2.isMain).toBe(false);
            return done();
          });
      });

      it(`Login de owner secundario, debe tener todos los permisos`, (done) => {
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: newHouse1User2.email,
            password: newHouse1User2.password,
          })
          .expect(201)
          .end(function (err, res: request.Response) {
            expect(res.body.access_token).toBeDefined();
            expect(res.body.identity.house.nombre).toBe(createdHouse1.nombre);
            expect(res.body.identity.rules.length).toBe(owner1Rules.length);
            return done();
          });
      });

      it('Modificar los permisos del usuario secundario', function (done) {
        request(app.getHttpServer())
          .put(`/owner/users/${createdOwner1User2.id}/rules`)
          .set('Authorization', owner_access_token)
          //le mandamos 3 reglas, 2 que si le pertenecen y una que no existe
          .send({
            rules: ['create:products', 'noexi:storule', 'update:products'],
          })
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            const result: UpdateResult = res.body;
            expect(result.affected).toBe(1);
            return done();
          });
      });

      it(`Hacer login con el secundario, solo debe tener 2 permisos`, (done) => {
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: newHouse1User2.email,
            password: newHouse1User2.password,
          })
          .expect(201)
          .end(function (err, res: request.Response) {
            expect(res.body.access_token).toBeDefined();
            expect(res.body.identity.house.nombre).toBe(createdHouse1.nombre);
            expect(res.body.identity.rules.length).toBe(2);
            return done();
          });
      });

      it('Resetear los permisos del usuario secundario', function (done) {
        request(app.getHttpServer())
          .put(`/owner/users/${createdOwner1User2.id}/reset-rules`)
          .set('Authorization', owner_access_token)
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            const result: UpdateResult = res.body;
            expect(result.affected).toBe(1);
            return done();
          });
      });

      it(`Login de owner secundario, debe tener todos los permisos`, (done) => {
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: newHouse1User2.email,
            password: newHouse1User2.password,
          })
          .expect(201)
          .end(function (err, res: request.Response) {
            expect(res.body.access_token).toBeDefined();
            expect(res.body.identity.house.nombre).toBe(createdHouse1.nombre);
            expect(res.body.identity.rules.length).toBe(owner1Rules.length);
            owner2_access_token = `Bearer ${res.body.access_token}`;
            return done();
          });
      });

      it('El usuario secundario no puede cambiar permisos', function (done) {
        request(app.getHttpServer())
          .put(`/owner/users/${createdOwner1User1.id}/rules`)
          .set('Authorization', owner2_access_token)
          //le mandamos 3 reglas, 2 que si le pertenecen y una que no existe
          .send({
            rules: ['create:products', 'noexi:storule', 'update:products'],
          })
          .expect(403)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            return done();
          });
      });

      it('El usuario secundario no puede resetear permisos', function (done) {
        request(app.getHttpServer())
          .put(`/owner/users/${createdOwner1User1.id}/reset-rules`)
          .set('Authorization', owner2_access_token)
          .expect(403)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            return done();
          });
      });

      it(`El owner secundario no puede desactivar a nadie`, (done) => {
        request(app.getHttpServer())
          .put(`/admin/users/${createdOwner1User1.id}/status`)
          .set('Authorization', owner2_access_token)
          .send({ active: false })
          .expect(403)
          .end(function (err, res: request.Response) {
            if (err) {
              console.log(res.body);
              throw err;
            }
            return done();
          });
      });

      it(`Obtener los usuarios de la casa 1`, (done) => {
        request(app.getHttpServer())
          .get(`/admin/houses/${createdHouse1.id}/users`)
          .set('Authorization', admin_access_token)
          .expect(200)
          .end(function (err, res: request.Response) {
            if (err) {
              console.log(res.body);
              throw err;
            }
            const users: UserEntity[] = res.body;
            expect(users.length).toBe(2);
            return done();
          });
      });

      it(`Obtener los usuarios de la casa uno desde owner`, (done) => {
        request(app.getHttpServer())
          .get(`/owner/users`)
          .set('Authorization', owner_access_token)
          .expect(200)
          .end(function (err, res: request.Response) {
            if (err) {
              console.log(res.body);
              throw err;
            }
            const users: UserEntity[] = res.body;
            expect(users.length).toBe(2);
            return done();
          });
      });

      it(`Owner secundario no debe poder ver los usuarios`, (done) => {
        request(app.getHttpServer())
          .get(`/owner/users`)
          .set('Authorization', owner2_access_token)
          .expect(403)
          .end(function (err, res: request.Response) {
            if (err) {
              console.log(res.body);
              throw err;
            }
            return done();
          });
      });

      it(`Obtener información de un usuario owner por id`, (done) => {
        request(app.getHttpServer())
          .get(`/owner/users/${createdOwner1User1.id}`)
          .set('Authorization', owner_access_token)
          .expect(200)
          .end(function (err, res: request.Response) {
            if (err) {
              console.log(res.body);
              throw err;
            }
            const user: UserEntity = res.body;
            expect(user).toBeInstanceOf(Object);
            expect(user.id).toBe(createdOwner1User1.id);
            return done();
          });
      });
    });
    describe('Imagenes de casa', () => {
      it('POST /owner/houses/:id/image', function (done) {
        const houseFile = 'test/images/test-house.jpg';
        request(app.getHttpServer())
          .post(`/owner/houses/${createdHouse1.id}/image`)
          .set('Authorization', owner_access_token)
          .attach('image', houseFile)
          .field('title', 'Foto de la casa')
          .field('description', 'Descripcion de la foto de la casa.')
          .expect(201)
          .end(async (err, res: request.Response) => {
            if (err) {
              console.log(res.body);
              throw new Error(err);
            }
            createdHouseImage = res.body;
            expect(createdHouseImage.house.id).toBe(createdHouse1.id);
            expect(createdHouseImage.path).toBeDefined();
            const image = await sharp(
              createdHouseImage.destination + createdHouseImage.uuid + '.jpg',
            ).metadata();
            expect(image.width).toBe(800);
            expect(image.height).toBe(600);
            return done();
          });
      });
      /**
       * Obtener especificamente la casa
       */
      it('GET /owner/houses/:id', function (done) {
        request(app.getHttpServer())
          .get(`/owner/houses/${createdHouse1.id}`)
          .set('Authorization', owner_access_token)
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.log(res.body);
              throw new Error(err);
            }
            const house: HouseEntity = res.body;
            expect(house).toBeInstanceOf(Object);
            expect(house.nombre).toBe(newHouse1.nombre);
            expect(house.images).toBeDefined();
            expect(house.images.length).toBe(1);
            createdHouse1 = house;
            return done();
          });
      });
      it('GET /browse/image/:uuid - Obtener la imagen de la casa', function (done) {
        request(app.getHttpServer())
          .get(`/browse/image/${createdHouse1.images[0].uuid}`)
          .expect(200)
          .end(async (err, res: request.Response) => {
            if (err) {
              console.log(res.body);
              throw new Error(err);
            }
            const image = await sharp(res.body).metadata();
            expect(image.width).toBe(800);
            expect(image.height).toBe(600);
            return done();
          });
      });
    });
    describe('Operaciones con tiendas', () => {
      it('Crear una tienda en casa uno', function (done) {
        request(app.getHttpServer())
          .post('/owner/shops')
          .set('Authorization', owner_access_token)
          .send(newHouse1Shop1)
          .expect(201)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            createdShop1 = res.body;
            expect(createdShop1).toBeInstanceOf(Object);
            expect(createdShop1.nombre).toBe(newHouse1Shop1.nombre);
            return done();
          });
      });

      it('Crear una tienda en casa dos', function (done) {
        request(app.getHttpServer())
          .post('/owner/shops')
          .set('Authorization', owner2_access_token)
          .send(newHouse2Shop1)
          .expect(201)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            createdShop2 = res.body;
            expect(createdShop2).toBeInstanceOf(Object);
            expect(createdShop2.nombre).toBe(newHouse2Shop1.nombre);
            return done();
          });
      });

      it('Obtener la tienda 1 desde owner 1', function (done) {
        request(app.getHttpServer())
          .get(`/owner/shops/${createdShop1.id}`)
          .set('Authorization', owner_access_token)
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body.nombre).toBe(newHouse1Shop1.nombre);
            return done();
          });
      });

      it('Obtener la tienda 2 desde owner 2', function (done) {
        request(app.getHttpServer())
          .get(`/owner/shops/${createdShop2.id}`)
          .set('Authorization', owner2_access_token)
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body.nombre).toBe(newHouse2Shop1.nombre);
            return done();
          });
      });

      // TODO: pruebas para actualizacion de estado shops
      it('Actualizar estado de una shop - inactivo', function (done) {
        request(app.getHttpServer())
          .put(`/admin/shops/${createdShop1.id}/status`)
          .send({ active: false })
          .set('Authorization', owner_access_token)
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.log(res.body);
              throw new Error(err);
            }
            const result: UpdateResult = res.body;
            expect(result.affected).toBe(1);
            return done();
          });
      });

      it('Actualizar estado de una shop - activo', function (done) {
        request(app.getHttpServer())
          .put(`/admin/shops/${createdShop1.id}/status`)
          .send({ active: true })
          .set('Authorization', owner_access_token)
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.log(res.body);
              throw new Error(err);
            }
            const result: UpdateResult = res.body;
            expect(result.affected).toBe(1);
            return done();
          });
      });

      /*it('Obtener la tienda 2 desde owner 1, no se debe poder', function (done) {
        request(app.getHttpServer())
          .get(`/owner/shops/${createdShop2.id}`)
          .set('Authorization', owner_access_token)
          .expect(404)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            console.log(res.body);
            return done();
          });
      });*/
      /*
      it('Obtener la tienda 1 desde owner 2, no se debe poder', function (done) {
        request(app.getHttpServer())
          .get(`/owner/shops/${createdShop1.id}`)
          .set('Authorization', owner2_access_token)
          .expect(404)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            console.log(res.body);
            return done();
          });
      });*/

      it('Obtener las tiendas desde público', function (done) {
        request(app.getHttpServer())
          .get(`/browse/catalogs/shops`)
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            expect(res.body.length).toBe(2);
            return done();
          });
      });

      it('Obtener una tienda por id desde público', function (done) {
        request(app.getHttpServer())
          .get(`/browse/catalogs/shops/${createdShop1.id}`)
          .expect(200)
          .end((err, res: request.Response) => {
            if (err) {
              console.error(res.body);
              throw new Error(err);
            }
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body.nombre).toBe(newHouse1Shop1.nombre);
            return done();
          });
      });
    });
  });

  describe('Brands', () => {
    /*
    ##    ########  ########     ###    ##    ## ########   ######  
    ##    ##     ## ##     ##   ## ##   ###   ## ##     ## ##    ## 
    ##    ##     ## ##     ##  ##   ##  ####  ## ##     ## ##       
    ##    ########  ########  ##     ## ## ## ## ##     ##  ######  
    ##    ##     ## ##   ##   ######### ##  #### ##     ##       ## 
    ##    ##     ## ##    ##  ##     ## ##   ### ##     ## ##    ## 
    ##    ########  ##     ## ##     ## ##    ## ########   ######  
    */
    it('Crear marca, por default en la casa 1', function (done) {
      request(app.getHttpServer())
        .post('/owner/brands')
        .set('Authorization', owner_access_token)
        .send(newBrand)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            throw err;
          }
          createdBrand = res.body;
          newProduct.brand = createdBrand.id; //inicializar el producto perteneciente a esta marca
          newProduct2.brand = createdBrand.id; //inicializar el producto perteneciente a esta marca
          expect(createdBrand).toBeInstanceOf(Object);
          expect(createdBrand.nombre).toBe(newBrand.nombre);
          return done();
        });
    });

    it('Crear otra marca en la casa 1 para pruebas paginate', function (done) {
      request(app.getHttpServer())
        .post('/owner/brands')
        .set('Authorization', owner_access_token)
        .send(newBrand2)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            throw err;
          }
          createdBrand2 = res.body;
          expect(createdBrand2).toBeInstanceOf(Object);
          expect(createdBrand2.nombre).toBe(newBrand2.nombre);
          return done();
        });
    });

    it('Subir imagen a la marca 1', function (done) {
      const brandFile = 'test/images/test-brand.jpg';
      request(app.getHttpServer())
        .post(`/owner/brands/${createdBrand.id}/image`)
        .set('Authorization', owner_access_token)
        .attach('image', brandFile)
        .field('title', 'Foto de marca')
        .field('description', 'Descripcion de la foto de marca.')
        .expect(201)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          createdBrandImage = res.body;
          expect(createdBrandImage.brand.id).toBe(createdBrand.id);
          expect(createdBrandImage.path).toBeDefined();
          const image = await sharp(
            createdBrandImage.destination + createdBrandImage.uuid + '.jpg',
          ).metadata();
          expect(image.width).toBe(800);
          expect(image.height).toBe(600);
          return done();
        });
    });

    it('Subir logo de la marca 1', function (done) {
      const brandLogo = 'test/images/test-brand-logo.jpg';
      request(app.getHttpServer())
        .post(`/owner/brands/${createdBrand.id}/logo`)
        .set('Authorization', owner_access_token)
        .attach('logo', brandLogo)
        .field('title', 'Logo de marca')
        .field('description', 'Descripcion del logo de marca.')
        .expect(201)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          createdLogoImage = res.body;
          expect(createdLogoImage.brandlogo.id).toBe(createdBrand.id);
          expect(createdLogoImage.path).toBeDefined();
          const image = await sharp(
            createdLogoImage.destination + createdLogoImage.uuid + '.jpg',
          ).metadata();
          expect(image.width).toBe(300);
          expect(image.height).toBe(300);
          return done();
        });
    });

    it('Obtener una marca', function (done) {
      request(app.getHttpServer())
        .get(`/owner/brands/${createdBrand.id}`)
        .set('Authorization', owner_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const brand: BrandEntity = res.body;
          expect(brand).toBeInstanceOf(Object);
          expect(brand.nombre).toBe(newBrand.nombre);
          expect(brand.images).toBeDefined();
          expect(brand.images.length).toBe(1);
          expect(brand.logo).toBeDefined();
          createdBrand = brand;
          return done();
        });
    });

    it('No se permite mas de un logo - se actualiza el logo', function (done) {
      const brandLogo = 'test/images/test-brand-logo.jpg';
      request(app.getHttpServer())
        .post(`/owner/brands/${createdBrand.id}/logo`)
        .set('Authorization', owner_access_token)
        .attach('logo', brandLogo)
        .field('title', 'Logo de marca')
        .field('description', 'Descripcion del logo de marca.')
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it('Obtener la imagen de la marca', function (done) {
      request(app.getHttpServer())
        .get(`/browse/image/${createdBrand.images[0].uuid}`)
        .expect(200)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const image = await sharp(res.body).metadata();
          expect(image.width).toBe(800);
          expect(image.height).toBe(600);
          return done();
        });
    });

    it('Actualizar una marca', function (done) {
      request(app.getHttpServer())
        .put(`/owner/brands/${createdBrand.id}`)
        .send(brandToUpdate)
        .set('Authorization', owner_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: UpdateResult = res.body;
          expect(result.affected).toBe(1);
          return done();
        });
    });

    it('Verificar actualizacion de marca', function (done) {
      request(app.getHttpServer())
        .get(`/owner/brands/${createdBrand.id}`)
        .set('Authorization', owner_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Object);
          expect(res.body.nombre).toBe(brandToUpdate.nombre);
          expect(res.body.descripcion).toBe(brandToUpdate.descripcion);
          expect(res.body.active).toBe(brandToUpdate.active);
          return done();
        });
    });

    it('Actualizar estado de una marca - inactivo', function (done) {
      request(app.getHttpServer())
        .put(`/owner/brands/${createdBrand.id}/status`)
        .send({ active: false })
        .set('Authorization', owner_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: UpdateResult = res.body;
          expect(result.affected).toBe(1);
          return done();
        });
    });

    it('Actualizar estado de una marca - activo', function (done) {
      request(app.getHttpServer())
        .put(`/owner/brands/${createdBrand.id}/status`)
        .send({ active: true })
        .set('Authorization', owner_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: UpdateResult = res.body;
          expect(result.affected).toBe(1);
          return done();
        });
    });
  });

  describe('Masters', function () {
    /*
    ##    ##     ##    ###     ######  ######## ######## ########   ######  
    ##    ###   ###   ## ##   ##    ##    ##    ##       ##     ## ##    ## 
    ##    #### ####  ##   ##  ##          ##    ##       ##     ## ##       
    ##    ## ### ## ##     ##  ######     ##    ######   ########   ######  
    ##    ##     ## #########       ##    ##    ##       ##   ##         ## 
    ##    ##     ## ##     ## ##    ##    ##    ##       ##    ##  ##    ## 
    ##    ##     ## ##     ##  ######     ##    ######## ##     ##  ######  
    */
    it('POST /owner/masters', function (done) {
      request(app.getHttpServer())
        .post('/owner/masters')
        .set('Authorization', owner_access_token)
        .send(newMaster)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            throw new Error(err);
          }
          createdMaster = res.body;
          expect(createdMaster).toBeInstanceOf(Object);
          expect(createdMaster.nombre).toBe(newMaster.nombre);
          return done();
        });
    });

    it('POST /owner/masters crear master num2', function (done) {
      request(app.getHttpServer())
        .post('/owner/masters')
        .set('Authorization', owner_access_token)
        .send(newMaster2)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            throw new Error(err);
          }
          createdMaster2 = res.body;
          expect(createdMaster2).toBeInstanceOf(Object);
          expect(createdMaster2.nombre).toBe(newMaster2.nombre);
          return done();
        });
    });

    it('POST /owner/masters crear master en casa 2', function (done) {
      request(app.getHttpServer())
        .post('/owner/masters')
        .set('Authorization', owner2_access_token)
        .send(newMasterHouse2)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            throw new Error(err);
          }
          createdMasterHouse2 = res.body;
          expect(createdMasterHouse2).toBeInstanceOf(Object);
          expect(createdMasterHouse2.nombre).toBe(newMasterHouse2.nombre);
          return done();
        });
    });

    it('PUT /owner/masters/:id/image - Subir imagen del maestro mezcalero', function (done) {
      const masterFile = 'test/images/test-master.jpg';
      request(app.getHttpServer())
        .put(`/owner/masters/${createdMaster.id}/image`)
        .set('Authorization', owner_access_token)
        .attach('image', masterFile)
        .field('title', 'El maestro Juan Perez')
        .field('description', 'Descripcion de la foto del maestro.')
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            throw new Error(err);
          }

          const createdMasterImage: {
            fieldname: string;
            originalname: string;
            encoding: string;
            mimetype: string;
            destination: string;
            filename: string;
            path: string;
            size: number;
          } = res.body;

          expect(createdMasterImage.originalname).toBe('test-master.jpg');
          expect(createdMasterImage.path).toBeDefined();
          expect(createdMasterImage.filename).toBeDefined();
          expect(createdMasterImage.mimetype).toBe('image/jpeg');
          return done();
        });
    });

    it('GET /owner/masters', function (done) {
      request(app.getHttpServer())
        .get(`/owner/masters`)
        .set('Authorization', owner_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Array);
          // expect(res.body[0]).toBe(newMaster.nombre);
          return done();
        });
    });

    it('GET /owner/masters/:id', function (done) {
      request(app.getHttpServer())
        .get(`/owner/masters/${createdMaster.id}`)
        .set('Authorization', owner_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Object);
          expect(res.body.nombre).toBe(newMaster.nombre);
          expect(res.body.images).toBeDefined();
          expect(res.body.images.length).toBe(1);
          createdMaster = res.body;
          return done();
        });
    });

    it('GET /browse/image/:uuid - Obtener la imagen de la marca', function (done) {
      request(app.getHttpServer())
        .get(`/browse/image/${createdMaster.images[0].uuid}`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    /**
     * Obtener todas las maestros como perfil public
     */
    it('GET /browse/catalogs/masters', function (done) {
      request(app.getHttpServer())
        .get(`/browse/catalogs/masters`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Object);
          // expect(res.body.nombre).toBe(newShop.nombre);
          return done();
        });
    });
    /**
     * Obtener un maestro como perfil public por id
     */
    it('GET /browse/catalogs/masters/:id', function (done) {
      request(app.getHttpServer())
        .get(`/browse/catalogs/masters/${createdMaster.id}`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Object);
          expect(res.body.nombre).toBe(newMaster.nombre);
          return done();
        });
    });

    it('Actualizar estado de un master - inactivo', function (done) {
      request(app.getHttpServer())
        .put(`/owner/masters/${createdMaster.id}/status`)
        .send({ active: false })
        .set('Authorization', owner_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: UpdateResult = res.body;
          expect(result.affected).toBe(1);
          return done();
        });
    });

    it('Actualizar estado de un master - activo', function (done) {
      request(app.getHttpServer())
        .put(`/owner/masters/${createdMaster.id}/status`)
        .send({ active: true })
        .set('Authorization', owner_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: UpdateResult = res.body;
          expect(result.affected).toBe(1);
          return done();
        });
    });
  });

  describe('Products', () => {
    it('POST /owner/products', function (done) {
      request(app.getHttpServer())
        .post('/owner/products')
        .set('Authorization', owner_access_token)
        .send(newProduct)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          createdProduct = res.body;
          expect(createdProduct).toBeInstanceOf(Object);
          expect(createdProduct.nombre).toBe(newProduct.nombre);
          expect(createdProduct.price).toBe(newProduct.price);
          return done();
        });
    });

    it('POST /owner/products', function (done) {
      request(app.getHttpServer())
        .post('/owner/products')
        .set('Authorization', owner_access_token)
        .send(newProduct2)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          createdProduct2 = res.body;
          expect(createdProduct2).toBeInstanceOf(Object);
          expect(createdProduct2.nombre).toBe(newProduct2.nombre);
          expect(createdProduct2.price).toBe(newProduct2.price);
          return done();
        });
    });
    /**
     * Subir imagenes a casas, marcas y productos
     *
     * https://gitlab.com/mezcalier/mezcalier-back/-/issues/29
     *
     */
    it('POST /owner/products/:id/image - Subir imagen al producto 1', function (done) {
      const productFile = 'test/images/test-product.jpg';
      request(app.getHttpServer())
        .post(`/owner/products/${createdProduct.id}/image`)
        .set('Authorization', owner_access_token)
        .attach('image', productFile)
        .field('title', 'Foto de marca')
        .field('description', 'Descripcion de la foto de marca.')
        .expect(201)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          createdProductImage = res.body;
          expect(createdProductImage.product).toBeInstanceOf(Object); //trae la estructura basica del nuevo Producto
          expect(createdProductImage.product.id).toBe(createdProduct.id);
          expect(createdProductImage.path).toBeDefined();

          //verificar que ./uploads/products/:idProducto/uuid de la imagen.jpg, mida 1200x800
          const image = await sharp(
            createdProductImage.destination + createdProductImage.uuid + '.jpg',
          ).metadata();
          expect(image.width).toBe(800);
          expect(image.height).toBe(600);
          return done();
        });
    });

    it('POST /owner/products/:id/image - Subir imagen al producto 2', function (done) {
      const productFile = 'test/images/test-product.jpg';
      request(app.getHttpServer())
        .post(`/owner/products/${createdProduct2.id}/image`)
        .set('Authorization', owner_access_token)
        .attach('image', productFile)
        .field('title', 'Foto de marca')
        .field('description', 'Descripcion de la foto de marca.')
        .expect(201)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          createdProductImage = res.body;
          expect(createdProductImage.product).toBeInstanceOf(Object); //trae la estructura basica del nuevo Producto
          expect(createdProductImage.path).toBeDefined();
          const image = await sharp(
            createdProductImage.destination + createdProductImage.uuid + '.jpg',
          ).metadata();
          expect(image.width).toBe(800);
          expect(image.height).toBe(600);
          return done();
        });
    });

    it('GET /owner/products/:id', function (done) {
      request(app.getHttpServer())
        .get(`/owner/products/${createdProduct.id}`)
        .set('Authorization', owner_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const prod: ProductEntity = res.body;
          expect(prod.images).toBeDefined();
          expect(prod.images.length).toBe(1);
          createdProduct.images = prod.images;
          expect(prod.nombre).toBe(newProduct.nombre);
          return done();
        });
    });
    /*
    it('GET /browse/masters/:id', function (done) {
      request(app.getHttpServer())
        .get(`/browse/masters/${createdMaster.id}`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            throw new Error(err);
          }
          expect(res.body).toBeInstanceOf(Object);
          expect(res.body.nombre).toBe(newMaster.nombre);
          expect(res.body.images).toBeDefined();
          expect(res.body.images.length).toBe(1);
          expect(res.body.house.id).toBe(createdHouse1.id);
          expect(res.body.products.length).toBeInstanceOf(Array);
          createdMaster = res.body;
          return done();
        });
    });*/

    it('GET /browse/image/:uuid - Obtener la imagen del producto1', function (done) {
      request(app.getHttpServer())
        .get(`/browse/image/${createdProduct.images[0].uuid}`)
        .expect(200)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const image = await sharp(res.body).metadata();
          expect(image.width).toBe(800);
          expect(image.height).toBe(600);
          return done();
        });
    });

    it('PAGINATE /owner/products', function (done) {
      const paginationOptions: PaginationPrimeNgProducts = {
        filters: {},
        skip: 0,
        take: 10,
      };
      request(app.getHttpServer())
        .post('/owner/products/paginate')
        .set('Authorization', owner_access_token)
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          const producto0: ProductEntity = result.data[0];
          expect(producto0.id).toBe(createdProduct.id);
          return done();
        });
    });

    it('PAGINATE /owner/products - Ordenado por precio de mayor a menor', function (done) {
      const paginationOptions: PaginationPrimeNgProducts = {
        filters: {},
        skip: 0,
        sort: SortTypes.PRECIO_MAYOR,
        take: 10,
      };
      request(app.getHttpServer())
        .post('/owner/products/paginate')
        .set('Authorization', owner_access_token)
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(2);
          expect(result.data[0].id).toBe(createdProduct2.id);
          expect(result.data[1].id).toBe(createdProduct.id);
          return done();
        });
    });

    it('PAGINATE /owner/products - Ordenado por precio de mayor a menor', function (done) {
      const paginationOptions: PaginationPrimeNgProducts = {
        filters: {},
        skip: 0,
        sort: SortTypes.PRECIO_MENOR,
        take: 10,
      };
      request(app.getHttpServer())
        .post('/owner/products/paginate')
        .set('Authorization', owner_access_token)
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(2);
          expect(result.data[0].id).toBe(createdProduct.id);
          expect(result.data[1].id).toBe(createdProduct2.id);
          return done();
        });
    });

    it('PAGINATE /owner/products - Ordenados por mejor calificados', function (done) {
      const paginationOptions: PaginationPrimeNgProducts = {
        filters: {},
        skip: 0,
        sort: SortTypes.MEJOR_CALIFICADOS,
        take: 10,
      };
      request(app.getHttpServer())
        .post('/owner/products/paginate')
        .set('Authorization', owner_access_token)
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(2);
          expect(result.data[0].id).toBe(createdProduct.id);
          expect(result.data[1].id).toBe(createdProduct2.id);
          return done();
        });
    });

    it('PAGINATE /owner/products - Ordenados reciente', function (done) {
      const paginationOptions: PaginationPrimeNgProducts = {
        filters: {},
        skip: 0,
        sort: SortTypes.RECIENTES,
        take: 10,
      };
      request(app.getHttpServer())
        .post('/owner/products/paginate')
        .set('Authorization', owner_access_token)
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(2);
          expect(result.data[0].id).toBe(createdProduct2.id);
          expect(result.data[1].id).toBe(createdProduct.id);
          return done();
        });
    });

    //TODO: actualizar con un mezcalType2

    //TODO: hacer get al product y verificar que ahora mezcaltype = 2

    //TODO: probar cambiarle el master a un master que no sea mio,

    //TODO crear otra casa, con otras marcas, con otros productos, masters y shops para poder hacer las pruebas de referencias cruzadas

    it('PUT /owner/products/:id/master -Actualizar master en producto', function (done) {
      const update = { master: createdMaster2.id };
      request(app.getHttpServer())
        .put(`/owner/products/${createdProduct.id}/master`)
        .set('Authorization', owner_access_token)
        .send(update)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const body = res.body;
          expect(body.affected).toBe(1);
          return done();
        });
    });
    /*
    it('PUT /owner/products/:id/master -Actualizar master de otra casa en producto de casa 1', function (done) {
      const update = { master: createdMasterHouse2.id };
      request(app.getHttpServer())
        .put(`/owner/products/${createdProduct.id}/master`)
        .set('Authorization', owner_access_token)
        .send(update)
        .expect(404)
        .end((err, res: request.Response) => {
          if (err) {
            console.error(res.body);
            throw new Error(err);
          }
          return done();
        });
    });*/

    it('PUT /owner/products/:id/shops -Actualizar tiendas en producto', function (done) {
      const update = { shops: [createdShop1.id] };
      request(app.getHttpServer())
        .put(`/owner/products/${createdProduct.id}/shops`)
        .set('Authorization', owner_access_token)
        .send(update)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const body = res.body;
          expect(body).toBeInstanceOf(Object);
          return done();
        });
    });
  });

  describe('BROWSER publico', () => {
    /*
   ########  ########   #######  ##      ##  ######  ######## ########  
   ##     ## ##     ## ##     ## ##  ##  ## ##    ## ##       ##     ## 
   ##     ## ##     ## ##     ## ##  ##  ## ##       ##       ##     ## 
   ########  ########  ##     ## ##  ##  ##  ######  ######   ########  
   ##     ## ##   ##   ##     ## ##  ##  ##       ## ##       ##   ##   
   ##     ## ##    ##  ##     ## ##  ##  ## ##    ## ##       ##    ##  
   ########  ##     ##  #######   ###  ###   ######  ######## ##     ## 
    */

    it('POST /browse/products/compare', function (done) {
      const productsToCompare: CompareProductsDTO = {
        productsIds: [createdProduct.id, createdProduct2.id],
      };

      request(app.getHttpServer())
        .post('/browse/products/compare')
        .set('Authorization', public_access_token)
        .send(productsToCompare)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const body: ProductEntity[] = res.body;
          expect(body).toBeInstanceOf(Array);
          expect(body.length).toBe(2);
          expect(body[0].id).toBe(createdProduct.id);
          expect(body[1].id).toBe(createdProduct2.id);
          return done();
        });
    });

    it('PUT /browse/products/:id/rate', function (done) {
      request(app.getHttpServer())
        .put(`/browse/products/${createdProduct.id}/rate`)
        .set('Authorization', public_access_token)
        .send(rateForm)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const body: RateDTO = res.body;
          expect(body.rating).toBe(rateForm.rating); //promedio
          expect(body.affected).toBe(1);
          return done();
        });
    });

    it('PUT /browse/products/:id/comment', function (done) {
      request(app.getHttpServer())
        .put(`/browse/products/${createdProduct.id}/comment`)
        .set('Authorization', public_access_token)
        .send(commentForm)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const body: ProductCommentsEntity = res.body;
          expect(body.comment).toBe(commentForm.comment);
          return done();
        });
    });

    it('GET /browse/products/:id/comments - Obtener los comentarios de un producto', function (done) {
      request(app.getHttpServer())
        .get(`/browse/products/${createdProduct.id}/comments`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const comments: ProductCommentsEntity[] = res.body;
          expect(comments.length).toBe(1);
          expect(comments[0].comment).toBe(commentForm.comment);
          return done();
        });
    });

    it('GET /browse/products/comments/user - Obtener los comentarios de un producto hechos por un usuario', function (done) {
      request(app.getHttpServer())
        .get(`/browse/products/comments/user`)
        .expect(200)
        .set('Authorization', public_access_token)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const comments: ProductCommentsEntity[] = res.body;
          expect(comments.length).toBe(1);
          expect(comments[0].comment).toBe(commentForm.comment);
          return done();
        });
    });

    it('PUT /browse/products/:id/taste', function (done) {
      request(app.getHttpServer())
        .put(`/browse/products/${createdProduct.id}/taste`)
        .set('Authorization', public_access_token)
        .send(tasteForm)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const body: ProductTastingsEntity = res.body;
          createdTasting = body;
          expect(body.experience).toBe(tasteForm.experience);
          return done();
        });
    });

    it('Subir imagen a la degustacion', function (done) {
      const taste = 'test/images/test-brand.jpg';
      request(app.getHttpServer())
        .post(`/browse/products/tasting/${createdTasting.id}/image`)
        .set('Authorization', public_access_token)
        .attach('image', taste)
        .expect(201)
        .end(async (err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          createdTastingImage = res.body;
          expect(createdTastingImage.path).toBeDefined();
          expect(createdTastingImage).toBeInstanceOf(Object);
          return done();
        });
    });

    it('PUT /browse/products/:id/like', function (done) {
      request(app.getHttpServer())
        .put(`/browse/products/${createdProduct.id}/like`)
        .set('Authorization', public_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it('PUT /browse/products/:id/favorite', function (done) {
      request(app.getHttpServer())
        .put(`/browse/products/${createdProduct.id}/favorite`)
        .set('Authorization', public_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it('PUT /browse/products/getFavorites', function (done) {
      request(app.getHttpServer())
        .put('/browse/products/getFavorites')
        .set('Authorization', public_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const favorites: ProductFavoritesEntity[] = res.body;
          expect(favorites.length).toBe(1);
          expect(favorites[0].product.id).toBe(createdProduct.id);
          return done();
        });
    });

    it('PUT /browse/products/tastings - Obtener degustaciones por usuario en sesión', function (done) {
      request(app.getHttpServer())
        .put('/browse/products/tastings')
        .set('Authorization', public_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const tastings: ProductTastingsEntity[] = res.body;
          expect(tastings.length).toBe(1);
          expect(tastings[0].product.id).toBe(createdProduct.id);
          return done();
        });
    });

    //browser paginate

    it('POST /browse/products/paginate', function (done) {
      const paginationOptions: PaginationPrimeNG = {
        filters: {},
        skip: 0,
        sort: {},
        take: 10,
      };
      request(app.getHttpServer())
        .post('/browse/products/paginate')
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(2);
          return done();
        });
    });

    it('POST /browse/products/paginate - el usuario publico tiene un producto con like', function (done) {
      const paginationOptions: PaginationPrimeNG = {
        filters: {},
        skip: 0,
        sort: {},
        take: 10,
      };
      request(app.getHttpServer())
        .post('/browse/products/paginate')
        .set('Authorization', public_access_token)
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(2);
          expect(result.data[0].isLike).toBe(true);
          return done();
        });
    });

    it('GET /browse/products/:id', function (done) {
      request(app.getHttpServer())
        .get(`/browse/products/${createdProduct.id}`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const prod: ProductEntity = res.body;
          expect(prod.nombre).toBe(newProduct.nombre);
          expect(prod.nombre).toBe(newProduct.nombre);
          //su rating debe ser la misma calificacion que tiene arriba
          expect(prod.rating).toBe(rateForm.rating);
          //comments deberia ser un array de 1 y coincidir con el mensaje comentado antes
          expect(prod.comments.length).toBe(1);
          expect(prod.userLikes.length).toBe(1);
          expect(prod.userFaves.length).toBe(1);
          expect(prod.likes).toBe(1);
          return done();
        });
    });

    it('POST /browse/products/paginate - Buscar por termino "crema", debe regresar 1 producto.', function (done) {
      const paginationOptions: PaginationPrimeNG = {
        filters: {
          search: 'crema',
        },
        skip: 0,
        sort: {},
        take: 10,
      };
      request(app.getHttpServer())
        .post('/browse/products/paginate')
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(1);
          expect(result.data[0].nombre).toBe(createdProduct.nombre);
          return done();
        });
    });

    //BRANDS

    it('PUT /browse/brands/:id/comment', function (done) {
      request(app.getHttpServer())
        .put(`/browse/brands/${createdHouse1.id}/comment`)
        .set('Authorization', public_access_token)
        .send(commentBrandForm)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const body: BrandCommentsEntity = res.body;
          expect(body.comment).toBe(commentBrandForm.comment);
          return done();
        });
    });

    it('PUT /browse/brands/:id/rate', function (done) {
      request(app.getHttpServer())
        .put(`/browse/brands/${createdBrand.id}/rate`)
        .set('Authorization', public_access_token)
        .send(rateForm)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const body: RateDTO = res.body;
          expect(body.rating).toBe(rateForm.rating); //promedio
          expect(body.affected).toBe(1);
          return done();
        });
    });

    it('PUT /browse/brands/:id/like', function (done) {
      request(app.getHttpServer())
        .put(`/browse/brands/${createdBrand.id}/like`)
        .set('Authorization', public_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it('PUT /browse/brands/:id/dislike - dar dislike a una marca', function (done) {
      request(app.getHttpServer())
        .put(`/browse/brands/${createdBrand.id}/dislike`)
        .set('Authorization', public_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it('PUT /browse/brands/:id/like - dar like nuevamente a la marca', function (done) {
      request(app.getHttpServer())
        .put(`/browse/brands/${createdBrand.id}/like`)
        .set('Authorization', public_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it('POST /browse/brands/paginate - prueba de una marca', function (done) {
      const paginationOptions: PaginationPrimeNgBrands = {
        filters: {
          search: 'oro',
        },
        skip: 0,
        take: 10,
      };
      request(app.getHttpServer())
        .post('/browse/brands/paginate')
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(1);
          return done();
        });
    });

    it('POST /browse/brands/paginate - prueba de una marca', function (done) {
      const paginationOptions: PaginationPrimeNgBrands = {
        filters: {
          search: 'santaella',
        },
        skip: 0,
        take: 10,
      };
      request(app.getHttpServer())
        .post('/browse/brands/paginate')
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(1);
          return done();
        });
    });

    it('POST /browse/brands/paginate - prueba que los filtros vacios', function (done) {
      const paginationOptions: PaginationPrimeNgBrands = {
        filters: {},
        skip: 0,
        take: 10,
      };
      request(app.getHttpServer())
        .post('/browse/brands/paginate')
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(2);
          expect(result.data[0].id).toBe(createdBrand.id);
          expect(result.data[1].id).toBe(createdBrand2.id);
          return done();
        });
    });

    it('POST /browse/brands/paginate - prueba para ordenar por nombre', function (done) {
      const paginationOptions: PaginationPrimeNgBrands = {
        filters: {},
        skip: 0,
        take: 10,
        sort: BrandsSortTypes.NOMBRE,
      };
      request(app.getHttpServer())
        .post('/browse/brands/paginate')
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(2);
          expect(result.data[0].id).toBe(createdBrand2.id);
          expect(result.data[1].id).toBe(createdBrand.id);
          return done();
        });
    });

    it('GET /browse/brands/:id', function (done) {
      request(app.getHttpServer())
        .get(`/browse/brands/${createdBrand.id}`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const brand: BrandEntity = res.body;
          expect(brand).toBeInstanceOf(Object);
          expect(brand.nombre).toBe(brandToUpdate.nombre);
          expect(brand.likes).toBe(1);
          expect(brand.comments.length).toBe(1);
          expect(brand.house.id).toBe(createdHouse1.id);
          return done();
        });
    });

    it('GET /browse/brands/:id/comments - comentarios de una marca por id', function (done) {
      request(app.getHttpServer())
        .get(`/browse/brands/${createdBrand.id}/comments`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const brand: BrandEntity = res.body;
          expect(brand).toBeInstanceOf(Object);
          expect(brand.comments.length).toBe(1);
          return done();
        });
    });

    it('GET /browse/brands/:id/comments - comentarios de una marca por id', function (done) {
      request(app.getHttpServer())
        .get(`/browse/brands/${createdBrand2.id}/comments`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const brand: BrandEntity = res.body;
          expect(brand).toBeInstanceOf(Object);
          expect(brand.comments.length).toBe(0);
          return done();
        });
    });

    it('GET /browse/brands/comments/user - Obtener los comentarios de una marca hechos por un usuario', function (done) {
      request(app.getHttpServer())
        .get(`/browse/brands/comments/user`)
        .expect(200)
        .set('Authorization', public_access_token)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const comments: BrandCommentsEntity[] = res.body;
          expect(comments.length).toBe(1);
          expect(comments[0].comment).toBe(commentBrandForm.comment);
          return done();
        });
    });

    // HOUSES
    it('PUT /browse/houses/:id/comment', function (done) {
      request(app.getHttpServer())
        .put(`/browse/houses/${createdHouse1.id}/comment`)
        .set('Authorization', public_access_token)
        .send(commentHouseForm)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const body: HouseCommentsEntity = res.body;
          expect(body.comment).toBe(commentHouseForm.comment);
          return done();
        });
    });

    it('GET /browse/houses/comments/user - Obtener los comentarios de una casa hechos por un usuario', function (done) {
      request(app.getHttpServer())
        .get(`/browse/houses/comments/user`)
        .expect(200)
        .set('Authorization', public_access_token)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const comments: HouseCommentsEntity[] = res.body;
          expect(comments.length).toBe(1);
          expect(comments[0].comment).toBe(commentHouseForm.comment);
          return done();
        });
    });

    it('PUT /browse/houses/:id/rate', function (done) {
      request(app.getHttpServer())
        .put(`/browse/houses/${createdHouse1.id}/rate`)
        .set('Authorization', public_access_token)
        .send(rateForm)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const body: RateDTO = res.body;
          expect(body.rating).toBe(rateForm.rating); //promedio
          expect(body.affected).toBe(1);
          return done();
        });
    });

    it('PUT /browse/houses/:id/like', function (done) {
      request(app.getHttpServer())
        .put(`/browse/houses/${createdHouse1.id}/like`)
        .set('Authorization', public_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it('PUT /browse/houses/:id/dislike - dar dislike a una casa', function (done) {
      request(app.getHttpServer())
        .put(`/browse/houses/${createdHouse1.id}/dislike`)
        .set('Authorization', public_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it('PUT /browse/houses/:id/like - dar like nuevamente a la casa', function (done) {
      request(app.getHttpServer())
        .put(`/browse/houses/${createdHouse1.id}/like`)
        .set('Authorization', public_access_token)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          return done();
        });
    });

    it('POST /browse/houses/paginate', function (done) {
      const paginationOptions: PaginationPrimeNgHouses = {
        filters: {},
        skip: 0,
        take: 10,
      };
      request(app.getHttpServer())
        .post('/browse/houses/paginate')
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(2);
          return done();
        });
    });

    it('POST /browse/houses/paginate - Prueba para buscar el nombre', function (done) {
      const paginationOptions: PaginationPrimeNgHouses = {
        filters: {
          search: 'Oro',
        },
        skip: 0,
        take: 10,
      };
      request(app.getHttpServer())
        .post('/browse/houses/paginate')
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(1);
          return done();
        });
    });

    it('POST /browse/houses/paginate - Prueba para buscar el nombre, sin palabras relacionadas', function (done) {
      const paginationOptions: PaginationPrimeNgHouses = {
        filters: {
          search: 'Guadalajara',
        },
        skip: 0,
        take: 10,
      };
      request(app.getHttpServer())
        .post('/browse/houses/paginate')
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(0);
          return done();
        });
    });

    it('GET /browse/houses/:id', function (done) {
      request(app.getHttpServer())
        .get(`/browse/houses/${createdHouse1.id}`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const obtainedHouse: HouseEntity = res.body;
          expect(obtainedHouse).toBeInstanceOf(Object);
          expect(obtainedHouse.nombre).toBe(newHouse1.nombre);
          expect(obtainedHouse.active).toBe(true); //aqui la casa ya esta activa
          expect(obtainedHouse.likes).toBe(1);
          expect(obtainedHouse.comments.length).toBe(1);
          expect(obtainedHouse.brands.length).toBe(2);
          return done();
        });
    });

    it('GET /browse/houses/:id/masters - Obtener los maestros mezcaleros desde public, por casa mezcalera', function (done) {
      request(app.getHttpServer())
        .get(`/browse/houses/${createdHouse1.id}/masters`)
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const masters: MasterEntity[] = res.body;
          expect(masters.length).toBeGreaterThan(0);
          expect(masters[0].nombre).toBe(newMaster.nombre);
          return done();
        });
    });

    /**
     * actualizar status de la casa y de sus usuarios
     */
    it('PUT /admin/houses/:id/status - Desactivar una casa y sus usuarios (admin)', function (done) {
      request(app.getHttpServer())
        .put(`/admin/houses/${createdHouse1.id}/status`)
        .set('Authorization', admin_access_token)
        .send({ active: false })
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }

          const response: {
            updatedHouse: UpdateResult;
            updatedUsers: UpdateResult;
          } = res.body;

          expect(response.updatedHouse.affected).toBe(1);
          expect(response.updatedUsers.affected).toBe(2);

          return done();
        });
    });

    it(`POST /auth/login - Intentar hacer login con un usuario de una casa desactivada`, (done) => {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: newHouse1User1.email,
          password: newHouse1User1.password,
        })
        .expect(401)
        .end(function (err) {
          if (err) {
            throw err;
          }
          return done();
        });
    });

    // TODO: hacer pruebas con productos de casas desactivadas
    it('POST /browse/products/paginate - no puede realizar la operación ya que la casa se desactivo', function (done) {
      const paginationOptions: PaginationPrimeNG = {
        filters: {},
        skip: 0,
        sort: {},
        take: 10,
      };
      request(app.getHttpServer())
        .post('/browse/products/paginate')
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          // expect(result.data.length).toBe(0);
          return done();
        });
    });

    it('PUT /admin/houses/:id/status - Activar una casa y sus usuarios (admin)', function (done) {
      request(app.getHttpServer())
        .put(`/admin/houses/${createdHouse1.id}/status`)
        .set('Authorization', admin_access_token)
        .send({ active: true })
        .expect(200)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }

          const response: {
            updatedHouse: UpdateResult;
            updatedUsers: UpdateResult;
          } = res.body;

          expect(response.updatedHouse.affected).toBe(1);
          expect(response.updatedUsers.affected).toBe(2);

          return done();
        });
    });

    it(`POST /auth/login - Hacer login con owner de casa activada`, (done) => {
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: newHouse1User1.email,
          password: newHouse1User1.password,
        })
        .expect(201)
        .end(function (err, res: request.Response) {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.identity.house.nombre).toBe(createdHouse1.nombre);
          owner_access_token = res.body.access_token;
          return done();
        });
    });

    it('POST /browse/products/paginate - puede hacer la operacion despues de activar la casa', function (done) {
      const paginationOptions: PaginationPrimeNG = {
        filters: {},
        skip: 0,
        sort: {},
        take: 10,
      };
      request(app.getHttpServer())
        .post('/browse/products/paginate')
        .send(paginationOptions)
        .expect(201)
        .end((err, res: request.Response) => {
          if (err) {
            console.log(res.body);
            throw new Error(err);
          }
          const result: PaginationPrimeNgResult = res.body;
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(2);
          return done();
        });
    });
  });

  afterAll(async (done) => {
    await app.close();
    return done();
  });
});
