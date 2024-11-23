# Usa una imagen base de Ruby
FROM ruby:2.7

# Instala dependencias
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs

# Configura el directorio de trabajo
WORKDIR /usr/src/app

# Copia el Gemfile y Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Instala las gemas necesarias
RUN bundle install

# Copia el resto del código de la aplicación
COPY . .

# Construye el sitio Jekyll
RUN bundle exec jekyll build

# Expone el puerto 4000
EXPOSE 4000

# Comando para ejecutar el servidor Jekyll
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0"]