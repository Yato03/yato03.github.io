---
title: "Cómo hacer Port Forwarding con SSH"
description: "Aprende a conectar redes y saltar restricciones mediante túneles SSH. Guía práctica sobre Local, Remote y Dynamic Port Forwarding con ejemplos de configuración."
date: 2026-01-19
pubDate: 2026-01-19
image: /image/ssh-port-forwarding/home.jpg
categories:
  - Blog
tags:
  - ssh
  - port forwarding
---


<a id="índice"></a>
## Índice
- [Índice](#índice)
- [Introducción](#introducción)
- [Reverse vs Local port forwarding](#reverse-vs-local-port-forwarding)
  - [Usando Local (A -\> B)](#usando-local-a---b)
  - [Usando Reverse (A \<- B)](#usando-reverse-a---b)
- [Static vs Dynamic port forwarding](#static-vs-dynamic-port-forwarding)
- [Conclusión](#conclusión)

<a id="introducción"></a>
## Introducción

El **Port Forwarding** es el mecanismo por el cual un puerto de un dispositivo puede actuar como uno o varios puertos de otro dispositivo en otra red. Esto es útil para acceder a servicios que se encuentran en una red distinta a la nuestra y tenemos acceso a un dispositivo que podemos usar como un puente entre las dos redes.

Uno de los diversos métodos disponibles para hacer Port Forwarding es usar **SSH**. Para ello, los dos dispositivos deben de tener instalado SSH y en escucha por algún puerto el cual suele ser el 22.

<img alt="Scenario 1" src="/image/ssh-port-forwarding/Scenario 1.svg">

Como se puede observar en la imagen, hay 3 dispositivos: ``A``,``B`` y ``C``. ``A`` se encuentra exclusivamente en la *Red 1* y ``C`` a la *Red 2*, en cambio, ``B`` se encuentra entre ambas. Queremos llegar desde la máquina ``A`` al servicio web de la máquina ``C``. Podemos usar a ``B`` como puente para llegar a ``C``, ya que está conectado a ambas redes con un Port Forwarding.

<img alt="Scenario 1 solved" src="/image/ssh-port-forwarding/Scenario 1 Solved.svg">

En este caso, se ha decidido usar el puerto 80 de la máquina ``B`` como el puerto 80 (servicio web) de la máquina ``C`` con Port Forwarding. Ahora ``A``, puede consultar al puerto 80 de la máquina ``B`` y esta redirigirá el tráfico a ``C``, al igual que cuando ``C`` devuelva la respuesta a ``B`` este lo hará a su vez a ``A``.

Gracias al Port Forwarding, ``A`` puede acceder al servicio web de ``C`` que estaba aislado en otra red.

<a id="reverse-vs-local-port-forwarding"></a>
## Reverse vs Local port forwarding

El Port Forwarding puede ser Reverse o Local dependiendo de la direccionalidad de la conexión. Se podría resumir en:

- <u>Local Port Forwarding (-L)</u>: Traes un servicio remoto a tu máquina local.

- <u>Remote/Reverse Port Forwarding (-R)</u>: Envías un servicio local a una máquina remota.

<img alt="Scenario 2" src="/image/ssh-port-forwarding/Scenario 2.svg">

En este caso, ``B`` tiene un servicio web que escucha en localhost (solo es accesible por el propio dispositivo) y ``A`` quiere acceder a él.

<a id="usando-local-a---b"></a>
### Usando Local (A -> B)
``A`` puede crear un Port Forwarding a ``B`` usando SSH de la siguiente manera:

```bash
# Comando ejecutado desde la máquina A
ssh -L 80:localhost:80 bob@IP_HOST_B -N -f
```

> ``-L [puerto_local]:[host_remoto]:[puerto_remoto]`` — Redirige un puerto local al puerto remoto (ej. 80:localhost:80).  
> `bob@IP_HOST_B` — Usuario y host SSH en B.  
> `-N` — No ejecutar comandos remotos. `-f` — Pasar a segundo plano (no bloquear la consola).

<img alt="Scenario 2 solved con Local" src="/image/ssh-port-forwarding/Scenario 2 solved with Local Port Forwarding.svg">

<a id="usando-reverse-a---b"></a>
### Usando Reverse (A <- B)

De esta forma, ``B`` es la que se debe de conectar a ``A`` para establecer la conexión.

```bash
# Comando ejecutado desde la máquina B
ssh -R 80:localhost:80 alice@IP_HOST_A -N -f
```

<img alt="Scenario 2 solved con Reverse" src="/image/ssh-port-forwarding/Scenario 2 solved with Remote Port Forwarding.svg">


<a id="static-vs-dynamic-port-forwarding"></a>
## Static vs Dynamic port forwarding

Hasta el momento, solo se han mostrado ejemplos donde se realiza Port Forwarding con un solo puerto. Esto se denomina **Static Port Forwarding**.

Hay determinados casos en los que se quiere acceder a varios servicios de diferentes puertos en una máquina. En vez de realizar un Static Port Forwarding a cada servicio que se quiere acceder, existe la posibilidad de realizar un **Dynamic Port Forwarding** y redirigir tu tráfico a cualquier servicio que esté al alcance de la otra máquina.

<img alt="Scenario 3" src="/image/ssh-port-forwarding/Scenario 3.svg">

En este escenario tenemos algo parecido al anterior pero esta vez, la máquina ``B`` tiene varios servicios locales a los que ``A`` quiere acceder.

Existen varias formas de realizar Dynamic Port Forwarding. Explicaré la que considero más sencilla de entender. 

Primero es necesario de crear un puerto de Dynamic Port Forwarding en la máquina ``B`` que en nuestro caso será local:

```bash
# Comando ejecutado desde la máquina B (crea un proxy SOCKS local en B)
ssh -D 3333 -N -f localhost
```

Ahora es necesario para ``A`` acceder a este puerto desde su máquina para poder usarlo. Para ello, usamos un Reverse Port Forwarding (ejecutado desde ``B`` para exponer el SOCKS en ``A``):

```bash
ssh -R 3333:localhost:3333 alice@IP_HOST_A -N -f
```

Ahora, en la máquina es necesario modificar el archivo `/etc/proxychains4.conf` (a veces es `/etc/proxychains.conf`) y añadir:

```
socks5 127.0.0.1 3333
```

Gracias a esto, ``A`` puede acceder a los servicios internos de ``B`` usando el comando `proxychains`:

```bash
proxychains curl http://localhost:80
```

<img alt="Scenario 3 solved" src="/image/ssh-port-forwarding/Scenario 3 Solved.svg">

<a id="conclusion"></a>
## Conclusión

El port forwarding con SSH es una herramienta flexible para exponer o consumir servicios a través de redes distintas: usa -L para traer servicios remotos a tu máquina, -R para exponer servicios locales en una máquina remota y -D para crear proxys dinámicos (SOCKS).
