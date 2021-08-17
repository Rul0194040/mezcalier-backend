Cada que hay dependencias nuevas se tiene que generar la imagen nueva.

Esta imagen es usada por CI/CD para hacer las pruebas.

Para construir la imagen y actualizarla:

```bash

# login (si tienes activado MFA usa un token que tenga acceso de lectura y escritura al registro)
$ docker login registry.gitlab.com

# build
$ docker build -t registry.gitlab.com/mezcalier/mezcalier-back .
```

```bash
# upload to registry
$ docker push registry.gitlab.com/mezcalier/mezcalier-back
```
