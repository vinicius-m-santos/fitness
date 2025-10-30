web: php bin/console doctrine:migrations:migrate --no-interaction && mkdir config/jwt && 
	openssl genpkey -out config/jwt/private.pem -algorithm RSA -pkeyopt rsa_keygen_bits:4096 && 
	openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout && vendor/bin/heroku-php-apache2 public/
