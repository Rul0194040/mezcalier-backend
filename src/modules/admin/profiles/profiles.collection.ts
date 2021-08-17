import { ProfileDTO } from '@mezcal/modules/admin/profiles/model/profile.dto';
import { RuleEntity } from '@mezcal/modules/admin/rules/model/rule.entity';
import { ProfileTypes } from '@mezcal/modules/admin/profiles/model/profiles.enum';
/**
 * Rules para admin
 */
const adminRules: RuleEntity[] = [
  {
    name: 'Ver Usuario',
    description: 'Ver datos del mismo usuario',
    value: 'view:user',
  },
  {
    name: 'Modificar Usuario',
    description: 'Modificar sus propios datos',
    value: 'update:user',
  },
  {
    name: 'Ver Usuarios',
    description: 'Ver listado de usuarios',
    value: 'view:users',
  },
  {
    name: 'Crear Usuarios',
    description: 'Crear usuarios',
    value: 'create:users',
  },
  {
    name: 'Modificar Usuarios',
    description: 'Modificación de usuarios',
    value: 'update:users',
  },
  {
    name: 'Eliminar usuarios',
    description: 'Eliminación de usuarios',
    value: 'delete:users',
  },
  {
    name: 'Ver Perfiles',
    description: 'Ver listado de Perfiles',
    value: 'view:profiles',
  },
  {
    name: 'Crear Perfiles',
    description: 'Crear Perfiles',
    value: 'create:profiles',
  },
  {
    name: 'Modificar Perfiles',
    description: 'Modificación de Perfiles',
    value: 'update:profiles',
  },
  {
    name: 'Eliminar Perfiles',
    description: 'Eliminación de Perfiles',
    value: 'delete:profiles',
  },

  {
    name: 'Ver Permisos',
    description: 'Ver listado de Permisos',
    value: 'view:rules',
  },
  {
    name: 'Crear Permisos',
    description: 'Crear Permisos',
    value: 'create:rules',
  },
  {
    name: 'Modificar Permisos',
    description: 'Modificación de Permisos',
    value: 'update:rules',
  },
  {
    name: 'Eliminar Permisos',
    description: 'Eliminación de Permisos',
    value: 'delete:rules',
  },
  {
    name: 'Ver Actividades',
    description: 'Ver listado de Actividades',
    value: 'view:activities',
  },
  {
    name: 'Crear Actividades',
    description: 'Crear Actividades',
    value: 'create:activities',
  },
  {
    name: 'Modificar Actividades',
    description: 'Modificación de Actividades',
    value: 'update:activities',
  },
  {
    name: 'Eliminar Actividades',
    description: 'Eliminación de Actividades',
    value: 'delete:activities',
  },
  {
    name: 'Crear Membresías',
    description: 'Crear Membresías',
    value: 'create:memberships',
  },
  {
    name: 'Modificar Membresías',
    description: 'Modificación de Membresías',
    value: 'update:memberships',
  },
  {
    name: 'Eliminar Membresías',
    description: 'Eliminación de Membresías',
    value: 'delete:memberships',
  },
  {
    name: 'Crear Miembros',
    description: 'Crear Miembros',
    value: 'create:members',
  },
  {
    name: 'Modificar Status Miembros',
    description: 'Modificación de Status Miembros',
    value: 'updatestatus:members',
  },
  {
    name: 'Eliminar Miembros',
    description: 'Eliminación de Miembros',
    value: 'delete:members',
  },
  {
    name: 'Crear Tiendas',
    description: 'Crear tiendas',
    value: 'create:stores',
  },
  {
    name: 'Modificar Tiendas',
    description: 'Modificar tiendas',
    value: 'update:stores',
  },
  {
    name: 'Eliminar Tiendas',
    description: 'Eliminar tiendas',
    value: 'delete:stores',
  },
  {
    name: 'Ver Tiendas',
    description: 'Ver listado de Tiendas',
    value: 'view:stores',
  },
  {
    name: 'Crear Productos',
    description: 'Crear Productos',
    value: 'create:products',
  },
  {
    name: 'Modificar Productos',
    description: 'Modificar Productos',
    value: 'update:products',
  },
  {
    name: 'Eliminar Productos',
    description: 'Eliminar Productos',
    value: 'delete:products',
  },
  {
    name: 'Actualizar casas',
    description: 'Actualizar casas',
    value: 'update:houses',
  },
];
/**
 * Reglas para owner
 */
