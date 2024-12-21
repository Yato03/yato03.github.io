---
title: "Proteger tus contraseñas: más allá del hash y las buenas intenciones"
description: "Todos los días desafortunadamente, se filtran datos de usuarios de grandes y pequeñas empresas. ¿Están las contraseñas de tus usuarios correctamente guardadas y seguras?"
date: 2024-12-07
pubDate: 2024-12-07
image: /image/contraseñas-seguras/encadenado.jpg
categories:
  - Blog
tags:
  - Hashes
  - MD5
  - SHA-1
  - Web
---

<center>
  <img src="/image/contraseñas-seguras/password.jpg" width="650"/>
</center>
<br/>

Hace muchos años (en 2012 para ser exactos), en una red social muy conocida ocurrió una tragedia. **6.5 millones de contraseñas** fueron filtradas debido a un SQL Injection. 

Esta empresa era conocedora de la normativa y tenía todas las contraseñas encriptadas con SHA-1 para que en el peor de los casos la desgracia no fuera a más.

Sin embargo, los usuarios no podían acceder a sus cuentas. ¿Qué estaba pasando? Los hackers estaban entrando a sus cuentas. 

Todas las contraseñas que estaban supuestamente encriptadas estaban siendo crackeadas con facilidad. El algoritmo SHA-1 no era suficiente para parar a los cibercriminales. 

Más tarde, en 2016, se invalidaron todas las contraseñas que no habían sido cambiadas desde este incidente y todo volvió a la normalidad. Eso sí, una normalidad en la cual habían sido robados millones de datos de usuarios y seguramente, vendidos en la dark web.

<br>

Pues esta empresa no es ni más ni menos que [LinkedIn](https://www.linkedin.com/in/miguel-hern%C3%A1ndez-677a7020b/) y aunque puedes estar pensando que ha sido un ataque de hace 12 años, es algo que ocurre continuamente. Día tras día se roban datos y se venden en el mercado negro.

En este post explicaré cómo proteger correctamente las contraseñas dentro de una base de datos para que en el caso (dios quiera que no) de que roben los datos de la tuya, no sea aún peor de lo que ya es.

> Dejo por aquí links de referencias a los datos: 
> - [Wikipedia](https://en.wikipedia.org/wiki/2012_LinkedIn_hack) 
> - [cecy.dev](https://www.cecy.dev/blog/linkedin-2012-breach-case-study/)

## Índice
- [Índice](#índice)
- [El problema](#el-problema)
- [La solución](#la-solución)
- [Conclusiones](#conclusiones)


## El problema

Como muchos sabréis, es obligatorio por ley almacenar de forma segura las contraseñas de los usuarios en la base de datos. Segura en el sentido de que sea "encriptada" con una función unidireccional, es decir, un algoritmo que pase la palabra `password` a algo como `5f4dcc3b5aa765d61d8327deb882cf99` y que de ninguna forma se pueda revertir, siendo imposible obtener la palabra original.

Estas funciones se llaman funciones hash o funciones resúmenes. Al final no son más que cálculos que usan todos los bits de un texto o palabra para dar como resultado el hash, que siempre es de la misma longitud. Si se cambiase cualquier carácter de la palabra a hashear, cambiará radicalmente el resultado.

Ejemplo:

**MD5**:
```
password -> 5f4dcc3b5aa765d61d8327deb882cf99
p4ssword -> 93863810133ebebe6e4c6bbc2a6ce1e7
```

Estas funciones hash, son de cálculo rápido y un cibercriminal podría usar la fuerza bruta para romper estas contraseñas. En estos casos, la seguridad recae en cómo de compleja sea la contraseña y por tanto en el usuario. También hay técnicas más avanzadas como encontrar colisiones en MD5, dejo un link por si quieres entrar más en detalle: [Implementación de colisiones MD5](https://es.wikipedia.org/wiki/Implementaci%C3%B3n_de_colisi%C3%B3n_en_MD5).

Por lo tanto podemos concluir que si sólo usamos una función hash para las contraseñas de nuestros usuarios, no podemos garantizar la seguridad de sus datos. ¿Qué deberíamos de hacer entonces?

## La solución

Para ayudar a las funciones hash a que sean más seguras, podemos optar por varias soluciones que se pueden usar de forma conjunta.

Para empezar, podemos añadir un valor aleatorio, de aproximadamente unos 16 o 32 bytes, al inicio de la contraseña sin hashear. Esto se llama _salt_, y dificultará los ataques de [Rainbow tables](https://www.ionos.es/digitalguide/servidores/seguridad/rainbow-tables/) y aumentará la complejidad ante descifrados masivos.

Por otro lado, podemos hashear la palabra múltiples veces. Esto se llama _Key Stretching_, y su función es complicarle el trabajo al cibercriminal a la hora de romper el hash por fuerza bruta.

Si no has quedado convencido de implementar por tu cuenta el _salt_ o el _Key Stretching_, no te preocupes porque existen algoritmos que ya lo hacen por ti. Estos algoritmos son: **bcrypt**, **scrypt**, **Argon2** y **PBKDF2**. 

El uso de estos algoritmos no son perfectos. Cada uno tiene sus normas para su correcto uso. El 30 de octubre de 2024, Okta tuvo una falla de seguridad debido al mal uso de **bycript**, te dejo un video por si te interesa: [Así fue el ERROR de SEGURIDAD de OKTA - Midudev](https://youtu.be/SYJLVHygwXU?si=LfQ0d5OvjMLYNhP9).

## Conclusiones

Como hemos visto, hashear las contraseñas con una simple función hash no funciona. Hay que esforzarse algo más e implementar _salt_ y _Key Stretching_ o incluso directamente un algoritmo que ya lo haga por ti. Como he dicho en la introducción, cada día sale una nueva noticia de una empresa que ha sido víctima de un filtrado de datos, y aunque esperemos que nunca sea el caso de nuestra base de datos, tenemos que estar preparados para cualquier escenario.

Espero que te haya servido de algo el post y recuerda recomendar el [post de LinkedIn](https://www.linkedin.com/posts/miguel-hern%C3%A1ndez-677a7020b_proteger-tus-contrase%C3%B1as-m%C3%A1s-all%C3%A1-del-hash-activity-7271822067111510017-T04u?utm_source=share&utm_medium=member_desktop) si vienes de allí o si no es así, hazlo igualmente que es gratis 🤑.