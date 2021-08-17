import { createUserDTO } from '@mezcal/modules/admin/users/model/createUser.dto';
/**
 * usuario unico a crear en el sistema, se crea en app service con password
 * default de .env
 */
export const users: createUserDTO[] = [
  {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'super@dominio.com',
    password: '',
  },
];
