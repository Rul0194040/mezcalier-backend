import { ApiProperty } from '@nestjs/swagger';
/**
 * @ignore
 */
export class AgaveDTO {
  @ApiProperty()
  readonly id?: number; //opcional

  @ApiProperty()
  uuid?: string; //opcional

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  nombreCientifico?: string;

  @ApiProperty()
  nombresConocidos?: string[];

  @ApiProperty()
  html?: string;

  @ApiProperty()
  active?: boolean;

  @ApiProperty()
  distribucion?: string;

  @ApiProperty()
  comentarioTaxonomico?: string;

  @ApiProperty()
  habitat?: string;

  @ApiProperty()
  uso?: string;

  @ApiProperty()
  probabilidadExistencia?: string;

  constructor(
    id: number,
    uuid: string,
    nombre: string,
    descripcion: string,
    nombreCientifico: string,
    nombresConocidos: string[],
    html: string,
    active: boolean,
    distribucion: string,
    comentarioTaxonomico: string,
    habitat: string,
    uso: string,
    probabilidadExistencia: string,
  ) {
    this.id = id;
    this.uuid = uuid;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.nombreCientifico = nombreCientifico;
    this.nombresConocidos = nombresConocidos;
    this.html = html;
    this.active = active;
    this.distribucion = distribucion;
    this.comentarioTaxonomico = comentarioTaxonomico;
    this.habitat = habitat;
    this.uso = uso;
    this.probabilidadExistencia = probabilidadExistencia;
  }
}
