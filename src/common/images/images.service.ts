import { ProcesseEntity } from '@mezcal/modules/admin/catalogs/processes/model/processe.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { FileResultDTO } from '@mezcal/common/dto/fileResult.dto';
import { SaveImageDTO } from '@mezcal/common/images/model/saveImage.dto';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { existsSync, unlinkSync } from 'fs';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { ImageTypes } from '@mezcal/common/images/imageTypes.enum';
import { BrandEntity } from '@mezcal/modules/brand.entity';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { MasterEntity } from '@mezcal/modules/owner/masters/model/master.entity';
import * as fs from 'fs';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import * as sharp from 'sharp';
import { ProductTastingsEntity } from '../../modules/browser/models/productTastings.entity';
import { RegionEntity } from '../../modules/admin/catalogs/regions/model/region.entity';
import { AgaveEntity } from '../../modules/admin/catalogs/agaves/model/agave.entity';
/**
 * Service para usuarios
 */
@Injectable()
export class ImagesService {
  /**
   * Retorna un stream de la imagen solicitada
   *
   * @param uuid uuid de la imagen
   */
  async get(uuid): Promise<string | boolean> {
    //const filesRoute = './';

    const image = await getRepository(ImageEntity).findOne({
      where: { uuid: uuid },
    });

    const imageRoute = image.destination + image.uuid + '.jpg';

    if (existsSync(imageRoute)) {
      return imageRoute || false;
    }
  }
  /**
   * Borrar imagen
   *
   * @param id id de la imagen a borrar
   */
  async delete(
    uuid: string, //uuid de la imagen
    user: JWTPayLoadDTO, //usuario que intenta borrarla
  ): Promise<ImageEntity> {
    //consultar imagen
    const imageToDelete = await getRepository(ImageEntity).findOne({
      where: { uuid },
    });

    if (!imageToDelete) {
      throw new HttpException('No existe esa imagen', HttpStatus.NOT_FOUND);
    }

    //si la imagen es de producto
    if (imageToDelete.product) {
      //necesitamos saber si la imagen es de un producto que es de una marca de la casa del usaurio
      const myImage = getRepository(ImageEntity)
        .createQueryBuilder('image')
        .leftJoin('image.product', 'product')
        .leftJoin('product.brand', 'brand')
        .leftJoin('brand.house', 'house')
        .where('image.uuid = :imgId AND house.id = :houseId', {
          houseId: user.house.id,
          imgId: uuid,
        })
        .getOne();
      if (!myImage) {
        throw new HttpException('No existe esa imagen.', HttpStatus.NOT_FOUND);
      }
    }

    //si la imagen es de marca
    if (imageToDelete.brand || imageToDelete.brandlogo) {
      //necesitamos saber si la imagen es de una marca de la casa del usaurio
      const myImage = getRepository(ImageEntity)
        .createQueryBuilder('image')
        .leftJoin('image.brand', 'brand')
        .leftJoin('brand.house', 'house')
        .where('image.uuid = :imgId AND house.id = :houseId', {
          houseId: user.house.id,
          imgId: uuid,
        })
        .getOne();
      if (!myImage) {
        throw new HttpException('No existe esa imagen.', HttpStatus.NOT_FOUND);
      }
    }

    //si la imagen es de casa
    if (imageToDelete.house) {
      //necesitamos saber si la imagen es de la casa del usaurio
      const myImage = getRepository(ImageEntity)
        .createQueryBuilder('image')
        .leftJoin('image.house', 'house')
        .where('image.uuid = :imgId AND house.id = :houseId', {
          houseId: user.house.id,
          imgId: uuid,
        })
        .getOne();
      if (!myImage) {
        throw new HttpException('No existe esa imagen.', HttpStatus.NOT_FOUND);
      }
    }

    //borrar de la base de datos
    const deleteResult = getRepository(ImageEntity).delete({ uuid: uuid });

    //borrar archivo
    if ((await deleteResult).affected === 1) {
      //estamos parados en src/modules/images
      const file = `${__dirname}/../../../${imageToDelete.path}`;

      if (existsSync(file)) {
        unlinkSync(file);
      }
    }

    return imageToDelete;
  }

