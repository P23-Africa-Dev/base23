# ─────────────────────────────────────────────────────────────────────────────
# Base23 production image — PHP-FPM + baked Vite assets
# Build:
#   docker build -t registry.digitalocean.com/con-reg/base23:<tag> .
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Composer dependencies ───────────────────────────────────────────
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-scripts \
    --optimize-autoloader \
    --ignore-platform-reqs

COPY . .
RUN composer dump-autoload --optimize --no-dev --no-scripts

# ── Stage 2: Frontend assets (Laravel Vite — minimal for API) ────────────────
FROM node:22-alpine AS assets

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY vite.config.js ./
COPY resources ./resources
COPY public ./public

RUN npm run build

# ── Stage 3: Runtime PHP-FPM ─────────────────────────────────────────────────
FROM php:8.4-fpm-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
        git curl unzip zip \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
        libzip-dev \
        libicu-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        intl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY --from=vendor /app /var/www/html
COPY --from=assets /app/public/build /var/www/html/public/build

RUN mkdir -p \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        storage/app/public \
        storage/app/private \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

RUN php artisan package:discover --ansi || true

RUN printf '%s\n' \
    'expose_php=Off' \
    'memory_limit=256M' \
    'upload_max_filesize=20M' \
    'post_max_size=25M' \
    'max_execution_time=120' \
    'date.timezone=UTC' \
    'opcache.enable=1' \
    'opcache.validate_timestamps=0' \
    'opcache.memory_consumption=128' \
    > /usr/local/etc/php/conf.d/99-base23.ini

USER www-data

CMD ["php-fpm"]
