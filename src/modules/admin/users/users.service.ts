import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { ConfigKeys } from '@mezcal/common/enum/configkeys.enum';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { compare } from 'bcryptjs';
import {
  PaginationPrimeNG,
  PaginationPrimeNgResult,
} from '@mezcal/common/dto/pagination/paginationprimeng.dto';
import { forIn } from 'lodash';
import * as moment from 'moment';
import {
  Like,
  Equal,
  Repository,
  DeleteResult,
  getRepository,
  UpdateResult,
} from 'typeorm';
import { genSalt, hash } from 'bcryptjs';
import { EmailSenderService } from '@mezcal/common/services/email-sender.service';
import { InjectRepository } from '@nestjs/typeorm';
import { createUserDTO } from '@mezcal/modules/admin/users/model/createUser.dto';
import { ProfileEntity } from '@mezcal/modules/admin/profiles/model/profile.entity';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { Profile } from 'passport';
import { RegTypes } from '@mezcal/common/enum/regTypes.enum';
import { ProfileTypes } from '../profiles/model/profiles.enum';
import { UpdateUserDTO } from './model/updateUser.dto';
import { JWTPayLoadDTO } from '@mezcal/auth/dto/jwtPayload.dto';
import { RuleEntity } from '../rules/model/rule.entity';
/**
 * Service para usuarios
 */
@Injectable()
export class UsersService {
  /**
   * @ignore
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    @InjectRepository(HouseEntity)
    private readonly houseRepository: Repository<HouseEntity>,
    private readonly _configService: ConfigService,
    private readonly _emailSenderService: EmailSenderService,
  ) {}

  /**
   * Retornar los usuarios de una casa
   */
  async getUsersByHouse(houseId: number) {
    return await getRepository(UserEntity)
      .createQueryBuilder('user')
      .leftJoin('user.house', 'house')
      .where('house.id = :houseId', { houseId })
      .getMany();
  }

  /**
   * Obtiene todos los usuarios de una casa
   *
   * @param id id de la casa
   */
  async getByHouseId(id): Promise<UserEntity[]> {
    return await getRepository(UserEntity)
      .createQueryBuilder('user')
      .leftJoin('user.house', 'house')
      .where('house.id = :id', { id })
      .getMany();
  }

  /**
   * Edita las rules de un usuario, verifica que las rules sean del perfil que le corresponde
   * al usuario y que sea un usuario de mi misma casa
   *
   * @param userId id del usuario al que se le editan las rules
   * @param rules nuevas rules del usuario
   * @param user el usuario en sesion
   */
  async updateUserRules(
    userId: number,
    rules: string[],
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    //obtener al usuario destino con su perfil y reglas.
    const destUser = await getRepository(UserEntity).findOne(userId, {
      relations: ['profile', 'profile.rules'],
    });

    //validar que el usuario que solicita sea principal, y que el destino sea secundario
    if ((user && !user.isMain) || destUser.isMain) {
      throw new HttpException(
        'Solo el usuario principal puede editar permisos de un secundario',
        HttpStatus.FORBIDDEN,
      );
    }

    //nos quedamos con las rules que nos enviaron y que tambien estan en la del perfil de ese usuario
    const finalRules = rules.filter((ruleAsked) => {
      return (
        destUser.profile.rules.findIndex((rule) => rule.value === ruleAsked) >
        -1
      );
    });

    //ponerle al usuario las reglas que vienen
    const query = getRepository(UserEntity)
      .createQueryBuilder('user')
      .leftJoin('user.house', 'house')
      .update()
      .where('id=:userId', { userId })
      .set({ rules: finalRules });
    //si viene user, limitar a solo usuarios de esa casa.
    if (user && user.house && user.house.id) {
      query.andWhere('house.id = :houseId', { houseId: user.house.id });
    }
    const updateResult = await query.execute();
    return updateResult;
  }

