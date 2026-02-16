---
name: symfony
description: Symfony framework
---

# Symfony Skill

Symfony is a high-performance PHP framework for web development, built on a set of reusable and decoupled components. It follows the HTTP Request-Response paradigm and provides tools for rapid development of complex, maintainable applications.

This skill synthesizes knowledge from official Symfony 7.x documentation, providing comprehensive guidance for building modern PHP applications.

## When to Use This Skill

Use this skill when you need help with:

### Core Development
- Creating controllers, routes, and handling HTTP requests/responses
- Building and validating HTML forms with the Form component
- Managing sessions, flash messages, and user state
- Configuring services using dependency injection

### Security
- Implementing user authentication and authorization
- Password hashing and verification
- CSRF protection for forms
- LDAP integration for enterprise authentication

### Architecture
- Understanding Symfony's request-response lifecycle
- Working with the HttpKernel and EventDispatcher
- Implementing event listeners and subscribers
- Configuring environments (dev, prod, test)

### Advanced Features
- Creating and running console commands
- Making HTTP client requests (sync/async)
- Working with Webpack Encore for frontend assets
- Configuring validation constraints

### Infrastructure
- Configuring caching strategies
- Setting up database sessions (Redis, PDO)
- Managing environment variables and debug mode

## Key Concepts

### Request-Response Lifecycle
Every HTTP interaction in Symfony follows this pattern:
1. **Request** - The front controller (`public/index.php`) receives the HTTP request
2. **Routing** - The router matches the URL to a controller
3. **Controller** - The controller processes the request and creates a Response
4. **Response** - The Response object is sent back to the client

### Service Container
Symfony uses dependency injection throughout. Services are configured in `config/services.yaml` and can be:
- **Autowired** - Dependencies are automatically resolved
- **Autoconfigured** - Services are automatically tagged based on interfaces
- **Lazy-loaded** - Services are only instantiated when needed

### Environments
Symfony applications run in different environments:
- **dev** - Development with debug tools enabled
- **prod** - Production with optimizations and caching
- **test** - For running automated tests

### MVC Architecture
- **Model** - Your data layer (Doctrine entities, repositories)
- **View** - Twig templates for rendering HTML
- **Controller** - PHP classes handling request logic

## Quick Reference

### Controller with Route Attribute
```php
// src/Controller/HelloController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class HelloController
{
    #[Route('/hello/{name}', name: 'hello', methods: ['GET'])]
    public function index(string $name): Response
    {
        return new Response('Hello '.$name);
    }
}
```

### Form Type Class
```php
// src/Form/TaskType.php
namespace App\Form;

use App\Entity\Task;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class TaskType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('task', TextType::class)
            ->add('dueDate', DateType::class)
            ->add('save', SubmitType::class, ['label' => 'Create Task']);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Task::class,
        ]);
    }
}
```

### Handling Forms in Controllers
```php
// src/Controller/TaskController.php
public function new(Request $request, EntityManagerInterface $em): Response
{
    $task = new Task();
    $form = $this->createForm(TaskType::class, $task);
    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
        $em->persist($task);
        $em->flush();

        $this->addFlash('success', 'Task created successfully!');
        return $this->redirectToRoute('task_list');
    }

    return $this->render('task/new.html.twig', [
        'form' => $form,
    ]);
}
```

### Console Command
```php
// src/Command/CreateUserCommand.php
namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:create-user',
    description: 'Creates a new user.',
)]
class CreateUserCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln('User created successfully!');
        return Command::SUCCESS;
    }
}
```

### HTTP Client Usage
```php
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ApiService
{
    public function __construct(
        private HttpClientInterface $client,
    ) {}

    public function fetchUserData(int $id): array
    {
        $response = $this->client->request(
            'GET',
            'https://api.example.com/users/'.$id
        );

        return $response->toArray();
    }
}
```

### Password Hashing
```php
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserService
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher,
    ) {}

    public function register(User $user, string $plainPassword): void
    {
        $hashedPassword = $this->passwordHasher->hashPassword(
            $user,
            $plainPassword
        );
        $user->setPassword($hashedPassword);
    }
}
```

### Service Configuration
```yaml
# config/services.yaml
services:
    _defaults:
        autowire: true
        autoconfigure: true

    App\:
        resource: '../src/'
        exclude:
            - '../src/DependencyInjection/'
            - '../src/Entity/'
            - '../src/Kernel.php'

    App\Service\MyService:
        arguments:
            $apiKey: '%env(API_KEY)%'
```

### Security Configuration
```yaml
# config/packages/security.yaml
security:
    password_hashers:
        App\Entity\User: 'auto'

    providers:
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email

    firewalls:
        main:
            lazy: true
            provider: app_user_provider
            form_login:
                login_path: login
                check_path: login
            logout:
                path: logout

    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/profile, roles: ROLE_USER }
```

