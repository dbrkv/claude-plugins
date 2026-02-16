---
name: symfony
description: Symfony framework
---

# Symfony Skill

Comprehensive assistance with Symfony development, generated from official documentation.

## When to Use This Skill

This skill should be triggered when:
- **Working with Symfony framework** - building web applications, APIs, or microservices
- **Asking about Symfony features** - routing, forms, validation, doctrine, security, etc.
- **Installing packages or bundles** - using Composer with Symfony Flex
- **Configuration questions** - environment variables, parameters, services, bundles
- **Debugging Symfony code** - HTTP kernel issues, request/response lifecycle, events
- **Learning Symfony best practices** - controller patterns, service injection, form handling
- **Console commands** - creating custom commands, using bin/console utilities
- **Performance optimization** - caching, production deployment, security hardening
- **Integration questions** - working with databases, third-party APIs, frontend frameworks

## Quick Reference

### 1. Creating a New Symfony Application

```bash
# Traditional web application with all features
symfony new my_project_directory --version="7.3.x" --webapp

# Microservice, console application or API
symfony new my_project_directory --version="7.3.x"

# Using Composer directly
composer create-project symfony/skeleton:"7.3.x" my_project_directory
cd my_project_directory
composer require webapp  # for web applications
```

### 2. Installing Packages with Symfony Flex

```bash
# Install packages using friendly names
composer require logger        # Installs Symfony logger
composer require orm           # Installs Doctrine ORM
composer require form          # Installs Form component
composer require validator     # Installs Validator component

# Security vulnerability check
symfony check:security
```

### 3. Basic Controller with Route

```php
// src/Controller/BlogController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class BlogController extends AbstractController
{
    #[Route('/blog/{slug}', name: 'blog_show')]
    public function show(string $slug): Response
    {
        // $slug will contain the value from the URL
        return new Response("Blog post: {$slug}");
    }
}
```

### 4. Configuration Parameters

```yaml
# config/services.yaml
parameters:
    # Custom application parameters
    app.admin_email: 'admin@example.com'
    app.supported_locales: ['en', 'es', 'fr']
    app.enable_v2_protocol: true

    # Reference parameters in other files
    # Use %parameter_name% syntax
```

### 5. Form Creation and Handling

```php
// src/Form/TaskType.php
namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\FormBuilderInterface;

class TaskType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('task', TextType::class)
            ->add('dueDate', DateType::class);
    }
}

// In controller
$form = $this->createForm(TaskType::class, $task);
$form->handleRequest($request);

if ($form->isSubmitted() && $form->isValid()) {
    // Process the form data
    return $this->redirectToRoute('task_success');
}
```

### 6. Entity Validation with Constraints

```php
// src/Entity/Author.php
namespace App\Entity;

use Symfony\Component\Validator\Constraints as Assert;

class Author
{
    #[Assert\NotBlank(message: "Name cannot be blank")]
    #[Assert\Length(min: 3, max: 100)]
    private string $name;

    #[Assert\Email(message: "Invalid email address")]
    private string $email;

    // Getter and setter methods...
}
```

### 7. Console Command Creation

```php
// src/Command/CreateUserCommand.php
namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:create-user',
    description: 'Creates a new user.'
)]
class CreateUserCommand extends Command
{
    protected function configure(): void
    {
        $this
            ->addArgument('username', InputArgument::REQUIRED, 'The username')
            ->addArgument('password', InputArgument::REQUIRED, 'The password');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $username = $input->getArgument('username');
        $output->writeln("User created: {$username}");
        return Command::SUCCESS;
    }
}
```

### 8. Environment Configuration

```bash
# .env file (committed to repo)
APP_ENV=dev
APP_SECRET=your-secret-key-here
DATABASE_URL="mysql://user:password@127.0.0.1:3306/db_name"

# .env.local file (not committed, overrides defaults)
APP_ENV=prod
DATABASE_URL="mysql://prod_user:prod_password@prod_host:3306/prod_db"
```

### 9. Service Configuration and Dependency Injection

```yaml
# config/services.yaml
services:
    # Default configuration for services
    _defaults:
        autowire: true
        autoconfigure: true
        bind:
            $projectDir: '%kernel.project_dir%'

    # Custom service with explicit configuration
    App\Service\UserManager:
        arguments:
            $entityManager: '@doctrine.orm.entity_manager'
            $emailSender: '@app.email_sender'
```

### 10. HTTP Kernel Event Listener

```php
// src/EventListener/RequestListener.php
namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class RequestListener
{
    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        // Add custom logic for every request
        // For example: logging, locale setting, security checks
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => 'onKernelRequest',
        ];
    }
}
```