  /**
   * Resetea las rules de un usuario al default de su perfil, verifica que el
   * usuario sea de mi misma casa
   *
   * @param userId el id del usuario a resetear sus rules
   * @param user el usuario en sesion
   */
  async resetUserRules(
    userId: number,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    //obtener el usuario original con su profile-rules
    const origUser = await getRepository(UserEntity).findOne(userId, {
      relations: ['profile', 'profile.rules'],
    });

    //validar que el usuario que solicita sea principal, y que el destino sea secundario
    if ((user && !user.isMain) || origUser.isMain) {
      throw new HttpException(
        'Solo el usuario principal puede editar permisos de un secundario',
        HttpStatus.FORBIDDEN,
      );
    }

    //generar la bolsa original de rules
    const origRules = origUser.profile.rules.map((rule) => rule.value);

    //ponersela al usuario solicitado
    const query = getRepository(UserEntity)
      .createQueryBuilder('user')
      .leftJoin('user.house', 'house')
      .update()
      .set({ rules: origRules })
      .where('id=:userId', { userId });

    //si viene user, limitar a solo usuarios de esa casa.
    if (user && user.house && user.house.id) {
      query.andWhere('house.id = :houseId', { houseId: user.house.id });
    }

    return query.execute();
  }

  /**
   * Cambia el password de un usuario segun el email y el token recibido,
   * la fecha del token aun debe ser valida.
   *
   * @param email Email del usuario
   * @param theToken el token a validar
   * @param newPassword el nuevo password del usuario
   *
   * @returns {UpdateResult} el update result con affected=1 cuando si se hizo el cambio,
   * si no se hizo, es por que o el email no coincide, o el token no coincide o el token ya
   * expiró o ya fué usado.
   *
   */
  async changePasswordByToken(
    email: string,
    theToken: string,
    newPassword: string,
  ): Promise<UpdateResult> {
    const now = moment().format('YYYY-MM-DD H:m:s');
    console.log('now', now);
    const newHash = await hash(newPassword, await genSalt(10));
    const updateResult = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .update()
      .set({ password: newHash, passwordToken: '', passwordTokenDate: '' })
      .where('email=:email', { email })
      .andWhere('passwordToken = :theToken', { theToken })
      .andWhere('passwordTokenDate >= :now', { now })
      .execute();
    if (updateResult.affected) {
      this._emailSenderService.send({
        to: email,
        subject: 'Su contraseña ha sido cambiada ✔',
        template: 'changed-password',
        context: {
          siteName: this._configService.get<string>(ConfigKeys.SITE_NAME), //FIXME: cambiar a config!
        },
      });
    }
    return updateResult;
  }

