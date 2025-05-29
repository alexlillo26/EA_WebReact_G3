## Minimo 2 Pau Cozar

Como pedía el ejercicio he añadido la opción de poder subir una foto para los combates. Cuando creamos un combate, en la ultima sección, veremos un botón que diga "Añadir imagen". Cuando seleccionemos esa imagen nos saldrá un apartado de previsualización, para saber que imagen es la que estamos eligiendo. 
En el momento que el usuario al que le enviamos la petición para hacer un combate nos acepte, podremos ver los dos la imagen de fondo en la tarjeta del combate.
La lista de combates futuros se encuentra en la sección "Mis combates" dentro del menú desplegable del usuario. Allí podemos ver todos los combates futuros del usuario y los pendientes. En los combates futuros es donde podremos ver la foto y, además, también podremos cambiarla con el botón "Cambiar foto". 
Aunque no es lo óptimo ni correcto, he hecho que se guarden las fotos en una carpeta llamada "uploads", dentro del proyecto.


Cosas a tener en cuenta:
- Para la web, hay que iniciarla dentro de la carpeta reactweb, sino dará error.
- El archivo .env que tenemos en el backend, no se sube cuando hacemos un commit. En caso de que no aparezca este fichero hay que crearlo fuera de la carpeta src, junto al dockerfile y el resto de archivos. Hay que asegurarse que también esté en la carpeta build, junto con el resto de carpetas. El contenido del fichero es el siguiente:
El contenido de archivo .env se encuentra en la publicación de Atenea, ya que contiene información sensible.
