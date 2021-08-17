# RUN!

```bash

# dependencias
$ npm install

#levantar mysql con docker
$ ./start-mysql.sh

# primer migracion (inicial)
$ npm run mig:run

# vamonos!
$ npm run start:dev

# cada que se hagan cambios a los models, para implementar esos cambios a la base de datos
# hay que generar y ejecutar una nueva migracion para sincronizar los archivos de los modelo y la bd.

# nueva migracion
$ npm run mig:gen "mis-cambios"

# implementarla
$ npm run mig:run

#si algo no quedo bien, revertirla
$ npm run mig:rev

# DEV CYCLE! antes de hacer commit push verifica que pases las pruebas de ci
$ npm run precommit

# de manera individual las pruebas son:

# end to end
$ npm run test

# de covertura:

# docs
$ npm run doc:cov

# end to end
$ npm run test:e2e:cov

# para levantar la documentacion del api:
$ npm run doc
```

# Tiempos:

## Inicio: 27/Nov

### Primera Entrega: 2/Ene (Detallar para sacar tareas y casos)

- Cascaron: Usuarios/Casas/Marcas/Productos/Catalogos
- Funcionalidad: CRUDS

### Prototipo Funcional: 2/Mar (Detallar para sacar tareas y casos)

- Estrategia: Web First
- Los productos se pueden navegar y filtrar.
- Los clientes se pueden registrar y marcar favoritos tanto para casas/marcas/productos.

### Final: 2/Jun (Detallar para sacar tareas y casos)

- Toda la funcionalidad prometida
