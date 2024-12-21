---
title: Targeted web cache poisoning using an unknown header - Portswigger
description: "Laboratorio de Portswigger sobre web cache poisoning"
date: 2024-04-14
pubDate: 2024-04-14
image: /image/portswigger-cache-poisoning/teaser.png
categories:
  - PortSwigger
  - writeup
tags:
  - Web Cache Poisoning
  - bscp
---

En este laboratorio de PortSwigger nuestro objetivo será ocasionar un web caché poisoining en el que se ejecute `alert(document.cookie)` en el navegador de la víctima.

**Laboratorio**: [Targeted web cache poisoning using an unknown header](https://portswigger.net/web-security/web-cache-poisoning/exploiting-design-flaws/lab-web-cache-poisoning-targeted-using-an-unknown-header)

## Índice
- [Índice](#índice)
- [Reconocer el web caché poisoning](#reconocer-el-web-caché-poisoning)
- [User agent](#user-agent)
- [Explotación](#explotación)

<a id="reconocer-el-web-caché-poisoning"></a>
## Reconocer el web caché poisoning

Si cargamos el _home_ de la página y miramos en el _Proxy->HTTP History_ podemos ver la respuesta del lado de servidor con los Headers:

![HTTP history](/image/portswigger-cache-poisoning/reconocimiento.png)

Como podemos ver, la respuesta se cachea por parte del servidor indicándolo en el Header **X-Cache**.

A continuación buscaremos Headers que no se tengan en cuenta a la hora de cachear la respuesta. Para ello usaré una extensión de la BApp: Param Miner. Haciendo click derecho en la request selecciono _Extensions->Param Miner->Guess Params->Guess Headers_.

![Param Miner](/image/portswigger-cache-poisoning/paramMiner.png)

Al hacer esto nos indica que el Header **X-Host** no lo tiene en cuenta. Si añadimos este Header en la request con un host de prueba ocurre lo siguiente:

![X-Host](/image/portswigger-cache-poisoning/x-host.png)

Podemos observar que el valor que pongamos en x-host se reflejará en el host del cual el servidor pedirá el archivo _tracking.js_. Esto es un vector de ataque el cual utilizaremos más tarde para cachear esta petición con el host del exploit server que nos da PortSwigger con nuestro payload `alert(document.cookie)`.

Pero antes tenemos que tener un factor en cuenta para que esto funcione.

<a id="user-agent"></a>
## User agent

Hay que tener en cuenta un Header más en la respuesta del servidor, **Vary**:

![Vary](/image/portswigger-cache-poisoning/vary.png)

Este header nos indica qué header tiene en cuenta para cachear la respuesta. En este caso quiere decir que dependiendo del User Agent que tengamos nos mostrará una respuesta cacheada u otra, es decir, para que nuestra víctima cargue nuestra respuesta cacheada necesitamos tener el mismo User Agent que ella. Para ello, lo primero que debemos de hacer es saber cuál es su User Agent.

En la parte de los Posts podemos observar que el HTML está permitido:

![HTML is allowed](/image/portswigger-cache-poisoning/html-is-allowed.png)

Tras hacer unas pruebas nos damos cuenta de que no es vulnerable a XSS, pero si hacemos que cargue un recurso a nuestro exploit server como por ejemplo una imagen, en la parte de logs podremos ver su User Agent.

Así que publicamos un post con lo siguiente en el _Comment_:
```html
<img src="http://<Nombre de tu exploit server>">
```

Si enviamos el comentario nos damos cuenta de que la víctima cae en la trampa y podemos ver al fin su User Agent:

![Victim User Agent](/image/portswigger-cache-poisoning/victim-user-agent.png)

Ahora sí podemos realizar el exploit y usando el User Agent de la víctima cachearlo en el servidor para completar el laboratorio.

<a id="explotación"></a>
## Explotación

Añadimos el payload en el exploit server con la misma dirección en la que se carga al poner el x-host (_/resources/js/tracking.js_):

![Payload](/image/portswigger-cache-poisoning/payload.png)

Guardamos el payload y realizamos el caché poisoning con la request que hicimos antes poniendo como X-Host nuestro exploit server y de User Agent el que hemos robado a la víctima:

![Exploit](/image/portswigger-cache-poisoning/exploit.png)

Lo mandamos hasta que nos salga `X-Cache: hit`, eso significará que se ha cacheado correctamente y con esto solucionamos el laboratorio.