### Flash Messages
```php
// In controller - set flash message
$this->addFlash('success', 'Changes saved successfully!');

// In Twig template - display flash messages
{% for message in app.flashes('success') %}
    <div class="alert alert-success">{{ message }}</div>
{% endfor %}
```

## Reference Files

This skill includes comprehensive documentation organized by topic:

### `references/getting_started.md`
**Pages:** 3 | **Confidence:** Medium

Covers:
- Controllers as services with `#[Route]` and `#[AsController]` attributes
- Front controller and Kernel architecture
- Debug mode and environment configuration
- Installing Webpack Encore for frontend assets

### `references/basics.md`
**Pages:** 76 | **Confidence:** Medium

Covers:
- **Forms** - Building, rendering, and processing HTML forms
- **Sessions** - Managing user sessions, flash messages
- **Validation** - Constraint-based data validation
- **Routing** - URL routing configuration
- **Controllers** - Request handling and response creation

### `references/security.md`
**Pages:** 9 | **Confidence:** Medium

Covers:
- **Password Hashing** - Configuring hashers, password migration
- **CSRF Protection** - Stateful and stateless token protection
- **LDAP Authentication** - Enterprise directory integration
- **HTTP Fundamentals** - Request/Response security concepts
- **Entry Points** - Authentication flow configuration

### `references/advanced_topics.md`
**Pages:** 35 | **Confidence:** Medium

Covers:
- **Console Commands** - Creating CLI commands with attributes
- **Validation Constraints** - Custom constraint creation
- **Notifications** - Sending notifications through various channels

### `references/architecture.md`
**Pages:** 21 | **Confidence:** Medium

Covers:
- **HttpKernel Component** - The heart of Symfony's request handling
- **Request-Response Lifecycle** - Event-driven kernel operation
- **Event Dispatcher** - Hooking into the application lifecycle

### `references/utilities.md`
**Pages:** 7 | **Confidence:** Medium

Covers:
- **HTTP Client** - Making synchronous and asynchronous HTTP requests
- **Scoped Clients** - URL-based client configuration
- **File Uploads** - Handling multipart form data
- **Caching** - Response caching strategies
- **Retry Strategies** - Automatic retry for failed requests

### `references/front_end.md`
Frontend asset management with Webpack Encore.

### `references/production.md`
Deployment and production configuration best practices.

### `references/other.md`
Additional topics and edge cases.

## Working with This Skill

### For Beginners
1. Start with **getting_started.md** to understand the basic architecture
2. Read **basics.md** for forms, routing, and controllers
3. Use the Quick Reference examples as templates for your code

### For Intermediate Developers
1. Consult **security.md** for authentication and authorization
2. Use **utilities.md** for HTTP client and external integrations
3. Explore **advanced_topics.md** for console commands and notifications

### For Advanced Use Cases
1. **architecture.md** for deep understanding of HttpKernel internals
2. Custom authentication flows in **security.md**
3. Performance optimization in **production.md**

### Navigating Multi-Source References
All reference files are derived from official Symfony 7.x documentation. When information varies:
- Official docs are the authoritative source
- Code examples in this skill are extracted directly from docs
- Version-specific features are noted with their introduction version

## Common Patterns

### Environment Variables
```bash
# .env
APP_ENV=dev
APP_DEBUG=1
DATABASE_URL="mysql://user:pass@localhost:3306/mydb"
```

### Twig Template with Form
```twig
{# templates/task/new.html.twig #}
{% extends 'base.html.twig' %}

{% block body %}
    <h1>Create Task</h1>
    {{ form_start(form) }}
        {{ form_widget(form) }}
    {{ form_end(form) }}
{% endblock %}
```

### Doctrine Entity
```php
// src/Entity/Task.php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
class Task
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    private ?string $task = null;

    #[ORM\Column]
    #[Assert\NotNull]
    private ?\DateTimeInterface $dueDate = null;

    // Getters and setters...
}
```

## Resources

### Official Documentation
All reference content is sourced from the official Symfony documentation at https://symfony.com/doc/7.4/

### References Directory
The `references/` directory contains organized documentation with:
- Detailed explanations of concepts
- Working code examples with proper language tags
- Links to original documentation for further reading

## Notes

- This skill targets **Symfony 7.x** (PHP 8.2+)
- Examples use modern PHP features like attributes (`#[...]`)
- Console commands use the `#[AsCommand]` attribute (Symfony 7.3+)
- Stateless CSRF tokens require Symfony 7.2+

## Updating

To refresh this skill with updated documentation:
1. Re-run the documentation scraper
2. The skill will be rebuilt with the latest Symfony docs
3. Check the Symfony changelog for new features and deprecations
