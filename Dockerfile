# Logistics Management System — production image for Render (free tier)
# Single container: Laravel 12 + Inertia React frontend served by `php artisan serve`.
# No application code is changed by this file; it only installs dependencies,
# builds the frontend assets and starts the app.
FROM php:8.3-cli

# System deps + PHP extensions Laravel needs (incl. pdo_mysql for TiDB/MySQL)
RUN apt-get update && apt-get install -y ca-certificates git unzip libzip-dev libpng-dev libonig-dev libxml2-dev libicu-dev \
 && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl \
 && rm -rf /var/lib/apt/lists/*

# Composer + Node.js (for the Vite frontend build)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs

WORKDIR /app
COPY . .

# Install PHP + JS dependencies and build the frontend.
# Full `composer install` (with dev) matches the setup already verified working.
RUN composer install --optimize-autoloader --no-interaction
RUN npm ci && npm run build

EXPOSE 8000

# Migrate + seed on every start (all seeders use firstOrCreate, so re-running is safe),
# then serve. Render provides $PORT; default 8000 locally.
CMD sh -c "php artisan migrate --force --seed && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"