## Detailed Reference Files

The reference documentation is organized into several comprehensive files:

### **advanced_topics.md** (37 pages)
- **Console Commands** - Creating and managing console commands
- **Validation** - Input validation with constraints and custom validators
- Complete coverage of advanced Symfony features with practical examples

### **architecture.md** (21 pages)
- **Kernel Configuration** - Deep dive into Symfony's kernel options
- **Bundle Management** - How bundles work and are registered
- **Container Parameters** - Understanding Symfony's dependency injection container

### **getting_started.md**
- Setup and installation procedures
- First application creation
- Basic concepts and terminology

### **security.md**
- Authentication and authorization
- Security configuration best practices
- User management and access control

### **production.md**
- Performance optimization
- Deployment strategies
- Security hardening for production

### **basics.md**, **front_end.md**, **utilities.md**, **other.md**
- Core framework concepts
- Frontend integration (Twig, Webpack Encore)
- Utility components and helpers
- Additional features and integrations

## Working with This Skill

### For Beginners
1. **Start with setup** - Use the "Creating a New Symfony Application" example
2. **Learn the basics** - Read the `getting_started.md` reference file
3. **Build your first controller** - Follow the routing and controller examples
4. **Understand forms** - Use the form creation patterns for user input
5. **Master validation** - Apply validation constraints to your entities

### For Intermediate Users
1. **Service container mastery** - Study dependency injection patterns
2. **Advanced routing** - Explore complex routing configurations
3. **Database integration** - Use Doctrine ORM patterns from reference docs
4. **Console commands** - Build custom CLI tools for your application
5. **Event listeners** - Hook into Symfony's request-response lifecycle

### For Advanced Users
1. **Performance optimization** - Reference production deployment guides
2. **Custom bundles** - Create reusable Symfony bundles
3. **Advanced security** - Implement complex authentication flows
4. **API development** - Build RESTful APIs with Symfony
5. **Testing strategies** - Implement comprehensive test suites

### Navigation Tips
- **Search by keywords** - Look for specific Symfony terms like "routing", "validation", "forms"
- **Reference the patterns** - Use the Quick Reference examples as starting points
- **Check environment docs** - Always consider APP_ENV and configuration contexts
- **Security first** - Use `symfony check:security` regularly for vulnerability scanning

## Key Concepts

### Core Symfony Concepts
- **Kernel** - The heart of Symfony that handles requests and returns responses
- **Bundles** - Symfony's plugin system for adding functionality
- **Service Container** - Dependency injection container for managing services
- **Controller** - PHP classes that handle requests and return responses
- **Routing** - Maps URLs to controllers
- **Twig** - Symfony's templating engine
- **Doctrine** - Database abstraction layer and ORM

### Request-Response Lifecycle
1. **Request** - HTTP request is created by Symfony
2. **Routing** - Router determines which controller should handle the request
3. **Controller** - Controller is executed and returns a Response
4. **Response** - HTTP response is sent back to the browser
5. **Events** - Various events are dispatched throughout the lifecycle

### Configuration Environments
- **dev** - Development environment with debugging enabled
- **prod** - Production environment optimized for performance
- **test** - Testing environment for automated tests

### Package Management
- **Composer** - PHP package manager
- **Symfony Flex** - Automates package installation and configuration
- **Recipes** - Automated setup instructions for packages

## Resources

### Official Documentation
- [Symfony Documentation](https://symfony.com/doc)
- [Symfony Components](https://symfony.com/components)
- [Symfony Best Practices](https://symfony.com/doc/current/best_practices.html)

### Development Tools
- **Symfony CLI** - Local development server and management tools
- **Web Debug Toolbar** - Development debugging interface
- **Profiler** - Performance and debugging analysis tool
- **Console** - Command-line interface for administrative tasks

### Community
- [Symfony Blog](https://symfony.com/blog)
- [SymfonyCasts](https://symfonycasts.com/) - Video tutorials
- Stack Overflow - Symfony tagged questions

## Important Commands

```bash
# Project management
symfony new project_name --webapp          # Create new project
symfony server:start                       # Start development server
symfony check:security                     # Check vulnerabilities

# Cache management
php bin/console cache:clear                # Clear cache
php bin/console cache:warmup               # Warm up cache

# Development tools
php bin/console debug:router               # Show routes
php bin/console debug:container            # Show services
php bin/console debug:config framework     # Show configuration

# Database operations
php bin/console doctrine:migrations:diff   # Create migration
php bin/console doctrine:migrations:migrate # Run migrations
```