  /**
   *
   * @param user usuario que cambia su contraseña
   * @param password contraseña anterior
   * @param newPassword contraseña nueva
   */
  async changePassword(
    user: JWTPayLoadDTO,
    password: string,
    newPassword: string,
  ): Promise<UpdateResult> {
    const theUser = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .where('user.email = :email', { email: user.email })
      .addSelect('user.password')
      .getOne();

    if (!(await compare(password, theUser.password))) {
      throw new HttpException(
        'La contraseña anterior no es válida.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newHash = await hash(newPassword, await genSalt(10));
    const updateResult = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .update()
      .set({ password: newHash, passwordToken: '', passwordTokenDate: '' })
      .where('id=:id', { id: user.id })
      .execute();
    if (updateResult.affected) {
      this._emailSenderService.send({
        to: user.email,
        subject: 'Su contraseña ha sido cambiada ✔',
        template: 'changed-password',
        context: {
          siteName: this._configService.get<string>(ConfigKeys.SITE_NAME), //FIXME: cambiar a config!
        },
      });
    }
    return updateResult;
  }

  /**
   * Inicia el proceso de cambio de password de un usuario.
   *
   * Esto genera un token, le pone fecha de expiracion al token de 10min
   * y envia un correo electronico al emal si es que existe.
   *
   * Siempre regresa un 200, sin importar si el usuario existe o no.
   *
   * @param email email del usuario a cambiar
   * @param profileType el tipo de perfil a filtrar
   */
  async startPasswordReset(email: string, profileType: ProfileTypes) {
    const user = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .select(['user'])
      .leftJoinAndSelect('user.profile', 'profile')
      .where('email=:email', { email })
      .andWhere('profile.name = :profileName', { profileName: profileType })
      .getOne();
    if (user) {
      //generar un token y fecha de token
      const token = uuidv4();
      const vencimiento = new Date(Date.now() + 1000 /*sec*/ * 60 /*min*/ * 10); //valido por 10 min
      //almacenar
      const result = await getRepository(UserEntity)
        .createQueryBuilder()
        .update()
        .set({ passwordToken: token, passwordTokenDate: vencimiento })
        .where('email=:theEmail', { theEmail: email })
        .execute();
      //enviar email
      if (result.affected) {
        this._emailSenderService.send({
          to: user.email,
          subject: 'Solicitud de cambio de contraseña ✔',
          template: 'change-password',
          context: {
            userName: user.firstName + ' ' + user.lastName,
            token: token,
            passwordUrl:
              this._configService.get<string>(ConfigKeys.BASE_URL) +
              '#/browse/user/change-password/' +
              token,
            siteName: this._configService.get<string>(ConfigKeys.SITE_NAME), //FIXME: cambiar a config!
          },
        });
      }
    }
    //pase lo que pase, regresamos ok
    throw new HttpException('OK', HttpStatus.OK);
  }

  /**
   * Actualizar la url de la imagen del usuario.
   *
   * @param {number} id del usuario
   * @param {string} picUrl ruta de la imagen del usuario
   *
   */
  async updateUserPicture(id: number, picUrl: string): Promise<UpdateResult> {
    return await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({ picUrl })
      .where('id=:id', { id: id })
      .execute();
  }
  /**
   * Retorna todos los usuarios
   */
  async get(): Promise<UserEntity[]> {
    return await this.usersRepository.find({
      relations: ['profile', 'profile.rules', 'house'],
    });
  }
  /**
   * Activa un usuario en la base de datos.
   *
   * @param id Id del usuario a activar
   */

  async updateStatus(id: number, active: boolean): Promise<UpdateResult> {
    return await getRepository(UserEntity)
      .createQueryBuilder()
      .update()
      .set({
        active: active,
      })
      .where('id=:id', { id: id })
      .execute();
  }

  /**
   * cambia el estado de un usuario que pertenece a una casa
   * @param id id de la casa a la que pertenece el usuario
   * @param active status a actualizar true / false
   */
  async updateStatusByHouse(
    id: number,
    active: boolean,
  ): Promise<UpdateResult> {
    return await getRepository(UserEntity)
      .createQueryBuilder()
      .update()
      .set({ active })
      .where('houseid=:id', { id })
      .execute();
  }

  /**
   * Retorna todos los usuarios de un perfil
   */
  async getByProfileType(profileType: ProfileTypes): Promise<UserEntity[]> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.rules', 'rules')
      .leftJoin('user.house', 'house')
      .select([
        'user',
        'profile.id',
        'profile.name',
        'rules.id',
        'rules.name',
        'rules.value',
        'house',
      ])
      .where('profile.name = :profileName', { profileName: profileType })
      .getMany();
  }
  /**
   * Obtiene un usuario por id
   * @param id del usuario a obtener
   */
  async getById(id: number, profileType?: ProfileTypes): Promise<UserEntity> {
    const queryUser = this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.rules', 'rules')
      .leftJoin('user.house', 'house')
      .select([
        'user',
        'profile.id',
        'profile.name',
        'rules.id',
        'rules.name',
        'rules.value',
        'house',
      ])
      .where('user.id = :theId', { theId: id });

    if (profileType) {
      queryUser.andWhere('profile.name = :profileName', {
        profileName: profileType,
      });
    }

    return await queryUser.getOne();
  }

  /**
   * Obtiene el nombre y apelldio de un usuario por id
   * @param id del usuario a obtener
   */
  async getNombreById(id: number): Promise<UserEntity> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .select(['user', 'user.firstName', 'user.lastName'])
      .where('user.id = :theId', { theId: id });

    return await query.getOne();
  }

