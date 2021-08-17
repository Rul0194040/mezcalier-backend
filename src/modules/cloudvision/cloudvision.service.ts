import { Injectable } from '@nestjs/common';
import {
  ProductSearchClient,
  ImageAnnotatorClient,
} from '@google-cloud/vision';
import { Storage } from '@google-cloud/storage';
import { readFileSync } from 'fs';
import * as protos from '@google-cloud/vision/build/protos/protos';

/**
 * Abstraccion de los metodos utilizados para el manejo de busqueda
 * por imagenes de google cloud vision.
 *
 * IMPORTANTE:
 *
 * Primero debemos tener en variables de entorno la ruta del archivo "llave"
 * obtenida segun las instrucciones:
 *
 * https://cloud.google.com/vision/product-search/docs/before-you-begin
 *
 * ENV: utiliza la variable GOOGLE_APPLICATION_CREDENTIALS la cual
 * debe apuntar a la ruta absoluta de un archivo json que provee
 * google como credenciales para el proyecto.
 *
 * Implementado según:
 *
 * https://cloud.google.com/vision/product-search/docs/tutorial
 *
 */
@Injectable()
export class CloudvisionService {
  private readonly client: ProductSearchClient = new ProductSearchClient();
  private readonly storage: Storage = new Storage();
  private readonly imageAnotator: ImageAnnotatorClient = new ImageAnnotatorClient();
  /**
   * Id del proyecto de google cloud
   */
  private readonly projectId = 'mezcalier'; //FIXME:deberia de venir de config o del json de google?
  /**
   * Ubicacion a utilizar
   */
  private readonly location = 'us-west1'; //FIXME:deberia de venir de config?
  /**
   * id del set de productos a usar
   */
  private readonly productSetId = 'mezcalier'; //FIXME:deberia de venir de config?
  /**
   * Nombre a establecer para el set.
   */
  private readonly productSetDisplayName = 'Mezcales del sistema'; //FIXME:deberia de venir de config?
  /**
   * categoria a usar para los productos.
   */
  private readonly productCategory = 'general-v1'; //FIXME:deberia de venir de config?
  /**
   * nombre del bucket en donde se almacenaran las imagenes,
   * ya debe existir en nuestros buckets
   */
  public readonly bucketName = 'mezcales'; //FIXME:deberia de venir de config?

  /**
   * Crea un conjunto de productos de google al cual le
   * podemos agregar productos.
   *
   * @param productSetId id del set de productos a crear
   * @param productSetDisplayName nombre descriptivo del set a crear
   */
  async createProductSet(
    productSetId = this.productSetId,
    productSetDisplayName = this.productSetDisplayName,
  ): Promise<protos.google.cloud.vision.v1.IProductSet> {
    const locationPath = this.client.locationPath(
      this.projectId,
      this.location,
    );

    const productSet = {
      displayName: productSetDisplayName,
    };

    const request = {
      parent: locationPath,
      productSet: productSet,
      productSetId: productSetId,
    };

    const [createdProductSet] = await this.client.createProductSet(request);
    return createdProductSet;
  }

  /**
   * Agrega un producto a google products
   *
   * @param productId Id del producto, aqui usamos el uuid de nuestro producto.
   * @param productDisplayName Nombre del producto a crear.
   * @param description Descripcion que se quiera dar al producto.
   */
  async createProduct(
    productId,
    productDisplayName,
    description?,
  ): Promise<protos.google.cloud.vision.v1.IProduct> {
    const locationPath = this.client.locationPath(
      this.projectId,
      this.location,
    );

    const product = {
      displayName: productDisplayName,
      productCategory: this.productCategory,
      description: description,
    };

    const request = {
      parent: locationPath,
      product: product,
      productId: productId,
    };

    const [createdProduct] = await this.client.createProduct(request);
    return createdProduct;
  }

