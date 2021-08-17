import { MezcalTypeEntity } from './model/mezcalType.entity';

export const MezcalTypesToCreate: MezcalTypeEntity[] = [
  {
    nombre: 'Blanco o Joven',
    descripcion:
      'Mezcal incoloro y translucido que no es sujeto a ningún tipo de proceso posterior',
  },
  {
    nombre: 'Madurado en Vidrio',
    descripcion:
      'Mezcal estabilizado en recipiente de vidrio más de 12 meses, bajo tierra o en un espacio con variaciones mínimas de luminosidad, temperatura y humedad.',
  },
  {
    nombre: 'Reposado',
    descripcion:
      'Mezcal que debe permanecer entre 2 y 12 meses en recipientes de madera que garanticen su inocuidad, sin restricción de tamaño, forma, y capacidad en L, en un espacio con variaciones mínimas de luminosidad, temperatura y humedad.',
  },
  {
    nombre: 'Añejo',
    descripcion:
      'Mezcal que debe permanecer más de 12 meses en recipientes de madera que garanticen su inocuidad de capacidades menores a 1000 L, en un espacio con variaciones mínimas de luminosidad, temperatura y humedad.',
  },
  {
    nombre: 'Abocado con',
    descripcion:
      'Mezcal al que se debe incorporar directamente ingredientes para adicionar sabores, tales como gusano de maguey, damiana, limón, miel, naranja, mango, entre otros, siempre que estén autorizados por el Acuerdo correspondiente de la Secretaría de Salud (Ver 2.10), así como en la NOM-142-SSA1/SCFI-2014 (Ver 2.2).',
  },
  {
    nombre: 'Destilado con',
    descripcion:
      'Mezcal que debe destilarse con ingredientes para incorporar sabores, tales como pechuga de pavo o pollo, conejo, mole, ciruelas, entre otros, en términos de la Norma Oficial Mexicana.',
  },
];
