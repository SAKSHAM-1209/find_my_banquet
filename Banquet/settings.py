from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv

# ===== LOAD .env =====
load_dotenv()

# ===== BASE DIR =====
BASE_DIR = Path(__file__).resolve().parent.parent

# ===== SECURITY =====
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-fallback-secret-key')
DEBUG = os.getenv('ENVIRONMENT', 'local').lower() == 'local'

# ===== ENVIRONMENT =====
ENVIRONMENT = os.getenv('ENVIRONMENT', 'local').lower()

# ===== HOSTS =====
DEFAULT_ALLOWED_HOSTS = [
    '127.0.0.1',
    'localhost',
    'find-my-banquet-6wqy.onrender.com',  # Render URL
    'findmybanquet.com',
    'www.findmybanquet.com',
]

# Allow overriding ALLOWED_HOSTS via environment variable (comma-separated)
env_allowed = os.getenv('ALLOWED_HOSTS')
if env_allowed:
    ALLOWED_HOSTS = [h.strip() for h in env_allowed.split(',') if h.strip()]
else:
    ALLOWED_HOSTS = DEFAULT_ALLOWED_HOSTS

# CSRF trusted origins (allow setting via env or default to known production hosts)
env_csrf = os.getenv('CSRF_TRUSTED_ORIGINS')
if env_csrf:
    CSRF_TRUSTED_ORIGINS = [u.strip() for u in env_csrf.split(',') if u.strip()]
else:
    CSRF_TRUSTED_ORIGINS = [f"https://{h}" for h in ALLOWED_HOSTS if h not in ('127.0.0.1', 'localhost')]

# ===== INSTALLED APPS =====
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'website',
]

# ===== MIDDLEWARE =====
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Banquet.urls'

# ===== TEMPLATES =====
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Banquet.wsgi.application'

# ===== DATABASE CONFIGURATION (Supabase PostgreSQL with local SQLite fallback) =====
# Expect DATABASE_URL in the form provided by Supabase, e.g.
# postgres://USER:PASSWORD@HOST:PORT/DB
db_url = os.getenv('DATABASE_URL')
use_database_url = os.getenv('USE_DATABASE_URL', '0') == '1'

# In local/dev, default to SQLite even if DATABASE_URL exists, unless explicitly forced
if ENVIRONMENT in ['local', 'dev', 'development'] and not use_database_url:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # Ensure SSL is required outside local envs
    ssl_require = ENVIRONMENT not in ['local', 'dev', 'development']
    DATABASES = {
        'default': dj_database_url.config(
            default=db_url,
            conn_max_age=600,
            ssl_require=ssl_require,
        )
    }



# ===== PASSWORD VALIDATION =====
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ===== INTERNATIONALIZATION =====
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# ===== STATIC FILES =====
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ===== MEDIA FILES =====
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ===== DEFAULT PRIMARY KEY FIELD TYPE =====
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ===== SECURITY SETTINGS =====
# Enable secure HTTPS-only settings when running in production
if ENVIRONMENT == 'production':
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
else:
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