  async deleteProduct(productId) {
    // Resource path that represents full path to the product.
    const productPath = this.client.productPath(
      this.projectId,
      this.location,
      productId,
    );
    await this.client.deleteProduct({ name: productPath });
  }

  /**
   * Genera un enlace (relacion) entre un producto y un grupo de productos.
   *
   * @param productId Id del producto a enlazar
   * @param productSetId Set de productos con el cual enlazar
   */
  async addProductToProductSet(
    productId,
    productSetId = this.productSetId,
  ): Promise<any> {
    const productPath = this.client.productPath(
      this.projectId,
      this.location,
      productId,
    );
    const productSetPath = this.client.productSetPath(
      this.projectId,
      this.location,
      productSetId,
    );

    const request = {
      name: productSetPath,
      product: productPath,
    };

    const result = await this.client.addProductToProductSet(request);
    return result;
  }

  /**
   * Sube un archivo a un bucket de google cloud para
   * poder usarlo como referencia de un producto.
   *
   * @param filename Nombre del archivo a subir
   * @param bucketName Nombre del contenedor del archivo en google.
   */
  async uploadFile(fileName, bucketName = this.bucketName): Promise<any> {
    return await this.storage.bucket(bucketName).upload(fileName, {
      gzip: false,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
  }

  async deleteFile(fileName, bucketName = this.bucketName) {
    return await this.storage.bucket(bucketName).file(fileName).delete();
  }

  /**
   * Referenciar una imagen en un contenedor de google con un
   * producto para su futura busqueda.
   *
   * @param productId Id del producto a referenciar.
   * @param referenceImageId Id de la imagen del producto a referenciar
   * @param gcsUri URI de la imagen en el contenedor de google: gs://<bucketName>/fileName
   */
  async createReferenceImage(
    productId,
    referenceImageId,
    gcsUri,
  ): Promise<protos.google.cloud.vision.v1.IReferenceImage> {
    const formattedParent = this.client.productPath(
      this.projectId,
      this.location,
      productId,
    );

    const referenceImage = {
      uri: gcsUri,
    };

    const request = {
      parent: formattedParent,
      referenceImage: referenceImage,
      referenceImageId: referenceImageId,
    };

    const [response] = await this.client.createReferenceImage(request);
    return response;
  }

  async deleteReferenceImage(productId, referenceImageId) {
    const formattedName = this.client.referenceImagePath(
      this.projectId,
      this.location,
      productId,
      referenceImageId,
    );

    const request = {
      name: formattedName,
    };

    return await this.client.deleteReferenceImage(request);
  }

  /**
   * Busca productos usando una imagen como referencia.
   *
   * @param filePath Ruta del archivo de referencia
   */
  async getSimilarProductsFile(
    filePath,
  ): Promise<protos.google.cloud.vision.v1.IBatchAnnotateImagesResponse> {
    const filter = '';
    const productSetPath = this.client.productSetPath(
      this.projectId,
      this.location,
      this.productSetId,
    );
    const imageContent = readFileSync(filePath, 'base64');
    const request: protos.google.cloud.vision.v1.IAnnotateImageRequest = {
      image: { content: imageContent.toString() },
      features: [{ type: 'PRODUCT_SEARCH' }],
      imageContext: {
        productSearchParams: {
          productSet: productSetPath,
          productCategories: [this.productCategory],
          filter: filter,
        },
      },
    };
    const [response] = await this.imageAnotator.batchAnnotateImages({
      requests: [request],
    });
    return response;
  }
}

/*const exampleResponse del metodo UploadFile = [
  {
    domain: {
      domain: null,
      _events: [Object],
      _eventsCount: 3,
      _maxListeners: undefined,
      members: [Array],
      __SENTRY__: [Object],
    },
    _eventsCount: 0,
    _maxListeners: undefined,
    metadata: {
      kind: 'storage#object',
      id: 'mezcales/1623e571-d418-4af2-9dcf-9410378f6f47.jpg/1617047863961315',
      selfLink:
        'https://www.googleapis.com/storage/v1/b/mezcales/o/1623e571-d418-4af2-9dcf-9410378f6f47.jpg',
      mediaLink:
        'https://storage.googleapis.com/download/storage/v1/b/mezcales/o/1623e571-d418-4af2-9dcf-9410378f6f47.jpg?generation=1617047863961315&alt=media',
      name: '1623e571-d418-4af2-9dcf-9410378f6f47.jpg',
      bucket: 'mezcales',
      generation: '1617047863961315',
      metageneration: '1',
      contentType: 'image/jpeg',
      storageClass: 'STANDARD',
      size: '14308',
      md5Hash: 'kcxrXdOb/+0hsCfbVOCx3A==',
      cacheControl: 'public, max-age=31536000',
      crc32c: 'H08WzQ==',
      etag: 'COPNkNyk1u8CEAE=',
      timeCreated: '2021-03-29T19:57:43.963Z',
      updated: '2021-03-29T19:57:43.963Z',
      timeStorageClassUpdated: '2021-03-29T19:57:43.963Z',
    },
    baseUrl: '/o',
    parent: {
      _maxListeners: undefined,
      metadata: {},
      baseUrl: '/b',
      id: 'mezcales',
      interceptors: [],
      pollIntervalMs: undefined,
      name: 'mezcales',
      userProject: undefined,
    },
    id: '1623e571-d418-4af2-9dcf-9410378f6f47.jpg',
    createMethod: undefined,
    methods: {
      delete: [Object],
      exists: [Object],
      get: [Object],
      getMetadata: [Object],
      setMetadata: [Object],
    },
    interceptors: [],
    pollIntervalMs: undefined,
    create: undefined,
    bucket: {
      _eventsCount: 0,
      _maxListeners: undefined,
      metadata: {},
      baseUrl: '/b',
      id: 'mezcales',
      methods: [Object],
      interceptors: [],
      pollIntervalMs: undefined,
      name: 'mezcales',
      userProject: undefined,
    },
    storage: {
      baseUrl: 'https://storage.googleapis.com/storage/v1',
      apiEndpoint: 'https://storage.googleapis.com',
      timeout: undefined,
      globalInterceptors: [],
      interceptors: [],
      projectId: '{{projectId}}',
      projectIdRequired: false,
      providedUserAgent: undefined,
    },
    kmsKeyName: undefined,
    userProject: undefined,
    name: '1623e571-d418-4af2-9dcf-9410378f6f47.jpg',
    acl: {
      owners: [Object],
      readers: [Object],
      writers: [Object],
      pathPrefix: '/acl',
    },
  },
  {
    kind: 'storage#object',
    id: 'mezcales/1623e571-d418-4af2-9dcf-9410378f6f47.jpg/1617047863961315',
    selfLink:
      'https://www.googleapis.com/storage/v1/b/mezcales/o/1623e571-d418-4af2-9dcf-9410378f6f47.jpg',
    mediaLink:
      'https://storage.googleapis.com/download/storage/v1/b/mezcales/o/1623e571-d418-4af2-9dcf-9410378f6f47.jpg?generation=1617047863961315&alt=media',
    name: '1623e571-d418-4af2-9dcf-9410378f6f47.jpg',
    bucket: 'mezcales',
    generation: '1617047863961315',
    metageneration: '1',
    contentType: 'image/jpeg',
    storageClass: 'STANDARD',
    size: '14308',
    md5Hash: 'kcxrXdOb/+0hsCfbVOCx3A==',
    cacheControl: 'public, max-age=31536000',
    crc32c: 'H08WzQ==',
    etag: 'COPNkNyk1u8CEAE=',
    timeCreated: '2021-03-29T19:57:43.963Z',
    updated: '2021-03-29T19:57:43.963Z',
    timeStorageClassUpdated: '2021-03-29T19:57:43.963Z',
  },
];
*/