  /**
   * Obtiene un usuario por su email
   *
   * @param email del usuario a obtener
   */
  async getByEmail(email: string): Promise<UserEntity> {
    const eluser = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .select(['user', 'house', 'profile', 'rules'])
      .where('user.email = :email', { email: email })
      .addSelect('user.password')
      .leftJoin('user.house', 'house')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.rules', 'rules')
      .getOne();

    return eluser;
  }
  /**
   * Crea un usuario en la base de datos
   *
   * @param user objeto a crear
   */
  async create(
    user: createUserDTO,
    theProfile: ProfileEntity,
    theHouse?: HouseEntity,
    isMain?: boolean,
  ): Promise<UserEntity> {
    const newHash = await hash(user.password, await genSalt(10));
    const origPass = user.password;
    user.password = newHash;

    const theRules = theProfile.rules.map((rule) => rule.value);

    const userToCreate = new UserEntity(
      undefined,
      undefined,
      user.email,
      user.firstName,
      user.lastName,
      user.password,
      user.active,
      theRules,
      theProfile,
      theHouse,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      isMain,
    );

    const newUser: UserEntity = await this.usersRepository.save(userToCreate);

    //EMAIL USER!
    if (this._configService.get<string>(ConfigKeys.SEND_USER_EMAILS)) {
      this._emailSenderService.send({
        to: newUser.email,
        subject: 'Tu nueva cuenta está lista ✔',
        template: 'welcome-user',
        context: {
          userName: newUser.firstName + ' ' + newUser.lastName,
          password: origPass,
          siteName: this._configService.get<string>(ConfigKeys.SITE_NAME), //FIXME: cambiar a config!
        },
      });
    }

    return newUser;
  }

  /**
   *  crea un nuevo usuario cuando se suscriben desde facebook
   * 
   * @param profile {
      provider: 'facebook',
      id: '10159246388256209',
      displayName: 'Erik Corona',
      name: { familyName: 'Corona', givenName: 'Erik', middleName: '' },
      gender: '',
      emails: [ { value: 'ecorona@live.com' } ],
      photos: [
        {
          value: 'https://graph.facebook.com/v4.0/10159246388256209/picture?type=large'
        }
      ],
      _raw: '{"id":"10159246388256209","name":"Erik Corona","last_name":"Corona","first_name":"Erik","email":"ecorona\\u0040live.com"}',
      _json: {
        id: '10159246388256209',
        name: 'Erik Corona',
        last_name: 'Corona',
        first_name: 'Erik',
        email: 'ecorona@live.com'
      }
    }
  */
  async findOrCreateFB(profile: Profile): Promise<UserEntity> {
    //buscamos el usuario de facebook
    let user = await getRepository(UserEntity).findOne({
      where: { facebookId: profile.id },
      relations: ['profile', 'profile.rules'],
    });

    if (!user) {
      //si no existe lo creamos

      //con el perfil public
      const publicProfile = await getRepository(ProfileEntity).findOne({
        where: { name: ProfileTypes.PUBLIC },
        relations: ['rules'],
      });
      //su foto de facebook
      const picUrl =
        profile.photos && profile.photos[0] && profile.photos[0].value
          ? profile.photos[0].value
          : '';
      //random password
      const origPass = await hash(
        Math.random().toString(36).slice(-12),
        await genSalt(10),
      );

      //entity
      user = await getRepository(UserEntity).save(
        new UserEntity(
          undefined,
          undefined,
          profile.emails[0].value,
          profile.name.givenName,
          profile.name.familyName,
          origPass,
          true,
          undefined,
          publicProfile,
          undefined,
          undefined,
          true,
          RegTypes.FACEBOOK,
          profile,
          profile.id,
          picUrl,
        ),
      );

      //lo retornamos con su profile.rules
      user.profile = publicProfile;

      //EMAIL USER!
      if (this._configService.get<string>(ConfigKeys.SEND_USER_EMAILS)) {
        this._emailSenderService.send({
          to: user.email,
          subject: 'Bienvenido a Mezcalier ✔',
          template: 'welcome-user',
          context: {
            userName: user.firstName + ' ' + user.lastName,
            password: origPass,
            siteName: this._configService.get<string>(ConfigKeys.SITE_NAME), //FIXME: cambiar a config!
          },
        });
      }
    }
    return user;
  }

