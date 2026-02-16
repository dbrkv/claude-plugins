---
name: symfony
description: Comprehensive Symfony framework assistance for development, debugging, and best practices
---

# Symfony Skill

Expert assistance with Symfony framework development, covering installation, configuration, development patterns, debugging, and optimization.

## When to Use This Skill

This skill should be triggered when:
- Setting up or configuring Symfony applications
- Developing Symfony features and components
- Debugging Symfony applications
- Optimizing Symfony performance
- Implementing best practices and design patterns
- Working with Symfony services, routing, forms, or security
- Database operations with Doctrine
- Testing Symfony applications
- Deploying Symfony applications

## Quick Reference

### Installation & Setup

#### Creating a New Symfony Project

```bash
# Traditional web application
symfony new my_project --version="7.3" --webapp

# Microservice or API
symfony new my_project --version="7.3"

# Using Composer
composer create-project symfony/skeleton:"7.3" my_project
cd my_project
composer require webapp  # for web applications
```

#### Running the Application

```bash
# Start local development server
symfony server:start

# Check requirements
symfony check:requirements

# Check security vulnerabilities
symfony check:security
```

### Common Patterns

#### 1. Controller Pattern

```php
<?php
// src/Controller/BlogController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\BlogPostRepository;

class BlogController extends AbstractController
{
    #[Route('/blog', name: 'blog_index')]
    public function index(BlogPostRepository $repository): Response
    {
        $posts = $repository->findAll();
        return $this->render('blog/index.html.twig', [
            'posts' => $posts
        ]);
    }

    #[Route('/blog/{slug}', name: 'blog_show')]
    public function show(string $slug, BlogPostRepository $repository): Response
    {
        $post = $repository->findOneBy(['slug' => $slug]);
        
        if (!$post) {
            throw $this->createNotFoundException('Post not found');
        }

        return $this->render('blog/show.html.twig', [
            'post' => $post
        ]);
    }
}
```

#### 2. Service Pattern

```php
<?php
// src/Service/EmailService.php
namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class EmailService
{
    public function __construct(
        private MailerInterface $mailer,
        private string $adminEmail
    ) {}

    public function sendNotification(string $to, string $subject, string $content): void
    {
        $email = (new Email())
            ->from($this->adminEmail)
            ->to($to)
            ->subject($subject)
            ->text($content);

        $this->mailer->send($email);
    }
}

// config/services.yaml
services:
    _defaults:
        autowire: true
        autoconfigure: true

    App\Service\:
        resource: '../src/Service/'

    # Bind parameters
    _defaults:
        bind:
            $adminEmail: '%app.admin_email%'
```

#### 3. Entity Pattern (Doctrine)

```php
<?php
// src/Entity/BlogPost.php
namespace App\Entity;

use App\Repository\BlogPostRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: BlogPostRepository::class)]
class BlogPost
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 5, max: 255)]
    private ?string $title = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Assert\NotBlank]
    private ?string $slug = null;

    #[ORM\Column(type: 'text')]
    #[Assert\NotBlank]
    private ?string $content = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    // Getters and setters...
}
```

#### 4. Form Pattern

```php
<?php
// src/Form/BlogPostType.php
namespace App\Form;

use App\Entity\BlogPost;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class BlogPostType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('title', TextType::class, [
                'label' => 'Title',
                'attr' => ['placeholder' => 'Enter post title']
            ])
            ->add('content', TextareaType::class, [
                'label' => 'Content',
                'attr' => ['rows' => 10]
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => BlogPost::class,
        ]);
    }
}
```

### Configuration Examples

#### Environment Configuration

```yaml
# .env
DATABASE_URL="mysql://db_user:db_password@127.0.0.1:3306/db_name"
APP_SECRET="your-secret-key"
MAILER_DSN="smtp://localhost:1025"
```

#### Framework Configuration

```yaml
# config/packages/framework.yaml
framework:
    secret: '%env(APP_SECRET)%'
    http_method_override: false
    trusted_hosts: ['localhost', '127.0.0.1']
    session:
        handler_id: null
        cookie_secure: auto
        cookie_samesite: lax
        storage_factory_id: session.storage.factory.native
    php_errors:
        log: true
    cache:
        app: cache.adapter.filesystem
        default_redis_provider: 'redis://localhost'
```

#### Doctrine Configuration

```yaml
# config/packages/doctrine.yaml
doctrine:
    dbal:
        driver: 'pdo_mysql'
        server_version: '8.0'
        charset: utf8mb4
        default_table_options:
            collate: utf8mb4_unicode_ci
        url: '%env(resolve:DATABASE_URL)%'
    orm:
        auto_generate_proxy_classes: true
        enable_lazy_ghost_objects: true
        report_fields_where_declared: true
        validate_xml_mapping: true
        naming_strategy: doctrine.orm.naming_strategy.underscore_number_aware
        auto_mapping: true
        mappings:
            App:
                type: attribute
                is_bundle: false
                dir: '%kernel.project_dir%/src/Entity'
                prefix: 'App\Entity'
                alias: App
```

### Debugging & Troubleshooting

#### Common Issues

1. **Memory Limits**
   ```yaml
   # config/packages/framework.yaml
   framework:
       php_errors:
           log: true
   ```

2. **Cache Issues**
   ```bash
   # Clear cache
   php bin/console cache:clear --env=prod
   php bin/console cache:warmup --env=prod
   ```

3. **Database Connection Issues**
   ```bash
   # Test database connection
   php bin/console doctrine:schema:validate
   php bin/console doctrine:database:create --if-not-exists
   ```

#### Debug Commands

