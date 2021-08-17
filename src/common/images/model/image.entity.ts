import { ProcesseEntity } from '@mezcal/modules/admin/catalogs/processes/model/processe.entity';
import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { ProductEntity } from '@mezcal/modules/product.entity';
import { BrandEntity } from '@mezcal/modules/brand.entity';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { MasterEntity } from '@mezcal/modules/owner/masters/model/master.entity';
import { ProductTastingsEntity } from '../../../modules/browser/models/productTastings.entity';
import { RegionEntity } from '../../../modules/admin/catalogs/regions/model/region.entity';
import { AgaveEntity } from '../../../modules/admin/catalogs/agaves/model/agave.entity';

/**
 * @ignore
 */
@Entity('images')
export class ImageEntity extends CommonEntity {
  @Column({
    name: 'title',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  title: string;
  @Column({
    name: 'description',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  description: string;
  @Column({
    name: 'fieldname',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  fieldname: string;
  @Column({
    name: 'originalname',
    type: 'varchar',
    length: 150,
  })
  originalname: string;
  @Column({
    name: 'encoding',
    type: 'varchar',
    length: 150,
  })
  encoding: string;
  @Column({
    name: 'mimetype',
    type: 'varchar',
    length: 150,
  })
  mimetype: string;
  @Column({
    name: 'destination',
    type: 'varchar',
    length: 150,
  })
  destination: string;
  @Column({
    name: 'filename',
    type: 'varchar',
    length: 150,
  })
  filename: string;
  @Column({
    name: 'path',
    type: 'text',
  })
  path: string;
  @Column({
    name: 'size',
    type: 'int',
    nullable: false,
  })
  size: number;

  @ManyToOne(() => ProductEntity, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product?: ProductEntity;
  @Column({
    type: 'int',
    nullable: true,
  })
  productId?: number;

  @ManyToOne(() => HouseEntity, (house) => house.images, {
    onDelete: 'CASCADE',
  })
  house?: HouseEntity;
  @Column({
    type: 'int',
    nullable: true,
  })
  houseId?: number;

  @OneToOne(() => BrandEntity, (brand) => brand.logo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  brandlogo: BrandEntity;

  @ManyToOne(() => BrandEntity, (brand) => brand.images, {
    onDelete: 'CASCADE',
  })
  brand?: BrandEntity;
  @Column({
    type: 'int',
    nullable: true,
  })
  brandId?: number;

  @ManyToOne(() => MasterEntity, (master) => master.images, {
    onDelete: 'CASCADE',
  })
  master?: MasterEntity;
  @Column({
    type: 'int',
    nullable: true,
  })
  masterId?: number;

  @ManyToOne(() => RegionEntity, (region) => region.images, {
    onDelete: 'CASCADE',
  })
  region?: RegionEntity;
  @Column({
    type: 'int',
    nullable: true,
  })
  regionId?: number;

  @ManyToOne(() => AgaveEntity, (agave) => agave.images, {
    onDelete: 'CASCADE',
  })
  agave?: AgaveEntity;
  @Column({
    type: 'int',
    nullable: true,
  })
  agaveId?: number;

  @ManyToOne(() => ProcesseEntity, (processe) => processe.images, {
    onDelete: 'CASCADE',
  })
  processe?: ProcesseEntity;

  @ManyToOne(
    () => ProductTastingsEntity,
    (productTasting) => productTasting.images,
    {
      onDelete: 'CASCADE',
    },
  )
  productTasting?: ProductTastingsEntity;

  constructor(
    id: number,
    uuid: string,
    title: string,
    description: string,
    destination: string,
    encoding: string,
    fieldname: string,
    filename: string,
    mimetype: string,
    originalname: string,
    path: string,
    size: number,
    active?: boolean,
    house?: HouseEntity,
    brand?: BrandEntity,
    product?: ProductEntity,
    master?: MasterEntity,
    brandlogo?: BrandEntity,
    region?: RegionEntity,
    agave?: AgaveEntity,
    processe?: ProcesseEntity,
    productTasting?: ProductTastingsEntity,
  ) {
    super();
    this.id = id;
    this.uuid = uuid;
    this.title = title;
    this.description = description;
    this.destination = destination;
    this.encoding = encoding;
    this.fieldname = fieldname;
    this.filename = filename;
    this.mimetype = mimetype;
    this.originalname = originalname;
    this.path = path;
    this.size = size;
    this.house = house;
    this.brand = brand;
    this.product = product;
    this.active = active;
    this.master = master;
    this.brandlogo = brandlogo;
    this.region = region;
    this.agave = agave;
    this.processe = processe;
    this.productTasting = productTasting;
  }
}
