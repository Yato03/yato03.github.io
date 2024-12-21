---
title: Password Reset Poisoning - Portswigger
description: "Laboratorio de Portswigger sobre el password reset poisoning"
date: 2024-04-17
pubDate: 2024-04-17
image: /image/portswigger-reset-password/teaser.png
categories:
  - PortSwigger
  - writeup
tags:
  - Host Header Attack
  - bscp
---

En este laboratorio de PortSwigger nuestro objetivo será cambiar la contraseña del usuario carlos burlando la funcionalidad de reseteo de contraseña.

Portswigger nos da un usuario para que probemos las funcionalidades (`wiener:peter`).

**Laboratorio**: [Basic password reset poisoning](https://portswigger.net/web-security/host-header/exploiting/password-reset-poisoning/lab-host-header-basic-password-reset-poisoning)

## Índice
- [Índice](#índice)
- [Funcionamiento normal del reseteo](#funcionamiento-normal-del-reseteo)
- [Robando el token](#robando-el-token)

<a id="funcionamiento-normal-del-reseteo"></a>
## Funcionamiento normal del reseteo

Antes de intentar hackearlo vamos a intentar entender el funcionamiento de cómo se resetea una contraseña para poder ver si encontramos alguna falla.

![Login](/image/portswigger-reset-password/funcionamiento1.png)

En el apartado de _My Account_ podemos ver un enlace que se llama _Forgot Password?_. 

![Forgot Password](/image/portswigger-reset-password/funcionamiento2.png)

Nos pide un nombre de usuario al cual resetear la contraseña. Para poder ver el funcionamiento completo ponemos el usuario `wiener`.

Nos avisará de que se ha enviado un email con link para resetar la contraseña. Si vamos al exploit server al apartado de _emails_ podremos verlo.

![Email](/image/portswigger-reset-password/funcionamiento3.png)

Si clickeamos, nos llevará a una página donde podremos cambiar la contraseña.

![Cambiar contraseña](/image/portswigger-reset-password/funcionamiento4.png)

Si nos fijamos en todo el proceso, nos podremos dar cuenta de que el factor clave para cambiar la contraseña es el token que se nos envía al correo. Si tuviesemos ese token del usuario _carlos_ podríamos cambiar su contraseña en la última página de cambio de contraseña.

<a id="robando-el-token"></a>
## Robando el token

Tras prueba y error nos daremos cuenta de que el Header del Host tiene repercusión en el email final, es decir, el enlace para cambiar la contraseña usará ese host especificado.

![Cambiando Host](/image/portswigger-reset-password/pruebaDeHost.png)

Al haber cambiado el Host a `example.com` se puede observar que el enlace ahora va dirigido a ese host. Si modificamos la request para que vaya al usuario carlos y que el Host sea nuestro exploit server y logramos que este usuario dé click en el enlace modificado, tendremos su token.

![Cambiando la request](/image/portswigger-reset-password/robarToken.png)

Ahora miramos en los logs del exploit server:

![Exploit server](/image/portswigger-reset-password/tokenRobado.png)

Ahora podemos ir a la página para cambiar la contraseña y en el apartado del token en la url ponemos el robado.

![Cambiando la contraseña](/image/portswigger-reset-password/cambioDeContraseña.png)

Habiendo cambiado la contraseña si ahora nos logueamos con el usuario carlos y la nueva contraseña que hemos puesto completaríamos el laboratorio.

![Laboratorio completado](/image/portswigger-reset-password/completado.png)