  /**
   *  crea un nuevo usuario cuando se suscriben desde google
   * 
   * @param profile {
      iss: 'accounts.google.com',
      sub: '108643933227638512863',
      email: 'erik.corona.vasquez@gmail.com',
      email_verified: true,
      at_hash: 'FiQp5p-s0l6f5YYbi_UeIQ',
      name: 'Erik Corona',
      picture: 'https://lh3.googleusercontent.com/a-/AOh14GjID71bULk_AeGNhbqm_Fuy8rWMBLcjON92f432Jw=s96-c',
      given_name: 'Erik',
      family_name: 'Corona',
      locale: 'es',
      iat: 1609015134,
      exp: 1609018734,
      jti: '259f3d013afb6187fe8678b88ab3f285767ef777'
    }
  */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async findOrCreateGoogle(profile: any): Promise<UserEntity> {
    //buscamos el usuario de google
    let user = await getRepository(UserEntity).findOne({
      where: { googleId: profile.sub },
      relations: ['profile', 'profile.rules'],
    });

    if (!user) {
      //si no existe lo creamos

      //con el perfil public
      const publicProfile = await getRepository(ProfileEntity).findOne({
        where: { name: ProfileTypes.PUBLIC },
        relations: ['rules'],
      });
      //su foto de google
      const picUrl = profile.picture || '';
      //random password
      const origPass = await hash(
        Math.random().toString(36).slice(-12),
        await genSalt(10),
      );

      //entity
      user = await getRepository(UserEntity).save(
        new UserEntity(
          undefined,
          undefined,
          profile.email,
          profile.given_name,
          profile.family_name,
          origPass,
          true,
          undefined,
          publicProfile,
          undefined,
          undefined,
          profile.email_verified,
          RegTypes.GOOGLE,
          profile,
          undefined,
          picUrl,
          profile.sub,
        ),
      );

      //lo retornamos con su profile.rules
      user.profile = publicProfile;

      //EMAIL USER!
      if (this._configService.get<string>(ConfigKeys.SEND_USER_EMAILS)) {
        this._emailSenderService.send({
          to: user.email,
          subject: 'Bienvenido a Mezcalier ✔',
          template: 'welcome-user',
          context: {
            userName: user.firstName + ' ' + user.lastName,
            password: origPass,
            siteName: this._configService.get<string>(ConfigKeys.SITE_NAME), //FIXME: cambiar a config!
          },
        });
      }
    }
    return user;
  }

  /**
   * Actualiza un usuario en la base de datos
   *
   * @param id del usuario a actualizar
   * @param user objeto de actualizacion
   */
  async update(id: number, user: UpdateUserDTO): Promise<UpdateResult> {
    return await getRepository(UserEntity)
      .createQueryBuilder()
      .update()
      .set({
        firstName: user.firstName,
        lastName: user.lastName,
      })
      .where('id=:id', { id })
      .execute();
  }

  async updateUserSecundario(
    userId: number,
    owner: UpdateUserDTO,
    user: JWTPayLoadDTO,
  ): Promise<UpdateResult> {
    const destUser = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.house', 'house')
      .where('user.id=:userId', { userId })
      .andWhere('house.id=:house', { house: user.house.id })
      .getOne();

    if (!destUser) {
      throw new HttpException(
        'El usuario no se encontró en la casa',
        HttpStatus.NOT_FOUND,
      );
    }

    //validar que el usuario que solicita sea principal, y que el destino sea secundario
    if ((user && !user.isMain) || destUser.isMain) {
      throw new HttpException(
        'Solo el usuario principal puede editar un secundario',
        400,
      );
    }

    return await getRepository(UserEntity)
      .createQueryBuilder()
      .update()
      .set({
        firstName: owner.firstName,
        lastName: owner.lastName,
      })
      .where('id=:userId', { userId })
      .execute();
  }

