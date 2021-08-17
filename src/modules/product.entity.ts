import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { BrandEntity } from '@mezcal/modules/brand.entity';
import { RegionEntity } from '@mezcal/modules/admin/catalogs/regions/model/region.entity';
import { ProcesseEntity } from '@mezcal/modules/admin/catalogs/processes/model/processe.entity';
import { AgaveEntity } from '@mezcal/modules/admin/catalogs/agaves/model/agave.entity';
import { FlavorEntity } from '@mezcal/modules/admin/catalogs/flavors/model/flavor.entity';
import { CommonEntity } from '@mezcal/common/commonEntity.abstract';
import { ShopEntity } from '@mezcal/modules/owner/shops/model/shop.entity';
import { MezcalTypeEntity } from '@mezcal/modules/admin/catalogs/mezcalTypes/model/mezcalType.entity';
import { ImageEntity } from '@mezcal/common/images/model/image.entity';
import { ProductCommentsEntity } from '@mezcal/modules/browser/models/productComments.entity';
import { ProductFavoritesEntity } from '@mezcal/modules/browser/models/productFavorites.entity';
import { ProductLikesEntity } from '@mezcal/modules/browser/models/productLikes.entity';
import { MasterEntity } from './owner/masters/model/master.entity';
import { CookingEntity } from './admin/catalogs/cooking/cooking.entity';
import { DistillingEntity } from './admin/catalogs/distilling/distilling.entity';
import { FermentingEntity } from './admin/catalogs/fermenting/fermenting.entity';
import { MillingEntity } from './admin/catalogs/milling/milling.entity';

/**
 * @ignore
 */
@Entity('products')
export class ProductEntity extends CommonEntity {
  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  nombre: string;

  @Column({
    name: 'descripcion',
    type: 'text',
    nullable: true,
  })
  descripcion: string;

  @Column({
    name: 'html',
    type: 'text',
    nullable: true,
  })
  html: string;

  @Column({
    name: 'score',
    unique: false,
    type: 'float',
    nullable: true,
  })
  score: number;

  @Column({
    name: 'rating',
    unique: false,
    type: 'float',
    default: 0,
    nullable: false,
  })
  rating?: number;

  @Column({
    name: 'price',
    unique: false,
    type: 'float',
    nullable: true,
  })
  price: number;

  @Column({
    name: 'likes',
    type: 'int',
    default: 0,
  })
  likes: number;

  @Column({
    name: 'colorAspect',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  colorAspect?: string;

  @Column({
    name: 'agingMaterial',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  agingMaterial?: string;

  @Column({
    name: 'agingTime',
    type: 'int',
    default: 0,
  })
  agingTime?: number;

  @Column({
    name: 'alcoholVolume',
    type: 'int',
    default: 0,
  })
  alcoholVolume?: number;

  @Column({
    name: 'distillingsNumber',
    type: 'int',
    default: 0,
  })
  distillingsNumber?: number;

  @Column({
    name: 'ltProduced',
    type: 'int',
    default: 0,
  })
  ltProduced?: number;

  //un producto tiene una marca
  @ManyToOne(() => BrandEntity, (brand) => brand.products, { nullable: false })
  brand: BrandEntity;

  //uno o varios productos tiene un maestro mezcalero
  @ManyToOne(() => MasterEntity, (master) => master.products, {
    nullable: true,
  })
  master: MasterEntity;

  @Column({ type: 'int' })
  brandId: number;

  //uno o varios productos tienen una región
  @ManyToOne(
    () => RegionEntity,
    (region) => region.products,
    //{ nullable: false },
  )
  region: RegionEntity;
  @Column({ type: 'int' })
  regionId: number;

  //uno o varios productos son de un tipo de mezcal
  @ManyToOne(() => MezcalTypeEntity, (mezcalType) => mezcalType.products, {
    nullable: false,
  })
  mezcalType: MezcalTypeEntity;

  @Column({ type: 'int' })
  mezcalTypeId: number;

  //uno o varios productos tienen un o varios procesos de elaboración
  @ManyToMany(() => ProcesseEntity, (processe) => processe.products)
  @JoinTable()
  processes: ProcesseEntity[];

  //uno o varios productos estan a la venta en varias tiendas
  @ManyToMany(() => ShopEntity, (shop) => shop.products)
  @JoinTable()
  shops: ShopEntity[];

  @ManyToMany(() => AgaveEntity, (agave) => agave.products)
  @JoinTable()
  agaves: AgaveEntity[];

  @Column({
    name: 'organolepticas',
    type: 'json',
    nullable: true,
  })
  organolepticas?: string[];

  @ManyToMany(() => FlavorEntity, (flavor) => flavor.products)
  @JoinTable()
  flavors: FlavorEntity[];

  @ManyToMany(() => FlavorEntity, (flavor) => flavor.productsAromas, {
    nullable: true,
  })
  @JoinTable()
  aromas?: FlavorEntity[];

  @OneToMany(() => ImageEntity, (image) => image.product)
  images?: ImageEntity[];

  @OneToMany(() => ProductCommentsEntity, (comment) => comment.product, {
    onDelete: 'CASCADE',
  })
  comments?: ProductCommentsEntity[];

  @OneToMany(() => ProductLikesEntity, (like) => like.product, {
    onDelete: 'CASCADE',
  })
  userLikes?: ProductLikesEntity[];

  @OneToMany(() => ProductFavoritesEntity, (fave) => fave.product, {
    onDelete: 'CASCADE',
  })
  userFaves?: ProductFavoritesEntity[];

  @ManyToOne(() => CookingEntity, (cooking) => cooking.products, {
    nullable: true,
  })
  cooking?: CookingEntity;

  @ManyToOne(() => MillingEntity, (milling) => milling.products, {
    nullable: true,
  })
  milling?: MillingEntity;

  @ManyToOne(() => DistillingEntity, (distilling) => distilling.products, {
    nullable: true,
  })
  distilling?: DistillingEntity;

  @ManyToOne(() => FermentingEntity, (fermenting) => fermenting.products, {
    nullable: true,
  })
  fermenting?: FermentingEntity;

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    descripcion: string,
    html: string,
    active: boolean,
    brand: BrandEntity,
    mezcalType: MezcalTypeEntity,
    price: number,
    score?: number,
    rating?: number,
    processes?: ProcesseEntity[],
    agaves?: AgaveEntity[],
    flavors?: FlavorEntity[],
    shops?: ShopEntity[],
    region?: RegionEntity,
    master?: MasterEntity,
  ) {
    super();
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.active = active;
    this.brand = brand;
    this.html = html;
    this.mezcalType = mezcalType;
    this.rating = rating;
    this.price = price;
    this.score = score;
    this.processes = processes;
    this.agaves = agaves;
    this.flavors = flavors;
    this.shops = shops;
    this.region = region;
    this.master = master;
  }
}
