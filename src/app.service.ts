import { Injectable } from '@nestjs/common';
import { ProfilesService } from '@mezcal/modules/admin/profiles/profiles.service';
import { UsersService } from '@mezcal/modules/admin/users/users.service';
import { MyLogger } from '@mezcal/common/services/logger.service';
import { RulesService } from '@mezcal/modules/admin/rules/rules.service';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { users as requiredUsers } from '@mezcal/modules/admin/users/users.collection';
import { profiles as requiredProfiles } from '@mezcal/modules/admin/profiles/profiles.collection';
import { RuleDTO } from '@mezcal/modules/admin/rules/model/rule.dto';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys } from '@mezcal/common/enum/configkeys.enum';
import { RuleEntity } from '@mezcal/modules/admin/rules/model/rule.entity';
import { ProfileEntity } from '@mezcal/modules/admin/profiles/model/profile.entity';
import { ProfileDTO } from '@mezcal/modules/admin/profiles/model/profile.dto';
import { createUserDTO } from '@mezcal/modules/admin/users/model/createUser.dto';
import { ProfileTypes } from './modules/admin/profiles/model/profiles.enum';
/**
 * Sevicio de app
 */
@Injectable()
export class AppService {
  /**
   * Constructor!
   *
   * @param {ProfilesService} _profiles
   * @param _users
   * @param _logger
   * @param _rules
   */
  constructor(
    private readonly _profiles: ProfilesService,
    private readonly _users: UsersService,
    private readonly _logger: MyLogger,
    private readonly _rules: RulesService,
    private readonly _configService: ConfigService,
  ) {}

  /**
   * Intenta inicializar los registros necesarios en las tablas de
   * users, profiles, rules
   */
  async initDatabase(): Promise<void> {
    //verificacion de profiles
    for (const profile of requiredProfiles) {
      //crear profile!
      await this.createProfile(profile);
    }

    if (this._configService.get<string>(ConfigKeys.CREATE_USERS)) {
      this._logger.info('Verifying users... ');
      const createdUsers = await this.createUsers(requiredUsers);
      this._logger.info('Users verification succeded.');
      for (const user of createdUsers) {
        this._logger.info('User ready: ' + user.email);
      }
    }
  }

  /**
   * Crear un profile si no existe.
   * @param {ProfileDTO} profile
   */
  private async createProfile(profile: ProfileDTO): Promise<ProfileEntity> {
    const profileFound: ProfileEntity = await this._profiles.getByName(
      profile.name,
    );
    if (profileFound) {
      return profileFound;
    }
    const createdRules: RuleEntity[] = [];
    //crear las rules para este perfil...
    if (profile.rules && profile.rules.length) {
      for (const rule of profile.rules) {
        //verificar que exista, aqui nos importa el value, no el name
        if (rule.value && rule.name) {
          const theRule = await this.createRule(rule);
          createdRules.push(theRule);
        }
      }
    }
    this._logger.info(`Creating profile "${profile.name}"...`);
    //crear el profile con sus reglas!
    return this._profiles.create({
      name: profile.name,
      rules: createdRules,
    });
  }

  /**
   * Crea una rule si no existe
   * @param rule
   */
  private async createRule(rule: RuleDTO): Promise<RuleEntity> {
    const ruleFound: RuleEntity = await this._rules.getByValue(rule.value);
    if (ruleFound) {
      return ruleFound;
    }

    return await this._rules.create(rule);
  }

  /**
   * Crea los usuarios que debe llevar el sistema
   * @param requiredUsers
   */

  private async createUsers(requiredUsers: createUserDTO[]) {
    const users: UserEntity[] = [];
    for (const user of requiredUsers) {
      const userFound: UserEntity = await this._users.getByEmail(user.email);

      if (!userFound) {
        this._logger.info(`Creating user "${user.email}"...`);
        user.password = this._configService.get<string>(
          ConfigKeys.FIRST_PASSWORD,
        );
        try {
          //los unicos usuarios que creamos seran superadmin
          const superProfile = await this._profiles.getByName(
            ProfileTypes.SUPER,
          );
          //crear al superadmin como principal
          const createdUser = await this._users.create(
            user,
            superProfile,
            undefined,
            true,
          );
          users.push(createdUser);
        } catch (error) {
          throw error;
        }
      } else {
        users.push(userFound);
      }
    }
    return users;
  }
}
