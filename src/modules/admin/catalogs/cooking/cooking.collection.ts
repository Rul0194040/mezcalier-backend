import { CookingEntity } from './cooking.entity';

export const CookingsToCreate: CookingEntity[] = [
  {
    //pertenece a proceso Mezcal
    nombre: 'Horno de pozo',
    descripcion:
      'cocimiento de cabezas o jugos de maguey o agave en hornos de pozo, mampostería o autoclave',
  }, //1
  {
    //pertenece a proceso Artesanal
    nombre: 'Horno elevado de mampostería',
    descripcion: 'Horno elevado de mampostería',
  }, //2
  {
    //pertenece a proceso Ancestral
    nombre: 'Horno de mampostería',
    descripcion: 'Horno de mampostería',
  }, //3
  {
    //pertenece a proceso Ancestral
    nombre: 'Autoclave',
    descripcion: 'Autoclave',
  }, //4
];
