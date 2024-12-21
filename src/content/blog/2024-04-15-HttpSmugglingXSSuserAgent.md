---
title: HTTP Smuggling to deliver XSS through User Agent - Portswigger
description: "Laboratorio de Portswigger sobre http smuggling"
date: 2024-04-15
pubDate: 2024-04-15
image: /image/portswigger-http-smuggling/teaser.PNG
categories:
  - PortSwigger
  - writeup
tags:
  - HTTP smuggling
  - XSS
  - bscp
---

En este laboratorio de PortSwigger nuestro objetivo será que una víctima ejecute un `alert(1)` a través de un HTTP Smuggling. Para ello, deberemos de encontrar un XSS e intentar infectar a la víctima a través del HTTP Smuggling.

**Laboratorio**: [HTTP Smuggling to deliver XSS through User Agent](https://portswigger.net/web-security/request-smuggling/exploiting/lab-deliver-reflected-xss)

## Índice
- [Índice](#índice)
- [Reconocimiento del HTTP Smuggling](#reconocimiento-del-http-smuggling)
- [XXS](#xxs)
- [Explotación](#explotación)

<a id="reconocimiento-del-http-smuggling"></a>
## Reconocimiento del HTTP Smuggling

Como ya sabemos hay distintos tipos de HTTP Smuggling. Para saber en que vista de la web se produce y de que tipo es utilizaré una extensión de BApp llamada _HTTP Request Smuggler_ de la siguiente manera:

![HTTP Request Smuggler](/image/portswigger-http-smuggling/scanning1.PNG)

En mi caso usaré **Launch All Scans**. Estos son los resultados:

![HTTP Request Smuggler Results](/image/portswigger-http-smuggling/scanResult.PNG)

Como se puede ver en la primera entrada, parece ser vulnerable al HTTP Smuggling de tipo **CL.TE** en el path `/`. Pasamos a verificarlo manualmente con la siguiente request:

![HTTP Error Smuggling](/image/portswigger-http-smuggling/errorSmuggling.PNG)

Como se puede observar, lo que busca esta request es que la segunda vez que le demos a _Send_ nos devuelva lo correspondiente al path `/error` y es exactamente lo que ocurre. Por lo tanto podemos decir que estamos antes un **CL.TE**.

<a id="xxs"></a>
## XXS

Una vez que hemos encontrado el HTTP Smuggling, debemos de buscar el XSS. Este se encontrará en la vista de un post cualquiera en un input oculto el cual toma nuestro User-Agent:

![Hidden Input vulnerable](/image/portswigger-http-smuggling/useragentXSS.png)

Si comprobamos a cambiar nuestro User-Agent por `"/><script>alert(1)</script>` veremos que es vulnerable a XSS.

<a id="explotación"></a>
## Explotación

Ahora tenemos que modificar el HTTP Smuggling que hemos encontrado anteriormente para que haga una petición maliciosa a un post cualquiera con un User-Agent con el payload del XSS y con esto habremos completado el laboratorio:

![Final HTTP Smuggling Request](/image/portswigger-http-smuggling/finalSmuggling.PNG)

