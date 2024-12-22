---
title: "Broken Access Control: Una de las vulnerabilidades más comunes y Peligrosas"
description: "El Broken Access Control es una de las vulnerabilidades más comunes y peligrosas según OWASP. Descubre cómo ocurre, sus riesgos y cómo proteger tus aplicaciones."
date: 2024-11-23
pubDate: 2024-11-23
image: /image/broken-access-control/lock.jpg
categories:
  - Vulnerability
  - Blog
tags:
  - Broken access control
  - OWASP
---


## Índice
- [Índice](#índice)
- [Introducción](#introducción)
- [¿Qué es?](#qué-es)
- [¿Por qué es tan peligroso y común?](#por-qué-es-tan-peligroso-y-común)
- [Solución](#solución)
- [Conclusión](#conclusión)

## Introducción

El Broken Access Control es la segunda vulnerabilidad más común según el OWASP Top 10. En este post se explicará qué es, por qué es tan común y su fácil solución.

## ¿Qué es?

Las políticas de control de acceso dictan lo que pueden y no hacer los usuarios según su rol y nivel de acceso. Así el Broken Access Control, es burlar estas políticas de control de acceso por culpa de una mala implementación de estos.

Un ejemplo sería el siguiente. El escenario es una página web en la cuál hay un panel de administrador al cual solo podrían acceder un usuario de tal rol. El programador al definir la ruta, especificó que el usuario deberá de estar logueado para poder acceder pero se le olvidó definir que solo los usuarios administradores puedan acceder. El resultado es que si eres un usuario cualquiera y te diriges a la ruta definida `/admin`, podrás ver el panel de administrador.

## ¿Por qué es tan peligroso y común?

Como se pudo observar en el ejemplo anterior, la criticidad de esta vulnerabilidad es alta ya que un usuario de pocos privilegios o incluso nulos puede obtener información o realizar acciones indeseadas puediendo ser fatal para la aplicación o incluso para el negocio.

Otro problema asociado a esta vulnerabilidad es la falta de doble verificación en el frontend y en el backend. Un ejemplo de esto es que en el frontend no aparece en la _navbar_ la opción de _Panel de adminstración_ para redireccionarte a `/admin`, pero el backend no verifica el rol del usuario. Por lo tanto puedes acceder directamente a la ruta si la conoces.

En el mundo real se puede observar esto en el típico botón que se desactiva si no se cumplen las condiciones de un formulario o como ya hemos dicho anteriormente, por tener un rol inadecuado. Si el backend no confirma quien está pulsando el botón podemos simplemente modificar el frontend con herramientas tales como el famoso _Insepccionar elemento_ para activar el botón y pulsarlo:

El código del botón sería el siguiente:

```html
<button disable>Acceder al panel de administrador</button>
```

Lo que deberíamos de hacer es simplemente eliminar el atributo `disable` y pulsar el botón.

Estos tipos de errores son comunes ya que un simple despiste del programador a la hora de definir los permisos de la aplicación la hace vulnerable. Esto ocurre con frecuencia en aplicaciones desarrolladas apresuradamente, ya que al priorizar la velocidad suelen cometerse descuidos de este tipo.

## Solución

La solución a este problema es bastante sencilla: se trata de asegurarte de que todos los permisos de la aplicación estén correctamente definidos y de verificar que no falte ninguno. La mejor práctica es otorgar a los usuarios solo los permisos estrictamente necesarios, ya que, aunque ciertos datos puedan parecer inofensivos, podrían ser aprovechados de manera inesperada, lo que podría dar lugar a vulnerabilidades adicionales.

## Conclusión

En resumen, el Broken Access Control es una vulnerabilidad crítica y común que puede comprometer la seguridad de una aplicación. La solución radica en definir correctamente los permisos, validar tanto en el frontend como en el backend y aplicar el principio de mínima concesión de privilegios. Así se puede reducir el riesgo de accesos no autorizados y proteger la integridad de la aplicación y los datos.