  /**
   * Crea una imagen en la base de datos con la informacion recibidas
   *
   * @param { FileResultDTO } file datos del archivo
   * @param { SaveImageDTO } data datos de la imagen
   * @returns { ImageEntity } imagen creada
   */
  async save(
    file: FileResultDTO,
    data: SaveImageDTO,
    user?: JWTPayLoadDTO,
  ): Promise<ImageEntity> {
    let house: HouseEntity;
    let brandLogo: BrandEntity;
    let brand: BrandEntity;
    let product: ProductEntity;
    let master: MasterEntity;
    let region: RegionEntity;
    let agave: AgaveEntity;
    let processe: ProcesseEntity;
    let productTasting: ProductTastingsEntity;

    //si viene user y es un logo de marca, asegurarnos que data.parent sea de una marca de su casa.
    if (
      user &&
      (data.type === ImageTypes.logo || data.type === ImageTypes.brand)
    ) {
      const myBrand = await getRepository(BrandEntity)
        .createQueryBuilder('brand')
        .leftJoin('brand.house', 'house')
        .where('brand.id = :parent AND house.id = :houseId', {
          parent: data.parent,
          houseId: user.house.id,
        })
        .getOne();
      if (!myBrand) {
        fs.unlinkSync(file.path);
        throw new HttpException(
          'Usted no puede hacer eso',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    //lo mismo para productos
    if (user && data.type === ImageTypes.product) {
      const myProduct = await getRepository(ProductEntity)
        .createQueryBuilder('product')
        .leftJoin('product.brand', 'brand')
        .leftJoin('brand.house', 'brand.house')
        .where('product.id = :parent AND brand.house.id = :houseId', {
          parent: data.parent,
          houseId: user.house.id,
        })
        .getOne();
      if (!myProduct) {
        fs.unlinkSync(file.path);
        throw new HttpException(
          'Usted no puede hacer eso',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    //obtener el parent y determinar tamaño segun
    let minWidth = 800;
    let minHeight = 600;

    switch (data.type) {
      case ImageTypes.house:
        house = await getRepository(HouseEntity).findOne(data.parent);
        minWidth = 800;
        minHeight = 600;
        break;
      case ImageTypes.logo:
        brandLogo = await getRepository(BrandEntity).findOne(data.parent);
        minWidth = 300;
        minHeight = 300;
        //si ya existe un logo anterior, eliminarlo
        const logoExistente = await getRepository(ImageEntity)
          .createQueryBuilder('image')
          .leftJoin('image.brandlogo', 'brandlogo')
          .where('image.brandlogo.id=:brandId', { brandId: data.parent })
          .getOne();

        if (logoExistente) {
          //TODO: borrar el archivo anterior
          await getRepository(ImageEntity).delete(logoExistente.id);
        }
        break;
      case ImageTypes.brand:
        brand = await getRepository(BrandEntity).findOne(data.parent);
        minWidth = 800;
        minHeight = 600;
        break;
      case ImageTypes.product:
        product = await getRepository(ProductEntity).findOne(data.parent);
        minWidth = 800;
        minHeight = 600;
        break;
      case ImageTypes.master:
        master = await getRepository(MasterEntity).findOne(data.parent);
        minWidth = 600;
        minHeight = 800;
        break;
      case ImageTypes.region:
        region = await getRepository(RegionEntity).findOne(data.parent);
        minWidth = 800;
        minHeight = 600;
        break;
      case ImageTypes.agave:
        agave = await getRepository(AgaveEntity).findOne(data.parent);
        minWidth = 800;
        minHeight = 600;
        break;
      case ImageTypes.processe:
        processe = await getRepository(ProcesseEntity).findOne(data.parent);
        minWidth = 800;
        minHeight = 600;
        break;
      case ImageTypes.productTasting:
        productTasting = await getRepository(ProductTastingsEntity).findOne(
          data.parent,
        );
        minWidth = 600;
        minHeight = 800;
        break;
      default:
        break;
    }

    // verificar si la imagen es del tamaño deseado (directo con sharp)
    const image = await sharp(file.path).metadata();
    if (
      data.type !== ImageTypes.productTasting &&
      (image.width < minWidth || image.height < minHeight)
    ) {
      fs.unlinkSync(file.path);
      throw new HttpException(
        `La imagen no cumple los requerimientos de tamaño, (${minWidth}x${minHeight})`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      !house &&
      !product &&
      !brand &&
      !master &&
      !brandLogo &&
      !region &&
      !agave &&
      !processe &&
      !productTasting
    ) {
      fs.unlinkSync(file.path);
      throw new HttpException(
        'Las imagenes deben llevar una entidad.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newImage: ImageEntity = new ImageEntity(
      undefined,
      undefined,
      data.title,
      data.description,
      file.destination,
      file.encoding,
      file.fieldname,
      file.filename,
      file.mimetype,
      file.originalname,
      file.path,
      file.size,
      true,
      house,
      brand,
      product,
      master,
      brandLogo,
      region,
      agave,
      processe,
      productTasting,
    );

    const createdImage = await getRepository(ImageEntity).save(newImage);

    //guardar el archivo final despues del resize, con el uuid de la imagen
    const finalFilename = createdImage.uuid + '.jpg';

    await sharp(file.path)
      .resize({
        width: minWidth,
        height: minHeight,
        fit: sharp.fit.cover,
        position: 'centre',
      })
      .toFile(file.destination + finalFilename);

    //eliminar el original subido
    fs.unlinkSync(file.path);

    return createdImage;
  }
}