```bash
# Show all routes
php bin/console debug:router

# Show route details
php bin/console debug:router blog_index

# Show all services
php bin/console debug:container

# Show service details
php bin/console debug:container mailer

# Show configuration
php bin/console debug:config framework

# Show parameters
php bin/console debug:container --parameters

# Show environment variables
php bin/console debug:dotenv
```

#### Xdebug Configuration

```ini
; php.ini
xdebug.mode=debug
xdebug.start_with_request=yes
xdebug.client_port=9003
xdebug.client_host=127.0.0.1
```

### Performance Optimization

#### Caching Strategies

```yaml
# config/packages/cache.yaml
framework:
    cache:
        app: cache.adapter.filesystem
        system: cache.adapter.system
        
services:
    cache.custom:
        parent: cache.app
        tags: cache.pool
        callable: [Symfony\Component\Cache\Adapter\FilesystemAdapter, '__construct']
        arguments: ['custom_cache', 3600, '%kernel.cache_dir%/custom']
```

#### Database Optimization

```yaml
# config/packages/doctrine.yaml
doctrine:
    orm:
        query_cache_driver:
            type: pool
            pool: doctrine.result_cache_pool
        result_cache_driver:
            type: pool
            pool: doctrine.result_cache_pool

framework:
    cache:
        pools:
            doctrine.result_cache_pool:
                adapter: cache.app
                default_lifetime: 3600
```

### Testing Strategies

#### Unit Testing

```php
<?php
// tests/Service/EmailServiceTest.php
namespace App\Tests\Service;

use App\Service\EmailService;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class EmailServiceTest extends TestCase
{
    public function testSendNotification(): void
    {
        $mailer = $this->createMock(MailerInterface::class);
        $mailer->expects($this->once())
            ->method('send')
            ->with($this->isInstanceOf(Email::class));

        $service = new EmailService($mailer, 'admin@example.com');
        $service->sendNotification('user@example.com', 'Test', 'Content');
    }
}
```

#### Functional Testing

```php
<?php
// tests/Controller/BlogControllerTest.php
namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class BlogControllerTest extends WebTestCase
{
    public function testBlogIndex(): void
    {
        $client = static::createClient();
        $client->request('GET', '/blog');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'Blog Posts');
    }

    public function testBlogShow(): void
    {
        $client = static::createClient();
        $client->request('GET', '/blog/test-post');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'Test Post');
    }
}
```

### Security Best Practices

#### Security Configuration

```yaml
# config/packages/security.yaml
security:
    password_hashers:
        Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface:
            algorithm: auto
            cost: 12
    
    providers:
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email
    
    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false
        
        main:
            lazy: true
            provider: app_user_provider
            form_login:
                login_path: app_login
                check_path: app_login
                enable_csrf: true
            logout:
                path: app_logout
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 604800
    
    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/profile, roles: ROLE_USER }
```

### API Development

#### REST API Example

```php
<?php
// src/Controller/Api/BlogApiController.php
namespace App\Controller\Api;

use App\Entity\BlogPost;
use App\Repository\BlogPostRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/blog')]
class BlogApiController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(BlogPostRepository $repository, SerializerInterface $serializer): JsonResponse
    {
        $posts = $repository->findAll();
        $data = $serializer->normalize($posts, null, ['groups' => 'blog:read']);
        
        return $this->json($data);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, SerializerInterface $serializer): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $blogPost = $serializer->denormalize($data, BlogPost::class);
        
        // Validation and persistence logic here
        
        return $this->json(['message' => 'Blog post created'], 201);
    }
}
```

### Deployment Tips

#### Production Checklist

```bash
# Check requirements
symfony check:requirements

# Check security
symfony check:security

# Clear production cache
php bin/console cache:clear --env=prod --no-debug

# Warm up cache
php bin/console cache:warmup --env=prod

# Update database schema
php bin/console doctrine:schema:update --force --env=prod

# Dump environment
composer dump-env prod
```

#### Docker Configuration

```dockerfile
# Dockerfile
FROM php:8.2-fpm-alpine

# Install required packages
RUN apk add --no-cache \
    libzip-dev \
    zip \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    zip \
    gd \
    intl \
    opcache \
    bcmath

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . /var/www/html

WORKDIR /var/www/html

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 9000

CMD ["php-fpm"]
```

### Common Commands Reference

#### Project Management

```bash
# Create project
symfony new my_project --webapp

# Install packages
composer require doctrine
composer require --dev maker

# Update dependencies
composer update

# Check vulnerabilities
symfony check:security
```

#### Development Commands

```bash
# Create controller
php bin/console make:controller BlogController

# Create entity
php bin/console make:entity BlogPost

# Create form
php bin/console make:form BlogPostType

# Create migration
php bin/console make:migration

# Run migration
php bin/console doctrine:migrations:migrate

# Clear cache
php bin/console cache:clear
```

#### Debugging Commands

```bash
# Debug router
php bin/console debug:router

# Debug container
php bin/console debug:container

# Debug config
php bin/console debug:config

# Show errors in dev
tail -f var/log/dev.log
```

## Best Practices

1. **Use Type Hints**: Always use PHP type hints for method parameters and return types
2. **Follow Naming Conventions**: Use Symfony naming conventions for classes, methods, and files
3. **Use Services**: Keep controllers thin, move business logic to services
4. **Validate Input**: Always validate user input using Symfony's validation component
5. **Use Environment Variables**: Store configuration in environment variables, not in code
6. **Write Tests**: Write both unit and functional tests for your application
7. **Use Caching**: Implement caching for frequently accessed data
8. **Secure Your Application**: Configure security properly and keep dependencies updated
9. **Use the Profiler**: Use Symfony's profiler for debugging and optimization
10. **Follow SOLID Principles**: Apply SOLID principles for maintainable code
