/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ImagesService } from '@mezcal/common/images/images.service';
import {
  Controller,
  Response,
  Get,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { existsSync } from 'fs';

/**
 * Controlador de avatares publico
 */

@ApiBearerAuth()
@ApiTags('browse')
@Controller('browse')
export class BrowseAvatarController {
  /**
   * @ignore
   */
  constructor(private readonly imagesService: ImagesService) {}
  private readonly filesRoute = './uploads/user'; //TODO: deberia venir de config

  /**
   * Ver imagen de usuario por uuid
   * @param req
   * @param res
   * @param uuid uuid del usuario
   */
  @Get('avatar/:uuid')
  serveAvatar(@Param('uuid') uuid: string, @Response() res): void {
    const image = `${uuid}.jpg`;
    const filesRoute = './uploads/user';
    if (existsSync(`${filesRoute}/${uuid}.jpg`)) {
      return res.sendFile(image, { root: `${filesRoute}` });
    }
    return res.sendFile('profile.jpg', {
      root: `${__dirname}/../../../assets`,
    });
  }

  /**
   * Obtener una imagen
   *
   * @param uuid uuid de la imagen
   * @param imageType tipo de imagen
   */
  @Get('image/:uuid')
  async get(@Param('uuid') uuid: string, @Response() res) {
    const image = await this.imagesService.get(uuid);

    if (!image) {
      throw new HttpException(
        'La imagen no se encuentra',
        HttpStatus.NOT_FOUND,
      );
    }

    return res.sendFile(image, { root: `./` });
  }
}
