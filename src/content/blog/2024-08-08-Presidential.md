---
title: Presidential - Vulnhub
description: "Máquina linux de dificultad MEDIUM de la plataforma Vulnhub. Se tratan temas de LFI y permisos SUID"
date: 2024-08-08
pubDate: 2024-08-08
image: /image/vh-writeup-presidential/home.png
categories:
  - Vulnhub
  - writeup
tags:
  - phpmyadmin
  - lfi
  - suid
  - medium
  - linux
---

<center>
  <img src="/image/vh-writeup-presidential/home.png" width="500"/>
</center>

<br/>

Presidential es una máquina Linux de nivel medio. Su principal dificultad está en enumerar bien la máquina para poder avanzar ya que en cuanto a las vulnerabilidades, son pocas y fáciles de explotar. 

Me referiré a la máquina con la ip: `10.0.2.22`.


## Índice
- [Índice](#índice)
- [Fase de reconocimiento](#fase-de-reconocimiento)
  - [Reconocimiento de puertos y servicios](#reconocimiento-de-puertos-y-servicios)
  - [Reconocimiento web](#reconocimiento-web)
- [PHPMyAdmin](#phpmyadmin)
- [Escalada de privilegios](#escalada-de-privilegios)

<a id="reconocimiento"></a>
## Fase de reconocimiento

### Reconocimiento de puertos y servicios

Empezaremos utilizando `nmap` para descubrir los puertos abiertos accesibles.

```bash
nmap -p- --open -sS --min-rate 5000 -Pn -n -v -oG allPorts 10.0.2.22
Nmap scan report for 10.0.2.22
Host is up (0.000083s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE
80/tcp   open  http
2082/tcp open  infowave
MAC Address: 08:00:27:63:FF:A2 (Oracle VirtualBox virtual NIC)
```

Ahora analizamos qué servicios y puertos corren en los puertos `80` y `2082`.

```bash
nmap -sCV -p80,2082 -oN targeted 10.0.2.22
Nmap scan report for 10.0.2.22
Host is up (0.00036s latency).

PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.6 ((CentOS) PHP/5.5.38)
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: Ontario Election Services &raquo; Vote Now!
|_http-server-header: Apache/2.4.6 (CentOS) PHP/5.5.38
2082/tcp open  ssh     OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey: 
|   2048 0640f4e58cad1ae686dea575d0a2ac80 (RSA)
|   256 e9e63a838e94f298dd3e70fbb9a3e399 (ECDSA)
|_  256 66a8a19fdbd5ec4c0a9c4d53156c436c (ED25519)
MAC Address: 08:00:27:63:FF:A2 (Oracle VirtualBox virtual NIC)
```

Como podemos observar, los puertos corresponden a los servicios `http` y `ssh`. A continuación enumeramos el servicio web.

### Reconocimiento web

Si accedemos a `http://10.0.2.22/` nos encontraremos con lo siguiente:

![](/image/vh-writeup-presidential/home.png)

En esta página no hay ninguna funcionalidad de la cual nos podamos aprovechar así que toca enumerar con `gobuster` alguna página oculta.

Tras esto nos damos cuenta que existe una página que es `config.php`. Si probamos a añadirle un `.bak` (`http://10.0.2.22/config.php.bak`) para ver si podemos referenciar un archivo de backup de este podemos ver lo siguiente en el código fuente:

![](/image/vh-writeup-presidential/config_php_bak.png)

Disponemos de credenciales para la base de datos. Ahora necesitamos saber dónde usarlas.

Si nos fijamos en los correos electrónicos, acaban en: `votenow.local`. Esto nos hace pensar que usa _Virtual Hosting_. Por lo tanto añadimos el dominio al `/etc/hosts`:

```/etc/hosts
10.0.2.22   votenow.local
```

Ahora realizamos un escaneo de subdominios con `gobuster`:

```bash
gobuster vhost -u http://votenow.local/ --wordlist /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
```

Descubrimos el subdominio: `datasafe.votenow.local`. Lo añadimos al `/etc/hosts` para poder acceder a él:

```/etc/hosts
10.0.2.22   votenow.local datasafe.votenow.local
```

## PHPMyAdmin

Si accedemos a `http://datasafe.votenow.local` veremos un _phpmyadmin_ en el cual podremos usar las credenciales que descubrimos anteriormente:

![](/image/vh-writeup-presidential/phpmyadmin_login.png)

Accedemos con las credenciales y vemos en que versión estamos:

![](/image/vh-writeup-presidential/version_phpmyadmin.png)

Si buscamos vulnerabilidades conocidas de esta versión encontramos una:

```bash
searchsploit phpmyadmin 4.8.1
--------------------------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                                                 |  Path
--------------------------------------------------------------------------------------------------------------- ---------------------------------
phpMyAdmin 4.8.1 - (Authenticated) Local File Inclusion (1)                                                    | php/webapps/44924.txt
phpMyAdmin 4.8.1 - (Authenticated) Local File Inclusion (2)                                                    | php/webapps/44928.txt
phpMyAdmin 4.8.1 - Remote Code Execution (RCE)                                                                 | php/webapps/50457.py
--------------------------------------------------------------------------------------------------------------- ---------------------------------

```

Todas las que aparecen son en verdad la misma. Es un LFI que puede ser derivado a un RCE, ya que al hacer consultas SQL, estas se almacenan en un archivo. Si primero realizamos un `SELECT` con código malicioso `php` y luego referenciamos este archivo, podremos tener RCE.

Para ello tenemos que ir al apartado de consulta y poner el payload. Por ejemplo, en mi caso puse una reverse shell:

![](/image/vh-writeup-presidential/inyectando_comando.png)

> Tal y como aparece en la imagen no funcionaría. En mi caso usé BurpSuite para url-encodear la query y que la interpretase correctamente.

Para ejecutar el comando, tenemos referenciarlo enviando un `GET` a `/index.php/index.php?target=db_sql.php%253f/../../../../../../../../var/lib/php/session/sess_COOKIE`, donde `COOKIE` es el valor de la Cookie `phpMyAdmin`. 

En mi caso, lo hice con _Burpsuite_:

![](/image/vh-writeup-presidential/burpsuite_rce.png)

Con esto, haremos una reverse shell y entraremos en la máquina.

## Escalada de privilegios

Si vemos el contenido de `/etc/passwd` nos daremos cuenta de que hay otro usuario con `/bin/bash`: 

![](/image/vh-writeup-presidential/etc_passwd.png)

En el _phpmyadmin_ hay un usuario `admin` con una contraseña cifrada. La podemos descrifrar con _John The Ripper_. Primero tendremos que meter el hash en un archivo (en mi caso lo llamaré _hash_) y luego ejecutar lo siguiente:

```bash
john -w:/usr/share/wordlists/rockyou.txt hash
```

Después de un largo rato nos dará la contraseña: `Stella`.

Ahora podemos movernos al usuario `admin` con `su admin`.

Si ahora vamos a `/home/admin` podremos ver una flag y una pista:

![](/image/vh-writeup-presidential/user_flag.png)

Si listamos las capabilities veremos lo siguiente:

![](/image/vh-writeup-presidential/tarS_caps.png)

Un binario `tarS` con permisos de lectura. Si ejecutamos el binario veremos lo siguiente:

![](/image/vh-writeup-presidential/same.png)

Tiene los mismos mensajes que `tar`.

Podemos usarlo para comprimir la clave privada de `ssh` del usuario _root_ y escalar privilegios:

![](/image/vh-writeup-presidential/ssh.png)

Por último, en `root` podremos ver la flag:

![](/image/vh-writeup-presidential/final_flag.png)