  /**
   * Cambia el password del usuario
   *
   * @param id id del usuario
   * @param newPassword password nuevo para el usuario
   */
  async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const hashPass = await hash(newPassword, await genSalt(10));
    const userEntity: UserEntity = await this.usersRepository.findOne(id, {
      relations: ['profile', 'profile.rules', 'house'],
    });
    userEntity.password = hashPass;
    const success = await this.usersRepository
      .createQueryBuilder('user')
      .update()
      .set({ password: userEntity.password })
      .where('id=:id', { id })
      .execute();
    return success ? true : false;
    /*  await this.usersRepository
      .update(id, userEntity)
      .then(() => {
        response = true;
        console.log(userEntity.password);
      })
      .catch((e) => {
        console.log(e);
        response = false;
      }); */
  }

  /**
   * Retornar las reglas de un perfil
   *
   * @param type de que perfil
   */
  async rulesByProfile(type: ProfileTypes): Promise<RuleEntity[]> {
    const theProfile = await getRepository(ProfileEntity)
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.rules', 'rules')
      .where('profile.name = :type', { type })
      .getOne();

    return theProfile.rules;
  }

  /**
   * Borra un usuario
   *
   * @param id del usuario a borrar
   */
  async delete(id: number): Promise<DeleteResult> {
    return await this.usersRepository.delete(id);
  }
  /**
   * Obtiene la foto de un usuario
   * @param id del usuario del cual se requiere su foto
   */
  async getUserPicture(id: number): Promise<string> {
    //TODO encargarse que exista el thumb, o generarlo

    return `images/${id}/picture.jpg`;
  }

  /**
   * Pagionacion de usuarios
   *
   * @param options opciones de paginacion
   */
  async paginate(options: PaginationPrimeNG): Promise<PaginationPrimeNgResult> {
    const filters = {};
    forIn(options.filters, (value, key) => {
      if (value.matchMode === 'Like') {
        filters[key] = Like(`%${value.value}%`);
      }
      if (value.matchMode === 'Equal') {
        filters[key] = Equal(`${value.value}`);
      }
    });

    const data = await this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'active', 'profile'],
      relations: ['profile', 'profile.rules'],
      where: [filters],
      order: options.sort,
      skip: options.skip,
      take: options.take,
    });

    return {
      data,
      skip: options.skip,
      totalItems: await this.usersRepository.count({ where: [filters] }),
    };
  }
  /**
   * Establecimiento del token email del usuairo
   *
   * @param id id del usuario
   * @param token token a establecer
   */
  async setEmailToken(id: number, token: string): Promise<boolean> {
    let response: boolean;
    const userEntity: UserEntity = await this.usersRepository.findOne(id);
    userEntity.emailToken = token;
    this.usersRepository
      .update(id, userEntity)
      .then(() => {
        response = true;
      })
      .catch(() => {
        response = false;
      });
    return response;
  }

  /**
   * Establece el token de validacion de l usuario y le manda
   * un correo electronico con el token generado.
   *
   * @param id del usuario
   */
  async startEmailValidate(id: number): Promise<boolean> {
    //usuario
    const user: UserEntity = await this.usersRepository.findOne(id, {
      relations: ['profile', 'profile.rules', 'house'],
    });
    //generar token
    const token = (Math.random() * 1000000).toString();
    //actualizar usuario
    const result = await this.setEmailToken(id, token);

    if (!result) {
      return false;
    }

    //enviar email
    this._emailSenderService.send({
      to: this._configService.get<string>(ConfigKeys.SMTP_FROM_EMAIL),
      subject: 'Validación de correo electrónico ✔',
      template: 'validate-email',
      context: {
        user: user,
        token: token,
      },
    });

    return true;
  }
  /**
   * Valida el token del usuario
   * @param id id del usuario
   * @param token token a verificar
   */
  async emailValidate(id: number, token: string): Promise<boolean> {
    //usuario
    const user: UserEntity = await this.usersRepository.findOne(id, {
      relations: ['profile', 'profile.rules', 'house'],
    });
    let result = false;

    //actualizar usuario
    if (user.emailToken === token) {
      result = await this.validEmail(id);
    }

    return result;
  }
  /**
   * Establece en true validEmail y emailToken en ''
   * para el usuario con el id que se pase de parametro
   * @param id
   */
  async validEmail(id: number): Promise<boolean> {
    let response: boolean;
    const userEntity: UserEntity = await this.usersRepository.findOne(id);
    userEntity.validEmail = true;
    userEntity.emailToken = '';
    this.usersRepository
      .update(id, userEntity)
      .then(() => {
        response = true;
      })
      .catch(() => {
        response = false;
      });
    return response;
  }

  /**
   * Valida si ya ha sido registrado el email en un usuario
   *
   * @param email email del usuario a validar
   * @returns { ok: boolean; message: string } false si el correo ya ha sido registrado, true si esta disponible
   */
  async verificateUser(
    email: string,
  ): Promise<{ ok: boolean; message: string }> {
    const existeAdminEmail = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('email=:email', { email })
      .andWhere('profile.id=:profileId', { profileId: 2 })
      .getOne();
    const existeOwnerEmail = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('email=:email', { email })
      .andWhere('profile.id=:profileId', { profileId: 3 })
      .getOne();
    let message: any;
    if (existeAdminEmail || existeOwnerEmail)
      message = {
        ok: false,
        message: 'El email ya ha sido registrado en un usuario',
      };
    else
      message = {
        ok: true,
        message: 'El email aun no ha sido registrado en un usuario',
      };
    return message;
  }
}