const ownerRules: RuleEntity[] = [
  //brands
  {
    name: 'Ver Marcas',
    description: 'Ver listado de marcas',
    value: 'view:brands',
  },
  {
    name: 'Actualizar Marcas',
    description: 'Actualizar listado de marcas',
    value: 'update:brands',
  },
  {
    name: 'Borrar Marcas',
    description: 'Borrar del listado de marcas',
    value: 'delete:brands',
  },
  {
    name: 'Borrar imagenes de las Marcas',
    description: 'Borrar del listado de marcas',
    value: 'delete:brands_image',
  },
  {
    name: 'Crear Marcas',
    description: 'Crear Marcas',
    value: 'create:brands',
  },
  {
    name: 'Subir imagenes a las Marcas',
    description: 'Subir imagenes a las Marcas',
    value: 'create:brands_image',
  },
  //houses
  {
    name: 'Borrar imagenes de la Casa',
    description: '',
    value: 'delete:houses_image',
  },
  {
    name: 'Crear imagenes en la Casa',
    description: '',
    value: 'create:houses_image',
  },
  {
    name: 'Ver información de la Casa',
    description: '',
    value: 'view:houses',
  },
  {
    name: 'Actualizar información de la Casa',
    description: '',
    value: 'update:houses',
  },
  // masters
  {
    name: 'Actualizar la información de los maestros',
    description: '',
    value: 'update:masters',
  },
  {
    name: 'Eliminar maestros',
    description: '',
    value: 'delete:masters',
  },
  {
    name: 'Eliminar imagenes de maestros',
    description: '',
    value: 'delete:masters_image',
  },
  {
    name: 'Ver información de los maestros',
    description: '',
    value: 'view:masters',
  },
  {
    name: 'Crear maestros',
    description: '',
    value: 'create:masters',
  },
  {
    name: 'Agregar imagen a maestros',
    description: '',
    value: 'create:masters_image',
  },

  // products
  {
    name: 'Crear un producto',
    description: '',
    value: 'create:products',
  },
  {
    name: 'Crear la imagen de un producto',
    description: '',
    value: 'create:products_image',
  },
  {
    name: 'Eliminar un producto',
    description: '',
    value: 'delete:products',
  },
  {
    name: 'Eliminar imagen de un producto',
    description: '',
    value: 'delete:products_image',
  },
  {
    name: 'Actualizar un producto',
    description: '',
    value: 'update:products',
  },
  {
    name: 'Ver la información de productos',
    description: '',
    value: 'view:products',
  },
  // shops
  {
    name: 'Crear una tienda',
    description: '',
    value: 'create:shops',
  },
  {
    name: 'Actualizar información de tiendas',
    description: '',
    value: 'update:shops',
  },
  {
    name: 'Eliminar tiendas',
    description: '',
    value: 'delete:shops',
  },
  {
    name: 'Ver información de las tiendas',
    description: '',
    value: 'view:shops',
  },
  {
    name: 'Autorizar/revocar comentarios',
    description: '',
    value: 'update:comments',
  },
];

/**
 * Perfiles en sistema
 */
export const profiles: ProfileDTO[] = [
  {
    id: null, //1
    name: ProfileTypes.SUPER,
  },
  {
    id: null, //2
    name: ProfileTypes.ADMIN,
    rules: adminRules,
  },
  {
    id: null, //3
    name: ProfileTypes.OWNER,
    rules: ownerRules,
  },
  {
    id: null, //4
    name: ProfileTypes.PUBLIC,
  },
];
