# Symfony - Basics

**Pages:** 76

---

## Forms

**URL:** https://symfony.com/doc/7.3/forms.html

**Contents:**
- Forms
- Installation
- Usage
  - Form Types
- Building Forms
  - Creating Forms in Controllers
  - Creating Form Classes
- Rendering Forms
- Processing Forms
- Validating Forms

Do you prefer video tutorials? Check out the Symfony Forms screencast series.

Creating and processing HTML forms is hard and repetitive. You need to deal with rendering HTML form fields, validating submitted data, mapping the form data into objects and a lot more. Symfony includes a powerful form feature that provides all these features and many more for truly complex scenarios.

In applications using Symfony Flex, run this command to install the form feature before using it:

The recommended workflow when working with Symfony forms is the following:

Each of these steps is explained in detail in the next sections. To make examples easier to follow, all of them assume that you're building a small Todo list application that displays "tasks".

Users create and edit tasks using Symfony forms. Each task is an instance of the following Task class:

This class is a "plain-old-PHP-object" because, so far, it has nothing to do with Symfony or any other library. It's a normal PHP object that directly solves a problem inside your application (i.e. the need to represent a task in your application). But you can also edit Doctrine entities in the same way.

Before creating your first Symfony form, it's important to understand the concept of "form type". In other projects, it's common to differentiate between "forms" and "form fields". In Symfony, all of them are "form types":

This may be confusing at first, but it will feel natural to you soon enough. Besides, it simplifies code and makes "composing" and "embedding" form fields much easier to implement.

There are tens of form types provided by Symfony and you can also create your own form types.

You can use the debug:form to list all the available types, type extensions and type guessers in your application:

Symfony provides a "form builder" object which allows you to describe the form fields using a fluent interface. Later, this builder creates the actual form object used to render and process contents.

If your controller extends from the AbstractController, use the createFormBuilder() helper:

If your controller does not extend from AbstractController, you'll need to fetch services in your controller and use the createBuilder() method of the form.factory service.

In this example, you've added two fields to your form - task and dueDate - corresponding to the task and dueDate properties of the Task class. You've also assigned each a form type (e.g. TextType and DateType), represented by its fully qualified class name. Finally, you added a submit button with a custom label for submitting the form to the server.

Symfony recommends putting as little logic as possible in controllers. That's why it's better to move complex forms to dedicated classes instead of defining them in controller actions. Besides, forms defined in classes can be reused in multiple actions and services.

Form classes are form types that implement FormTypeInterface. However, it's better to extend from AbstractType, which already implements the interface and provides some utilities:

Install the MakerBundle in your project to generate form classes using the make:form and make:registration-form commands.

The form class contains all the directions needed to create the task form. In controllers extending from the AbstractController, use the createForm() helper (otherwise, use the create() method of the form.factory service):

Every form needs to know the name of the class that holds the underlying data (e.g. App\Entity\Task). Usually, this is just guessed based off of the object passed to the second argument to createForm() (i.e. $task). Later, when you begin embedding forms, this will no longer be sufficient.

So, while not always necessary, it's generally a good idea to explicitly specify the data_class option by adding the following to your form type class:

Now that the form has been created, the next step is to render it:

Internally, the render() method calls $form->createView() to transform the form into a form view instance.

Then, use some form helper functions to render the form contents:

That's it! The form() function renders all fields and the <form> start and end tags. By default, the form method is POST and the target URL is the same that displayed the form, but you can change both.

Notice how the rendered task input field has the value of the task property from the $task object (i.e. "Write a blog post"). This is the first job of a form: to take data from an object and translate it into a format that's suitable for being rendered in an HTML form.

The form system is smart enough to access the value of the protected task property via the getTask() and setTask() methods on the Task class. Unless a property is public, it must have a "getter" and "setter" method so that Symfony can get and put data onto the property. For a boolean property, you can use an "isser" or "hasser" method (e.g. isPublished() or hasReminder()) instead of a getter (e.g. getPublished() or getReminder()).

As short as this rendering is, it's not very flexible. Usually, you'll need more control about how the entire form or some of its fields look. For example, thanks to the Bootstrap 5 integration with Symfony forms you can set this option to generate forms compatible with the Bootstrap 5 CSS framework:

The built-in Symfony form themes include Bootstrap 3, 4 and 5, Foundation 5 and 6, as well as Tailwind 2. You can also create your own Symfony form theme.

In addition to form themes, Symfony allows you to customize the way fields are rendered with multiple functions to render each field part separately (widgets, labels, errors, help messages, etc.)

The recommended way of processing forms is to use a single action for both rendering the form and handling the form submit. You can use separate actions, but using one action simplifies everything while keeping the code concise and maintainable.

Processing a form means to translate user-submitted data back to the properties of an object. To make this happen, the submitted data from the user must be written into the form object:

This controller follows a common pattern for handling forms and has three possible paths:

When the user submits the form, handleRequest() recognizes this and immediately writes the submitted data back into the task and dueDate properties of the $task object. Then this object is validated (validation is explained in the next section). If it is invalid, isValid() returns false and the form is rendered again, but now with validation errors.

By passing $form to the render() method (instead of $form->createView()), the response code is automatically set to HTTP 422 Unprocessable Content. This ensures compatibility with tools relying on the HTTP specification, like Symfony UX Turbo;

Redirecting a user after a successful form submission is a best practice that prevents the user from being able to hit the "Refresh" button of their browser and re-post the data.

If you need more control over exactly when your form is submitted or which data is passed to it, you can use the submit() method to handle form submissions.

In the previous section, you learned how a form can be submitted with valid or invalid data. In Symfony, the question isn't whether the "form" is valid, but whether or not the underlying object ($task in this example) is valid after the form has applied the submitted data to it. Calling $form->isValid() is a shortcut that asks the $task object whether or not it has valid data.

Before using validation, add support for it in your application:

Validation is done by adding a set of rules, called (validation) constraints, to a class. You can add them either to the entity class or by using the constraints option of form types.

To see the first approach - adding constraints to the entity - in action, add the validation constraints, so that the task field cannot be empty, and the dueDate field cannot be empty, and must be a valid DateTimeImmutable object.

That's it! If you re-submit the form with invalid data, you'll see the corresponding errors printed out with the form.

To see the second approach - adding constraints to the form - refer to this section. Both approaches can be used together.

If you create forms in classes, when building the form in the controller you can pass custom options to it as the third optional argument of createForm():

If you try to use the form now, you'll see an error message: The option "require_due_date" does not exist. That's because forms must declare all the options they accept using the configureOptions() method:

Now you can use this new form option inside the buildForm() method:

Each form type has a number of options to configure it, as explained in the Symfony form types reference. Two commonly used options are required and label.

The most common option is the required option, which can be applied to any field. By default, this option is set to true, meaning that HTML5-ready browsers will require you to fill in all fields before submitting the form.

If you don't want this behavior, either disable client-side validation for the entire form or set the required option to false on one or more fields:

The required option does not perform any server-side validation. If a user submits a blank value for the field (either with an old browser or a web service, for example), it will be accepted as a valid value unless you also use Symfony's NotBlank or NotNull validation constraints.

By default, the label of form fields are the humanized version of the property name (user -> User; postalAddress -> Postal Address). Set the label option on fields to define their labels explicitly:

By default, <label> tags of required fields are rendered with a required CSS class, so you can display an asterisk by applying a CSS style:

By default, the <form> tag is rendered with a method="post" attribute, and no action attribute. This means that the form is submitted via an HTTP POST request to the same URL under which it was rendered. When building the form, use the setAction() and setMethod() methods to change this:

When building the form in a class, pass the action and method as form options:

Finally, you can override the action and method in the template by passing them to the form() or the form_start() helper functions:

If the form's method is not GET or POST, but PUT, PATCH or DELETE, Symfony will insert a hidden field with the name _method that stores this method. The form will be submitted in a normal POST request, but Symfony's routing is capable of detecting the _method parameter and will interpret it as a PUT, PATCH or DELETE request. The http_method_override option must be enabled for this to work.

If you inspect the HTML contents of the rendered form, you'll see that the <form> name and the field names are generated from the type class name (e.g. <form name="task" ...> and <select name="task[dueDate][date][month]" ...>).

If you want to modify this, use the createNamed() method:

You can even suppress the name completely by setting it to an empty string.

Thanks to HTML5, many browsers can natively enforce certain validation constraints on the client side. The most common validation is activated by adding a required attribute on fields that are required. For browsers that support HTML5, this will result in a native browser message being displayed if the user tries to submit the form with that field blank.

Generated forms take full advantage of this new feature by adding sensible HTML attributes that trigger the validation. The client-side validation, however, can be disabled by adding the novalidate attribute to the <form> tag or formnovalidate to the submit tag. This is especially useful when you want to test your server-side validation constraints, but are being prevented by your browser from, for example, submitting blank fields.

If the object handled by the form includes validation constraints, Symfony can introspect that metadata to guess the type of your field. In the above example, Symfony can guess from the validation rules that the task field is a normal TextType field and the dueDate field is a DateType field.

To enable Symfony's "guessing mechanism", omit the second argument to the add() method, or pass null to it:

When using a specific form validation group, the field type guesser will still consider all validation constraints when guessing your field types (including constraints that are not part of the validation group(s) being used).

When the guessing mechanism is enabled for some field, in addition to its form type, the following options will be guessed too:

If you'd like to change one of the guessed values, override it in the options field array:

Besides guessing the form type, Symfony also guesses validation constraints if you're using a Doctrine entity. Read Databases and the Doctrine ORM guide for more information.

When editing an object via a form, all form fields are considered properties of the object. Any fields on the form that do not exist on the object will cause an exception to be thrown.

If you need extra fields in the form that won't be stored in the object (for example to add an "I agree with these terms" checkbox), set the mapped option to false in those fields:

These "unmapped fields" can be set and accessed in a controller with:

Additionally, if there are any fields on the form that aren't included in the submitted data, those fields will be explicitly set to null.

When building forms, keep in mind that the first goal of a form is to translate data from an object (Task) to an HTML form so that the user can modify that data. The second goal of a form is to take the data submitted by the user and to re-apply it to the object.

There's a lot more to learn and a lot of powerful tricks in the Symfony forms:

Form Themes and Customization:

Take the exam at home

Make sure your project is risk free

**Examples:**

Example 1 (unknown):
```unknown
$ composer require symfony/form
```

Example 2 (csharp):
```csharp
// src/Entity/Task.php
namespace App\Entity;

class Task
{
    protected string $task;

    protected ?\DateTimeInterface $dueDate;

    public function getTask(): string
    {
        return $this->task;
    }

    public function setTask(string $task): void
    {
        $this->task = $task;
    }

    public function getDueDate(): ?\DateTimeInterface
    {
        return $this->dueDate;
    }

    public function setDueDate(?\DateTimeInterface $dueDate): void
    {
        $this->dueDate = $dueDate;
    }
}
```

Example 3 (unknown):
```unknown
$ php bin/console debug:form

# pass the form type FQCN to only show the options for that type, its parents and extensions.
# For built-in types, you can pass the short classname instead of the FQCN
$ php bin/console debug:form BirthdayType

# pass also an option name to only display the full definition of that option
$ php bin/console debug:form BirthdayType label_attr
```

Example 4 (javascript):
```javascript
// src/Controller/TaskController.php
namespace App\Controller;

use App\Entity\Task;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class TaskController extends AbstractController
{
    public function new(Request $request): Response
    {
        // creates a task object and initializes some data for this example
        $task = new Task();
        $task->setTask('Write a blog post');
        $task->setDueDate(new \DateTimeImmutable('tomorrow'));

        $form = $this->createFormBuilder($task)
            ->add('task', TextType::class)
            ->add('dueDate', DateType::class)
            ->add('save', SubmitType::class, ['label' => 'Create Task'])
            ->getForm();

        // ...
    }
}
```

---

## Sessions

**URL:** https://symfony.com/doc/7.3/session.html

**Contents:**
- Sessions
- Installation
- Basic Usage
- Session Attributes
- Flash Messages
- Configuration
  - Session Idle Time/Keep Alive
  - Configuring Garbage Collection
- Store Sessions in a Database
  - Store Sessions in a key-value Database (Redis)

The Symfony HttpFoundation component has a very powerful and flexible session subsystem which is designed to provide session management that you can use to store information about the user between requests through a clear object-oriented interface using a variety of session storage drivers.

Symfony sessions are designed to replace the usage of the $_SESSION super global and native PHP functions related to manipulating the session like session_start(), session_regenerate_id(), session_id(), session_name(), and session_destroy().

Sessions are only started if you read or write from it.

You need to install the HttpFoundation component to handle sessions:

The session is available through the Request object and the RequestStack service. Symfony injects the request_stack service in services and controllers if you type-hint an argument with RequestStack:

From a Symfony controller, you can also type-hint an argument with Request:

PHP's session management requires the use of the $_SESSION super-global. However, this interferes with code testability and encapsulation in an OOP paradigm. To help overcome this, Symfony uses session bags linked to the session to encapsulate a specific dataset of attributes.

This approach mitigates namespace pollution within the $_SESSION super-global because each bag stores all its data under a unique namespace. This allows Symfony to peacefully co-exist with other applications or libraries that might use the $_SESSION super-global and all data remains completely compatible with Symfony's session management.

A session bag is a PHP object that acts like an array:

Stored attributes remain in the session for the remainder of that user's session. By default, session attributes are key-value pairs managed with the AttributeBag class.

Sessions are automatically started whenever you read, write or even check for the existence of data in the session. This may hurt your application performance because all users will receive a session cookie. In order to prevent starting sessions for anonymous users, you must completely avoid accessing the session.

Sessions will also be started when using features that rely on them internally, such as the stateful CSRF protection in forms.

You can store special messages, called "flash" messages, on the user's session. By design, flash messages are meant to be used exactly once: they vanish from the session automatically as soon as you retrieve them. This feature makes "flash" messages particularly great for storing user notifications.

For example, imagine you're processing a form submission:

After processing the request, the controller sets a flash message in the session and then redirects. The message key (notice in this example) can be anything. You'll use this key to retrieve the message.

In the template of the next page (or even better, in your base layout template), read any flash messages from the session using the flashes() method provided by the Twig global app variable. Alternatively, you can use the peek() method to retrieve the message while keeping it in the bag:

It's common to use notice, warning and error as the keys of the different types of flash messages, but you can use any key that fits your needs.

Accessing flash messages requires starting the session, which in turn causes Symfony to mark the response as private. In general, because flash messages are meant to be displayed only once, pages that might show them cannot reasonably be cached by HTTP caches.

As an alternative, you can load flash messages asynchronously through another HTTP request (for example, using a Twig Live Component), making the original page fully cacheable.

In the Symfony framework, sessions are enabled by default. Session storage and other configuration can be controlled under the framework.session configuration in config/packages/framework.yaml:

Setting the handler_id config option to null means that Symfony will use the native PHP session mechanism. The session metadata files will be stored outside of the Symfony application, in a directory controlled by PHP. Although this usually simplifies things, some session expiration related options may not work as expected if other applications that write to the same directory have short max lifetime settings.

If you prefer, you can use the session.handler.native_file service as handler_id to let Symfony manage the sessions itself. Another useful option is save_path, which defines the directory where Symfony will store the session metadata files:

Check out the Symfony config reference to learn more about the other available Session configuration options.

Symfony sessions are incompatible with php.ini directive session.auto_start = 1 This directive should be turned off in php.ini, in the web server directives or in .htaccess.

The sid_length and sid_bits_per_character options were deprecated in Symfony 7.2 and will be ignored in Symfony 8.0.

The session cookie is also available in the Response object. This is useful to get that cookie in the CLI context or when using PHP runners like Roadrunner or Swoole.

There are often circumstances where you may want to protect, or minimize unauthorized use of a session when a user steps away from their terminal while logged in by destroying the session after a certain period of idle time. For example, it is common for banking applications to log the user out after just 5 to 10 minutes of inactivity. Setting the cookie lifetime here is not appropriate because that can be manipulated by the client, so we must do the expiry on the server side. The easiest way is to implement this via session garbage collection which runs reasonably frequently. The cookie_lifetime would be set to a relatively high value, and the garbage collection gc_maxlifetime would be set to destroy sessions at whatever the desired idle period is.

The other option is specifically check if a session has expired after the session is started. The session can be destroyed as required. This method of processing can allow the expiry of sessions to be integrated into the user experience, for example, by displaying a message.

Symfony records some metadata about each session to give you fine control over the security settings:

Both methods return a Unix timestamp (relative to the server).

This metadata can be used to explicitly expire a session on access:

It is also possible to tell what the cookie_lifetime was set to for a particular cookie by reading the getLifetime() method:

The expiry time of the cookie can be determined by adding the created timestamp and the lifetime.

When a session opens, PHP will call the gc handler randomly according to the probability set by session.gc_probability / session.gc_divisor. For example if these were set to 5/100 respectively, it would mean a probability of 5%. Similarly, 3/4 would mean a 3 in 4 chance of being called, i.e. 75%.

If the garbage collection handler is invoked, PHP will pass the value stored in the php.ini directive session.gc_maxlifetime. The meaning in this context is that any stored session that was saved more than gc_maxlifetime ago should be deleted. This allows one to expire records based on idle time.

However, some operating systems (e.g. Debian) manage session handling differently and set the session.gc_probability variable to 0 to prevent PHP from performing garbage collection. By default, Symfony uses the value of the gc_probability directive set in the php.ini file. If you can't modify this PHP setting, you can configure it directly in Symfony:

Alternatively, you can configure these settings by passing gc_probability, gc_divisor and gc_maxlifetime in an array to the constructor of NativeSessionStorage or to the setOptions() method.

Using the php.ini directive as the default value for gc_probability was introduced in Symfony 7.2.

Symfony stores sessions in files by default. If your application is served by multiple servers, you'll need to use a database instead to make sessions work across different servers.

Symfony can store sessions in all kinds of databases (relational, NoSQL and key-value) but recommends key-value databases like Redis to get best performance.

This section assumes that you have a fully-working Redis server and have also installed and configured the phpredis extension.

You have two different options to use Redis to store sessions:

The first PHP-based option is to configure Redis session handler directly in the server php.ini file:

The second option is to configure Redis sessions in Symfony. First, define a Symfony service for the connection to the Redis server:

Next, use the handler_id configuration option to tell Symfony to use this service as the session handler:

Symfony will now use your Redis server to read and write the session data. The main drawback of this solution is that Redis does not perform session locking, so you can face race conditions when accessing sessions. For example, you may see an "Invalid CSRF token" error because two requests were made in parallel and only the first one stored the CSRF token in the session.

If you use Memcached instead of Redis, follow a similar approach but replace RedisSessionHandler by MemcachedSessionHandler.

When using Redis with a DSN in the handler_id config option, you can add the prefix and ttl options as query string parameters in the DSN.

Symfony includes a PdoSessionHandler to store sessions in relational databases like MariaDB, MySQL and PostgreSQL. To use it, first register a new handler service with your database credentials:

When using MySQL as the database, the DSN defined in DATABASE_URL can contain the charset and unix_socket options as query string parameters.

Next, use the handler_id configuration option to tell Symfony to use this service as the session handler:

The table used to store sessions is called sessions by default and defines certain column names. You can configure these values with the second argument passed to the PdoSessionHandler service:

These are parameters that you can configure:

Before storing sessions in the database, you must create the table that stores the information.

With Doctrine installed, the session table will be automatically generated when you run the make:migration command if the database targeted by doctrine is identical to the one used by this component.

Or if you prefer to create the table yourself and the table has not already been created, the session handler provides a method called createTable() to set up this table for you according to the database engine used:

If the table already exists an exception will be thrown.

If you would rather set up the table yourself, it's recommended to generate an empty database migration with the following command:

Then, find the appropriate SQL for your database below, add it to the migration file and run the migration with the following command:

If needed, you can also add this table to your schema by calling configureSchema() method in your code.

A BLOB column type (which is the one used by default by createTable()) stores up to 64 kb. If the user session data exceeds this, an exception may be thrown or their session will be silently reset. Consider using a MEDIUMBLOB if you need more space.

Symfony includes a MongoDbSessionHandler to store sessions in the MongoDB NoSQL database. First, make sure to have a working MongoDB connection in your Symfony application as explained in the DoctrineMongoDBBundle configuration article.

Then, register a new handler service for MongoDbSessionHandler and pass it the MongoDB connection as argument, and the required parameters:

Next, use the handler_id configuration option to tell Symfony to use this service as the session handler:

That's all! Symfony will now use your MongoDB server to read and write the session data. You do not need to do anything to initialize your session collection. However, you may want to add an index to improve garbage collection performance. Run this from the MongoDB shell:

The collection used to store sessions defines certain field names. You can configure these values with the second argument passed to the MongoDbSessionHandler service:

These are parameters that you can configure:

If your application changes the way sessions are stored, use the MigratingSessionHandler to migrate between old and new save handlers without losing session data.

This is the recommended migration workflow:

Switch to the migrating handler, with your new handler as the write-only one. The old handler behaves as usual and sessions get written to the new one:

Update the migrating handler to use the old handler as the write-only one, so the sessions will now be read from the new handler. This step allows easier rollbacks:

Symfony by default will use PHP's ini setting session.gc_maxlifetime as session lifetime. When you store sessions in a database, you can also configure your own TTL in the framework configuration or even at runtime.

Changing the ini setting is not possible once the session is started so if you want to use a different TTL depending on which user is logged in, you must do it at runtime using the callback method below.

You need to pass the TTL in the options array of the session handler you are using:

If you would like to have a different TTL for different users or sessions for whatever reason, this is also possible by passing a callback as the TTL value. The callback will be called right before the session is written and has to return an integer which will be used as TTL.

Symfony stores the locale setting in the Request, which means that this setting is not automatically saved ("sticky") across requests. But, you can store the locale in the session, so that it's used on subsequent requests.

Create a new event subscriber. Typically, _locale is used as a routing parameter to signify the locale, though you can determine the correct locale however you want:

If you're using the default services.yaml configuration, you're done! Symfony will automatically know about the event subscriber and call the onKernelRequest method on each request.

To see it working, either set the _locale key on the session manually (e.g. via some "Change Locale" route & controller), or create a route with the _locale default.

Explicitly Configure the Subscriber

You can also explicitly configure it, in order to pass in the default_locale:

Now celebrate by changing the user's locale and seeing that it's sticky throughout the request.

Remember, to get the user's locale, always use the Request::getLocale method:

You might want to improve this technique even further and define the locale based on the user entity of the logged in user. However, since the LocaleSubscriber is called before the FirewallListener, which is responsible for handling authentication and setting the user token on the TokenStorage, you have no access to the user which is logged in.

Suppose you have a locale property on your User entity and want to use this as the locale for the given user. To accomplish this, you can hook into the login process and update the user's session with this locale value before they are redirected to their first page.

To do this, you need an event subscriber on the LoginSuccessEvent::class event:

In order to update the language immediately after a user has changed their language preferences, you also need to update the session when you change the User entity.

The session proxy mechanism has a variety of uses and this article demonstrates two common ones. Rather than using the regular session handler, you can create a custom save handler by defining a class that extends the SessionHandlerProxy class.

Then, define the class as a service. If you're using the default services.yaml configuration, that happens automatically.

Finally, use the framework.session.handler_id configuration option to tell Symfony to use your session handler instead of the default one:

Keep reading the next sections to learn how to use the session handlers in practice to solve two common use cases: encrypt session information and define read-only guest sessions.

If you want to encrypt the session data, you can use the proxy to encrypt and decrypt the session as required. The following example uses the php-encryption library, but you can adapt it to any other library that you may be using:

Another possibility to encrypt session data is to decorate the session.marshaller service, which points out to MarshallingSessionHandler. You can decorate this handler with a marshaller that uses encryption, like the SodiumMarshaller.

First, you need to generate a secure key and add it to your secret store as SESSION_DECRYPTION_FILE:

Then, register the SodiumMarshaller service using this key:

This will encrypt the values of the cache items, but not the cache keys. Be careful not to leak sensitive data in the keys.

There are some applications where a session is required for guest users, but where there is no particular need to persist the session. In this case you can intercept the session before it is written:

If you're integrating the Symfony full-stack Framework into a legacy application that starts the session with session_start(), you may still be able to use Symfony's session management by using the PHP Bridge session.

If the application has its own PHP save handler, you can specify null for the handler_id:

Otherwise, if the problem is that you cannot avoid the application starting the session with session_start(), you can still make use of a Symfony based session save handler by specifying the save handler as in the example below:

If the legacy application requires its own session save handler, do not override this. Instead set handler_id: ~. Note that a save handler cannot be changed once the session has been started. If the application starts the session before Symfony is initialized, the save handler will have already been set. In this case, you will need handler_id: ~. Only override the save handler if you are sure the legacy application can use the Symfony save handler without side effects and that the session has not been started before Symfony is initialized.

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

Put the code quality back at the heart of your project

**Examples:**

Example 1 (unknown):
```unknown
$ composer require symfony/http-foundation
```

Example 2 (unknown):
```unknown
use Symfony\Component\HttpFoundation\RequestStack;

class SomeService
{
    public function __construct(
        private RequestStack $requestStack,
    ) {
        // Accessing the session in the constructor is *NOT* recommended, since
        // it might not be accessible yet or lead to unwanted side-effects
        // $this->session = $requestStack->getSession();
    }

    public function someMethod(): void
    {
        $session = $this->requestStack->getSession();

        // ...
    }
}
```

Example 3 (unknown):
```unknown
use Symfony\Component\HttpFoundation\Session\Session;

$session = new Session();
$session->start();
```

Example 4 (unknown):
```unknown
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

public function index(Request $request): Response
{
    $session = $request->getSession();

    // ...
}
```

---

## Cache

**URL:** https://symfony.com/doc/7.3/cache.html

**Contents:**
- Cache
- Configuring Cache with FrameworkBundle
- Creating Custom (Namespaced) Pools
- Custom Provider Options
- Creating a Cache Chain
- Using Cache Tags
- Clearing the Cache
- Encrypting the Cache
- Computing Cache Values Asynchronously

Using a cache is a great way of making your application run quicker. The Symfony cache component ships with many adapters to different storages. Every adapter is developed for high performance.

The following example shows a typical usage of the cache:

Symfony supports Cache Contracts and PSR-6/16 interfaces. You can read more about these at the component documentation.

When configuring the cache component there are a few concepts you should know:

There are two pools that are always enabled by default. They are cache.app and cache.system. The system cache is used for things like annotations, serializer, and validation. The cache.app can be used in your code. You can configure which adapter (template) they use by using the app and system key like:

While it is possible to reconfigure the system cache, it's recommended to keep the default configuration applied to it by Symfony.

The Cache component comes with a series of adapters pre-configured:

There's also a special cache.adapter.system adapter. It's recommended to use it for the system cache. This adapter uses some logic to dynamically select the best possible storage based on your system (either PHP files or APCu).

Some of these adapters could be configured via shortcuts.

Using a DSN as the provider for the PDO adapter was introduced in Symfony 7.1.

You can also create more customized pools:

Each pool manages a set of independent cache keys: keys from different pools never collide, even if they share the same backend. This is achieved by prefixing keys with a namespace that's generated by hashing the name of the pool, the name of the cache adapter class and a configurable seed that defaults to the project directory and compiled container class.

Each custom pool becomes a service whose service ID is the name of the pool (e.g. custom_thing.cache). An autowiring alias is also created for each pool using the camel case version of its name - e.g. custom_thing.cache can be injected automatically by naming the argument $customThingCache and type-hinting it with either CacheInterface or Psr\Cache\CacheItemPoolInterface:

If you need the namespace to be interoperable with a third-party app, you can take control over auto-generation by setting the namespace attribute of the cache.pool service tag. For example, you can override the service definition of the adapter:

Some providers have specific options that can be configured. The RedisAdapter allows you to create providers with the options timeout, retry_interval. etc. To use these options with non-default values you need to create your own \Redis provider and use that when configuring the pool.

Different cache adapters have different strengths and weaknesses. Some might be really quick but optimized to store small items and some may be able to contain a lot of data but are quite slow. To get the best of both worlds you may use a chain of adapters.

A cache chain combines several cache pools into a single one. When storing an item in a cache chain, Symfony stores it in all pools sequentially. When retrieving an item, Symfony tries to get it from the first pool. If it's not found, it tries the next pools until the item is found or an exception is thrown. Because of this behavior, it's recommended to define the adapters in the chain in order from fastest to slowest.

If an error happens when storing an item in a pool, Symfony stores it in the other pools and no exception is thrown. Later, when the item is retrieved, Symfony stores the item automatically in all the missing pools.

In applications with many cache keys it could be useful to organize the data stored to be able to invalidate the cache more efficiently. One way to achieve that is to use cache tags. One or more tags could be added to the cache item. All items with the same tag could be invalidated with one function call:

The cache adapter needs to implement TagAwareCacheInterface to enable this feature. This could be added by using the following configuration.

Tags are stored in the same pool by default. This is good in most scenarios. But sometimes it might be better to store the tags in a different pool. That could be achieved by specifying the adapter.

The interface TagAwareCacheInterface is autowired to the cache.app service.

To clear the cache you can use the bin/console cache:pool:clear [pool] command. That will remove all the entries from your storage and you will have to recalculate all the values. You can also group your pools into "cache clearers". There are 3 cache clearers by default:

The global clearer clears all the cache items in every pool. The system cache clearer is used in the bin/console cache:clear command. The app clearer is the default clearer.

To see all available cache pools:

Clear all custom pools:

Clear all cache pools:

Clear all cache pools except some:

Clear all caches everywhere:

Clear cache by tag(s):

To encrypt the cache using libsodium, you can use the SodiumMarshaller.

First, you need to generate a secure key and add it to your secret store as CACHE_DECRYPTION_KEY:

Then, register the SodiumMarshaller service using this key:

This will encrypt the values of the cache items, but not the cache keys. Be careful not to leak sensitive data in the keys.

When configuring multiple keys, the first key will be used for reading and writing, and the additional key(s) will only be used for reading. Once all cache items encrypted with the old key have expired, you can completely remove OLD_CACHE_DECRYPTION_KEY.

The Cache component uses the probabilistic early expiration algorithm to protect against the cache stampede problem. This means that some cache items are elected for early-expiration while they are still fresh.

By default, expired cache items are computed synchronously. However, you can compute them asynchronously by delegating the value computation to a background worker using the Messenger component. In this case, when an item is queried, its cached value is immediately returned and a EarlyExpirationMessage is dispatched through a Messenger bus.

When this message is handled by a message consumer, the refreshed cache value is computed asynchronously. The next time the item is queried, the refreshed value will be fresh and returned.

First, create a service that will compute the item's value:

This cache value will be requested from a controller, another service, etc. In the following example, the value is requested from a controller:

Finally, configure a new cache pool (e.g. called async.cache) that will use a message bus to compute values in a worker:

You can now start the consumer:

That's it! Now, whenever an item is queried from this cache pool, its cached value will be returned immediately. If it is elected for early-expiration, a message will be sent through to bus to schedule a background computation to refresh the value.

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (unknown):
```unknown
use Symfony\Contracts\Cache\ItemInterface;

// The callable will only be executed on a cache miss.
$value = $pool->get('my_cache_key', function (ItemInterface $item): string {
    $item->expiresAfter(3600);

    // ... do some HTTP request or heavy computations
    $computedValue = 'foobar';

    return $computedValue;
});

echo $value; // 'foobar'

// ... and to remove the cache key
$pool->delete('my_cache_key');
```

Example 2 (unknown):
```unknown
# config/packages/cache.yaml
framework:
    cache:
        app: cache.adapter.filesystem
        system: cache.adapter.system
```

Example 3 (unknown):
```unknown
<!-- config/packages/cache.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:framework="http://symfony.com/schema/dic/symfony"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd
        http://symfony.com/schema/dic/symfony
        https://symfony.com/schema/dic/symfony/symfony-1.0.xsd"
>
    <framework:config>
        <framework:cache
            app="cache.adapter.filesystem"
            system="cache.adapter.system"
        />
    </framework:config>
</container>
```

Example 4 (unknown):
```unknown
// config/packages/cache.php
use Symfony\Config\FrameworkConfig;

return static function (FrameworkConfig $framework): void {
    $framework->cache()
        ->app('cache.adapter.filesystem')
        ->system('cache.adapter.system')
    ;
};
```

---

## HTTP Cache

**URL:** https://symfony.com/doc/7.3/http_cache.html

**Contents:**
- HTTP Cache
- Caching on the Shoulders of Giants
- Caching with a Gateway Cache
  - Symfony Reverse Proxy
- Making your Responses HTTP Cacheable
  - Expiration Caching
  - Validation Caching
  - Safe Methods: Only caching GET or HEAD requests
  - More Response Methods
- Cache Invalidation

The nature of rich web applications means that they're dynamic. No matter how efficient your application, each request will always contain more overhead than serving a static file. Usually, that's fine. But when you need your requests to be lightning fast, you need HTTP caching.

With HTTP Caching, you cache the full output of a page (i.e. the response) and bypass your application entirely on subsequent requests. Caching entire responses isn't always possible for highly dynamic sites, or is it? With Edge Side Includes (ESI), you can use the power of HTTP caching on only fragments of your site.

The Symfony cache system is different because it relies on the simplicity and power of the HTTP cache as defined in RFC 7234 - Caching. Instead of reinventing a caching methodology, Symfony embraces the standard that defines basic communication on the Web. Once you understand the fundamental HTTP validation and expiration caching models, you'll be ready to understand the Symfony cache system.

Since caching with HTTP isn't unique to Symfony, many articles already exist on the topic. If you're new to HTTP caching, Ryan Tomayko's article Things Caches Do is highly recommended. Another in-depth resource is Mark Nottingham's Cache Tutorial.

When caching with HTTP, the cache is separated from your application entirely and sits between your application and the client making the request.

The job of the cache is to accept requests from the client and pass them back to your application. The cache will also receive responses back from your application and forward them on to the client. The cache is the "middle-man" of the request-response communication between the client and your application.

Along the way, the cache will store each response that is deemed "cacheable" (See HTTP Cache). If the same resource is requested again, the cache sends the cached response to the client, ignoring your application entirely.

This type of cache is known as an HTTP gateway cache and many exist such as Varnish, Squid in reverse proxy mode, and the Symfony reverse proxy.

Gateway caches are sometimes referred to as reverse proxy caches, surrogate caches, or even HTTP accelerators.

Symfony comes with a reverse proxy (i.e. gateway cache) written in PHP. It's not a fully-featured reverse proxy cache like Varnish, but it is a great way to start.

For details on setting up Varnish, see How to Use Varnish to Speed up my Website.

Use the framework.http_cache option to enable the proxy for the prod environment:

The kernel will immediately act as a reverse proxy: caching responses from your application and returning them to the client.

The proxy has a sensible default configuration, but it can be finely tuned via a set of options.

When in debug mode, Symfony automatically adds an X-Symfony-Cache header to the response. You can also use the trace_level config option and set it to either none, short or full to add this information.

short will add the information for the main request only. It's written in a concise way that makes it easy to record the information in your server log files. For example, in Apache you can use %{X-Symfony-Cache}o in LogFormat format statements. This information can be used to extract general information about cache efficiency of your routes.

You can change the name of the header used for the trace information using the trace_header config option.

Changing from one Reverse Proxy to another

The Symfony reverse proxy is a great tool to use when developing your website or when you deploy your website to a shared host where you cannot install anything beyond PHP code. But being written in PHP, it cannot be as fast as a proxy written in C.

Fortunately, since all reverse proxies are effectively the same, you should be able to switch to something more robust - like Varnish - without any problems. See How to use Varnish

Once you've added a reverse proxy cache (e.g. like the Symfony reverse proxy or Varnish), you're ready to cache your responses. To do that, you need to communicate to your cache which responses are cacheable and for how long. This is done by setting HTTP cache headers on the response.

HTTP specifies four response cache headers that you can set to enable caching:

These four headers are used to help cache your responses via two different models:

Reading the HTTP Specification

All of the HTTP headers you'll read about are not invented by Symfony! They're part of an HTTP specification that's used by sites all over the web. To dig deeper into HTTP Caching, check out the documents RFC 7234 - Caching and RFC 7232 - Conditional Requests.

As a web developer, you are strongly urged to read the specification. Its clarity and power - even more than fifteen years after its creation - is invaluable. Don't be put-off by the appearance of the spec - its contents are much more beautiful than its cover!

The easiest way to cache a response is by caching it for a specific amount of time:

Thanks to this new code, your HTTP response will have the following header:

This tells your HTTP reverse proxy to cache this response for 3600 seconds. If anyone requests this URL again before 3600 seconds, your application won't be hit at all. If you're using the Symfony reverse proxy, look at the X-Symfony-Cache header for debugging information about cache hits and misses.

The URI of the request is used as the cache key (unless you vary).

This provides great performance and is simple to use. But, cache invalidation is not supported. If your content change, you'll need to wait until your cache expires for the page to update.

Actually, you can manually invalidate your cache, but it's not part of the HTTP Caching spec. See Cache Invalidation.

If you need to set cache headers for many different controller actions, check out FOSHttpCacheBundle. It provides a way to define cache headers based on the URL pattern and other request properties.

Finally, for more information about expiration caching, see HTTP Cache Expiration.

With expiration caching, you say "cache for 3600 seconds!". But, when someone updates cached content, you won't see that content on your site until the cache expires.

If you need to see updated content immediately, you either need to invalidate your cache or use the validation caching model.

For details, see HTTP Cache Validation.

HTTP caching only works for "safe" HTTP methods (like GET and HEAD). This means three things:

The Response class provides many more methods related to the cache. Here are the most useful ones:

Additionally, most cache-related HTTP headers can be set via the single setCache() method:

All these options are also available when using the #[Cache] attribute.

Cache invalidation is not part of the HTTP specification. Still, it can be really useful to delete various HTTP cache entries as soon as some content on your site is updated.

For details, see Cache Invalidation.

When pages contain dynamic parts, you may not be able to cache entire pages, but only parts of it. Read Working with Edge Side Includes to find out how to configure different cache strategies for specific parts of your page.

Whenever the session is started during a request, Symfony turns the response into a private non-cacheable response. This is the best default behavior to not cache private user information (e.g. a shopping cart, a user profile details, etc.) and expose it to other visitors.

However, even requests making use of the session can be cached under some circumstances. For example, information related to some user group could be cached for all the users belonging to that group. Handling these advanced caching scenarios is out of the scope of Symfony, but they can be solved with the FOSHttpCacheBundle.

In order to disable the default Symfony behavior that makes requests using the session uncacheable, add the following internal header to your response and Symfony won't modify it:

Symfony was designed to follow the proven rules of the road: HTTP. Caching is no exception. Mastering the Symfony cache system means becoming familiar with the HTTP cache models and using them effectively. This means that, instead of relying only on Symfony documentation and code examples, you have access to a world of knowledge related to HTTP caching and gateway caches such as Varnish.

Online exam, become Sylius certified today

Make sure your project is risk free

**Examples:**

Example 1 (unknown):
```unknown
# config/packages/framework.yaml
when@prod:
    framework:
        http_cache: true
```

Example 2 (unknown):
```unknown
<!-- config/packages/framework.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:framework="http://symfony.com/schema/dic/symfony"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd
        http://symfony.com/schema/dic/symfony
        https://symfony.com/schema/dic/symfony/symfony-1.0.xsd">

    <when env="prod">
      <framework:config>
          <!-- ... -->
          <framework:http-cache enabled="true"/>
      </framework:config>
    </when>
</container>
```

Example 3 (unknown):
```unknown
// config/packages/framework.php
use Symfony\Config\FrameworkConfig;

return static function (FrameworkConfig $framework, string $env): void {
    if ('prod' === $env) {
        $framework->httpCache()->enabled(true);
    }
};
```

Example 4 (unknown):
```unknown
// src/Controller/BlogController.php
use Symfony\Component\HttpKernel\Attribute\Cache;
// ...

#[Cache(public: true, maxage: 3600, mustRevalidate: true)]
public function index(): Response
{
    return $this->render('blog/index.html.twig', []);
}
```

---

## Framework Configuration Reference (FrameworkBundle)

**URL:** https://symfony.com/doc/7.3/reference/configuration/framework.html

**Contents:**
- Framework Configuration Reference (FrameworkBundle)
- annotations
  - cache
  - debug
  - file_cache_dir
- assets
  - base_path
  - base_urls
  - json_manifest_path
  - packages

The FrameworkBundle defines the main framework configuration, from sessions and translations to forms, validation, routing and more. All these options are configured under the framework key in your application configuration.

When using XML, you must use the http://symfony.com/schema/dic/symfony namespace and the related XSD schema is available at: https://symfony.com/schema/dic/symfony/symfony-1.0.xsd

type: string default: php_array

This option can be one of the following values:

type: boolean default: %kernel.debug%

Whether to enable debug mode for caching. If enabled, the cache will automatically update when the original file is changed (both with code and annotation changes). For performance reasons, it is recommended to disable debug mode in production, which will happen automatically if you use the default value.

type: string default: %kernel.cache_dir%/annotations

The directory to store cache files for annotations, in case annotations.cache is set to 'file'.

The following options configure the behavior of the Twig asset() function.

This option allows you to prepend a base path to the URLs generated for assets:

With this configuration, a call to asset('logo.png') will generate /images/logo.png instead of /logo.png.

This option allows you to define base URLs to be used for assets. If multiple base URLs are provided, Symfony will select one from the collection each time it generates an asset's path:

type: string default: null

The file path or absolute URL to a manifest.json file containing an associative array of asset names and their respective compiled names. A common cache-busting technique using a "manifest" file works by writing out assets with a "hash" appended to their file names (e.g. main.ae433f1cb.css) during a front-end compilation routine.

Symfony's Webpack Encore supports outputting hashed assets. Moreover, this can be incorporated into many other workflows, including Webpack and Gulp using webpack-manifest-plugin and gulp-rev, respectively.

This option can be set globally for all assets and individually for each asset package:

This parameter cannot be set at the same time as version or version_strategy. Additionally, this option cannot be nullified at the package scope if a global manifest file is specified.

If you request an asset that is not found in the manifest.json file, the original - unmodified - asset path will be returned. You can set strict_mode to true to get an exception when an asset is not found.

If a URL is set, the JSON manifest is downloaded on each request using the http_client.

After having configured one or more asset packages, you have two ways of injecting them in any service or controller:

(1) Use a specific argument name

Type-hint your constructor/method argument with PackageInterface and name the argument using this pattern: "asset package name in camelCase". For example, to inject the foo_package package defined earlier:

(2) Use the #[Target] attribute

When dealing with multiple implementations of the same type the #[Target] attribute helps you select which one to inject. Symfony creates a target called "asset package name" + .package suffix.

For example, to select the foo_package package defined earlier:

You can group assets into packages, to specify different base URLs for them:

Now you can use the avatars package in your templates:

Each package can configure the following options:

type: boolean default: false

When enabled, the strict mode asserts that all requested assets are in the manifest file. This option is useful to detect typos or missing assets, the recommended value is %kernel.debug%.

This option is used to bust the cache on assets by globally adding a query parameter to all rendered asset paths (e.g. /images/logo.png?v2). This applies only to assets rendered via the Twig asset() function (or PHP equivalent).

For example, suppose you have the following:

By default, this will render a path to your image such as /images/logo.png. Now, activate the version option:

Now, the same asset will be rendered as /images/logo.png?v2 If you use this feature, you must manually increment the version value before each deployment so that the query parameters change.

You can also control how the query string works via the version_format option.

This parameter cannot be set at the same time as version_strategy or json_manifest_path.

As with all settings, you can use a parameter as value for the version. This makes it easier to increment the cache on each deployment.

type: string default: %%s?%%s

This specifies a sprintf pattern that will be used with the version option to construct an asset's path. By default, the pattern adds the asset's version as a query string. For example, if version_format is set to %%s?version=%%s and version is set to 5, the asset's path would be /images/logo.png?version=5.

All percentage signs (%) in the format string must be doubled to escape the character. Without escaping, values might inadvertently be interpreted as Service Container.

Some CDN's do not support cache-busting via query strings, so injecting the version into the actual file path is necessary. Thankfully, version_format is not limited to producing versioned query strings.

The pattern receives the asset's original path and version as its first and second parameters, respectively. Since the asset's path is one parameter, you cannot modify it in-place (e.g. /images/logo-v5.png); however, you can prefix the asset's path using a pattern of version-%%2$s/%%1$s, which would result in the path version-5/images/logo.png.

URL rewrite rules could then be used to disregard the version prefix before serving the asset. Alternatively, you could copy assets to the appropriate version path as part of your deployment process and forgot any URL rewriting. The latter option is useful if you would like older asset versions to remain accessible at their original URL.

type: string default: null

The service id of the asset version strategy applied to the assets. This option can be set globally for all assets and individually for each asset package:

This parameter cannot be set at the same time as version or json_manifest_path.

type: string default: cache.adapter.filesystem

The cache adapter used by the cache.app service. The FrameworkBundle ships with multiple adapters: cache.adapter.apcu, cache.adapter.system, cache.adapter.filesystem, cache.adapter.psr6, cache.adapter.redis, cache.adapter.memcached, cache.adapter.pdo and cache.adapter.doctrine_dbal.

There's also a special adapter called cache.adapter.array which stores contents in memory using a PHP array and it's used to disable caching (mostly on the dev environment).

It might be tough to understand at the beginning, so to avoid confusion remember that all pools perform the same actions but on different medium given the adapter they are based on. Internally, a pool wraps the definition of an adapter.

The service name to use as your default Doctrine provider. The provider is available as the cache.default_doctrine_provider service.

type: string default: memcached://localhost

The DSN to use by the Memcached provider. The provider is available as the cache.default_memcached_provider service.

type: string default: doctrine.dbal.default_connection

The service id of the database connection, which should be either a PDO or a Doctrine DBAL instance. The provider is available as the cache.default_pdo_provider service.

The service name to use as your default PSR-6 provider. It is available as the cache.default_psr6_provider service.

type: string default: redis://localhost

The DSN to use by the Redis provider. The provider is available as the cache.default_redis_provider service.

type: string default: %kernel.cache_dir%/pools

The path to the cache directory used by services inheriting from the cache.adapter.filesystem adapter (including cache.app).

A list of cache pools to be created by the framework extension.

For more information about how pools work, see cache pools.

To configure a Redis cache pool with a default lifetime of 1 hour, do the following:

type: string default: cache.app

The service name of the adapter to use. You can specify one of the default services that follow the pattern cache.adapter.[type]. Alternatively you can specify another cache pool as base, which will make this pool inherit the settings from the base pool as defaults.

Your service needs to implement the Psr\Cache\CacheItemPoolInterface interface.

The cache clearer used to clear your PSR-6 cache.

For more information, see Psr6CacheClearer.

type: integer | string

Default lifetime of your cache items. Give an integer value to set the default lifetime in seconds. A string value could be ISO 8601 time interval, like "PT5M" or a PHP date expression that is accepted by strtotime(), like "5 minutes".

If no value is provided, the cache adapter will fallback to the default value on the actual cache storage.

Name of the pool you want to create.

Your pool name must differ from cache.app or cache.system.

Overwrite the default service name or DSN respectively, if you do not want to use what is configured as default_X_provider under cache. See the description of the default provider setting above for information on how to specify your specific provider.

type: boolean default: false

Whether your service should be public or not.

type: boolean | string default: null

Whether your service should be able to handle tags or not. Can also be the service id of another cache pool where tags will be stored.

type: string default: _%kernel.project_dir%.%kernel.container_class%

This value is used as part of the "namespace" generated for the cache item keys. A common practice is to use the unique name of the application (e.g. symfony.com) because that prevents naming collisions when deploying multiple applications into the same path (on different servers) that share the same cache backend.

It's also useful when using blue/green deployment strategies and more generally, when you need to abstract out the actual deployment directory (for example, when warming caches offline).

The prefix_seed option is used at compile time. This means that any change made to this value after container's compilation will have no effect.

type: string default: cache.adapter.system

The cache adapter used by the cache.system service. It supports the same adapters available for the cache.app service.

For more information about CSRF protection, see How to Implement CSRF Protection.

type: boolean default: true or false depending on your installation

This option can be used to disable CSRF protection on all forms. But you can also disable CSRF protection on individual forms.

If you're using forms, but want to avoid starting your session (e.g. using forms in an API-only website), csrf_protection will need to be set to false.

type: array default: []

The list of CSRF token ids that will use stateless CSRF protection.

The stateless_token_ids option was introduced in Symfony 7.2.

type: integer or bool default: false

Whether to check the CSRF token in an HTTP header in addition to the cookie when using stateless CSRF protection. You can also set this to 2 (the value of the CHECK_ONLY_HEADER constant on the SameOriginCsrfTokenManager class) to check only the header and ignore the cookie.

The check_header option was introduced in Symfony 7.2.

type: string default: csrf-token

The name of the cookie (and HTTP header) to use for the double-submit when using stateless CSRF protection.

The cookie_name option was introduced in Symfony 7.2.

type: string default: en

The default locale is used if no _locale routing parameter has been set. It is available with the Request::getDefaultLocale method.

You can read more information about the default locale in Translations.

type: array default: [] (empty array = enable all locales)

Symfony applications generate by default the translation files for validation and security messages in all locales. If your application only uses some locales, use this option to restrict the files generated by Symfony and improve performance a bit:

An added bonus of defining the enabled locales is that they are automatically added as a requirement of the special _locale parameter. For example, if you define this value as ['ar', 'he', 'ja', 'zh'], the _locale routing parameter will have an ar|he|ja|zh requirement. If some user makes requests with a locale not included in this option, they'll see a 404 error.

type: boolean default: false

If this option is set to true, the response will have a Content-Language HTTP header set with the Request locale.

type: boolean default: false

If this option is set to true, the Request locale will automatically be set to the value of the Accept-Language HTTP header.

When the _locale request attribute is passed, the Accept-Language header is ignored.

type: boolean default: true when the debug mode is enabled, false otherwise.

If true, Symfony adds a X-Robots-Tag: noindex HTTP tag to all responses (unless your own app adds that header, in which case it's not modified). This X-Robots-Tag HTTP header tells search engines to not index your web site. This option is a protection measure in case you accidentally publish your site in debug mode.

type: string default: error_controller

This is the controller that is called when an exception is thrown anywhere in your application. The default controller (ErrorController) renders specific templates under different error conditions (see How to Customize Error Pages).

You can read more about Edge Side Includes (ESI) in Working with Edge Side Includes.

type: boolean default: false

Whether to enable the edge side includes support in the framework.

You can also set esi to true to enable it:

Defines the log level, log channel and HTTP status code applied to the exceptions that match the given exception class:

The log_channel option was introduced in Symfony 7.3.

The order in which you configure exceptions is important because Symfony will use the configuration of the first exception that matches instanceof:

You can map a status code and a set of headers to an exception thanks to the #[WithHttpStatus] attribute on the exception class:

It is also possible to map a log level on a custom exception class using the #[WithLogLevel] attribute:

The attributes can also be added to interfaces directly:

Support to use #[WithHttpStatus] and #[WithLogLevel] attributes on interfaces was introduced in Symfony 7.1.

type: boolean default: true or false depending on your installation

Whether to enable the form services or not in the service container. If you don't use forms, setting this to false may increase your application's performance because less services will be loaded into the container.

This option will automatically be set to true when one of the child settings is configured.

This will automatically enable the validation.

For more details, see Forms.

type: string default: _token

This is the field name that you should give to the CSRF token field of your forms.

type: array default: ['data-controller' => 'csrf-protection']

HTML attributes to add to the CSRF token field of your forms.

type: string default: null

The CSRF token ID used to validate the CSRF tokens of your forms. This setting applies only to form types that use service autoconfiguration, which typically means your own form types, not those registered by third-party bundles.

Learn more about fragments in the HTTP Cache article.

type: boolean default: false

Whether to enable the fragment listener or not. The fragment listener is used to render ESI fragments independently of the rest of the page.

This setting is automatically set to true when one of the child settings is configured.

type: string default: null

Sets the content shown during the loading of the fragment or when JavaScript is disabled. This can be either a template name or the content itself.

See Creating and Using Templates for more information about hinclude.

type: string default: /_fragment

The path prefix for fragments. The fragment listener will only be executed when the request starts with this path.

type: boolean default: true

When set to true, the Symfony kernel will catch all \Throwable exceptions thrown by the application and will turn them into HTTP responses.

The html_sanitizer option (and its children) are used to configure custom HTML sanitizers. Read more about the options in the HTML sanitizer documentation.

type: boolean default: false

Specifies whether the client can force a cache reload by including a Cache-Control "no-cache" directive in the request. Set it to true for compliance with RFC 2616.

type: boolean default: false

Specifies whether the client can force a cache revalidate by including a Cache-Control "max-age=0" directive in the request. Set it to true for compliance with RFC 2616.

type: boolean default: %kernel.debug%

If true, exceptions are thrown when things go wrong. Otherwise, the cache will try to carry on and deliver a meaningful response.

type: integer default: 0

The number of seconds that a cache entry should be considered fresh when no explicit freshness information is provided in a response. Explicit Cache-Control or Expires headers override this value.

type: boolean default: false

type: array default: ['Authorization', 'Cookie']

Set of request headers that trigger "private" cache-control behavior on responses that don't explicitly state whether the response is public or private via a Cache-Control directive.

type: array default: Set-Cookie

Set of response headers that will never be cached even when the response is cacheable and public.

type: integer default: 60

Specifies the default number of seconds (the granularity is the second) during which the cache can serve a stale response when an error is encountered. This setting is overridden by the stale-if-error HTTP Cache-Control extension (see RFC 5861).

type: integer default: 2

Specifies the default number of seconds (the granularity is the second as the Response TTL precision is a second) during which the cache can immediately return a stale response while it revalidates it in the background. This setting is overridden by the stale-while-revalidate HTTP Cache-Control extension (see RFC 5861).

type: string default: 'X-Symfony-Cache'

Header name to use for traces.

type: string possible values: 'none', 'short' or 'full'

For 'short', a concise trace of the main request will be added as an HTTP header. 'full' will add traces for all requests (including ESI subrequests). (default: 'full' if in debug; 'none' otherwise)

When the HttpClient component is installed, an HTTP client is available as a service named http_client or using the autowiring alias HttpClientInterface.

This service can be configured using framework.http_client.default_options:

Multiple pre-configured HTTP client services can be defined, each with its service name defined as a key under scoped_clients. Scoped clients inherit the default options defined for the http_client service. You can override these options and can define a few others:

Options defined for scoped clients apply only to URLs that match either their base_uri or the scope option when it is defined. Non-matching URLs always use default options.

Each scoped client also defines a corresponding named autowiring alias. If you use for example Symfony\Contracts\HttpClient\HttpClientInterface $myApiClient as the type and name of an argument, autowiring will inject the my_api.client service into your autowired classes.

The username and password used to create the Authorization HTTP header used in HTTP Basic authentication. The value of this option must follow the format username:password.

The token used to create the Authorization HTTP header used in HTTP Bearer authentication (also called token authentication).

The username and password used to create the Authorization HTTP header used in the Microsoft NTLM authentication protocol. The value of this option must follow the format username:password. This authentication mechanism requires using the cURL-based transport.

URI that is merged into relative URIs, following the rules explained in the RFC 3986 standard. This is useful when all the requests you make share a common prefix (e.g. https://api.github.com/) so you can avoid adding it to every request.

Here are some common examples of how base_uri merging works in practice:

A network interface name, IP address, a host name or a UNIX socket to use as the outgoing network interface.

type: boolean | Closure

Buffering the response means that you can access its content multiple times without performing the request again. Buffering is enabled by default when the content type of the response is text/*, application/json or application/xml.

If this option is a boolean value, the response is buffered when the value is true. If this option is a closure, the response is buffered when the returned value is true (the closure receives as argument an array with the response headers).

The path of the certificate authority file that contains one or more certificates used to verify the other servers' certificates.

The path to a directory that contains one or more certificate authority files.

A list of the names of the ciphers allowed for the TLS connections. They can be separated by colons, commas or spaces (e.g. 'RC4-SHA:TLS13-AES-128-GCM-SHA256').

The minimum version of TLS to accept. The value must be one of the STREAM_CRYPTO_METHOD_TLSv*_CLIENT constants defined by PHP.

Arbitrary additional data to pass to the HTTP client for further use. This can be particularly useful when decorating an existing client.

An associative array of the HTTP headers added before making the request. This value must use the format ['header-name' => 'value0, value1, ...'].

type: string | null default: null

The HTTP version to use, typically '1.1' or '2.0'. Leave it to null to let Symfony select the best version automatically.

The path to a file that contains the PEM formatted certificate used by the HTTP client. This is often combined with the local_pk and passphrase options.

The path of a file that contains the PEM formatted private key of the certificate defined in the local_cert option.

type: float default: 0

The maximum execution time, in seconds, that the request and the response are allowed to take. A value lower than or equal to 0 means it is unlimited.

type: integer default: 6

Defines the maximum amount of simultaneously open connections to a single host (considering a "host" the same as a "host name + port number" pair). This limit also applies for proxy connections, where the proxy is considered to be the host for which this limit is applied.

type: integer default: 20

The maximum number of redirects to follow. Use 0 to not follow any redirection.

type: string | null default: null

A comma separated list of hosts that do not require a proxy to be reached, even if one is configured. Use the '*' wildcard to match all hosts and an empty string to match none (disables the proxy).

The passphrase used to encrypt the certificate stored in the file defined in the local_cert option.

When negotiating a TLS connection, the server sends a certificate indicating its identity. A public key is extracted from this certificate and if it does not exactly match any of the public keys provided in this option, the connection is aborted before sending or receiving any data.

The value of this option is an associative array of algorithm => hash (e.g ['pin-sha256' => '...']).

The HTTP proxy to use to make the requests. Leave it to null to detect the proxy automatically based on your system configuration.

An associative array of the query string values added to the URL before making the request. This value must use the format ['parameter-name' => parameter-value, ...].

The service ID of the rate limiter used to limit the number of HTTP requests within a certain period. The service must implement the LimiterInterface.

The rate_limiter option was introduced in Symfony 7.1.

A list of hostnames and their IP addresses to pre-populate the DNS cache used by the HTTP client in order to avoid a DNS lookup for those hosts. This option is useful to improve security when IPs are checked before the URL is passed to the client and to make your tests easier.

The value of this option is an associative array of domain => IP address (e.g ['symfony.com' => '46.137.106.254', ...]).

This option configures the behavior of the HTTP client when some request fails, including which types of requests to retry and how many times. The behavior is defined with the following options:

type: integer default: 1000

The initial delay in milliseconds used to compute the waiting time between retries.

type: boolean default: false

Whether to enable the support for retry failed HTTP request or not. This setting is automatically set to true when one of the child settings is configured.

type: array default: DEFAULT_RETRY_STATUS_CODES()

The list of HTTP status codes that triggers a retry of the request.

type: float default: 0.1 (must be between 0.0 and 1.0)

This option adds some randomness to the delay. It's useful to avoid sending multiple requests to the server at the exact same time. The randomness is calculated as delay * jitter. For example: if delay is 1000ms and jitter is 0.2, the actual delay will be a number between 800 and 1200 (1000 +/- 20%).

type: integer default: 0

The maximum amount of milliseconds initial to wait between retries. Use 0 to not limit the duration.

type: integer default: 3

The maximum number of retries for failing requests. When the maximum is reached, the client returns the last received response.

type: float default: 2

This value is multiplied to the delay each time a retry occurs, to distribute retries in time instead of making all of them sequentially.

The service is used to decide if a request should be retried and to compute the time to wait between retries. By default, it uses an instance of GenericRetryStrategy configured with http_codes, delay, max_delay, multiplier and jitter options. This class has to implement RetryStrategyInterface.

For scoped clients only: the regular expression that the URL must match before applying all other non-default options. By default, the scope is derived from base_uri.

type: float default: depends on your PHP config

Time, in seconds, to wait for network activity. If the connection is idle for longer, a TransportException is thrown. Its default value is the same as the value of PHP's default_socket_timeout config option.

type: boolean default: true

If true, the certificate sent by other servers is verified to ensure that their common name matches the host included in the URL. This is usually combined with verify_peer to also verify the certificate authenticity.

type: boolean default: true

If true, the certificate sent by other servers when negotiating a TLS connection is verified for authenticity. Authenticating the certificate is not enough to be sure about the server, so you should combine this with the verify_host option.

type: boolean default: false

This determines whether the _method request parameter is used as the intended HTTP method on POST requests. If enabled, the Request::enableHttpMethodParameterOverride method gets called automatically. It becomes the service container parameter named kernel.http_method_override.

Changing the Action and HTTP Method of Symfony forms.

If you're using the HttpCache Reverse Proxy with this option, the kernel will ignore the _method parameter, which could lead to errors.

To fix this, invoke the enableHttpMethodParameterOverride() method before creating the Request object:

type: string default: %env(default::SYMFONY_IDE)%

Symfony turns file paths seen in variable dumps and exception messages into links that open those files right inside your browser. If you prefer to open those files in your favorite IDE or text editor, set this option to any of the following values: phpstorm, sublime, textmate, macvim, emacs, atom and vscode.

The phpstorm option is supported natively by PhpStorm on macOS and Windows; Linux requires installing phpstorm-url-handler.

If you use another editor, the expected configuration value is a URL template that contains an %f placeholder where the file path is expected and %l placeholder for the line number (percentage signs (%) must be escaped by doubling them to prevent Symfony from interpreting them as container parameters).

Since every developer uses a different IDE, the recommended way to enable this feature is to configure it on a system level. First, you can define this option in the SYMFONY_IDE environment variable, which Symfony reads automatically when framework.ide config is not set.

Another alternative is to set the xdebug.file_link_format option in your php.ini configuration file. The format to use is the same as for the framework.ide option, but without the need to escape the percent signs (%) by doubling them:

If both framework.ide and xdebug.file_link_format are defined, Symfony uses the value of the xdebug.file_link_format option.

Setting the xdebug.file_link_format ini option works even if the Xdebug extension is not enabled.

When running your app in a container or in a virtual machine, you can tell Symfony to map files from the guest to the host by changing their prefix. This map should be specified at the end of the URL template, using & and > as guest-to-host separators:

The default lock adapter. If not defined, the value is set to semaphore when available, or to flock otherwise. Store's DSN are also allowed.

type: boolean default: true

Whether to enable the support for lock or not. This setting is automatically set to true when one of the child settings is configured.

A map of lock stores to be created by the framework extension, with the name as key and DSN or service id as value:

For more details, see Dealing with Concurrency with Locks.

Name of the lock you want to create.

type: string default: null

The DSN used by the mailer. When several DSN may be used, use transports option (see below) instead.

The "envelope recipient" which is used as the value of RCPT TO during the the SMTP session. This value overrides any other recipient set in the code.

The "envelope sender" which is used as the value of MAIL FROM during the SMTP session. This value overrides any other sender set in the code.

Headers to add to emails. The key (name attribute in xml format) is the header name and value the header value.

For more information, see Configuring Emails Globally

type: string default: null or default bus if Messenger component is installed

Service identifier of the message bus to use when using the Messenger component (e.g. messenger.default_bus).

A list of DSN that can be used by the mailer. A transport name is the key and the dsn is the value.

type: boolean default: true

Whether to enable or not Messenger.

For more details, see the Messenger component documentation.

type: boolean, int or array<int, string> default: true

Use the application logger instead of the PHP logger for logging PHP errors. When an integer value is used, it defines a bitmask of PHP errors that will be logged. Those integer values must be the same used in the error_reporting PHP option. The default log levels will be used for each PHP error. When a boolean value is used, true enables logging for all PHP errors while false disables logging entirely.

This option also accepts a map of PHP errors to log levels:

type: boolean default: %kernel.debug%

Throw PHP errors as \ErrorException instances. The parameter debug.error_handler.throw_at controls the threshold.

type: boolean default: true

This option configures the way the profiler behaves when it is enabled. If set to true, the profiler collects data for all requests. If you want to only collect information on-demand, you can set the collect flag to false and activate the data collectors manually:

type: string default: null

This specifies name of a query parameter, a body parameter or a request attribute used to enable or disable collection of data by the profiler for each request. Combine it with the collect option to enable/disable the profiler on demand:

type: boolean default: false

When this option is true, all normalizers and encoders are decorated by traceable implementations that collect profiling information about them.

Setting the collect_serializer_data option to false is deprecated since Symfony 7.3.

type: string default: file:%kernel.cache_dir%/profiler

The DSN where to store the profiling information.

type: boolean default: false

The profiler can be enabled by setting this option to true. When you install it using Symfony Flex, the profiler is enabled in the dev and test environments.

The profiler works independently from the Web Developer Toolbar, see the WebProfilerBundle configuration on how to disable/enable the toolbar.

type: boolean default: false

When this is set to true, the profiler will only be enabled when an exception is thrown during the handling of the request.

type: boolean default: false

When this is set to true, the profiler will only be enabled on the main requests (and not on the subrequests).

type: boolean default: false

When enabled, the property_accessor service uses PHP's magic __call() method when its getValue() method is called.

type: boolean default: true

When enabled, the property_accessor service uses PHP's magic __get() method when its getValue() method is called.

type: boolean default: true

When enabled, the property_accessor service uses PHP's magic __set() method when its setValue() method is called.

type: boolean default: false

When enabled, the property_accessor service throws an exception when you try to access an invalid index of an array.

type: boolean default: true

When enabled, the property_accessor service throws an exception when you try to access an invalid property path of an object.

type: boolean default: true or false depending on your installation

type: boolean default: false

Configures the property_info service to extract property information from the constructor arguments using the ConstructorExtractor.

The with_constructor_extractor option was introduced in Symfony 7.3. It's required to set a value for it because its default value will change from false to true in Symfony 8.0.

Name of the rate limiter you want to create.

type: string default: lock.factory

The service that is used to create a lock. The service has to be an instance of the LockFactory class.

type: string required

The name of the rate limiting algorithm to use. Example names are fixed_window, sliding_window and no_limit. See Rate Limiter Policies) for more information.

type: array default: []

This setting is used to associate additional request formats (e.g. html) to one or more mime types (e.g. text/html), which will allow you to use the format & mime types to call Request::getFormat($mimeType) or Request::getMimeType($format).

In practice, this is important because Symfony uses it to automatically set the Content-Type header on the Response (if you don't explicitly set one). If you pass an array of mime types, the first will be used for the header.

To configure a jsonp format:

type: string default: %kernel.cache_dir%

The directory where routing information will be cached. Can be set to ~ (null) to disable route caching.

Setting the cache_dir option is deprecated since Symfony 7.1. The routes are now always cached in the %kernel.build_dir% directory.

The default URI used to generate URLs in a non-HTTP context (see Generating URLs in Commands).

type: integer default: 80

The port for normal http requests (this is used when matching the scheme).

type: integer default: 443

The port for https requests (this is used when matching the scheme).

type: string required

The path the main routing resource (e.g. a YAML file) that contains the routes and imports the router should load.

type: mixed default: true

Determines the routing generator behavior. When generating a route that has specific parameter requirements, the generator can behave differently in case the used parameters do not meet these requirements.

The value can be one of:

true is recommended in the development environment, while false or null might be preferred in production.

The type of the resource to hint the loaders about the format. This isn't needed when you use the default routers with the expected file extensions (.xml, .yaml, .php).

type: boolean default: true

When this option is set to true, the regular expressions used in the requirements of route parameters will be run using the utf-8 modifier. This will for example match any UTF-8 character when using ., instead of matching only a single byte.

If the charset of your application is UTF-8 (as defined in the getCharset() method of your kernel) it's recommended setting it to true. This will make non-UTF8 URLs to generate 404 errors.

type: string required

This is a string that should be unique to your application and it's commonly used to add more entropy to security related operations. Its value should be a series of characters, numbers and symbols chosen randomly and the recommended length is around 32 characters.

In practice, Symfony uses this value for encrypting the cookies used in the remember me functionality and for creating signed URIs when using ESI (Edge Side Includes). That's why you should treat this value as if it were a sensitive credential and never make it public.

This option becomes the service container parameter named kernel.secret, which you can use whenever the application needs an immutable random string to add more entropy.

As with any other security-related parameter, it is a good practice to change this value from time to time. However, keep in mind that changing this value will invalidate all signed URIs and Remember Me cookies. That's why, after changing this value, you should regenerate the application cache and log out all the application users.

type: string default: base64:default::SYMFONY_DECRYPTION_SECRET

The env var name that contains the vault decryption secret. By default, this value will be decoded from base64.

type: boolean default: true

Whether to enable or not secrets managements.

type: string default: %kernel.project_dir%/.env.%kernel.environment%.local

The path to the local .env file. This file must contain the vault decryption key, given by the decryption_env_var option.

type: string default: %kernel.project_dir%/config/secrets/%kernel.runtime_environment%

The directory to store the secret vault. By default, the path includes the value of the kernel.runtime_environment parameter.

The default semaphore adapter. Store's DSN are also allowed.

type: boolean default: true

Whether to enable the support for semaphore or not. This setting is automatically set to true when one of the child settings is configured.

A map of semaphore stores to be created by the framework extension, with the name as key and DSN or service id as value:

Name of the semaphore you want to create.

The service id that is used as the circular reference handler of the default serializer. The service has to implement the magic __invoke($object) method.

For more information, see How to Use the Serializer.

type: array default: []

A map with default context options that will be used with each serialize and deserialize call. This can be used for example to set the json encoding behavior by setting json_encode_options to a json_encode flags bitmask.

You can inspect the serializer context builders to discover the available settings.

type: boolean default: true

Enables support for PHP attributes in the serializer component.

See the reference for a list of supported annotations.

type: boolean default: true or false depending on your installation

Whether to enable the serializer service or not in the service container.

type: array default: []

This option allows to define an array of paths with files or directories where the component will look for additional serialization files.

The name converter to use. The CamelCaseToSnakeCaseNameConverter name converter can enabled by using the serializer.name_converter.camel_case_to_snake_case value.

For more information, see How to Use the Serializer.

type: string default: 0

If set to 0, Symfony won't set any particular header related to the cache and it will rely on php.ini's session.cache_limiter directive.

Unlike the other session options, cache_limiter is set as a regular container parameter:

Be aware that if you configure it, you'll have to set other session-related options as parameters as well.

This determines the domain to set in the session cookie.

If not set, php.ini's session.cookie_domain directive will be relied on.

type: boolean default: true

This determines whether cookies should only be accessible through the HTTP protocol. This means that the cookie won't be accessible by scripting languages, such as JavaScript. This setting can effectively help to reduce identity theft through XSS attacks.

This determines the lifetime of the session - in seconds. Setting this value to 0 means the cookie is valid for the length of the browser session.

If not set, php.ini's session.cookie_lifetime directive will be relied on.

This determines the path to set in the session cookie.

If not set, php.ini's session.cookie_path directive will be relied on.

type: string or null default: 'lax'

It controls the way cookies are sent when the HTTP request did not originate from the same domain that is associated with the cookies. Setting this option is recommended to mitigate CSRF security attacks.

By default, browsers send all cookies related to the domain of the HTTP request. This may be a problem for example when you visit a forum and some malicious comment includes a link like https://some-bank.com/?send_money_to=attacker&amount=1000. If you were previously logged into your bank website, the browser will send all those cookies when making that HTTP request.

The possible values for this option are:

type: boolean or 'auto'

This determines whether cookies should only be sent over secure connections. In addition to true and false, there's a special 'auto' value that means true for HTTPS requests and false for HTTP requests.

If not set, php.ini's session.cookie_secure directive will be relied on.

type: boolean default: true

Whether to enable the session support in the framework.

If not set, php.ini's session.gc_divisor directive will be relied on.

This determines the number of seconds after which data will be seen as "garbage" and potentially cleaned up. Garbage collection may occur during session start and depends on gc_divisor and gc_probability.

If not set, php.ini's session.gc_maxlifetime directive will be relied on.

This defines the probability that the garbage collector (GC) process is started on every session initialization. The probability is calculated by using gc_probability / gc_divisor, e.g. 1/100 means there is a 1% chance that the GC process will start on each request.

If not set, Symfony will use the value of the session.gc_probability directive in the php.ini configuration file.

Relying on php.ini's directive as default for gc_probability was introduced in Symfony 7.2.

type: string | null default: null

If framework.session.save_path is not set, the default value of this option is null, which means to use the session handler configured in php.ini. If the framework.session.save_path option is set, then Symfony stores sessions using the native file session handler.

It is possible to store sessions in a database, and also to configure the session handler with a DSN:

Supported DSN protocols are the following:

type: integer default: 0

This is how many seconds to wait between updating/writing the session metadata. This can be useful if, for some reason, you want to limit the frequency at which the session persists, instead of doing that on every request.

This specifies the name of the session cookie.

If not set, php.ini's session.name directive will be relied on.

type: string | null default: %kernel.cache_dir%/sessions

This determines the argument to be passed to the save handler. If you choose the default file handler, this is the path where the session files are created.

If null, php.ini's session.save_path directive will be relied on:

This determines the number of bits in the encoded session ID character. The possible values are 4 (0-9, a-f), 5 (0-9, a-v), and 6 (0-9, a-z, A-Z, "-", ","). The more bits results in stronger session ID. 5 is recommended value for most environments.

If not set, php.ini's session.sid_bits_per_character directive will be relied on.

The sid_bits_per_character option was deprecated in Symfony 7.2. No alternative is provided as PHP 8.4 has deprecated the related option.

This determines the length of session ID string, which can be an integer between 22 and 256 (both inclusive), 32 being the recommended value. Longer session IDs are harder to guess.

If not set, php.ini's session.sid_length directive will be relied on.

The sid_length option was deprecated in Symfony 7.2. No alternative is provided as PHP 8.4 has deprecated the related option.

type: string default: session.storage.factory.native

The service ID used for creating the SessionStorageInterface that stores the session. This service is available in the Symfony application via the session.storage.factory service alias. The class has to implement SessionStorageFactoryInterface. To see a list of all available storages, run:

This specifies if the session ID is stored on the client side using cookies or not.

If not set, php.ini's session.use_cookies directive will be relied on.

type: boolean default: false

Whether to enable or not SSI support in your application.

If this configuration setting is present (and not false), then the services related to testing your application (e.g. test.client) are loaded. This setting should be present in your test environment (usually via config/packages/test/framework.yaml).

For more information, see Testing.

type: string | null default: %kernel.cache_dir%/translations

Defines the directory where the translation cache is stored. Use null to disable this cache.

type: string default: %kernel.project_dir%/translations

This option allows to define the path where the application translations files are stored.

type: boolean default: true or false depending on your installation

Whether or not to enable the translator service in the service container.

type: string|array default: value of default_locale

This option is used when the translation key for the current locale wasn't found.

For more details, see Translations.

type: string default: translator.formatter.default

The ID of the service used to format translation messages. The service class must implement the MessageFormatterInterface.

default: true when the debug mode is enabled, false otherwise.

When true, a log entry is made whenever the translator cannot find a translation for a given key. The logs are made to the translation channel at the debug level for keys where there is a translation in the fallback locale, and the warning level if there is no translation to use at all.

type: array default: []

This option allows to define an array of paths where the component will look for translation files. The later a path is added, the more priority it has (translations from later paths overwrite earlier ones). Translations from the default_path have more priority than translations from all these paths.

type: array default: []

This option enables and configures translation providers to push and pull your translations to/from third party translation services.

type: boolean default: %env(bool:default::SYMFONY_TRUST_X_SENDFILE_TYPE_HEADER)%

In Symfony 7.2, the default value of this option was changed from false to the value stored in the SYMFONY_TRUST_X_SENDFILE_TYPE_HEADER environment variable.

X-Sendfile is a special HTTP header that tells web servers to replace the response contents by the file that is defined in that header. This improves performance because files are no longer served by your application but directly by the web server.

This configuration option determines whether to trust x-sendfile header for BinaryFileResponse. If enabled, Symfony calls the BinaryFileResponse::trustXSendfileTypeHeader method automatically. It becomes the service container parameter named kernel.trust_x_sendfile_type_header.

The trusted_headers option is needed to configure which client information should be trusted (e.g. their host) when running Symfony behind a load balancer or a reverse proxy. See How to Configure Symfony to Work behind a Load Balancer or a Reverse Proxy.

type: array | string default: ['%env(default::SYMFONY_TRUSTED_HOSTS)%']

In Symfony 7.2, the default value of this option was changed from [] to the value stored in the SYMFONY_TRUSTED_HOSTS environment variable.

A lot of different attacks have been discovered relying on inconsistencies in handling the Host header by various software (web servers, reverse proxies, web frameworks, etc.). Basically, every time the framework is generating an absolute URL (when sending an email to reset a password for instance), the host might have been manipulated by an attacker.

You can read HTTP Host header attacks for more information about these kinds of attacks.

The Symfony Request::getHost() method might be vulnerable to some of these attacks because it depends on the configuration of your web server. One simple solution to avoid these attacks is to configure a list of hosts that your Symfony application can respond to. That's the purpose of this trusted_hosts option. If the incoming request's hostname doesn't match one of the regular expressions in this list, the application won't respond and the user will receive a 400 response.

Hosts can also be configured to respond to any subdomain, via ^(.+\.)?example\.com$ for instance.

In addition, you can also set the trusted hosts in the front controller using the Request::setTrustedHosts() method:

The default value for this option is an empty array, meaning that the application can respond to any given host.

Read more about this in the Security Advisory Blog post.

The trusted_proxies option is needed to get precise information about the client (e.g. their IP address) when running Symfony behind a load balancer or a reverse proxy. See How to Configure Symfony to Work behind a Load Balancer or a Reverse Proxy.

type: array default: []

Defines the Doctrine entities that will be introspected to add automatic validation constraints to them:

type: boolean default: false

Validation error messages are automatically translated to the current application locale. Set this option to true to disable translation of validation messages. This is useful to avoid "missing translation" errors in applications that use only a single language.

The disable_translation option was introduced in Symfony 7.3.

type: string default: html5

Sets the default value for the "mode" option of the Email validator.

type: boolean default: true

If this option is enabled, validation constraints can be defined using PHP attributes.

type: boolean default: true or false depending on your installation

Whether or not to enable validation support.

This option will automatically be set to true when one of the child settings is configured.

type: array default: ['config/validation/']

This option allows to define an array of paths with files or directories where the component will look for additional validation files:

The NotCompromisedPassword constraint makes HTTP requests to a public API to check if the given password has been compromised in a data breach.

type: boolean default: true

If you set this option to false, no HTTP requests will be made and the given password will be considered valid. This is useful when you don't want or can't make HTTP requests, such as in dev and test environments or in continuous integration servers.

type: string default: null

By default, the NotCompromisedPassword constraint uses the public API provided by haveibeenpwned.com. This option allows to define a different, but compatible, API endpoint to make the password checks. It's useful for example when the Symfony application is run in an intranet without public access to the internet.

type: string | array default: ['loadValidatorMetadata']

Defines the name of the static method which is called to load the validation metadata of the class. You can define an array of strings with the names of several methods. In that case, all of them will be called in that order to load the metadata.

type: string | false default: validators

The translation domain that is used when translating validation constraint error messages. Use false to disable translations.

type: boolean default: true or false depending on your installation

Adds a Link HTTP header to the response.

The webhook option (and its children) are used to configure the webhooks defined in your application. Read more about the options in the Webhook documentation.

A list of workflows to be created by the framework extension:

See also the article about using workflows in Symfony applications.

type: boolean default: false

Whether to enable the support for workflows or not. This setting is automatically set to true when one of the child settings is configured.

Name of the workflow you want to create.

If set to true, the AuditTrailListener will be enabled.

One of the places or empty. If not null and the supported object is not already initialized via the workflow, this place will be set.

Each marking store can define any of these options:

Metadata available for the workflow configuration. Note that places and transitions can also have their own metadata entry.

All available places (type: string) for the workflow configuration.

The FQCN (fully-qualified class name) of the object supported by the workflow configuration or an array of FQCN if multiple objects are supported.

Each marking store can define any of these options:

type: string possible values: 'workflow' or 'state_machine'

Defines the kind of workflow that is going to be created, which can be either a normal workflow or a state machine. Read this article to know their differences.

Check Code Performance in Dev, Test, Staging & Production

The life jacket for your team and your project

**Examples:**

Example 1 (unknown):
```unknown
# displays the default config values defined by Symfony
$ php bin/console config:dump-reference framework

# displays the actual config values used by your application
$ php bin/console debug:config framework
```

Example 2 (unknown):
```unknown
# config/packages/framework.yaml
framework:
    # ...
    assets:
        base_path: '/images'
```

Example 3 (unknown):
```unknown
<!-- config/packages/framework.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:framework="http://symfony.com/schema/dic/symfony"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd
        http://symfony.com/schema/dic/symfony https://symfony.com/schema/dic/symfony/symfony-1.0.xsd">

    <framework:config>
        <framework:assets base-path="/images"/>
    </framework:config>
</container>
```

Example 4 (unknown):
```unknown
// config/packages/framework.php
use Symfony\Config\FrameworkConfig;

return static function (FrameworkConfig $framework): void {
    // ...
    $framework->assets()
        ->basePath('/images');
};
```

---

## Working with Edge Side Includes

**URL:** https://symfony.com/doc/7.3/http_cache/esi.html

**Contents:**
- Working with Edge Side Includes
- Using ESI in Symfony

Gateway caches are a great way to make your website perform better. But they have one limitation: they can only cache whole pages. If your pages contain dynamic sections, such as the user name or a shopping cart, you are out of luck. Fortunately, Symfony provides a solution for these cases, based on a technology called ESI, or Edge Side Includes. Akamai wrote this specification in 2001 and it allows specific parts of a page to have a different caching strategy than the main page.

The ESI specification describes tags you can embed in your pages to communicate with the gateway cache. Only one tag is implemented in Symfony, include, as this is the only useful one outside of Akamai context:

Notice from the example that each ESI tag requires a fully-qualified URL. An ESI tag represents a page fragment that can be fetched via the given URL.

When a request is handled, the gateway cache fetches the entire page from its cache or requests it from the backend application. If the response contains one or more ESI tags, these are processed in the same way. In other words, the gateway cache either retrieves the included page fragment from its cache or requests the page fragment from the backend application again. When all the ESI tags have been resolved, the gateway cache merges each into the main page and sends the final content to the client.

All of this happens transparently at the gateway cache level (i.e. outside of your application). As you'll see, if you choose to take advantage of ESI tags, Symfony makes the process of including them almost effortless.

First, to use ESI, be sure to enable it in your application configuration:

Now, suppose you have a page that is relatively static, except for a news ticker at the bottom of the content. With ESI, you can cache the news ticker independently of the rest of the page:

In this example, the response is marked as public to make the full page cacheable for all requests with a lifetime of ten minutes. Next, include the news ticker in the template by embedding an action. This is done via the render() helper (for more details, see how to embed controllers in templates).

As the embedded content comes from another page (or controller for that matter), Symfony uses the standard render helper to configure ESI tags:

By using the esi renderer (via the render_esi() Twig function), you tell Symfony that the action should be rendered as an ESI tag. You might be wondering why you would want to use a helper instead of just writing the ESI tag yourself. That's because using a helper makes your application work even if there is no gateway cache installed.

As you'll see below, the maxPerPage variable you pass is available as an argument to your controller (i.e. $maxPerPage). The variables passed through render_esi also become part of the cache key so that you have unique caches for each combination of variables and values.

When using the default render() function (or setting the renderer to inline), Symfony merges the included page content into the main one before sending the response to the client. But if you use the esi renderer (i.e. call render_esi()) and if Symfony detects that it's talking to a gateway cache that supports ESI, it generates an ESI include tag. But if there is no gateway cache or if it does not support ESI, Symfony will just merge the included page content within the main one as it would have done if you had used render().

Symfony considers that a gateway cache supports ESI if its request include the Surrogate-Capability HTTP header and the value of that header contains the ESI/1.0 string anywhere.

The embedded action can now specify its own caching rules entirely independently of the main page:

In this example, the embedded action is cached publicly too because the contents are the same for all requests. However, in other cases you may need to make this response non-public and even non-cacheable, depending on your needs.

Putting all the above code together, with ESI the full page cache will be valid for 600 seconds, but the news component cache will only last for 60 seconds.

When using a controller reference, the ESI tag should reference the embedded action as an accessible URL so the gateway cache can fetch it independently of the rest of the page. Symfony takes care of generating a unique URL for any controller reference and it is able to route them properly thanks to the FragmentListener that must be enabled in your configuration:

One great advantage of the ESI renderer is that you can make your application as dynamic as needed and at the same time, hit the application as little as possible.

The fragment listener only responds to signed requests. Requests are only signed when using the fragment renderer and the render_esi Twig function.

The render_esi helper supports three other useful options:

Code consumes server resources. Blackfire tells you how

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (unknown):
```unknown
<!DOCTYPE html>
<html>
    <body>
        <!-- ... some content -->

        <!-- Embed the content of another page here -->
        <esi:include src="http://..."/>

        <!-- ... more content -->
    </body>
</html>
```

Example 2 (unknown):
```unknown
# config/packages/framework.yaml
framework:
    # ...
    esi: true
```

Example 3 (unknown):
```unknown
<!-- config/packages/framework.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:framework="http://symfony.com/schema/dic/symfony"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd
        http://symfony.com/schema/dic/symfony
        https://symfony.com/schema/dic/symfony/symfony-1.0.xsd">

    <framework:config>
        <!-- ... -->
        <framework:esi enabled="true"/>
    </framework:config>
</container>
```

Example 4 (unknown):
```unknown
// config/packages/framework.php
use Symfony\Config\FrameworkConfig;

return static function (FrameworkConfig $framework): void {
    $framework->esi()
        ->enabled(true)
    ;
};
```

---

## Form Types Reference

**URL:** https://symfony.com/doc/7.3/reference/forms/types.html

**Contents:**
- Form Types Reference
- Supported Field Types
  - Text Fields
  - Choice Fields
  - Date and Time Fields
  - Other Fields
  - Symfony UX Fields
  - UID Fields
  - Field Groups
  - Hidden Fields

A form is composed of fields, each of which are built with the help of a field type (e.g. TextType, ChoiceType, etc). Symfony comes standard with a large list of field types that can be used in your application.

The following field types are natively available in Symfony:

These types are part of the Symfony UX Packages

Online exam, become Symfony certified today

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

---

## How to Embed Forms

**URL:** https://symfony.com/doc/7.3/form/embedded.html

**Contents:**
- How to Embed Forms
- Embedding a Single Object
- Embedding a Collection of Forms

Often, you'll want to build a form that will include fields from many different objects. For example, a registration form may contain data belonging to a User object as well as many Address objects. Fortunately this can be achieved by the Form component.

Suppose that each Task belongs to a Category object. Start by creating the Category class:

Next, add a new category property to the Task class:

The Valid Constraint has been added to the property category. This cascades the validation to the corresponding entity. If you omit this constraint, the child entity would not be validated.

Now that your application has been updated to reflect the new requirements, create a form class so that a Category object can be modified by the user:

The end goal is to allow the Category of a Task to be modified right inside the task form itself. To accomplish this, add a category field to the TaskType object whose type is an instance of the new CategoryType class:

The fields from CategoryType can now be rendered alongside those from the TaskType class.

Render the Category fields in the same way as the original Task fields:

When the user submits the form, the submitted data for the Category fields are used to construct an instance of Category, which is then set on the category field of the Task instance.

The Category instance is accessible naturally via $task->getCategory() and can be persisted to the database or used however you need.

You can also embed a collection of forms into one form (imagine a Category form with many Product sub-forms). This is done by using the collection field type.

For more information see the How to Embed a Collection of Forms article and the CollectionType reference.

Measure & Improve Symfony Code Performance

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (csharp):
```csharp
// src/Entity/Category.php
namespace App\Entity;

use Symfony\Component\Validator\Constraints as Assert;

class Category
{
    #[Assert\NotBlank]
    public string $name;
}
```

Example 2 (unknown):
```unknown
// ...

class Task
{
    // ...

    #[Assert\Type(type: Category::class)]
    #[Assert\Valid]
    protected ?Category $category = null;

    // ...

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): void
    {
        $this->category = $category;
    }
}
```

Example 3 (javascript):
```javascript
// src/Form/CategoryType.php
namespace App\Form;

use App\Entity\Category;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CategoryType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('name');
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Category::class,
        ]);
    }
}
```

Example 4 (unknown):
```unknown
// src/Form/TaskType.php
use App\Form\CategoryType;
use Symfony\Component\Form\FormBuilderInterface;

public function buildForm(FormBuilderInterface $builder, array $options): void
{
    // ...

    $builder->add('category', CategoryType::class);
}
```

---

## FormType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/form.html

**Contents:**
- FormType Field
- Field Options
  - action
  - allow_extra_fields
  - by_reference
  - compound
  - constraints
  - data
  - data_class
  - empty_data

The FormType predefines a couple of options that are then available on all types for which FormType is the parent.

The full list of options defined and inherited by this form type is available running this command in your app:

type: string default: empty string

This option specifies where to send the form's data on submission (usually a URI). Its value is rendered as the action attribute of the form element. An empty value is considered a same-document reference, i.e. the form will be submitted to the same URI that rendered the form.

type: boolean default: false

Usually, if you submit extra fields that aren't configured in your form, you'll get a "This form should not contain extra fields." validation error.

You can silence this validation error by enabling the allow_extra_fields option on the form.

type: boolean default: true

In most cases, if you have an author field, then you expect setAuthor() to be called on the underlying object. In some cases, however, setAuthor() may not be called. Setting by_reference to false ensures that the setter is called in all cases.

To explain this further, here's a simple example:

If by_reference is true, the following takes place behind the scenes when you call submit() (or handleRequest()) on the form:

Notice that setAuthor() is not called. The author is modified by reference.

If you set by_reference to false, submitting looks like this:

So, all that by_reference=false really does is that it clones the object, which enforces the framework to call the setter on the parent object.

Similarly, if you're using the CollectionType field where your underlying collection data is an object (like with Doctrine's ArrayCollection), then by_reference must be set to false if you need the adder and remover (e.g. addAuthor() and removeAuthor()) to be called.

type: boolean default: true

A compound form can be either an entire <form> element or a group of form fields (rendered for example inside a <div> or <tr> container elements). Compound forms use the DataMapperInterface to initialize their children or to write back their submitted data.

A simple (non-compound) form is rendered as any of these HTML elements: <input> (TextType, FileType, HiddenType), <textarea> (TextareaType) or <select> (ChoiceType).

Some core types like date related types or the ChoiceType are simple or compound depending on other options (such as expanded or widget). They will either behave as a simple text field or as a group of text or choice fields.

type: array or Constraint default: []

Allows you to attach one or more validation constraints to a specific field. For more information, see Adding Validation. This option is added in the FormTypeValidatorExtension form extension.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

This option is used to set the appropriate data mapper to be used by the form, so you can use it for any form field type which requires an object:

The actual default value of this option depends on other field options:

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: callable default: null

This callable takes form data and returns whether value is considered empty.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string default: This form should not contain extra fields.

This is the validation error message that's used if the submitted form data contains one or more fields that are not part of the form definition. The placeholder {{ extra_fields }} can be used to display a comma separated list of the submitted extra field names.

This message can be pluralized, see formatting pluralized messages for details.

type: boolean or string default: false

When true and used on a form element, it adds a "form" attribute to its HTML field representation with its HTML form id. By doing this, a form element can be rendered outside the HTML form while still working as expected:

This can be useful when you need to solve nested form problems. You can also set this to true on a root form to automatically set the "form" attribute on all its children.

When the root form has no ID, form_attr is required to be a string identifier to be used as the form ID.

type: callable default: null

When provided, this callable will be invoked to read the value from the underlying object that will be used to populate the form field.

More details are available in the section on When and How to Use Data Mappers.

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: array default: []

The content of the help option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The help_translation_parameters option of children fields is merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

type: boolean default: false

This option determines if the form will inherit data from its parent form. This can be useful if you have a set of fields that are duplicated across multiple forms. See How to Reduce Code Duplication with "inherit_data".

When a field has the inherit_data option set, it uses the data of the parent form as is. This means that Data Transformers won't be applied to that field.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: string default: POST

This option specifies the HTTP method used to submit the form's data. Its value is rendered as the method attribute of the form element and is used to decide whether to process the form submission in the handleRequest() method after submission. Possible values are:

When the method is PUT, PATCH, or DELETE, Symfony will automatically render a _method hidden field in your form. This is used to "fake" these HTTP methods, as they're not supported on standard browsers. This can be useful when matching routes by HTTP method.

The PATCH method allows submitting partial data. In other words, if the submitted form data is missing certain fields, those will be ignored and the default values (if any) will be used. With all other HTTP methods, if the submitted form data is missing some fields, those fields are set to null.

type: string default: The uploaded file was too large. Please try to upload a smaller file.

This is the validation error message that's used if submitted POST form data exceeds php.ini's post_max_size directive. The {{ max }} placeholder can be used to display the allowed size.

Validating the post_max_size only happens on the root form.

type: PropertyPathInterface|string|null default: null

By default (when the value of this option is null) form fields read from and write to the properties with the same names in the form's domain object. The property_path option lets you define which property a field reads from and writes to. The value of this option can be any valid PropertyAccess syntax.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: callable default: null

When provided, this callable will be invoked to map the form value back to the underlying object.

More details are available in the section on When and How to Use Data Mappers.

type: boolean default: true

If true, the whitespace of the submitted string value will be stripped via the trim function when the data is bound. This guarantees that if a value is submitted with extra whitespace, it will be removed before the value is merged back onto the underlying object.

type: array, string, callable, GroupSequence, or null default: null

This option is only valid on the root form. It specifies which validation groups will be used by the validator.

If set to null, the validator will use only the Default group. For the other possible values, see the main article about using validation groups in Symfony forms

In some cases, you want to validate your groups step by step. To do this, you can pass a GroupSequence to this option. This enables you to validate against multiple groups, like when you pass multiple groups in an array, but with the difference that a group is only validated if the previous groups pass without errors. Here's an example:

Read the article How to Sequentially Apply Validation Groups to find out more about this.

The following options are defined in the BaseType class. The BaseType class is the parent class for both the form type and the ButtonType, but it is not part of the form type tree (i.e. it cannot be used as a form type on its own).

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: boolean default: true

An internal option: sets whether the form should be initialized automatically. For all fields, this option should only be true for root forms. You won't need to change this option and probably won't need to worry about it.

type: string default: the form's name (see Knowing which block to customize)

Allows you to add a custom block name to the ones used by default to render the form type. Useful for example if you have multiple instances of the same form and you need to personalize the rendering of the forms individually.

If you set for example this option to my_custom_name and the field is of type text, Symfony will use the following names (and in this order) to find the block used to render the widget of the field: _my_custom_name_widget, text_widget and form_widget.

type: string or null default: null (see Knowing which block to customize)

Allows you to add a custom block prefix and override the block name used to render the form type. Useful for example if you have multiple instances of the same form and you need to personalize the rendering of all of them without the need to create a new form type.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

type: string, null or false default: null

This is the translation domain that will be used for any label or option that is rendered for this field. Use null to reuse the translation domain of the parent form (or the default domain of the translator for the root form). Use false to disable translations.

type: array default: []

The content of the label option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The label_translation_parameters option of children fields is merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

type: array default: []

The content of the title and placeholder values defined in the attr option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The attr_translation_parameters option of children fields is merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

type: integer default: 0

Fields are rendered in the same order as they are included in the form. This option changes the field rendering priority, allowing you to display fields earlier or later than their original order.

This option will affect the view order only. The higher this priority, the earlier the field will be rendered. Priority can also be negative and fields with the same priority will keep their original order.

Symfony Code Performance Profiling

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
// ...

$builder = $this->createFormBuilder($article);
$builder
    ->add('title', TextType::class)
    ->add(
        $builder->create('author', FormType::class, ['by_reference' => ?])
            ->add('name', TextType::class)
            ->add('email', EmailType::class)
    )
```

Example 3 (unknown):
```unknown
$article->setTitle('...');
$article->getAuthor()->setName('...');
$article->getAuthor()->setEmail('...');
```

Example 4 (unknown):
```unknown
$article->setTitle('...');
$author = clone $article->getAuthor();
$author->setName('...');
$author->setEmail('...');
$article->setAuthor($author);
```

---

## Configuring Validation Groups in Forms

**URL:** https://symfony.com/doc/7.3/form/validation_groups.html

**Contents:**
- Configuring Validation Groups in Forms
- Choosing Validation Groups Based on the Clicked Button
- Choosing Validation Groups Based on Submitted Data
- Choosing Validation Groups via a Service
- Learn More

If the object handled in your form uses validation groups, you need to specify which validation group(s) the form should apply.

To define them when creating forms in classes, use the configureOptions() method:

When creating forms in controllers, pass it as a form option:

In both cases, only the registration group will be used to validate the object. To apply the registration group and all constraints not in any other group, add the special Default group:

You can use any name for your validation groups. Symfony recommends using "lower snake case" (e.g. foo_bar), while automatically generated groups use "UpperCamelCase" (e.g. Default, SomeClassName).

When your form has multiple submit buttons, you can change the validation group based on the clicked button. For example, in a multi-step form like the following, you might want to skip validation when returning to a previous step:

To do so, configure the validation groups of the previousStep button to false, which is a special value that skips validation:

Now the form will skip your validation constraints when that button is clicked. It will still validate basic integrity constraints, such as checking whether an uploaded file was too large or whether you tried to submit text in a number field.

To determine validation groups dynamically based on submitted data, use a callback. This is called after the form is submitted, but before validation is invoked. The callback receives the form object as its first argument:

Adding Default to the list of validation groups is common but not mandatory. See the main article about validation groups to learn more about validation groups and the default constraints.

You can also pass a static class method callback:

If validation group logic requires services or can't fit in a closure, use a dedicated validation group resolver service. The class of this service must be invokable and receives the form object as its first argument:

Then use the service in your form type:

For more information about how validation groups work, see How to Apply only a Subset of all Your Validation Constraints (Validation Groups).

Show your Symfony expertise

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (javascript):
```javascript
use Symfony\Component\OptionsResolver\OptionsResolver;

public function configureOptions(OptionsResolver $resolver): void
{
    $resolver->setDefaults([
        // ...
        'validation_groups' => ['registration'],
    ]);
}
```

Example 2 (javascript):
```javascript
$form = $this->createFormBuilder($user, [
    'validation_groups' => ['registration'],
])->add(/* ... */);
```

Example 3 (javascript):
```javascript
[
    // ...
    'validation_groups' => ['Default', 'registration'],
]
```

Example 4 (unknown):
```unknown
$form = $this->createFormBuilder($task)
    // ...
    ->add('nextStep', SubmitType::class)
    ->add('previousStep', SubmitType::class)
    ->getForm();
```

---

## How to Embed a Collection of Forms

**URL:** https://symfony.com/doc/7.3/form/form_collections.html

**Contents:**
- How to Embed a Collection of Forms
- Allowing "new" Tags with the "Prototype"
  - JavaScript with Stimulus
  - Handling the new Tags in PHP
- Allowing Tags to be Removed

Symfony Forms can embed a collection of many other forms, which is useful to edit related entities in a single form. In this article, you'll create a form to edit a Task class and, right inside the same form, you'll be able to edit, create and remove many Tag objects related to that Task.

Let's start by creating a Task entity:

The ArrayCollection is specific to Doctrine and is similar to a PHP array but provides many utility methods.

Now, create a Tag class. As you saw above, a Task can have many Tag objects:

Then, create a form class so that a Tag object can be modified by the user:

Next, let's create a form for the Task entity, using a CollectionType field of TagType forms. This will allow us to modify all the Tag elements of a Task right inside the task form itself:

In your controller, you'll create a new form from the TaskType:

In the template, you can now iterate over the existing TagType forms to render them:

When the user submits the form, the submitted data for the tags field is used to construct an ArrayCollection of Tag objects. The collection is then set on the tag field of the Task and can be accessed via $task->getTags().

So far, this works great, but only to edit existing tags. It doesn't allow us yet to add new tags or delete existing ones.

You can embed nested collections as many levels down as you like. However, if you use Xdebug, you may receive a Maximum function nesting level of '100' reached, aborting! error. To fix this, increase the xdebug.max_nesting_level PHP setting, or render each form field by hand using form_row() instead of rendering the whole form at once (e.g form_widget(form)).

Previously you added two tags to your task in the controller. Now let the users add as many tag forms as they need directly in the browser. This requires a bit of JavaScript code.

Instead of writing the needed JavaScript code yourself, you can use Symfony UX to implement this feature with only PHP and Twig code. See the Symfony UX Demo of Form Collections.

But first, you need to let the form collection know that instead of exactly two, it will receive an unknown number of tags. Otherwise, you'll see a "This form should not contain extra fields" error. This is done with the allow_add option:

The allow_add option also makes a prototype variable available to you. This "prototype" is a little "template" that contains all the HTML needed to dynamically create any new "tag" forms with JavaScript.

Let's start with plain JavaScript (Vanilla JS) – if you're using Stimulus, see below.

To render the prototype, add the following data-prototype attribute to the existing <ul> in your template:

On the rendered page, the result will look something like this:

Now add a button to dynamically add a new tag:

If you want to customize the HTML code in the prototype, see How to Work with Form Themes.

The form.tags.vars.prototype is a form element that looks and feels just like the individual form_widget(tag.*) elements inside your for loop. This means that you can call form_widget(), form_row() or form_label() on it. You could even choose to render only one of its fields (e.g. the name field):

If you render your whole "tags" sub-form at once (e.g. form_row(form.tags)), the data-prototype attribute is automatically added to the containing div, and you need to adjust the following JavaScript accordingly.

Now add some JavaScript to read this attribute and dynamically add new tag forms when the user clicks the "Add a tag" link. Add a <script> tag somewhere on your page to include the required functionality with JavaScript:

The addFormToCollection() function's job will be to use the data-prototype attribute to dynamically add a new form when this link is clicked. The data-prototype HTML contains the tag's text input element with a name of task[tags][__name__][name] and id of task_tags___name___name. The __name__ is a placeholder, which you'll replace with a unique, incrementing number (e.g. task[tags][3][name]):

Now, each time a user clicks the Add a tag link, a new sub form will appear on the page. When the form is submitted, any new tag forms will be converted into new Tag objects and added to the tags property of the Task object.

You can find a working example in this JSFiddle.

If you're using Stimulus, wrap everything in a <div>:

Then create the controller:

To make handling these new tags easier, add an "adder" and a "remover" method for the tags in the Task class:

Next, add a by_reference option to the tags field and set it to false:

With these two changes, when the form is submitted, each new Tag object is added to the Task class by calling the addTag() method. Before this change, they were added internally by the form by calling $task->getTags()->add($tag). That was fine, but forcing the use of the "adder" method makes handling these new Tag objects easier (especially if you're using Doctrine, which you will learn about next!).

You have to create both addTag() and removeTag() methods, otherwise the form will still use setTag() even if by_reference is false. You'll learn more about the removeTag() method later in this article.

Symfony can only make the plural-to-singular conversion (e.g. from the tags property to the addTag() method) for English words. Code written in any other language won't work as expected.

Doctrine: Cascading Relations and saving the "Inverse" side

To save the new tags with Doctrine, you need to consider a couple more things. First, unless you iterate over all of the new Tag objects and call $entityManager->persist($tag) on each, you'll receive an error from Doctrine:

To fix this, you may choose to "cascade" the persist operation automatically from the Task object to any related tags. To do this, add the cascade option to your ManyToMany metadata:

A second potential issue deals with the Owning Side and Inverse Side of Doctrine relationships. In this example, if the "owning" side of the relationship is "Task", then persistence will work fine as the tags are properly added to the Task. However, if the owning side is on "Tag", then you'll need to do a little bit more work to ensure that the correct side of the relationship is modified.

The trick is to make sure that the single "Task" is set on each "Tag". One way to do this is to add some extra logic to addTag(), which is called by the form type since by_reference is set to false:

If you're going for addTask(), make sure you have an appropriate method that looks something like this:

The next step is to allow the deletion of a particular item in the collection. The solution is similar to allowing tags to be added.

Start by adding the allow_delete option in the form Type:

Now, you need to put some code into the removeTag() method of Task:

The allow_delete option means that if an item of a collection isn't sent on submission, the related data is removed from the collection on the server. In order for this to work in an HTML form, you must remove the DOM element for the collection item to be removed, before submitting the form.

In the JavaScript code, add a "delete" button to each existing tag on the page. Then, append the "add delete button" method in the function that adds the new tags:

The addTagFormDeleteLink() function will look something like this:

When a tag form is removed from the DOM and submitted, the removed Tag object will not be included in the collection passed to setTags(). Depending on your persistence layer, this may or may not be enough to actually remove the relationship between the removed Tag and Task object.

Doctrine: Ensuring the database persistence

When removing objects in this way, you may need to do a little bit more work to ensure that the relationship between the Task and the removed Tag is properly removed.

In Doctrine, you have two sides of the relationship: the owning side and the inverse side. Normally in this case you'll have a many-to-one relationship and the deleted tags will disappear and persist correctly (adding new tags also works effortlessly).

But if you have a one-to-many relationship or a many-to-many relationship with a mappedBy on the Task entity (meaning Task is the "inverse" side), you'll need to do more work for the removed tags to persist correctly.

In this case, you can modify the controller to remove the relationship on the removed tag. This assumes that you have some edit() action which is handling the "update" of your Task:

As you can see, adding and removing the elements correctly can be tricky. Unless you have a many-to-many relationship where Task is the "owning" side, you'll need to do extra work to make sure that the relationship is properly updated (whether you're adding new tags or removing existing tags) on each Tag object itself.

The Symfony community has created some JavaScript packages that provide the functionality needed to add, edit and delete elements of the collection. Check out the @a2lix/symfony-collection or search on GitHub for other recent packages.

Measure & Improve Symfony Code Performance

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (csharp):
```csharp
// src/Entity/Task.php
namespace App\Entity;

use Doctrine\Common\Collections\Collection;

class Task
{
    protected string $description;
    protected Collection $tags;

    public function __construct()
    {
        $this->tags = new ArrayCollection();
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    public function getTags(): Collection
    {
        return $this->tags;
    }
}
```

Example 2 (csharp):
```csharp
// src/Entity/Tag.php
namespace App\Entity;

class Tag
{
    private string $name;

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }
}
```

Example 3 (javascript):
```javascript
// src/Form/TagType.php
namespace App\Form;

use App\Entity\Tag;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class TagType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('name');
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Tag::class,
        ]);
    }
}
```

Example 4 (javascript):
```javascript
// src/Form/TaskType.php
namespace App\Form;

use App\Entity\Task;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class TaskType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('description');

        $builder->add('tags', CollectionType::class, [
            'entry_type' => TagType::class,
            'entry_options' => ['label' => false],
        ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Task::class,
        ]);
    }
}
```

---

## How to Unit Test your Forms

**URL:** https://symfony.com/doc/7.3/form/unit_testing.html

**Contents:**
- How to Unit Test your Forms
- The Basics
- Testing Types Registered as Services
- Adding Custom Extensions

This article is intended for developers who create custom form types. If you are using the built-in Symfony form types or the form types provided by third-party bundles, you don't need to unit test them.

The Form component consists of 3 core objects: a form type (implementing FormTypeInterface), the Form and the FormView.

The only class that is usually manipulated by programmers is the form type class which serves as a form blueprint. It is used to generate the Form and the FormView. You could test it directly by mocking its interactions with the factory but it would be complex. It is better to pass it to FormFactory like it is done in a real application. It is easier to bootstrap and you can trust the Symfony components enough to use them as a testing base.

There is already a class that you can benefit from for testing: TypeTestCase. It is used to test the core types and you can use it to test your types too.

Depending on the way you installed your Symfony or Symfony Form component the tests may not be downloaded. Use the --prefer-source option with Composer if this is the case.

The simplest TypeTestCase implementation looks like the following:

So, what does it test? Here comes a detailed explanation.

First you verify if the FormType compiles. This includes basic class inheritance, the buildForm() method and options resolution. This should be the first test you write:

This test checks that none of your data transformers used by the form produces an error. The isSynchronized() method is only set to false if a data transformer throws an exception:

Don't test the validation: it is applied by a listener that is not active in the test case and it relies on validation configuration. Instead, unit test your custom constraints directly or read how to add custom extensions in the last section of this page.

Next, verify the submission and mapping of the form. The test below checks if all the fields are correctly specified:

Finally, check the creation of the FormView. You can check that a custom variable exists and will be available in your form themes:

Use PHPUnit data providers to test multiple form conditions using the same test code.

When your type relies on the EntityType, you should register the DoctrineOrmExtension, which will need to mock the ManagerRegistry.

However, If you cannot use a mock to write your test, you should extend the KernelTestCase instead and use the form.factory service to create the form.

Your form may be used as a service, as it depends on other services (e.g. the Doctrine entity manager). In these cases, using the above code won't work, as the Form component instantiates the form type without passing any arguments to the constructor.

To solve this, you have to mock the injected dependencies, instantiate your own form type and use the PreloadedExtension to make sure the FormRegistry uses the created instance:

It often happens that you use some options that are added by form extensions. One of the cases may be the ValidatorExtension with its invalid_message option. The TypeTestCase only loads the core form extension, which means an InvalidOptionsException will be raised if you try to test a class that depends on other extensions. The getExtensions() method allows you to return a list of extensions to register:

By default only the CoreExtension is registered in tests. You can find other extensions from the Form component in the Symfony\Component\Form\Extension namespace.

It is also possible to load custom form types, form type extensions or type guessers using the getTypes(), getTypeExtensions() and getTypeGuessers() methods.

When testing the themes of your forms, consider making your test extend the FormLayoutTestCase class. This saves a lot of boilerplate and code duplication by implementing the FormIntegrationTestCase methods for you. All you need to do is to implement the getTemplatePaths(), the getTwigExtensions() and the getThemes() methods.

Symfony Code Performance Profiling

Become certified from home

**Examples:**

Example 1 (javascript):
```javascript
// tests/Form/Type/TestedTypeTest.php
namespace App\Tests\Form\Type;

use App\Form\Type\TestedType;
use App\Model\TestObject;
use Symfony\Component\Form\Test\TypeTestCase;

class TestedTypeTest extends TypeTestCase
{
    public function testSubmitValidData(): void
    {
        $formData = [
            'test' => 'test',
            'test2' => 'test2',
        ];

        $model = new TestObject();
        // $model will retrieve data from the form submission; pass it as the second argument
        $form = $this->factory->create(TestedType::class, $model);

        $expected = new TestObject();
        // ...populate $expected properties with the data stored in $formData

        // submit the data to the form directly
        $form->submit($formData);

        // This check ensures there are no transformation failures
        $this->assertTrue($form->isSynchronized());

        // check that $model was modified as expected when the form was submitted
        $this->assertEquals($expected, $model);
    }

    public function testCustomFormView(): void
    {
        $formData = new TestObject();
        // ... prepare the data as you need

        // The initial data may be used to compute custom view variables
        $view = $this->factory->create(TestedType::class, $formData)
            ->createView();

        $this->assertArrayHasKey('custom_var', $view->vars);
        $this->assertSame('expected value', $view->vars['custom_var']);
    }
}
```

Example 2 (unknown):
```unknown
$form = $this->factory->create(TestedType::class, $formData);
```

Example 3 (unknown):
```unknown
$form->submit($formData);
$this->assertTrue($form->isSynchronized());
```

Example 4 (unknown):
```unknown
$this->assertEquals($expected, $formData);
```

---

## How to Customize the Bootstrap Process before Running Tests

**URL:** https://symfony.com/doc/7.3/testing/bootstrap.html

**Contents:**
- How to Customize the Bootstrap Process before Running Tests

Sometimes when running tests, you need to do additional bootstrap work before running those tests. For example, if you're running a functional test and have introduced a new translation resource, then you will need to clear your cache before running those tests.

When installing testing using Symfony Flex, it already created a tests/bootstrap.php file that is run by PHPUnit before your tests.

You can modify this file to add custom logic:

If you don't use Symfony Flex, make sure this file is configured as bootstrap file in your phpunit.dist.xml file:

Now, when running vendor/bin/phpunit, the cache will be cleared automatically by the bootstrap file before running all tests.

Check Code Performance in Dev, Test, Staging & Production

Get your Sylius expertise recognized

**Examples:**

Example 1 (unknown):
```unknown
// tests/bootstrap.php
  use Symfony\Component\Dotenv\Dotenv;

  require dirname(__DIR__).'/vendor/autoload.php';

  if (file_exists(dirname(__DIR__).'/config/bootstrap.php')) {
      require dirname(__DIR__).'/config/bootstrap.php';
  } elseif (method_exists(Dotenv::class, 'bootEnv')) {
      (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
  }

+ // executes the "php bin/console cache:clear" command
+ passthru(sprintf(
+   'APP_ENV=%s php "%s/../bin/console" cache:clear --no-warmup',
+   $_ENV['APP_ENV'],
+   __DIR__
+ ));
```

Example 2 (unknown):
```unknown
<!-- phpunit.dist.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<phpunit
    bootstrap="tests/bootstrap.php"
>
    <!-- ... -->
</phpunit>
```

---

## Using the Logger

**URL:** https://symfony.com/doc/7.3/components/console/logger.html

**Contents:**
- Using the Logger
- Verbosity
- Color
- Errors

The Console component comes with a standalone logger complying with the PSR-3 standard. Depending on the verbosity setting, log messages will be sent to the OutputInterface instance passed as a parameter to the constructor.

The logger does not have any external dependency except psr/log. This is useful for console applications and commands needing a lightweight PSR-3 compliant logger:

You can rely on the logger to use this dependency inside a command:

The dependency will use the instance of ConsoleLogger as logger. Log messages emitted will be displayed on the console output.

Depending on the verbosity level that the command is run, messages may or may not be sent to the OutputInterface instance.

By default, the console logger behaves like the Monolog's Console Handler. The association between the log level and the verbosity can be configured through the second parameter of the ConsoleLogger constructor:

The logger outputs the log messages formatted with a color reflecting their level. This behavior is configurable through the third parameter of the constructor:

The Console logger includes a hasErrored() method which returns true as soon as any error message has been logged during the execution of the command. This is useful to decide which status code to return as the result of executing the command.

Measure & Improve Symfony Code Performance

Online Sylius certification, take it now!

**Examples:**

Example 1 (csharp):
```csharp
namespace Acme;

use Psr\Log\LoggerInterface;

class MyDependency
{
    public function __construct(
        private LoggerInterface $logger,
    ) {
    }

    public function doStuff(): void
    {
        $this->logger->info('I love Tony Vairelles\' hairdresser.');
    }
}
```

Example 2 (csharp):
```csharp
namespace Acme\Console\Command;

use Acme\MyDependency;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Logger\ConsoleLogger;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'my:command',
    description: 'Use an external dependency requiring a PSR-3 logger'
)]
class MyCommand
{
    public function __invoke(OutputInterface $output): int
    {
        $logger = new ConsoleLogger($output);

        $myDependency = new MyDependency($logger);
        $myDependency->doStuff();

        return Command::SUCCESS;
    }
}
```

Example 3 (javascript):
```javascript
use Psr\Log\LogLevel;
// ...

$verbosityLevelMap = [
    LogLevel::NOTICE => OutputInterface::VERBOSITY_NORMAL,
    LogLevel::INFO   => OutputInterface::VERBOSITY_NORMAL,
];

$logger = new ConsoleLogger($output, $verbosityLevelMap);
```

Example 4 (javascript):
```javascript
// ...
$formatLevelMap = [
    LogLevel::CRITICAL => ConsoleLogger::ERROR,
    LogLevel::DEBUG    => ConsoleLogger::INFO,
];

$logger = new ConsoleLogger($output, [], $formatLevelMap);
```

---

## The Cache Component

**URL:** https://symfony.com/doc/7.3/components/cache.html

**Contents:**
- The Cache Component
- Installation
- Cache Contracts versus PSR-6
- Cache Contracts
- Creating Sub-Namespaces
  - Stampede Prevention
  - Available Cache Adapters
- Generic Caching (PSR-6)
- Basic Usage (PSR-6)
- Marshalling (Serializing) Data

The Cache component provides features covering simple to advanced caching needs. It natively implements PSR-6 and the Cache Contracts for greatest interoperability. It is designed for performance and resiliency, ships with ready to use adapters for the most common caching backends. It enables tag-based invalidation and cache stampede protection via locking and early expiration.

The component also contains adapters to convert between PSR-6 and PSR-16. See Adapters For Interoperability between PSR-6 and PSR-16 Cache.

If you install this component outside of a Symfony application, you must require the vendor/autoload.php file in your code to enable the class autoloading mechanism provided by Composer. Read this article for more details.

This component includes two different approaches to caching:

Using the Cache Contracts approach is recommended: it requires less code boilerplate and provides cache stampede protection by default.

All adapters support the Cache Contracts. They contain only two methods: get() and delete(). There's no set() method because the get() method both gets and sets the cache values.

The first thing you need is to instantiate a cache adapter. The FilesystemAdapter is used in this example:

Now you can retrieve and delete cached data using this object. The first argument of the get() method is a key, an arbitrary string that you associate to the cached value so you can retrieve it later. The second argument is a PHP callable which is executed when the key is not found in the cache to generate and return the value:

Use cache tags to delete more than one key at the time. Read more at Cache Invalidation.

Cache sub-namespaces were introduced in Symfony 7.3.

Sometimes you need to create context-dependent variations of data that should be cached. For example, the data used to render a dashboard page may be expensive to generate and unique per user, so you can't cache the same data for everyone.

In such cases, Symfony allows you to create different cache contexts using namespaces. A cache namespace is an arbitrary string that identifies a set of related cache items. All cache adapters provided by the component implement the NamespacedPoolInterface, which provides the withSubNamespace() method.

This method allows you to namespace cached items by transparently prefixing their keys:

In this example, the cache item uses the dashboard_data key, but it will be stored internally under a namespace based on the current user ID. This is handled automatically, so you don't need to manually prefix keys like user-27.dashboard_data.

There are no guidelines or restrictions on how to define cache namespaces. You can make them as granular or as generic as your application requires:

You can combine cache namespaces with cache tags for more advanced needs.

There is no built-in way to invalidate caches by namespace. Instead, the recommended approach is to change the namespace itself. For this reason, it's common to include static or dynamic versioning data in the cache namespace:

The Cache Contracts also come with built in Stampede prevention. This will remove CPU spikes at the moments when the cache is cold. If an example application spends 5 seconds to compute data that is cached for 1 hour and this data is accessed 10 times every second, this means that you mostly have cache hits and everything is fine. But after 1 hour, we get 10 new requests to a cold cache. So the data is computed again. The next second the same thing happens. So the data is computed about 50 times before the cache is warm again. This is where you need stampede prevention.

The first solution is to use locking: only allow one PHP process (on a per-host basis) to compute a specific key at a time. Locking is built-in by default, so you don't need to do anything beyond leveraging the Cache Contracts.

The second solution is also built-in when using the Cache Contracts: instead of waiting for the full delay before expiring a value, recompute it ahead of its expiration date. The Probabilistic early expiration algorithm randomly fakes a cache miss for one user while others are still served the cached value. You can control its behavior with the third optional parameter of get(), which is a float value called "beta".

By default the beta is 1.0 and higher values mean earlier recompute. Set it to 0 to disable early recompute and set it to INF to force an immediate recompute:

The following cache adapters are available:

To use the generic PSR-6 Caching abilities, you'll need to learn its key concepts:

This part of the component is an implementation of PSR-6, which means that its basic API is the same as defined in the document. Before starting to cache information, create the cache pool using any of the built-in adapters. For example, to create a filesystem-based cache, instantiate FilesystemAdapter:

Now you can create, retrieve, update and delete items using this cache pool:

For a list of all of the supported adapters, see Cache Pools and Supported Adapters.

Marshalling and serializing are similar concepts. Serializing is the process of translating an object state into a format that can be stored (e.g. in a file). Marshalling is the process of translating both the object state and its codebase into a format that can be stored or transmitted.

Unmarshalling an object produces a copy of the original object, possibly by automatically loading the class definitions of the object.

Symfony uses marshallers (classes which implement MarshallerInterface) to process the cache items before storing them.

The DefaultMarshaller uses PHP's serialize() function by default, but you can optionally use the igbinary_serialize() function from the Igbinary extension:

There are other marshallers that can encrypt or compress the data before storing it.

In Symfony versions prior to 7.2, the igbinary_serialize() function was used by default when the Igbinary extension was installed. Starting from Symfony 7.2, you have to enable Igbinary support explicitly.

Show your Sylius expertise

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (unknown):
```unknown
$ composer require symfony/cache
```

Example 2 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\FilesystemAdapter;

$cache = new FilesystemAdapter();
```

Example 3 (unknown):
```unknown
use Symfony\Contracts\Cache\ItemInterface;

// The callable will only be executed on a cache miss.
$value = $cache->get('my_cache_key', function (ItemInterface $item): string {
    $item->expiresAfter(3600);

    // ... do some HTTP request or heavy computations
    $computedValue = 'foobar';

    return $computedValue;
});

echo $value; // 'foobar'

// ... and to remove the cache key
$cache->delete('my_cache_key');
```

Example 4 (unknown):
```unknown
$userCache = $cache->withSubNamespace(sprintf('user-%d', $user->getId()));

$userCache->get('dashboard_data', function (ItemInterface $item): string {
    $item->expiresAfter(3600);

    return '...';
});
```

---

## Array Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/array_cache_adapter.html

**Contents:**
- Array Cache Adapter

Generally, this adapter is useful for testing purposes, as its contents are stored in memory and not persisted outside the running PHP process in any way. It can also be useful while warming up caches, due to the getValues() method:

The optional $clock argument was introduced in Symfony 7.2.

Measure & Improve Symfony Code Performance

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\ArrayAdapter;

$cache = new ArrayAdapter(

    // the default lifetime (in seconds) for cache items that do not define their
    // own lifetime, with a value 0 causing items to be stored indefinitely (i.e.
    // until the current PHP process finishes)
    $defaultLifetime = 0,

    // if true, the values saved in the cache are serialized before storing them
    $storeSerialized = true,

    // the maximum lifetime (in seconds) of the entire cache (after this time, the
    // entire cache is deleted to avoid stale data from consuming memory)
    $maxLifetime = 0,

    // the maximum number of items that can be stored in the cache. When the limit
    // is reached, cache follows the LRU model (least recently used items are deleted)
    $maxItems = 0,

    // optional implementation of the Psr\Clock\ClockInterface that will be used
    // to calculate the lifetime of cache items (for example to get predictable
    // lifetimes in tests)
    $clock = null,
);
```

---

## APCu Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/apcu_adapter.html

**Contents:**
- APCu Cache Adapter

This adapter is a high-performance, shared memory cache. It can significantly increase an application's performance, as its cache contents are stored in shared memory, a component appreciably faster than many others, such as the filesystem.

Requirement: The APCu extension must be installed and active to use this adapter.

The ApcuAdapter can optionally be provided a namespace, default cache lifetime, and cache items version string as constructor arguments:

Use of this adapter is discouraged in write/delete heavy workloads, as these operations cause memory fragmentation that results in significantly degraded performance.

This adapter's CRUD operations are specific to the PHP SAPI it is running under. This means cache operations (such as additions, deletions, etc) using the CLI will not be available under the FPM or CGI SAPIs.

Code consumes server resources. Blackfire tells you how

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (csharp):
```csharp
use Symfony\Component\Cache\Adapter\ApcuAdapter;

$cache = new ApcuAdapter(

    // a string prefixed to the keys of the items stored in this cache
    $namespace = '',

    // the default lifetime (in seconds) for cache items that do not define their
    // own lifetime, with a value 0 causing items to be stored indefinitely (i.e.
    // until the APCu memory is cleared)
    $defaultLifetime = 0,

    // when set, all keys prefixed by $namespace can be invalidated by changing
    // this $version string
    $version = null
);
```

---

## Doctrine DBAL Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/doctrine_dbal_adapter.html

**Contents:**
- Doctrine DBAL Cache Adapter

The Doctrine DBAL adapters store the cache items in a table of an SQL database.

This adapter implements PruneableInterface, allowing for manual pruning of expired cache entries by calling the prune() method.

The DoctrineDbalAdapter requires a Doctrine DBAL Connection, or Doctrine DBAL URL as its first parameter. You can pass a namespace, default cache lifetime, and options array as the other optional arguments:

DBAL Connection are lazy-loaded by default; some additional options may be necessary to detect the database engine and version without opening the connection.

The adapter uses SQL syntax that is optimized for database server that it is connected to. The following database servers are known to be compatible:

Newer releases of Doctrine DBAL might increase these minimal versions. Check the manual page on Doctrine DBAL Platforms if your database server is compatible with the installed Doctrine DBAL version.

Code consumes server resources. Blackfire tells you how

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (csharp):
```csharp
use Symfony\Component\Cache\Adapter\DoctrineDbalAdapter;

$cache = new DoctrineDbalAdapter(

    // a Doctrine DBAL connection or DBAL URL
    $databaseConnectionOrURL,

    // the string prefixed to the keys of the items stored in this cache
    $namespace = '',

    // the default lifetime (in seconds) for cache items that do not define their
    // own lifetime, with a value 0 causing items to be stored indefinitely (i.e.
    // until the database table is truncated or its rows are otherwise deleted)
    $defaultLifetime = 0,

    // an array of options for configuring the database table and connection
    $options = []
);
```

---

## Memcached Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/memcached_adapter.html

**Contents:**
- Memcached Cache Adapter
- Configure the Connection
- Configure the Options
  - Available Options

This adapter stores the values in-memory using one (or more) Memcached server instances. Unlike the APCu adapter, and similarly to the Redis adapter, it is not limited to the current server's shared memory; you can store contents independent of your PHP environment. The ability to utilize a cluster of servers to provide redundancy and/or fail-over is also available.

Requirements: The Memcached PHP extension as well as a Memcached server must be installed, active, and running to use this adapter. Version 2.2 or greater of the Memcached PHP extension is required for this adapter.

This adapter expects a Memcached instance to be passed as the first parameter. A namespace and default cache lifetime can optionally be passed as the second and third parameters:

The createConnection() helper method allows creating and configuring a Memcached class instance using a Data Source Name (DSN) or an array of DSNs:

The Data Source Name (DSN) for this adapter must use the following format:

The DSN must include a IP/host (and an optional port) or a socket path, an optional username and password (for SASL authentication; it requires that the memcached extension was compiled with --enable-memcached-sasl) and an optional weight (for prioritizing servers in a cluster; its value is an integer between 0 and 100 which defaults to null; a higher value means more priority).

Below are common examples of valid DSNs showing a combination of available values:

The createConnection() helper method also accepts an array of options as its second argument. The expected format is an associative array of key => value pairs representing option names and their respective values:

Specifies the timeout (in milliseconds) of socket connection operations when the no_block option is enabled.

Valid option values include any positive integer.

Specifies the item key distribution method among the servers. Consistent hashing delivers better distribution and allows servers to be added to the cluster with minimal cache losses.

Valid option values include modula, consistent, and virtual_bucket.

Specifies the hashing algorithm used for item keys. Each hash algorithm has its advantages and its disadvantages. The default is suggested for compatibility with other clients.

Valid option values include default, md5, crc, fnv1_64, fnv1a_64, fnv1_32, fnv1a_32, hsieh, and murmur.

Specifies the number of replicas that should be stored for each item (on different servers). This does not dedicate certain memcached servers to store the replicas in, but instead stores the replicas together with all of the other objects (on the "n" next servers registered).

Valid option values include any positive integer.

Specifies a "domain" (or "namespace") prepended to your keys. It cannot be longer than 128 characters and reduces the maximum key size.

Valid option values include any alphanumeric string.

Specifies the amount of time (in seconds) before timing out during a socket polling operation.

Valid option values include any positive integer.

Specifies the amount of time (in microseconds) before timing out during an outgoing socket (read) operation. When the no_block option isn't enabled, this will allow you to still have timeouts on the reading of data.

Valid option values include 0 or any positive integer.

Specifies the amount of time (in seconds) before timing out and retrying a connection attempt.

Valid option values include any positive integer.

Specifies the amount of time (in microseconds) before timing out during an incoming socket (send) operation. When the no_block option isn't enabled, this will allow you to still have timeouts on the sending of data.

Valid option values include 0 or any positive integer.

Specifies the serializer to use for serializing non-scalar values. The igbinary options requires the igbinary PHP extension to be enabled, as well as the memcached extension to have been compiled with support for it.

Valid option values include php and igbinary.

Specifies the failure limit for server connection attempts before marking the server as "dead". The server will remain in the server pool unless auto_eject_hosts is enabled.

Valid option values include any positive integer.

Specified the maximum buffer size (in bytes) in the context of incoming (receive) socket connection data.

Valid option values include any positive integer, with a default value that varies by platform and kernel configuration.

Specified the maximum buffer size (in bytes) in the context of outgoing (send) socket connection data.

Valid option values include any positive integer, with a default value that varies by platform and kernel configuration.

Enables or disables the use of User Datagram Protocol (UDP) mode (instead of Transmission Control Protocol (TCP) mode), where all operations are executed in a "fire-and-forget" manner; no attempt to ensure the operation has been received or acted on will be made once the client has executed it.

Not all library operations are tested in this mode. Mixed TCP and UDP servers are not allowed.

Reference the Memcached extension's predefined constants documentation for additional information about the available options.

Check Code Performance in Dev, Test, Staging & Production

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (csharp):
```csharp
use Symfony\Component\Cache\Adapter\MemcachedAdapter;

$cache = new MemcachedAdapter(
    // the client object that sets options and adds the server instance(s)
    \Memcached $client,

    // a string prefixed to the keys of the items stored in this cache
    $namespace = '',

    // the default lifetime (in seconds) for cache items that do not define their
    // own lifetime, with a value 0 causing items to be stored indefinitely (i.e.
    // until MemcachedAdapter::clear() is invoked or the server(s) are restarted)
    $defaultLifetime = 0
);
```

Example 2 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\MemcachedAdapter;

// pass a single DSN string to register a single server with the client
$client = MemcachedAdapter::createConnection(
    'memcached://localhost'
    // the DSN can include config options (pass them as a query string):
    // 'memcached://localhost:11222?retry_timeout=10'
    // 'memcached://localhost:11222?socket_recv_size=1&socket_send_size=2'
);

// pass an array of DSN strings to register multiple servers with the client
$client = MemcachedAdapter::createConnection([
    'memcached://10.0.0.100',
    'memcached://10.0.0.101',
    'memcached://10.0.0.102',
    // etc...
]);

// a single DSN can define multiple servers using the following syntax:
// host[hostname-or-IP:port] (where port is optional). Sockets must include a trailing ':'
$client = MemcachedAdapter::createConnection(
    'memcached:?host[localhost]&host[localhost:12345]&host[/some/memcached.sock:]=3'
);
```

Example 3 (unknown):
```unknown
memcached://[user:pass@][ip|host|socket[:port]][?weight=int]
```

Example 4 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\MemcachedAdapter;

$client = MemcachedAdapter::createConnection([
    // hostname + port
    'memcached://my.server.com:11211'

    // hostname without port + SASL username and password
    'memcached://rmf:abcdef@localhost'

    // IP address instead of hostname + weight
    'memcached://127.0.0.1?weight=50'

    // socket instead of hostname/IP + SASL username and password
    'memcached://janesmith:mypassword@/var/run/memcached.sock'

    // socket instead of hostname/IP + weight
    'memcached:///var/run/memcached.sock?weight=20'
]);
```

---

## Filesystem Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/filesystem_adapter.html

**Contents:**
- Filesystem Cache Adapter
- Working with Tags

This adapter offers improved application performance for those who cannot install tools like APCu or Redis in their environment. It stores the cache item expiration and content as regular files in a collection of directories on a locally mounted filesystem.

The performance of this adapter can be greatly increased by utilizing a temporary, in-memory filesystem, such as tmpfs on Linux, or one of the many other RAM disk solutions available.

The FilesystemAdapter can optionally be provided a namespace, default cache lifetime, and cache root path as constructor parameters:

The overhead of filesystem IO often makes this adapter one of the slower choices. If throughput is paramount, the in-memory adapters (Apcu, Memcached, and Redis) or the database adapters (Doctrine DBAL, PDO) are recommended.

This adapter implements PruneableInterface, enabling manual pruning of expired cache items by calling its prune() method.

In order to use tag-based invalidation, you can wrap your adapter in TagAwareAdapter, but it's often more interesting to use the dedicated FilesystemTagAwareAdapter. Since tag invalidation logic is implemented using links on filesystem, this adapter offers better read performance when using tag-based invalidation:

Online Symfony certification, take it now!

The life jacket for your team and your project

**Examples:**

Example 1 (csharp):
```csharp
use Symfony\Component\Cache\Adapter\FilesystemAdapter;

$cache = new FilesystemAdapter(

    // a string used as the subdirectory of the root cache directory, where cache
    // items will be stored
    $namespace = '',

    // the default lifetime (in seconds) for cache items that do not define their
    // own lifetime, with a value 0 causing items to be stored indefinitely (i.e.
    // until the files are deleted)
    $defaultLifetime = 0,

    // the main cache directory (the application needs read-write permissions on it)
    // if none is specified, a directory is created inside the system temporary directory
    $directory = null
);
```

Example 2 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\FilesystemTagAwareAdapter;

$cache = new FilesystemTagAwareAdapter();
```

---

## PDO Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/pdo_adapter.html

**Contents:**
- PDO Cache Adapter

The PDO adapters store the cache items in a table of an SQL database.

This adapter implements PruneableInterface, allowing for manual pruning of expired cache entries by calling the prune() method.

The PdoAdapter requires a PDO, or DSN as its first parameter. You can pass a namespace, default cache lifetime, and options array as the other optional arguments:

The table where values are stored is created automatically on the first call to the save() method. You can also create this table explicitly by calling the createTable() method in your code.

When passed a Data Source Name (DSN) string (instead of a database connection class instance), the connection will be lazy-loaded when needed.

Measure & Improve Symfony Code Performance

Show your Sylius expertise

**Examples:**

Example 1 (csharp):
```csharp
use Symfony\Component\Cache\Adapter\PdoAdapter;

$cache = new PdoAdapter(

    // a PDO connection or DSN for lazy connecting through PDO
    $databaseConnectionOrDSN,

    // the string prefixed to the keys of the items stored in this cache
    $namespace = '',

    // the default lifetime (in seconds) for cache items that do not define their
    // own lifetime, with a value 0 causing items to be stored indefinitely (i.e.
    // until the database table is truncated or its rows are otherwise deleted)
    $defaultLifetime = 0,

    // an array of options for configuring the database table and connection
    $options = []
);
```

---

## Redis Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/redis_adapter.html

**Contents:**
- Redis Cache Adapter
- Configure the Connection
- Configure the Options
  - Available Options
- Configuring Redis
- Working with Tags
- Working with Marshaller
  - TagAwareMarshaller for Tag-Based Caching
  - SodiumMarshaller for Encrypted Caching
  - DefaultMarshaller with igbinary Serialization

This article explains how to configure the Redis adapter when using the Cache as an independent component in any PHP application. Read the Symfony Cache configuration article if you are using it in a Symfony application.

This adapter stores the values in-memory using one (or more) Redis server or Valkey server instances.

Unlike the APCu adapter, and similarly to the Memcached adapter, it is not limited to the current server's shared memory; you can store contents independent of your PHP environment. The ability to utilize a cluster of servers to provide redundancy and/or fail-over is also available.

Requirements: At least one Redis server must be installed and running to use this adapter. Additionally, this adapter requires a compatible extension or library that implements \Redis, \RedisArray, RedisCluster, \Relay\Relay, \Relay\Cluster or \Predis.

This adapter expects a Redis, RedisArray, RedisCluster, Relay, RelayCluster or Predis instance to be passed as the first parameter. A namespace and default cache lifetime can optionally be passed as the second and third parameters:

Support for Relay\Cluster was introduced in Symfony 7.3.

The createConnection() helper method allows creating and configuring the Redis client class instance using a Data Source Name (DSN):

Starting in Symfony 7.3, when using Valkey servers you can use the valkey[s]: scheme instead of the redis[s]: one in your DSNs.

The DSN can specify either an IP/host (and an optional port) or a socket path, as well as a password and a database index. To enable TLS for connections, the scheme redis must be replaced by rediss (the second s means "secure").

A Data Source Name (DSN) for this adapter must use either one of the following formats.

Values for placeholders [user], [:port], [/db-index] and [&params] are optional.

Below are common examples of valid DSNs showing a combination of available values:

Redis Sentinel, which provides high availability for Redis, is also supported when using the PHP Redis Extension v5.2+ or the Predis library. Use the redis_sentinel parameter to set the name of your service group:

See the RedisTrait for more options you can pass as DSN parameters.

The createConnection() helper method also accepts an array of options as its second argument. The expected format is an associative array of key => value pairs representing option names and their respective values:

Defines configuration options specific to \Relay\Cluster. For example, to user a self-signed certificate for testing in local environment:

The option sentinel_master as an alias for redis_sentinel was introduced in Symfony 7.1.

The relay_cluster_context option was introduced in Symfony 7.3.

When using the Predis library some additional Predis-specific options are available. Reference the Predis Connection Parameters documentation for more information.

When using Redis as cache, you should configure the maxmemory and maxmemory-policy settings. By setting maxmemory, you limit how much memory Redis is allowed to consume. If the amount is too low, Redis will drop entries that would still be useful and you benefit less from your cache. Setting the maxmemory-policy to allkeys-lru tells Redis that it is ok to drop data when it runs out of memory, and to first drop the oldest entries (least recently used). If you do not allow Redis to drop entries, it will return an error when you try to add data when no memory is available. An example setting could look as follows:

In order to use tag-based invalidation, you can wrap your adapter in TagAwareAdapter. However, when Redis is used as backend, it's often more interesting to use the dedicated RedisTagAwareAdapter. Since tag invalidation logic is implemented in Redis itself, this adapter offers better performance when using tag-based invalidation:

When using RedisTagAwareAdapter, in order to maintain relationships between tags and cache items, you have to use either noeviction or volatile-* in the Redis maxmemory-policy eviction policy.

Read more about this topic in the official Redis LRU Cache Documentation.

Optimizes caching for tag-based retrieval, allowing efficient management of related items:

Encrypts cached data using Sodium for enhanced security:

Uses igbinary for faster and more efficient serialization when available:

Throws an exception if serialization fails, facilitating error handling:

Supports key rotation, ensuring secure decryption with both old and new keys:

Code consumes server resources. Blackfire tells you how

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (csharp):
```csharp
use Symfony\Component\Cache\Adapter\RedisAdapter;

$cache = new RedisAdapter(

    // the object that stores a valid connection to your Redis system
    \Redis $redisConnection,

    // the string prefixed to the keys of the items stored in this cache
    $namespace = '',

    // the default lifetime (in seconds) for cache items that do not define their
    // own lifetime, with a value 0 causing items to be stored indefinitely (i.e.
    // until RedisAdapter::clear() is invoked or the server(s) are purged)
    $defaultLifetime = 0,

    // $marshaller (optional) An instance of MarshallerInterface to control the serialization
    // and deserialization of cache items. By default, native PHP serialization is used.
    // This can be useful for compressing data, applying custom serialization logic, or
    // optimizing the size and performance of cached items
    ?MarshallerInterface $marshaller = null
);
```

Example 2 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\RedisAdapter;

// pass a single DSN string to register a single server with the client
$client = RedisAdapter::createConnection(
    'redis://localhost'
);
```

Example 3 (unknown):
```unknown
redis[s]://[pass@][ip|host|socket[:port]][/db-index]
```

Example 4 (unknown):
```unknown
redis[s]:[[user]:pass@]?[ip|host|socket[:port]][&params]
```

---

## Proxy Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/proxy_adapter.html

**Contents:**
- Proxy Cache Adapter

This adapter wraps a PSR-6 compliant cache item pool interface. It is used to integrate your application's cache item pool implementation with the Symfony Cache Component by consuming any implementation of Psr\Cache\CacheItemPoolInterface.

It can also be used to prefix all keys automatically before storing items in the decorated pool, effectively allowing the creation of several namespaced pools out of a single one.

This adapter expects a Psr\Cache\CacheItemPoolInterface instance as its first parameter, and optionally a namespace and default cache lifetime as its second and third parameters:

Check Code Performance in Dev, Test, Staging & Production

Show your Sylius expertise

**Examples:**

Example 1 (csharp):
```csharp
use Psr\Cache\CacheItemPoolInterface;
use Symfony\Component\Cache\Adapter\ProxyAdapter;

// create your own cache pool instance that implements
// the PSR-6 CacheItemPoolInterface
$psr6CachePool = ...

$cache = new ProxyAdapter(

    // a cache pool instance
    CacheItemPoolInterface $psr6CachePool,

    // a string prefixed to the keys of the items stored in this cache
    $namespace = '',

    // the default lifetime (in seconds) for cache items that do not define their
    // own lifetime, with a value 0 causing items to be stored indefinitely (i.e.
    // until the cache is cleared)
    $defaultLifetime = 0
);
```

---

## How to Use Varnish to Speed up my Website

**URL:** https://symfony.com/doc/7.3/http_cache/varnish.html

**Contents:**
- How to Use Varnish to Speed up my Website
- Make Symfony Trust the Reverse Proxy
- Routing and X-FORWARDED Headers
- Cookies and Caching
- Ensure Consistent Caching Behavior
- Enable Edge Side Includes (ESI)
- Cache Invalidation

Because Symfony's cache uses the standard HTTP cache headers, the HTTP Cache can be replaced with any other reverse proxy. Varnish is a powerful, open-source, HTTP accelerator capable of serving cached content fast and including support for Edge Side Includes.

Varnish automatically forwards the IP as X-Forwarded-For and leaves the X-Forwarded-Proto header in the request. If you do not configure Varnish as trusted proxy, Symfony will see all requests as coming through insecure HTTP connections from the Varnish host instead of the real client.

Remember to call the Request::setTrustedProxies() method in your front controller so that Varnish is seen as a trusted proxy and the X-Forwarded-* headers are used.

To ensure that the Symfony Router generates URLs correctly with Varnish, an X-Forwarded-Port header must be present for Symfony to use the correct port number.

This port number corresponds to the port your setup is using to receive external connections (80 is the default value for HTTP connections). If the application also accepts HTTPS connections, there could be another proxy (as Varnish does not do HTTPS itself) on the default HTTPS port 443 that handles the SSL termination and forwards the requests as HTTP requests to Varnish with an X-Forwarded-Proto header. In this case, you need to add the following configuration snippet:

Forcing HTTPS while using a reverse proxy or load balancer requires a proper configuration to avoid infinite redirect loops; see How to Configure Symfony to Work behind a Load Balancer or a Reverse Proxy for more details.

By default, most caching proxies do not cache anything when a request is sent with cookies or a basic authentication header. This is because the content of the page is supposed to depend on the cookie value or authentication header.

If you know for sure that the backend never uses sessions or basic authentication, have Varnish remove the corresponding header from requests to prevent clients from bypassing the cache. In practice, you will need sessions at least for some parts of the site, e.g. when using forms with stateful CSRF Protection. In this situation, make sure to only start a session when actually needed and clear the session when it is no longer needed. Alternatively, you can look into caching pages that contain CSRF protected forms.

Cookies created in JavaScript and used only on the frontend, such as those from Google Analytics, are still sent to the server. These cookies are not relevant for backend processing and should not influence the caching logic. To ensure this, configure your Varnish cache to clean the cookies header by retaining only essential cookies (e.g., session cookies) and removing all others. This allows pages to be cached when there is no active session.

If you are using PHP with its default configuration, the session cookie is typically named PHPSESSID. Additionally, if your application depends on other critical cookies, such as a REMEMBERME cookie for remember me functionality or a trusted device cookie for two-factor authentication, these cookies should also be preserved.

If content is not different for every user, but depends on the roles of a user, a solution is to separate the cache per group. This pattern is implemented and explained by the FOSHttpCacheBundle under the name User Context.

Varnish uses the cache headers sent by your application to determine how to cache content. However, versions prior to Varnish 4 did not respect Cache-Control: no-cache, no-store and private. To ensure consistent behavior, use the following configuration if you are still using Varnish 3:

You can see the default behavior of Varnish in the form of a VCL file: default.vcl for Varnish 3, builtin.vcl for Varnish 4.

As explained in the Edge Side Includes article, Symfony detects whether it talks to a reverse proxy that understands ESI or not. When you use the Symfony reverse proxy, you don't need to do anything. But to make Varnish instead of Symfony resolve the ESI tags, you need some configuration in Varnish. Symfony uses the Surrogate-Capability header from the Edge Architecture described by Akamai.

Varnish only supports the src attribute for ESI tags (onerror and alt attributes are ignored).

First, configure Varnish so that it advertises its ESI support by adding a Surrogate-Capability header to requests forwarded to the backend application:

The abc part of the header isn't important unless you have multiple "surrogates" that need to advertise their capabilities. See Surrogate-Capability Header for details.

Then, optimize Varnish so that it only parses the response contents when there is at least one ESI tag by checking the Surrogate-Control header that Symfony adds automatically:

If you followed the advice about ensuring a consistent caching behavior, those VCL functions already exist. Append the code to the end of the function, they won't interfere with each other.

If you want to cache content that changes frequently and still serve the most recent version to users, you need to invalidate that content. While cache invalidation allows you to purge content from your proxy before it has expired, it adds complexity to your caching setup.

The open source FOSHttpCacheBundle takes the pain out of cache invalidation by helping you to organize your caching and invalidation setup.

The documentation of the FOSHttpCacheBundle explains how to configure Varnish and other reverse proxies for cache invalidation.

Check Code Performance in Dev, Test, Staging & Production

Online Symfony certification, take it now!

**Examples:**

Example 1 (unknown):
```unknown
sub vcl_recv {
    if (req.http.X-Forwarded-Proto == "https" ) {
        set req.http.X-Forwarded-Port = "443";
    } else {
        set req.http.X-Forwarded-Port = "80";
    }
}
```

Example 2 (unknown):
```unknown
sub vcl_recv {
    // Remove all cookies except for essential ones.
    if (req.http.Cookie) {
        set req.http.Cookie = ";" + req.http.Cookie;
        set req.http.Cookie = regsuball(req.http.Cookie, "; +", ";");
        set req.http.Cookie = regsuball(req.http.Cookie, ";(PHPSESSID|REMEMBERME)=", "; \1=");
        set req.http.Cookie = regsuball(req.http.Cookie, ";[^ ][^;]*", "");
        set req.http.Cookie = regsuball(req.http.Cookie, "^[; ]+|[; ]+$", "");

        if (req.http.Cookie == "") {
            // If there are no more cookies, remove the header to get the page cached.
            unset req.http.Cookie;
        }
    }
}
```

Example 3 (unknown):
```unknown
sub vcl_recv {
    // Remove all cookies except for essential ones.
    if (req.http.Cookie) {
        set req.http.Cookie = ";" + req.http.Cookie;
        set req.http.Cookie = regsuball(req.http.Cookie, "; +", ";");
        set req.http.Cookie = regsuball(req.http.Cookie, ";(PHPSESSID|REMEMBERME)=", "; \1=");
        set req.http.Cookie = regsuball(req.http.Cookie, ";[^ ][^;]*", "");
        set req.http.Cookie = regsuball(req.http.Cookie, "^[; ]+|[; ]+$", "");

        if (req.http.Cookie == "") {
            // If there are no more cookies, remove the header to get page cached.
            remove req.http.Cookie;
        }
    }
}
```

Example 4 (unknown):
```unknown
sub vcl_fetch {
    // By default, Varnish3 ignores Cache-Control: no-cache and private
    // https://www.varnish-cache.org/docs/3.0/tutorial/increasing_your_hitrate.html#cache-control
    if (beresp.http.Cache-Control ~ "private" ||
        beresp.http.Cache-Control ~ "no-cache" ||
        beresp.http.Cache-Control ~ "no-store"
    ) {
        return (hit_for_pass);
    }
}
```

---

## Cache Invalidation

**URL:** https://symfony.com/doc/7.3/http_cache/cache_invalidation.html

**Contents:**
- Cache Invalidation

"There are only two hard things in Computer Science: cache invalidation and naming things." -- Phil Karlton

Once a URL is cached by a gateway cache, the cache will not ask the application for that content anymore. This allows the cache to provide fast responses and reduces the load on your application. However, you risk delivering outdated content. A way out of this dilemma is to use long cache lifetimes, but to actively notify the gateway cache when content changes. Reverse proxies usually provide a channel to receive such notifications, typically through special HTTP requests.

While cache invalidation is powerful, avoid it when possible. If you fail to invalidate something, outdated caches will be served for a potentially long time. Instead, use short cache lifetimes or use the validation model, and adjust your controllers to perform efficient validation checks as explained in HTTP Cache Validation.

Furthermore, since invalidation is a topic specific to each type of reverse proxy, using this concept will tie you to a specific reverse proxy or need additional efforts to support different proxies.

Sometimes, however, you need that extra performance you can get when explicitly invalidating. For invalidation, your application needs to detect when content changes and tell the cache to remove the URLs which contain that data from its cache.

If you want to use cache invalidation, have a look at the FOSHttpCacheBundle. This bundle provides services to help with various cache invalidation concepts and also documents the configuration for a couple of common caching proxies.

If one content corresponds to one URL, the PURGE model works well. You send a request to the cache proxy with the HTTP method PURGE (using the word "PURGE" is a convention, technically this can be any string) instead of GET and make the cache proxy detect this and remove the data from the cache instead of going to the application to get a response.

Here is how you can configure the Symfony reverse proxy to support the PURGE HTTP method. First create a caching kernel that overrides the invalidate() method:

Then, register the class as a service that decorates http_cache:

You must protect the PURGE HTTP method somehow to avoid random people purging your cached data.

Purge instructs the cache to drop a resource in all its variants (according to the Vary header, see Varying the Response for HTTP Cache). An alternative to purging is refreshing the content. Refreshing means that the caching proxy is instructed to discard its local cache and fetch the content again. This way, the new content is already available in the cache. The drawback of refreshing is that variants are not invalidated.

In many applications, the same content bit is used on various pages with different URLs. More flexible concepts exist for those cases:

Code consumes server resources. Blackfire tells you how

Online Symfony certification, take it now!

**Examples:**

Example 1 (csharp):
```csharp
// src/CacheKernel.php
namespace App;

use Symfony\Bundle\FrameworkBundle\HttpCache\HttpCache;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
// ...

class CacheKernel extends HttpCache
{
    protected function invalidate(Request $request, bool $catch = false): Response
    {
        if ('PURGE' !== $request->getMethod()) {
            return parent::invalidate($request, $catch);
        }

        if ('127.0.0.1' !== $request->getClientIp()) {
            return new Response(
                'Invalid HTTP method',
                Response::HTTP_BAD_REQUEST
            );
        }

        $response = new Response();
        if ($this->getStore()->purge($request->getUri())) {
            $response->setStatusCode(Response::HTTP_OK, 'Purged');
        } else {
            $response->setStatusCode(Response::HTTP_NOT_FOUND, 'Not found');
        }

        return $response;
    }
}
```

Example 2 (javascript):
```javascript
// src/CacheKernel.php
namespace App;

// ...
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Component\DependencyInjection\Attribute\Autoconfigure;

#[Autoconfigure(bind: ['$surrogate' => '@?esi'])]
#[AsDecorator(decorates: 'http_cache')]
class CacheKernel extends HttpCache
{
    // ...
}
```

Example 3 (unknown):
```unknown
# config/services.yaml
services:
    App\CacheKernel:
        decorates: http_cache
        arguments:
            - '@kernel'
            - '@http_cache.store'
            - '@?esi'
```

Example 4 (unknown):
```unknown
<!-- config/services.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd"
>
    <services>
        <service id="App\CacheKernel" decorates="http_cache">
            <argument type="service" id="kernel"/>
            <argument type="service" id="http_cache.store"/>
            <argument type="service" id="esi" on-invalid="null"/>
        </service>
    </services>
</container>
```

---

## Varying the Response for HTTP Cache

**URL:** https://symfony.com/doc/7.3/http_cache/cache_vary.html

**Contents:**
- Varying the Response for HTTP Cache

So far, it's been assumed that each URI has exactly one representation of the target resource. By default, HTTP caching is done by using the URI of the resource as the cache key. If two people request the same URI of a cacheable resource, the second person will receive the cached version.

Sometimes this isn't enough and different versions of the same URI need to be cached based on one or more request header values. For instance, if you compress pages when the client supports it, any given URI has two representations: one when the client supports compression, and one when it does not. This determination is done by the value of the Accept-Encoding request header.

In this case, you need the cache to store both a compressed and uncompressed version of the response for the particular URI and return them based on the request's Accept-Encoding value. This is done by using the Vary response header, which is a comma-separated list of different headers whose values trigger a different representation of the requested resource:

This particular Vary header would cache different versions of each resource based on the URI and the value of the Accept-Encoding and User-Agent request header.

Set the Vary header via the Response object methods or the #[Cache] attribute:

Measure & Improve Symfony Code Performance

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):
```unknown
Vary: Accept-Encoding, User-Agent
```

Example 2 (unknown):
```unknown
// this attribute takes an array with the name of the header(s)
// names for which the response varies
use Symfony\Component\HttpKernel\Attribute\Cache;
// ...

#[Cache(vary: ['Accept-Encoding'])]
#[Cache(vary: ['Accept-Encoding', 'User-Agent'])]
public function index(): Response
{
    // ...
}
```

Example 3 (unknown):
```unknown
// this method takes a header name or an array of header names for
// which the response varies
$response->setVary('Accept-Encoding');
$response->setVary(['Accept-Encoding', 'User-Agent']);
```

---

## HTTP Cache Expiration

**URL:** https://symfony.com/doc/7.3/http_cache/expiration.html

**Contents:**
- HTTP Cache Expiration
- Expiration with the Cache-Control Header
- Expiration with the Expires Header

The expiration model is the most efficient and straightforward of the two caching models and should be used whenever possible. When a response is cached with an expiration, the cache returns it directly without hitting the application until the cached response expires.

The expiration model can be accomplished using one of two, nearly identical, HTTP headers: Expires or Cache-Control.

Expiration and Validation

You can use both validation and expiration within the same Response. As expiration wins over validation, you can benefit from the best of both worlds. In other words, by using both expiration and validation, you can instruct the cache to serve the cached content, while checking back at some interval (the expiration) to verify that the content is still valid.

Most of the time, you will use the Cache-Control header, which is used to specify many different cache directives:

The Cache-Control header would take on the following format (it may have additional directives):

Using the setSharedMaxAge() method is not equivalent to using both setPublic() and setMaxAge() methods. According to the Serving Stale Responses section of RFC 7234, the s-maxage setting (added by setSharedMaxAge() method) prohibits a cache to use a stale response in stale-if-error scenarios. That's why it's recommended to use both public and max-age directives.

An alternative to the Cache-Control header is Expires. There's no advantage or disadvantage to either.

According to the HTTP specification, "the Expires header field gives the date/time after which the response is considered stale." The Expires header can be set with the expires option of the #[Cache] attribute or the setExpires() Response method:

The resulting HTTP header will look like this:

The expires option and the setExpires() method automatically convert the date to the GMT timezone as required by the specification.

Note that in HTTP versions before 1.1 the origin server wasn't required to send the Date header. Consequently, the cache (e.g. the browser) might need to rely on the local clock to evaluate the Expires header making the lifetime calculation vulnerable to clock skew. Another limitation of the Expires header is that the specification states that "HTTP/1.1 servers should not send Expires dates more than one year in the future."

According to the Calculating Freshness Lifetime section of RFC 7234, the Expires header value is ignored when the s-maxage or max-age directive of the Cache-Control header is defined.

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (unknown):
```unknown
use Symfony\Component\HttpKernel\Attribute\Cache;
// ...

#[Cache(public: true, maxage: 600)]
public function index(): Response
{
    // ...
}
```

Example 2 (unknown):
```unknown
// sets the number of seconds after which the response
// should no longer be considered fresh by shared caches
$response->setPublic();
$response->setMaxAge(600);
```

Example 3 (unknown):
```unknown
Cache-Control: public, max-age=600
```

Example 4 (unknown):
```unknown
use Symfony\Component\HttpKernel\Attribute\Cache;
// ...

#[Cache(expires: '+600 seconds')]
public function index(): Response
{
    // ...
}
```

---

## Working with Server Side Includes

**URL:** https://symfony.com/doc/7.3/http_cache/ssi.html

**Contents:**
- Working with Server Side Includes
- Using SSI in Symfony

In a similar way as ESI (Edge Side Includes), SSI can be used to control HTTP caching on fragments of a response. The most important difference that is SSI is known directly by most web servers like Apache, Nginx etc.

The SSI instructions are done via HTML comments:

There are some other available directives but Symfony manages only the #include virtual one.

Be careful with SSI, your website may fall victim to injections. Please read this OWASP article first!

When the web server reads an SSI directive, it requests the given URI or gives directly from its cache. It repeats this process until there is no more SSI directives to handle. Then, it merges all responses into one and sends it to the client.

First, to use SSI, be sure to enable it in your application configuration:

Suppose you have a page with private content like a Profile page and you want to cache a static GDPR content block. With SSI, you can add some expiration on this block and keep the page private:

The profile index page has not public caching, but the GDPR block has 10 minutes of expiration. Let's include this block into the main one:

The render_ssi twig helper will generate something like:

render_ssi ensures that SSI directive is generated only if the request has the header requirement like Surrogate-Capability: device="SSI/1.0" (normally given by the web server). Otherwise it will embed directly the sub-response.

For more information about Symfony cache fragments, take a tour on the ESI documentation.

Symfony Code Performance Profiling

Online Sylius certification, take it now!

**Examples:**

Example 1 (cpp):
```cpp
<!DOCTYPE html>
<html>
    <body>
        <!-- ... some content -->

        <!-- Embed the content of another page here -->
        <!--#include virtual="/..." -->

        <!-- ... more content -->
    </body>
</html>
```

Example 2 (unknown):
```unknown
# config/packages/framework.yaml
framework:
    ssi: { enabled: true }
```

Example 3 (unknown):
```unknown
<!-- config/packages/framework.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/symfony"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:framework="http://symfony.com/schema/dic/symfony"
    xsi:schemaLocation="http://symfony.com/schema/dic/services
        https://symfony.com/schema/dic/services/services-1.0.xsd
        http://symfony.com/schema/dic/symfony
        https://symfony.com/schema/dic/symfony/symfony-1.0.xsd">

    <framework:config>
        <framework:ssi enabled="true"/>
    </framework:config>
</container>
```

Example 4 (unknown):
```unknown
// config/packages/framework.php
use Symfony\Config\FrameworkConfig;

return static function (FrameworkConfig $framework): void {
    $framework->ssi()
        ->enabled(true)
    ;
};
```

---

## HTTP Cache Validation

**URL:** https://symfony.com/doc/7.3/http_cache/validation.html

**Contents:**
- HTTP Cache Validation
- Validation with the ETag Header
- Validation with the Last-Modified Header
- Optimizing your Code with Validation

When a resource needs to be updated as soon as a change is made to the underlying data, the expiration model falls short. With the expiration model, the application won't be asked to return the updated response until the cache finally becomes stale.

The validation model addresses this issue. Under this model, the cache continues to store responses. The difference is that, for each request, the cache asks the application if the cached response is still valid or if it needs to be regenerated. If the cache is still valid, your application should return a 304 status code and no content. This tells the cache that it's OK to return the cached response.

Under this model, you only save CPU if you're able to determine that the cached response is still valid by doing less work than generating the whole page again (see below for an implementation example).

The 304 status code means "Not Modified". It's important because with this status code the response does not contain the actual content being requested. Instead, the response only consists of the response headers that tells the cache that it can use its stored version of the content.

Like with expiration, there are two different HTTP headers that can be used to implement the validation model: ETag and Last-Modified.

Expiration and Validation

You can use both validation and expiration within the same Response. As expiration wins over validation, you can benefit from the best of both worlds. In other words, by using both expiration and validation, you can instruct the cache to serve the cached content, while checking back at some interval (the expiration) to verify that the content is still valid.

The HTTP ETag ("entity-tag") header is an optional HTTP header whose value is an arbitrary string that uniquely identifies one representation of the target resource. It's entirely generated and set by your application so that you can tell, for example, if the /about resource that's stored by the cache is up-to-date with what your application would return.

An ETag is like a fingerprint and is used to quickly compare if two different versions of a resource are equivalent. Like fingerprints, each ETag must be unique across all representations of the same resource.

To see a short implementation, generate the ETag as the md5 of the content:

The isNotModified() method compares the If-None-Match header with the ETag response header. If the two match, the method automatically sets the Response status code to 304.

When using mod_deflate or mod_brotli in Apache 2.4, the original ETag value is modified (e.g. if ETag was foo, Apache turns it into foo-gzip or foo-br), which breaks the ETag-based validation.

You can control this behavior with the DeflateAlterETag and BrotliAlterETag directives. Alternatively, you can use the following Apache configuration to keep both the original ETag and the modified one when compressing responses:

The cache sets the If-None-Match header on the request to the ETag of the original cached response before sending the request back to the app. This is how the cache and server communicate with each other and decide whether or not the resource has been updated since it was cached.

This algorithm works and is very generic, but you need to create the whole Response before being able to compute the ETag, which is sub-optimal. In other words, it saves on bandwidth, but not CPU cycles.

In the HTTP Cache Validation section, you'll see how validation can be used more intelligently to determine the validity of a cache without doing so much work.

Symfony also supports weak ETag s by passing true as the second argument to the setEtag() method.

The Last-Modified header is the second form of validation. According to the HTTP specification, "The Last-Modified header field indicates the date and time at which the origin server believes the representation was last modified." In other words, the application decides whether or not the cached content has been updated based on whether or not it's been updated since the response was cached.

For instance, you can use the latest update date for all the objects needed to compute the resource representation as the value for the Last-Modified header value:

The isNotModified() method compares the If-Modified-Since header with the Last-Modified response header. If they are equivalent, the Response will be set to a 304 status code.

The cache sets the If-Modified-Since header on the request to the Last-Modified of the original cached response before sending the request back to the app. This is how the cache and server communicate with each other and decide whether or not the resource has been updated since it was cached.

The main goal of any caching strategy is to lighten the load on the application. Put another way, the less you do in your application to return a 304 response, the better. The Response::isNotModified() method does exactly that:

When the Response is not modified, the isNotModified() automatically sets the response status code to 304, removes the content, and removes some headers that must not be present for 304 responses (see setNotModified()).

Check Code Performance in Dev, Test, Staging & Production

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (csharp):
```csharp
// src/Controller/DefaultController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class DefaultController extends AbstractController
{
    public function homepage(Request $request): Response
    {
        $response = $this->render('static/homepage.html.twig');
        $response->setEtag(md5($response->getContent()));
        $response->setPublic(); // make sure the response is public/cacheable
        $response->isNotModified($request);

        return $response;
    }
}
```

Example 2 (unknown):
```unknown
RequestHeader edit "If-None-Match" '^"((.*)-(gzip|br))"$' '"$1", "$2"'
```

Example 3 (csharp):
```csharp
// src/Controller/ArticleController.php
namespace App\Controller;

// ...
use App\Entity\Article;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ArticleController extends AbstractController
{
    public function show(Article $article, Request $request): Response
    {
        $author = $article->getAuthor();

        $articleDate = new \DateTime($article->getUpdatedAt());
        $authorDate = new \DateTime($author->getUpdatedAt());

        $date = $authorDate > $articleDate ? $authorDate : $articleDate;

        $response = new Response();
        $response->setLastModified($date);
        // Set response as public. Otherwise it will be private by default.
        $response->setPublic();

        if ($response->isNotModified($request)) {
            return $response;
        }

        // ... do more work to populate the response with the full content

        return $response;
    }
}
```

Example 4 (javascript):
```javascript
// src/Controller/ArticleController.php
namespace App\Controller;

// ...
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ArticleController extends AbstractController
{
    public function show(string $articleSlug, Request $request): Response
    {
        // Get the minimum information to compute
        // the ETag or the Last-Modified value
        // (based on the Request, data is retrieved from
        // a database or a key-value store for instance)
        $article = ...;

        // create a Response with an ETag and/or a Last-Modified header
        $response = new Response();
        $response->setEtag($article->computeETag());
        $response->setLastModified($article->getPublishedAt());

        // Set response as public. Otherwise it will be private by default.
        $response->setPublic();

        // Check that the Response is not modified for the given Request
        if ($response->isNotModified($request)) {
            // return the 304 Response immediately
            return $response;
        }

        // do more work here - like retrieving more data
        $comments = ...;

        // or render a template with the $response you've already started
        return $this->render('article/show.html.twig', [
            'article' => $article,
            'comments' => $comments,
        ], $response);
    }
}
```

---

## Cache Pools and Supported Adapters

**URL:** https://symfony.com/doc/7.3/components/cache/cache_pools.html

**Contents:**
- Cache Pools and Supported Adapters
- Creating Cache Pools
- Using the Cache Contracts
- Using PSR-6
  - Looking for Cache Items
  - Saving Cache Items
  - Removing Cache Items
- Pruning Cache Items

Cache Pools are the logical repositories of cache items. They perform all the common operations on items, such as saving them or looking for them. Cache pools are independent of the actual cache implementation. Therefore, applications can keep using the same cache pool even if the underlying cache mechanism changes from a file system based cache to a Redis or database based cache.

Cache Pools are created through the cache adapters, which are classes that implement both CacheInterface and Psr\Cache\CacheItemPoolInterface. This component provides several adapters ready to use in your applications.

The CacheInterface allows fetching, storing and deleting cache items using only two methods and a callback:

Out of the box, using this interface provides stampede protection via locking and early expiration. Early expiration can be controlled via the third "beta" argument of the get() method. See the The Cache Component article for more information.

Early expiration can be detected inside the callback by calling the isHit() method: if this returns true, it means we are currently recomputing a value ahead of its expiration date.

For advanced use cases, the callback can accept a second bool &$save argument passed by reference. By setting $save to false inside the callback, you can instruct the cache pool that the returned value should not be stored in the backend.

Cache Pools define three methods to look for cache items. The most common method is getItem($key), which returns the cache item identified by the given key:

If no item is defined for the given key, the method doesn't return a null value but an empty object which implements the CacheItem class.

If you need to fetch several cache items simultaneously, use instead the getItems([$key1, $key2, ...]) method:

Again, if any of the keys doesn't represent a valid cache item, you won't get a null value but an empty CacheItem object.

The last method related to fetching cache items is hasItem($key), which returns true if there is a cache item identified by the given key:

The most common method to save cache items is Psr\Cache\CacheItemPoolInterface::save, which stores the item in the cache immediately (it returns true if the item was saved or false if some error occurred):

Sometimes you may prefer to not save the objects immediately in order to increase the application performance. In those cases, use the Psr\Cache\CacheItemPoolInterface::saveDeferred method to mark cache items as "ready to be persisted" and then call to Psr\Cache\CacheItemPoolInterface::commit method when you are ready to persist them all:

The saveDeferred() method returns true when the cache item has been successfully added to the "persist queue" and false otherwise. The commit() method returns true when all the pending items are successfully saved or false otherwise.

Cache Pools include methods to delete a cache item, some of them or all of them. The most common is Psr\Cache\CacheItemPoolInterface::deleteItem, which deletes the cache item identified by the given key (it returns true when the item is successfully deleted or doesn't exist and false otherwise):

Use the Psr\Cache\CacheItemPoolInterface::deleteItems method to delete several cache items simultaneously (it returns true only if all the items have been deleted, even when any or some of them don't exist):

Finally, to remove all the cache items stored in the pool, use the Psr\Cache\CacheItemPoolInterface::clear method (which returns true when all items are successfully deleted):

If the cache component is used inside a Symfony application, you can remove items from cache pools using the following commands (which reside within the framework bundle):

To remove one specific item from the given pool:

You can also remove all items from the given pool(s):

Some cache pools do not include an automated mechanism for pruning expired cache items. For example, the FilesystemAdapter cache does not remove expired cache items until an item is explicitly requested and determined to be expired, for example, via a call to Psr\Cache\CacheItemPoolInterface::getItem. Under certain workloads, this can cause stale cache entries to persist well past their expiration, resulting in a sizable consumption of wasted disk or memory space from excess, expired cache items.

This shortcoming has been solved through the introduction of PruneableInterface, which defines the abstract method prune(). The ChainAdapter, DoctrineDbalAdapter, and FilesystemAdapter, PdoAdapter, and PhpFilesAdapter all implement this new interface, allowing manual removal of stale cache items:

The ChainAdapter implementation does not directly contain any pruning logic itself. Instead, when calling the chain adapter's prune() method, the call is delegated to all its compatible cache adapters (and those that do not implement PruneableInterface are silently ignored):

If the cache component is used inside a Symfony application, you can prune all items from all pools using the following command (which resides within the framework bundle):

Get your Sylius expertise recognized

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Contracts\Cache\ItemInterface;

$cache = new FilesystemAdapter();

// The callable will only be executed on a cache miss.
$value = $cache->get('my_cache_key', function (ItemInterface $item): string {
    $item->expiresAfter(3600);

    // ... do some HTTP request or heavy computations
    $computedValue = 'foobar';

    return $computedValue;
});

echo $value; // 'foobar'

// ... and to remove the cache key
$cache->delete('my_cache_key');
```

Example 2 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\FilesystemAdapter;

$cache = new FilesystemAdapter('app.cache');
$latestNews = $cache->getItem('latest_news');
```

Example 3 (unknown):
```unknown
// ...
$stocks = $cache->getItems(['AAPL', 'FB', 'GOOGL', 'MSFT']);
```

Example 4 (unknown):
```unknown
// ...
$hasBadges = $cache->hasItem('user_'.$userId.'_badges');
```

---

## TextType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/text.html

**Contents:**
- TextType Field
- Inherited Options
  - attr
  - data
  - disabled
  - empty_data
  - error_bubbling
  - error_mapping
  - help
  - help_attr

The TextType field represents the most basic input text field.

The full list of options defined and inherited by this form type is available running this command in your app:

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

From an HTTP perspective, submitted data is always a string or an array of strings. So by default, the form will treat any empty string as null. If you prefer to get an empty string, explicitly set the empty_data option to an empty string.

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

type: boolean default: false

When true, the text input will be sanitized using the Symfony HTML Sanitizer component after the form is submitted. This protects the form input against XSS, clickjacking and CSS injection.

You must install the HTML sanitizer component to use this option.

type: string default: "default"

When sanitize_html is enabled, you can specify the name of a custom sanitizer using this option.

type: boolean default: true

If true, the whitespace of the submitted string value will be stripped via the trim function when the data is bound. This guarantees that if a value is submitted with extra whitespace, it will be removed before the value is merged back onto the underlying object.

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

Check Code Performance in Dev, Test, Staging & Production

Online exam, become Symfony certified today

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## TextareaType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/textarea.html

**Contents:**
- TextareaType Field
- Inherited Options
  - attr
  - data
  - disabled
  - empty_data
  - error_bubbling
  - error_mapping
  - help
  - help_attr

Renders a textarea HTML element.

The full list of options defined and inherited by this form type is available running this command in your app:

If you prefer to use an advanced WYSIWYG editor instead of a plain <textarea>, consider using the FOSCKEditorBundle community bundle. Read its documentation to learn how to integrate it in your Symfony application.

When allowing users to type HTML code in the textarea (or using a WYSIWYG) editor, the application is vulnerable to XSS injection, clickjacking or CSS injection. Use the sanitize_html option to protect against these types of attacks.

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

From an HTTP perspective, submitted data is always a string or an array of strings. So by default, the form will treat any empty string as null. If you prefer to get an empty string, explicitly set the empty_data option to an empty string.

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

type: boolean default: false

When true, the text input will be sanitized using the Symfony HTML Sanitizer component after the form is submitted. This protects the form input against XSS, clickjacking and CSS injection.

You must install the HTML sanitizer component to use this option.

type: string default: "default"

When sanitize_html is enabled, you can specify the name of a custom sanitizer using this option.

type: boolean default: true

If true, the whitespace of the submitted string value will be stripped via the trim function when the data is bound. This guarantees that if a value is submitted with extra whitespace, it will be removed before the value is merged back onto the underlying object.

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

Put the code quality back at the heart of your project

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## EmailType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/email.html

**Contents:**
- EmailType Field
- Overridden Options
  - invalid_message
- Inherited Options
  - attr
  - data
  - disabled
  - empty_data
  - error_bubbling
  - error_mapping

The EmailType field is a text field that is rendered using the HTML5 <input type="email"> tag.

The full list of options defined and inherited by this form type is available running this command in your app:

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

type: boolean default: true

If true, the whitespace of the submitted string value will be stripped via the trim function when the data is bound. This guarantees that if a value is submitted with extra whitespace, it will be removed before the value is merged back onto the underlying object.

Measure & Improve Symfony Code Performance

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## NumberType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/number.html

**Contents:**
- NumberType Field
- Field Options
  - grouping
  - html5
  - input
  - scale
  - rounding_mode
- Overridden Options
  - compound
  - invalid_message

Renders an input text field and specializes in handling number input. This type offers different options for the scale, rounding and grouping that you want to use for your number.

The full list of options defined and inherited by this form type is available running this command in your app:

type: boolean default: false

This value is used internally as the NumberFormatter::GROUPING_USED value when using PHP's NumberFormatter class. Its documentation is non-existent, but it appears that if you set this to true, numbers will be grouped with a comma or period (depending on your locale): 12345.123 would display as 12,345.123.

type: boolean default: false

If set to true, the HTML input will be rendered as a native HTML5 type="number" form.

type: string default: number

The format of the input data - i.e. the format that the number is stored on your underlying object. Valid values are number and string. Setting this option to string can be useful if the underlying data is a string for precision reasons (for example, Doctrine uses strings for the decimal type).

type: integer default: Locale-specific (usually around 3)

This specifies how many decimals will be allowed until the field rounds the submitted value (via rounding_mode). For example, if scale is set to 2, a submitted value of 20.123 will be rounded to, for example, 20.12 (depending on your rounding_mode).

type: integer default: \NumberFormatter::ROUND_DOWN for IntegerType and \NumberFormatter::ROUND_HALFUP for MoneyType and NumberType

default: \NumberFormatter::ROUND_DOWN

default: \NumberFormatter::ROUND_HALFUP

If a submitted number needs to be rounded (based on the scale option), you have several configurable options for that rounding. Each option is a constant on the NumberFormatter class:

When the html5 option is set to false, the <input> element will include an inputmode HTML attribute which depends on the value of this option. If the scale value is 0, inputmode will be numeric; if scale is set to any value greater than 0, inputmode will be decimal.

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Symfony Code Performance Profiling

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## IntegerType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/integer.html

**Contents:**
- IntegerType Field
- Field Options
  - grouping
  - rounding_mode
- Overridden Options
  - compound
  - invalid_message
- Inherited Options
  - attr
  - data

Renders an input "number" field. Basically, this is a text field that's good at handling data that's in an integer form. The input number field looks like a text box, except that - if the user's browser supports HTML5 - it will have some extra front-end functionality.

This field has different options on how to handle input values that aren't integers. By default, all non-integer values (e.g. 6.78) will round down (e.g. 6).

The full list of options defined and inherited by this form type is available running this command in your app:

type: boolean default: false

This value is used internally as the NumberFormatter::GROUPING_USED value when using PHP's NumberFormatter class. Its documentation is non-existent, but it appears that if you set this to true, numbers will be grouped with a comma or period (depending on your locale): 12345.123 would display as 12,345.123.

type: integer default: \NumberFormatter::ROUND_DOWN

By default, if the user enters a non-integer number, it will be rounded down. You have several configurable options for that rounding. Each option is a constant on the NumberFormatter class:

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

Save your teams and projects before they sink

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## MoneyType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/money.html

**Contents:**
- MoneyType Field
- Field Options
  - currency
  - divisor
  - grouping
  - rounding_mode
  - html5
  - input
  - scale
- Overridden Options

Renders an input text field and specializes in handling submitted "money" data.

This field type allows you to specify a currency, whose symbol is rendered next to the text field. There are also several other options for customizing how the input and output of the data is handled.

The full list of options defined and inherited by this form type is available running this command in your app:

type: string default: EUR

Specifies the currency that the money is being specified in. This determines the currency symbol that should be shown by the text box. Depending on the currency - the currency symbol may be shown before or after the input text field.

This can be any 3 letter ISO 4217 code. You can also set this to false to hide the currency symbol.

type: integer default: 1

If you need to divide your starting value by a number before rendering it to the user, you can use the divisor option. For example if you store prices as integer in order to avoid rounding errors, you can transform values in cents automatically:

In this case, if the price field is set to 9900, then the value 99 will actually be rendered to the user. When the user submits the value 99, it will be multiplied by 100 and 9900 will ultimately be set back on your object.

type: boolean default: false

This value is used internally as the NumberFormatter::GROUPING_USED value when using PHP's NumberFormatter class. Its documentation is non-existent, but it appears that if you set this to true, numbers will be grouped with a comma or period (depending on your locale): 12345.123 would display as 12,345.123.

type: integer default: \NumberFormatter::ROUND_DOWN for IntegerType and \NumberFormatter::ROUND_HALFUP for MoneyType and NumberType

default: \NumberFormatter::ROUND_DOWN

default: \NumberFormatter::ROUND_HALFUP

If a submitted number needs to be rounded (based on the scale option), you have several configurable options for that rounding. Each option is a constant on the NumberFormatter class:

type: boolean default: false

If set to true, the HTML input will be rendered as a native HTML5 <input type="number"> element.

As HTML5 number format is normalized, it is incompatible with the grouping option.

type: string default: float

By default, the money value is converted to a float PHP type. If you need the value to be converted into an integer (e.g. because some library needs money values stored in cents as integers) set this option to integer. You can also set this option to string, it can be useful if the underlying data is a string for precision reasons (for example, Doctrine uses strings for the decimal type).

The input option was introduced in Symfony 7.1.

type: integer default: 2

If, for some reason, you need some scale other than 2 decimal places, you can modify this value. You probably won't need to do this unless, for example, you want to round to the nearest dollar (set the scale to 0).

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Check Code Performance in Dev, Test, Staging & Production

Make sure your project is risk free

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\MoneyType;
// ...

$builder->add('price', MoneyType::class, [
    'divisor' => 100,
]);
```

Example 3 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 4 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

---

## PasswordType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/password.html

**Contents:**
- PasswordType Field
- Field Options
  - always_empty
  - hash_property_path
  - toggle
- Overridden Options
  - invalid_message
  - trim
- Inherited Options
  - attr

The PasswordType field renders an input password text box.

The full list of options defined and inherited by this form type is available running this command in your app:

type: boolean default: true

If set to true, the field will always render blank, even if the corresponding field has a value. When set to false, the password field will be rendered with the value attribute set to its true value only upon submission.

If you want to render your password field with the password value already entered into the box, set this to false and submit the form.

type: string default: null

If set, the password will be hashed using the PasswordHasher component and stored in the property defined by the given PropertyAccess expression.

Data passed to the form must be a PasswordAuthenticatedUserInterface object.

To minimize the risk of leaking the plain password, this option can only be used with the "mapped" option set to false:

or if you want to use it with the RepeatedType:

type: boolean requires: symfony/ux-toggle-password

Adds "Show"/"Hide" links to the field which toggle the password field to plaintext when clicked. See symfony/ux-toggle-password for more details.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

type: boolean default: false

Unlike the rest of form types, the PasswordType doesn't apply the trim function to the value submitted by the user. This ensures that the password is merged back onto the underlying object exactly as it was typed by the user.

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Get your Sylius expertise recognized

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('plainPassword', PasswordType::class, [
    'hash_property_path' => 'password',
    'mapped' => false,
]);
```

Example 3 (javascript):
```javascript
$builder->add('plainPassword', RepeatedType::class, [
    'type' => PasswordType::class,
    'first_options'  => ['label' => 'Password', 'hash_property_path' => 'password'],
    'second_options' => ['label' => 'Repeat Password'],
    'mapped' => false,
]);
```

Example 4 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

---

## PercentType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/percent.html

**Contents:**
- PercentType Field
- Field Options
  - rounding_mode
  - html5
  - scale
  - symbol
  - type
- Overridden Options
  - compound
  - invalid_message

The PercentType renders an input text field and specializes in handling percentage data. If your percentage data is stored as a decimal (e.g. 0.95), you can use this field out-of-the-box. If you store your data as a number (e.g. 95), you should set the type option to integer.

When symbol is not false, the field will render the given string after the input.

The full list of options defined and inherited by this form type is available running this command in your app:

type: integer default: \NumberFormatter::ROUND_DOWN for IntegerType and \NumberFormatter::ROUND_HALFUP for MoneyType and NumberType

default: \NumberFormatter::ROUND_DOWN

default: \NumberFormatter::ROUND_HALFUP

If a submitted number needs to be rounded (based on the scale option), you have several configurable options for that rounding. Each option is a constant on the NumberFormatter class:

type: boolean default: false

If set to true, the HTML input will be rendered as a native HTML5 <input type="number"> element.

type: integer default: 0

This specifies how many decimals will be allowed until the field rounds the submitted value (via rounding_mode). For example, if scale is set to 2, a submitted value of 20.123 will be rounded to, for example, 20.12 (depending on your rounding_mode).

type: boolean or string default: %

By default, fields are rendered with a percentage sign % after the input. Setting the value to false will not display the percentage sign. Setting the value to a string (e.g. ‱), will show that string instead of the default % sign.

type: string default: fractional

This controls how your data is stored on your object. For example, a percentage corresponding to "55%", might be stored as 0.55 or 55 on your object. The two "types" handle these two cases:

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Code consumes server resources. Blackfire tells you how

Become certified from home

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## UrlType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/url.html

**Contents:**
- UrlType Field
- Field Options
  - default_protocol
- Overridden Options
  - invalid_message
- Inherited Options
  - attr
  - data
  - disabled
  - empty_data

The UrlType field is a text field that prepends the submitted value with a given protocol (e.g. http://) if the submitted value doesn't already have a protocol.

The full list of options defined and inherited by this form type is available running this command in your app:

type: string default: http

Set this value to null to render the field using a <input type="url"/>, allowing the browser to perform local validation before submission.

When this value is neither null nor an empty string, the form field is rendered using a <input type="text"/>. This ensures users can submit the form field without specifying the protocol.

If a value is submitted that doesn't begin with some protocol (e.g. http://, ftp://, etc), this protocol will be prepended to the string when the data is submitted to the form.

Not setting the default_protocol option is deprecated since Symfony 7.1 and will default to null in Symfony 8.0.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

type: boolean default: true

If true, the whitespace of the submitted string value will be stripped via the trim function when the data is bound. This guarantees that if a value is submitted with extra whitespace, it will be removed before the value is merged back onto the underlying object.

Online exam, become Symfony certified today

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## SearchType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/search.html

**Contents:**
- SearchType Field
- Overridden Options
  - invalid_message
- Inherited Options
  - attr
  - disabled
  - empty_data
  - error_bubbling
  - error_mapping
  - help

This renders an <input type="search"> field, which is a text box with special functionality supported by some browsers.

The full list of options defined and inherited by this form type is available running this command in your app:

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

type: boolean default: true

If true, the whitespace of the submitted string value will be stripped via the trim function when the data is bound. This guarantees that if a value is submitted with extra whitespace, it will be removed before the value is merged back onto the underlying object.

Show your Sylius expertise

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

Example 4 (javascript):
```javascript
public function configureOptions(OptionsResolver $resolver): void
{
    $resolver->setDefaults([
        'error_mapping' => [
            'matchingCityAndZipCode' => 'city',
        ],
    ]);
}
```

---

## ColorType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/color.html

**Contents:**
- ColorType Field
- Field Options
  - html5
- Overridden Options
  - invalid_message
- Inherited Options
  - attr
  - data
  - disabled
  - empty_data

The ColorType field is a text field that is rendered using the HTML5 <input type="color"> tag. Depending on each browser, the behavior of this form field can vary substantially. Some browsers display it as a simple text field, while others display a native color picker.

The value of the underlying <input type="color"> field is always a 7-character string specifying an RGB color in lower case hexadecimal notation. That's why it's not possible to select semi-transparent colors with this element.

The full list of options defined and inherited by this form type is available running this command in your app:

type: boolean default: false

When this option is set to true, the form type checks that its value matches the HTML5 color format (/^#[0-9a-f]{6}$/i). If it doesn't match it, you'll see the following error message: "This value is not a valid HTML5 color".

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

type: boolean default: true

If true, the whitespace of the submitted string value will be stripped via the trim function when the data is bound. This guarantees that if a value is submitted with extra whitespace, it will be removed before the value is merged back onto the underlying object.

Check Code Performance in Dev, Test, Staging & Production

Online Symfony certification, take it now!

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## TelType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/tel.html

**Contents:**
- TelType Field
- Overridden Options
  - invalid_message
- Inherited Options
  - attr
  - data
  - disabled
  - empty_data
  - error_bubbling
  - error_mapping

The TelType field is a text field that is rendered using the HTML5 <input type="tel"> tag. Following the recommended HTML5 behavior, the value of this type is not validated in any way, because formats for telephone numbers vary too much depending on each country.

Nevertheless, it may be useful to use this type in web applications because some browsers (e.g. smartphone browsers) adapt the input keyboard to make it easier to input phone numbers.

The full list of options defined and inherited by this form type is available running this command in your app:

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

type: boolean default: true

If true, the whitespace of the submitted string value will be stripped via the trim function when the data is bound. This guarantees that if a value is submitted with extra whitespace, it will be removed before the value is merged back onto the underlying object.

Symfony Code Performance Profiling

Become certified from home

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## ChoiceType Field (select drop-downs, radio buttons & checkboxes)

**URL:** https://symfony.com/doc/7.3/reference/forms/types/choice.html

**Contents:**
- ChoiceType Field (select drop-downs, radio buttons & checkboxes)
- Example Usage
- Advanced Example (with Objects!)
- Select Tag, Checkboxes or Radio Buttons
- Customizing each Option's Text (Label)
- Grouping Options
- Field Options
  - choices
  - choice_attr
  - choice_filter

A multi-purpose field used to allow the user to "choose" one or more options. It can be rendered as a select tag, radio buttons, or checkboxes.

To use this field, you must specify either choices or choice_loader option.

The full list of options defined and inherited by this form type is available running this command in your app:

The easiest way to use this field is to define the choices option to specify the choices as an associative array where the keys are the labels displayed to end users and the array values are the internal values used in the form field:

This will create a select drop-down like this:

If the user selects No, the form will return false for this field. Similarly, if the starting data for this field is true, then Yes will be auto-selected. In other words, the choice of each item is the value you want to get/set in PHP code, while the key is the label that will be shown to the user.

This field has a lot of options and most control how the field is displayed. In this example, the underlying data is some Category object that has a getName() method:

You can also customize the choice_name of each choice. You can learn more about all of these options in the sections below.

The placeholder is a specific field, when the choices are optional the first item in the list must be empty, so the user can unselect. Be sure to always handle the empty choice null when using callbacks.

This field may be rendered as one of several HTML fields, depending on the expanded and multiple options:

Normally, the array key of each item in the choices option is used as the text that's shown to the user. But that can be completely customized via the choice_label option. Check it out for more details.

You can group the <option> elements of a <select> into <optgroup> by passing a multi-dimensional choices array:

To get fancier, use the group_by option instead.

type: array default: []

This is the most basic way to specify the choices that should be used by this field. The choices option is an array, where the array key is the item's label and the array value is the item's value:

If there are choice values that are not scalar or the stringified representation is not unique Symfony will use incrementing integers as values. When the form gets submitted the correct values with the correct types will be assigned to the model.

type: array, callable, string or PropertyPath default: []

Use this to add additional HTML attributes to each choice. This can be an associative array where the keys match the choice keys and the values are the attributes for each choice, a callable or a property path (just like choice_label).

If an array, the keys of the choices array must be used as keys:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: callable, string or PropertyPath default: null

When using predefined choice types from Symfony core or vendor libraries (i.e. CountryType) this option lets you define a callable that takes each choice as the only argument and must return true to keep it or false to discard it:

The option can be a callable or a property path when choices are objects:

Considering this AddressType could be an entry of a CollectionType you should use the ChoiceList class helper to enable caching:

type: string, callable, false or PropertyPath default: null

By default, the array key of each item in the choices option is used as the text that's shown to the user. The choice_label option allows you to take more control:

This method is called for each choice, passing you the $choice and $key from the choices array (additional $value is related to choice_value). This will give you:

If your choice values are objects, then choice_label can also be a property path. Imagine you have some Status class with a getDisplayName() method:

If set to false, all the tag labels will be discarded for radio or checkbox inputs. You can also return false from the callable to discard certain labels.

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: ChoiceLoaderInterface

The choice_loader option can be used instead of the choices option. It allows to create a list lazily or partially when fetching only the choices for a set of submitted values (i.e. querying a search engine like ElasticSearch can be a heavy process).

You can use an instance of CallbackChoiceLoader if you want to take advantage of lazy loading:

This will cause the call of StaticClass::getConstants() to not happen if the request is redirected and if there is no pre set or submitted data. Otherwise the choice options would need to be resolved thus triggering the callback.

If the built-in CallbackChoiceLoader doesn't fit your needs, you can create your own loader by implementing the ChoiceLoaderInterface or by extending the AbstractChoiceLoader. This abstract class saves you some boilerplate by implementing some methods of the interface so you'll only have to implement the loadChoices() method to have a fully functional choice loader.

When you're defining a custom choice type that may be reused in many fields (like entries of a collection) or reused in multiple forms at once, you should use the ChoiceList static methods to wrap the loader and make the choice list cacheable for better performance:

type: boolean default: false

The choice_lazy option was introduced in Symfony 7.2.

The choice_lazy option is particularly useful when dealing with a large set of choices, where loading them all at once could cause performance issues or delays:

When set to true and used alongside the choice_loader option, the form will only load and render the choices that are preset as default values or submitted. This defers the loading of the full list of choices, helping to improve your form's performance.

Keep in mind that when using choice_lazy, you are responsible for providing the user interface for selecting choices, typically through a JavaScript plugin capable of dynamically loading choices.

type: callable, string or PropertyPath default: null

Controls the internal field name of the choice. You normally don't care about this, but in some advanced cases, you might. For example, this "name" becomes the index of the choice views in the template and is used as part of the field name attribute.

This can be a callable or a property path. See choice_label for similar usage. By default, the choice key or an incrementing integer may be used (starting at 0).

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

The configured value must be a valid form name. Make sure to only return valid names when using a callable. Valid form names must be composed of letters, digits, underscores, dashes and colons and must not start with a dash or a colon.

type: string, boolean or null default: true

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

type: array, callable, string or PropertyPath default: []

The choice values are translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders. This can be an associative array where the keys match the choice keys and the values are the attributes for each choice, a callable or a property path (just like choice_label).

Given this translation message:

You can specify the placeholder values as follows:

If an array, the keys of the choices array must be used as keys:

The translation parameters of child fields are merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

type: callable, string or PropertyPath default: null

Returns the string "value" for each choice, which must be unique across all choices. This is used in the value attribute in HTML and submitted in the POST/PUT requests. You don't normally need to worry about this, but it might be handy when processing an API request (since you can configure the value that will be sent in the API request).

This can be a callable or a property path. By default, the choices are used if they can be cast to strings. Otherwise an incrementing integer is used (starting at 0).

If you pass a callable, it will receive one argument: the choice itself. When using the EntityType Field, the argument will be the entity object for each choice or null in a placeholder is used, which you need to handle:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: boolean default: true

When using the preferred_choices option, those preferred choices are displayed twice by default: at the top of the list and in the full list below. Set this option to false, to only display preferred choices at the top of the list:

type: boolean default: false

If set to true, radio buttons or checkboxes will be rendered (depending on the multiple value). If false, a select element will be rendered.

type: string, callable or PropertyPath default: null

You can group the <option> elements of a <select> into <optgroup> by passing a multi-dimensional array to choices. See the Grouping Options section about that.

The group_by option is an alternative way to group choices, which gives you a bit more flexibility.

Take the following example:

This groups the dates that are within 3 days into "Soon" and everything else into a "Later" <optgroup>:

If you return null, the option won't be grouped. You can also pass a string "property path" that will be called to get the group. See the choice_label for details about using a property path.

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: boolean default: false

If true, the user will be able to select multiple options (as opposed to choosing just one option). Depending on the value of the expanded option, this will render either a select tag or checkboxes if true and a select tag or radio buttons if false. The returned value will be an array.

type: string or TranslatableMessage or boolean

This option determines whether or not a special "empty" option (e.g. "Choose an option") will appear at the top of a select widget. This option only applies if the multiple option is set to false.

Add an empty value with "Choose an option" as the text:

Guarantee that no "empty" value option is displayed:

If you leave the placeholder option unset, then a blank (with no text) option will automatically be added if and only if the required option is false:

type: array default: []

Use this to add additional HTML attributes to the placeholder choice:

type: array, callable, string or PropertyPath default: []

This option allows you to display certain choices at the top of your list with a visual separator between them and the complete list of options. If you have a form of languages, you can list the most popular on top, like Bork and Pirate:

This options can also be a callback function to give you more flexibility. This might be especially useful if your values are objects:

This will "prefer" the "now" and "tomorrow" choices only:

Finally, if your values are objects, you can also specify a property path string on the object that will return true or false.

The preferred choices are only meaningful when rendering a select element (i.e. expanded false). The preferred choices and normal choices are separated visually by a set of dotted lines (i.e. -------------------). This can be customized when rendering the field:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: string default: -------------------

This option allows you to customize the visual separator shown after the preferred choices. You can use HTML elements like <hr> to display a more modern separator, but you'll also need to set the separator_html option to true.

The separator option was introduced in Symfony 7.1.

type: boolean default: false

If this option is true, the separator option will be displayed as HTML instead of text. This is useful when using HTML elements (e.g. <hr>) as a more modern visual separator.

The separator_html option was introduced in Symfony 7.1.

type: boolean default: same value as expanded option

This option specifies if a form is compound. The value is by default overridden by the value of the expanded option.

The actual default value of this option depends on other field options:

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false

Set that error on this field must be attached to the field instead of the parent field (the form in most cases).

type: boolean default: false

Trimming is disabled by default because the selected value or values must match the given choice values exactly (and they could contain whitespaces).

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: boolean default: true

In most cases, if you have an author field, then you expect setAuthor() to be called on the underlying object. In some cases, however, setAuthor() may not be called. Setting by_reference to false ensures that the setter is called in all cases.

To explain this further, here's a simple example:

If by_reference is true, the following takes place behind the scenes when you call submit() (or handleRequest()) on the form:

Notice that setAuthor() is not called. The author is modified by reference.

If you set by_reference to false, submitting looks like this:

So, all that by_reference=false really does is that it clones the object, which enforces the framework to call the setter on the parent object.

Similarly, if you're using the CollectionType field where your underlying collection data is an object (like with Doctrine's ArrayCollection), then by_reference must be set to false if you need the adder and remover (e.g. addAuthor() and removeAuthor()) to be called.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: boolean default: false

This option determines if the form will inherit data from its parent form. This can be useful if you have a set of fields that are duplicated across multiple forms. See How to Reduce Code Duplication with "inherit_data".

When a field has the inherit_data option set, it uses the data of the parent form as is. This means that Data Transformers won't be applied to that field.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

type: string default: messages

In case choice_translation_domain is set to true or null, this configures the exact translation domain that will be used for any labels or options that are rendered for this field.

type: array default: []

The content of the label option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The label_translation_parameters option of children fields is merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

type: array default: []

The content of the title and placeholder values defined in the attr option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The attr_translation_parameters option of children fields is merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

type: array default: []

The content of the help option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The help_translation_parameters option of children fields is merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

In Twig template, instead of using is_selected(), it's significantly faster to use the selectedchoice test.

The form.vars variable of each choice entry holds data such as whether the choice is selected or not. If you need to get the full list of choices data and values, use the choices variable from the parent form of the choice entry (which is the ChoiceType itself) with form.parent.vars.choices:

Following the same advanced example as above (where choices values are entities), the Category object is inside form.parent.vars.choices[key].data:

Symfony Code Performance Profiling

Become certified from home

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
// ...

$builder->add('isAttending', ChoiceType::class, [
    'choices'  => [
        'Maybe' => null,
        'Yes' => true,
        'No' => false,
    ],
]);
```

Example 3 (javascript):
```javascript
use App\Entity\Category;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
// ...

$builder->add('category', ChoiceType::class, [
    'choices' => [
        new Category('Cat1'),
        new Category('Cat2'),
        new Category('Cat3'),
        new Category('Cat4'),
    ],
    // "name" is a property path, meaning Symfony will look for a public
    // property or a public method like "getName()" to define the input
    // string value that will be submitted by the form
    'choice_value' => 'name',
    // a callback to return the label for a given choice
    // if a placeholder is used, its empty value (null) may be passed but
    // its label is defined by its own "placeholder" option
    'choice_label' => function (?Category $category): string {
        return $category ? strtoupper($category->getName()) : '';
    },
    // returns the html attributes for each option input (may be radio/checkbox)
    'choice_attr' => function (?Category $category): array {
        return $category ? ['class' => 'category_'.strtolower($category->getName())] : [];
    },
    // every option can use a string property path or any callable that get
    // passed each choice as argument, but it may not be needed
    'group_by' => function (): string {
        // randomly assign things into 2 groups
        return rand(0, 1) === 1 ? 'Group A' : 'Group B';
    },
    // a callback to return whether a category is preferred
    'preferred_choices' => function (?Category $category): bool {
        return $category && 100 < $category->getArticleCounts();
    },
]);
```

Example 4 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
// ...

$builder->add('stockStatus', ChoiceType::class, [
    'choices' => [
        'Main Statuses' => [
            'Yes' => 'stock_yes',
            'No' => 'stock_no',
        ],
        'Out of Stock Statuses' => [
            'Backordered' => 'stock_backordered',
            'Discontinued' => 'stock_discontinued',
        ],
    ],
]);
```

---

## RangeType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/range.html

**Contents:**
- RangeType Field
- Basic Usage
- Overridden Options
  - invalid_message
- Inherited Options
  - attr
  - data
  - disabled
  - empty_data
  - error_bubbling

The RangeType field is a slider that is rendered using the HTML5 <input type="range"> tag.

The full list of options defined and inherited by this form type is available running this command in your app:

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

type: boolean default: true

If true, the whitespace of the submitted string value will be stripped via the trim function when the data is bound. This guarantees that if a value is submitted with extra whitespace, it will be removed before the value is merged back onto the underlying object.

Check Code Performance in Dev, Test, Staging & Production

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\RangeType;
// ...

$builder->add('name', RangeType::class, [
    'attr' => [
        'min' => 5,
        'max' => 50
    ],
]);
```

Example 3 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 4 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

---

## EnumType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/enum.html

**Contents:**
- EnumType Field
- Example Usage
- Field Options
  - class
- Inherited Options
  - choices
  - choice_attr
  - choice_filter
  - choice_label
  - choice_loader

A multi-purpose field used to allow the user to "choose" one or more options defined in a PHP enumeration. It extends the ChoiceType field and defines the same options.

The full list of options defined and inherited by this form type is available running this command in your app:

Before using this field, you'll need to have some PHP enumeration (or "enum" for short) defined somewhere in your application. This enum has to be of type "backed enum", where each keyword defines a scalar value such as a string:

Instead of using the values of the enumeration in a choices option, the EnumType only requires to define the class option pointing to the enum:

This will display a <select> tag with the three possible values defined in the TextAlign enum. Use the expanded and multiple options to display these values as <input type="checkbox"> or <input type="radio">.

The label displayed in the <option> elements of the <select> is the enum name. PHP defines some strict rules for these names (e.g. they can't contain dots or spaces). If you need more flexibility for these labels, your enum can implement TranslatableInterface to translate or display custom labels:

type: string default: (it has no default)

The fully-qualified class name (FQCN) of the PHP enum used to get the values displayed by this form field.

These options inherit from the ChoiceType:

type: array default: []

By default, this field displays all the cases of the related PHP enum. Use this option to explicitly define which options to display:

type: array, callable, string or PropertyPath default: []

Use this to add additional HTML attributes to each choice. This can be an associative array where the keys match the choice keys and the values are the attributes for each choice, a callable or a property path (just like choice_label).

If an array, the keys of the choices array must be used as keys:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: callable, string or PropertyPath default: null

When using predefined choice types from Symfony core or vendor libraries (i.e. CountryType) this option lets you define a callable that takes each choice as the only argument and must return true to keep it or false to discard it:

The option can be a callable or a property path when choices are objects:

Considering this AddressType could be an entry of a CollectionType you should use the ChoiceList class helper to enable caching:

type: string, callable, false or PropertyPath default: null

By default, the array key of each item in the choices option is used as the text that's shown to the user. The choice_label option allows you to take more control:

This method is called for each choice, passing you the $choice and $key from the choices array (additional $value is related to choice_value). This will give you:

If your choice values are objects, then choice_label can also be a property path. Imagine you have some Status class with a getDisplayName() method:

If set to false, all the tag labels will be discarded for radio or checkbox inputs. You can also return false from the callable to discard certain labels.

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: ChoiceLoaderInterface

The choice_loader option can be used instead of the choices option. It allows to create a list lazily or partially when fetching only the choices for a set of submitted values (i.e. querying a search engine like ElasticSearch can be a heavy process).

You can use an instance of CallbackChoiceLoader if you want to take advantage of lazy loading:

This will cause the call of StaticClass::getConstants() to not happen if the request is redirected and if there is no pre set or submitted data. Otherwise the choice options would need to be resolved thus triggering the callback.

If the built-in CallbackChoiceLoader doesn't fit your needs, you can create your own loader by implementing the ChoiceLoaderInterface or by extending the AbstractChoiceLoader. This abstract class saves you some boilerplate by implementing some methods of the interface so you'll only have to implement the loadChoices() method to have a fully functional choice loader.

When you're defining a custom choice type that may be reused in many fields (like entries of a collection) or reused in multiple forms at once, you should use the ChoiceList static methods to wrap the loader and make the choice list cacheable for better performance:

type: callable, string or PropertyPath default: null

Controls the internal field name of the choice. You normally don't care about this, but in some advanced cases, you might. For example, this "name" becomes the index of the choice views in the template and is used as part of the field name attribute.

This can be a callable or a property path. See choice_label for similar usage. By default, the choice key or an incrementing integer may be used (starting at 0).

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

The configured value must be a valid form name. Make sure to only return valid names when using a callable. Valid form names must be composed of letters, digits, underscores, dashes and colons and must not start with a dash or a colon.

type: string, boolean or null default: true

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

type: array, callable, string or PropertyPath default: []

The choice values are translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders. This can be an associative array where the keys match the choice keys and the values are the attributes for each choice, a callable or a property path (just like choice_label).

Given this translation message:

You can specify the placeholder values as follows:

If an array, the keys of the choices array must be used as keys:

The translation parameters of child fields are merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

type: callable, string or PropertyPath default: null

Returns the string "value" for each choice, which must be unique across all choices. This is used in the value attribute in HTML and submitted in the POST/PUT requests. You don't normally need to worry about this, but it might be handy when processing an API request (since you can configure the value that will be sent in the API request).

This can be a callable or a property path. By default, the choices are used if they can be cast to strings. Otherwise an incrementing integer is used (starting at 0).

If you pass a callable, it will receive one argument: the choice itself. When using the EntityType Field, the argument will be the entity object for each choice or null in a placeholder is used, which you need to handle:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: boolean default: false

If set to true, radio buttons or checkboxes will be rendered (depending on the multiple value). If false, a select element will be rendered.

type: string or callable or PropertyPath default: null

You can group the <option> elements of a <select> into <optgroup> by passing a multi-dimensional array to choices. See the Grouping Options section about that.

The group_by option is an alternative way to group choices, which gives you a bit more flexibility.

Let's add a few cases to our TextAlign enumeration:

We can now group choices by the enum case value:

This callback will group choices in 3 categories: Upper, Lower and Other.

If you return null, the option won't be grouped.

type: boolean default: true

When using the preferred_choices option, those preferred choices are displayed twice by default: at the top of the list and in the full list below. Set this option to false, to only display preferred choices at the top of the list:

type: boolean default: false

If true, the user will be able to select multiple options (as opposed to choosing just one option). Depending on the value of the expanded option, this will render either a select tag or checkboxes if true and a select tag or radio buttons if false. The returned value will be an array.

type: string or TranslatableMessage or boolean

This option determines whether or not a special "empty" option (e.g. "Choose an option") will appear at the top of a select widget. This option only applies if the multiple option is set to false.

Add an empty value with "Choose an option" as the text:

Guarantee that no "empty" value option is displayed:

If you leave the placeholder option unset, then a blank (with no text) option will automatically be added if and only if the required option is false:

type: array default: []

Use this to add additional HTML attributes to the placeholder choice:

type: array, callable, string or PropertyPath default: []

This option allows you to display certain choices at the top of your list with a visual separator between them and the complete list of options. If you have a form of languages, you can list the most popular on top, like Bork and Pirate:

This options can also be a callback function to give you more flexibility. This might be especially useful if your values are objects:

This will "prefer" the "now" and "tomorrow" choices only:

Finally, if your values are objects, you can also specify a property path string on the object that will return true or false.

The preferred choices are only meaningful when rendering a select element (i.e. expanded false). The preferred choices and normal choices are separated visually by a set of dotted lines (i.e. -------------------). This can be customized when rendering the field:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: boolean default: false

Trimming is disabled by default because the selected value or values must match the given choice values exactly (and they could contain whitespaces).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

The life jacket for your team and your project

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (csharp):
```csharp
// src/Config/TextAlign.php
namespace App\Config;

enum TextAlign: string
{
    case Left = 'Left aligned';
    case Center = 'Center aligned';
    case Right = 'Right aligned';
}
```

Example 3 (javascript):
```javascript
use App\Config\TextAlign;
use Symfony\Component\Form\Extension\Core\Type\EnumType;
// ...

$builder->add('alignment', EnumType::class, ['class' => TextAlign::class]);
```

Example 4 (javascript):
```javascript
// src/Config/TextAlign.php
namespace App\Config;

use Symfony\Contracts\Translation\TranslatableInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

enum TextAlign: string implements TranslatableInterface
{
    case Left = 'Left aligned';
    case Center = 'Center aligned';
    case Right = 'Right aligned';

    public function trans(TranslatorInterface $translator, ?string $locale = null): string
    {
        // Translate enum from name (Left, Center or Right)
        return $translator->trans($this->name, locale: $locale);

        // Translate enum using custom labels
        return match ($this) {
            self::Left  => $translator->trans('text_align.left.label', locale: $locale),
            self::Center => $translator->trans('text_align.center.label', locale: $locale),
            self::Right  => $translator->trans('text_align.right.label', locale: $locale),
        };
    }
}
```

---

## EntityType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/entity.html

**Contents:**
- EntityType Field
- Basic Usage
  - Using a Custom Query for the Entities
  - Using Choices
- Select Tag, Checkboxes or Radio Buttons
- Field Options
  - choice_label
  - class
  - em
  - query_builder

A special ChoiceType field that's designed to load options from a Doctrine entity. For example, if you have a Category entity, you could use this field to display a select field of all, or some, of the Category objects from the database.

The full list of options defined and inherited by this form type is available running this command in your app:

The entity type has just one required option: the entity which should be listed inside the choice field:

This will build a select drop-down containing all of the User objects in the database. To render radio buttons or checkboxes instead, change the multiple and expanded options.

If you want to create a custom query to use when fetching the entities (e.g. you only want to return some entities, or need to order them), use the query_builder option (which must be a QueryBuilder object, a closure returning a QueryBuilder object or null to load all entities):

Using form collections may result in making too many database requests to fetch related entities. This is known as the "N + 1 query problem" and it can be solved by joining related records when querying for Doctrine associations.

If you already have the exact collection of entities that you want to include in the choice element, just pass them via the choices key.

For example, if you have a $group variable (passed into your form perhaps as a form option) and getUsers() returns a collection of User entities, then you can supply the choices option directly:

This field may be rendered as one of several HTML fields, depending on the expanded and multiple options:

type: string, callable or PropertyPath

This is the property that should be used for displaying the entities as text in the HTML element:

If left blank, the entity object will be cast to a string and so must have a __toString() method. You can also pass a callback function for more control:

The method is called for each entity in the list and passed to the function. For more details, see the main choice_label documentation.

When passing a string, the choice_label option is a property path. So you can use anything supported by the PropertyAccess component

For example, if the translations property is actually an associative array of objects, each with a name property, then you could do this:

type: string required

The class of your entity (e.g. App:Category). This can be a fully-qualified class name (e.g. App\Entity\Category) or the short alias name (as shown prior).

type: string | Doctrine\Persistence\ObjectManager default: the default entity manager

If specified, this entity manager will be used to load the choices instead of the default entity manager.

type: Doctrine\ORM\QueryBuilder or a callable default: null

Allows you to create a custom query for your choices. See how to use it for an example.

The value of this option can either be a QueryBuilder object, a callable or null (which will load all entities). When using a callable, you will be passed the EntityRepository of the entity as the only argument and should return a QueryBuilder. Returning null in the Closure will result in loading all entities.

The entity used in the FROM clause of the query_builder option will always be validated against the class which you have specified at the class option. If you return another entity instead of the one used in your FROM clause (for instance if you return an entity from a joined table), it will break validation.

type: callable, string or PropertyPath default: null

Controls the internal field name of the choice. You normally don't care about this, but in some advanced cases, you might. For example, this "name" becomes the index of the choice views in the template and is used as part of the field name attribute.

This can be a callable or a property path. See choice_label for similar usage. By default, the choice key or an incrementing integer may be used (starting at 0).

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

The configured value must be a valid form name. Make sure to only return valid names when using a callable. Valid form names must be composed of letters, digits, underscores, dashes and colons and must not start with a dash or a colon.

In the EntityType, this defaults to the id of the entity, if it can be read. Otherwise, it falls back to using auto-incrementing integers.

type: callable, string or PropertyPath default: null

Returns the string "value" for each choice, which must be unique across all choices. This is used in the value attribute in HTML and submitted in the POST/PUT requests. You don't normally need to worry about this, but it might be handy when processing an API request (since you can configure the value that will be sent in the API request).

This can be a callable or a property path. By default, the choices are used if they can be cast to strings. Otherwise an incrementing integer is used (starting at 0).

If you pass a callable, it will receive one argument: the choice itself. When using the EntityType Field, the argument will be the entity object for each choice or null in a placeholder is used, which you need to handle:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

In the EntityType, this is overridden to use the id by default. When the id is used, Doctrine only queries for the objects for the ids that were actually submitted.

type: array | \Traversable default: null

Instead of allowing the class and query_builder options to fetch the entities to include for you, you can pass the choices option directly. See how to use choices.

type: string default: null

This option is not used in favor of the class option which is required to query the entities.

These options inherit from the ChoiceType:

type: array, callable, string or PropertyPath default: []

Use this to add additional HTML attributes to each choice. This can be an associative array where the keys match the choice keys and the values are the attributes for each choice, a callable or a property path (just like choice_label).

If an array, the keys of the choices array must be used as keys:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: string, boolean or null default: false

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

type: boolean default: false

If set to true, radio buttons or checkboxes will be rendered (depending on the multiple value). If false, a select element will be rendered.

type: string, callable or PropertyPath default: null

You can group the <option> elements of a <select> into <optgroup> by passing a multi-dimensional array to choices. See the Grouping Options section about that.

The group_by option is an alternative way to group choices, which gives you a bit more flexibility.

Take the following example:

This groups the dates that are within 3 days into "Soon" and everything else into a "Later" <optgroup>:

If you return null, the option won't be grouped. You can also pass a string "property path" that will be called to get the group. See the choice_label for details about using a property path.

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: boolean default: false

If true, the user will be able to select multiple options (as opposed to choosing just one option). Depending on the value of the expanded option, this will render either a select tag or checkboxes if true and a select tag or radio buttons if false. The returned value will be a Doctrine's Array Collection.

If you are working with a collection of Doctrine entities, it will be helpful to read the documentation for the CollectionType Field as well. In addition, there is a complete example in the How to Embed a Collection of Forms article.

type: string or TranslatableMessage or boolean

This option determines whether or not a special "empty" option (e.g. "Choose an option") will appear at the top of a select widget. This option only applies if the multiple option is set to false.

Add an empty value with "Choose an option" as the text:

Guarantee that no "empty" value option is displayed:

If you leave the placeholder option unset, then a blank (with no text) option will automatically be added if and only if the required option is false:

type: array default: []

Use this to add additional HTML attributes to the placeholder choice:

type: array or callable default: []

This option allows you to move certain choices to the top of your list with a visual separator between them and the rest of the options. This option expects an array of entity objects:

The preferred choices are only meaningful when rendering a select element (i.e. expanded false). The preferred choices and normal choices are separated visually by a set of dotted lines (i.e. -------------------). This can be customized when rendering the field:

type: string default: messages

In case choice_translation_domain is set to true or null, this configures the exact translation domain that will be used for any labels or options that are rendered for this field.

type: boolean default: false

Trimming is disabled by default because the selected value or values must match the given choice values exactly (and they could contain whitespaces).

These options inherit from the form type:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: boolean default: true

In most cases, if you have an author field, then you expect setAuthor() to be called on the underlying object. In some cases, however, setAuthor() may not be called. Setting by_reference to false ensures that the setter is called in all cases.

To explain this further, here's a simple example:

If by_reference is true, the following takes place behind the scenes when you call submit() (or handleRequest()) on the form:

Notice that setAuthor() is not called. The author is modified by reference.

If you set by_reference to false, submitting looks like this:

So, all that by_reference=false really does is that it clones the object, which enforces the framework to call the setter on the parent object.

Similarly, if you're using the CollectionType field where your underlying collection data is an object (like with Doctrine's ArrayCollection), then by_reference must be set to false if you need the adder and remover (e.g. addAuthor() and removeAuthor()) to be called.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The actual default value of this option depends on other field options:

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

type: array default: []

The content of the label option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The label_translation_parameters option of children fields is merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

type: array default: []

The content of the title and placeholder values defined in the attr option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The attr_translation_parameters option of children fields is merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

type: array default: []

The content of the help option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The help_translation_parameters option of children fields is merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

Check Code Performance in Dev, Test, Staging & Production

Take the exam at home

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use App\Entity\User;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
// ...

$builder->add('users', EntityType::class, [
    // looks for choices from this entity
    'class' => User::class,

    // uses the User.username property as the visible option string
    'choice_label' => 'username',

    // used to render a select box, check boxes or radios
    // 'multiple' => true,
    // 'expanded' => true,
]);
```

Example 3 (javascript):
```javascript
use App\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
// ...

$builder->add('users', EntityType::class, [
    'class' => User::class,
    'query_builder' => function (EntityRepository $er): QueryBuilder {
        return $er->createQueryBuilder('u')
            ->orderBy('u.username', 'ASC');
    },
    'choice_label' => 'username',
]);
```

Example 4 (javascript):
```javascript
use App\Entity\User;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
// ...

$builder->add('users', EntityType::class, [
    'class' => User::class,
    'choices' => $group->getUsers(),
]);
```

---

## LanguageType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/language.html

**Contents:**
- LanguageType Field
- Field Options
  - alpha3
  - choice_self_translation
  - choice_translation_locale
- Overridden Options
  - choices
  - choice_translation_domain
  - invalid_message
- Inherited Options

The LanguageType is a subset of the ChoiceType that allows the user to select from a large list of languages. As an added bonus, the language names are displayed in the language of the user.

The "value" for each language is the Unicode language identifier used in the International Components for Unicode (e.g. fr or zh_Hant).

The locale of your user is guessed using getDefault(), which requires the intl PHP extension to be installed and enabled.

Unlike the ChoiceType, you don't need to specify a choices option as the field type automatically uses a large list of languages. You can specify the option manually, but then you should just use the ChoiceType directly.

The full list of options defined and inherited by this form type is available running this command in your app:

type: boolean default: false

If this option is true, the choice values use the ISO 639-2 alpha-3 (2T) three-letter codes (e.g. French = fra) instead of the default ISO 639-1 alpha-2 two-letter codes (e.g. French = fr).

type: boolean default: false

By default, language names are translated into the current locale of the application. For example, when browsing the application in English, you'll get an array like [..., 'cs' => 'Czech', ..., 'es' => 'Spanish', ..., 'zh' => 'Chinese'] and when browsing it in French, you'll get the following array: [..., 'cs' => 'tchèque', ..., 'es' => 'espagnol', ..., 'zh' => 'chinois'].

If this option is true, each language is translated into its own language, regardless of the current application locale: [..., 'cs' => 'čeština', ..., 'es' => 'español', ..., 'zh' => '中文'].

type: string or null default: null

This option determines if the choice values should be translated into a different locale than the current one.

The values of the choice_translation_locale option can be null (reuse the current translation locale) or a string which represents the exact translation locale to use.

default: Symfony\Component\Intl\Languages::getNames().

The choices option defaults to all languages. The default locale is used to translate the languages names.

If you want to override the built-in choices of the language type, you will also have to set the choice_loader option to null.

type: string, boolean or null default: false

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the ChoiceType:

type: boolean default: true

When using the preferred_choices option, those preferred choices are displayed twice by default: at the top of the list and in the full list below. Set this option to false, to only display preferred choices at the top of the list:

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: boolean default: false

If set to true, radio buttons or checkboxes will be rendered (depending on the multiple value). If false, a select element will be rendered.

type: boolean default: false

If true, the user will be able to select multiple options (as opposed to choosing just one option). Depending on the value of the expanded option, this will render either a select tag or checkboxes if true and a select tag or radio buttons if false. The returned value will be an array.

type: string or TranslatableMessage or boolean

This option determines whether or not a special "empty" option (e.g. "Choose an option") will appear at the top of a select widget. This option only applies if the multiple option is set to false.

Add an empty value with "Choose an option" as the text:

Guarantee that no "empty" value option is displayed:

If you leave the placeholder option unset, then a blank (with no text) option will automatically be added if and only if the required option is false:

type: array default: []

Use this to add additional HTML attributes to the placeholder choice:

type: array, callable, string or PropertyPath default: []

This option allows you to display certain choices at the top of your list with a visual separator between them and the complete list of options. If you have a form of languages, you can list the most popular on top, like Bork and Pirate:

This options can also be a callback function to give you more flexibility. This might be especially useful if your values are objects:

This will "prefer" the "now" and "tomorrow" choices only:

Finally, if your values are objects, you can also specify a property path string on the object that will return true or false.

The preferred choices are only meaningful when rendering a select element (i.e. expanded false). The preferred choices and normal choices are separated visually by a set of dotted lines (i.e. -------------------). This can be customized when rendering the field:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: boolean default: false

Trimming is disabled by default because the selected value or values must match the given choice values exactly (and they could contain whitespaces).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The actual default value of this option depends on other field options:

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Check Code Performance in Dev, Test, Staging & Production

Make sure your project is risk free

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
// ...

$builder->add('language', ChoiceType::class, [
    'choices' => [
        'English' => 'en',
        'Spanish' => 'es',
        'Bork' => 'muppets',
        'Pirate' => 'arr',
    ],
    'preferred_choices' => ['muppets', 'arr'],
    'duplicate_preferred_choices' => false,
]);
```

Example 3 (javascript):
```javascript
public function configureOptions(OptionsResolver $resolver): void
{
    $resolver->setDefaults([
        'error_mapping' => [
            'matchingCityAndZipCode' => 'city',
        ],
    ]);
}
```

Example 4 (javascript):
```javascript
$resolver->setDefaults([
    'error_mapping' => [
        '.' => 'city',
    ],
]);
```

---

## CountryType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/country.html

**Contents:**
- CountryType Field
- Field Options
  - alpha3
  - choice_translation_locale
- Overridden Options
  - choices
  - choice_translation_domain
  - invalid_message
- Inherited Options
  - duplicate_preferred_choices

The CountryType is a subset of the ChoiceType that displays countries of the world. As an added bonus, the country names are displayed in the language of the user.

The "value" for each country is the two-letter country code.

The locale of your user is guessed using getDefault()

Unlike the ChoiceType, you don't need to specify a choices option as the field type automatically uses all of the countries of the world. You can specify the option manually, but then you should just use the ChoiceType directly.

The full list of options defined and inherited by this form type is available running this command in your app:

type: boolean default: false

If this option is true, the choice values use the ISO 3166-1 alpha-3 three-letter codes (e.g. New Zealand = NZL) instead of the default ISO 3166-1 alpha-2 two-letter codes (e.g. New Zealand = NZ).

type: string or null default: null

This option determines if the choice values should be translated into a different locale than the current one.

The values of the choice_translation_locale option can be null (reuse the current translation locale) or a string which represents the exact translation locale to use.

default: Symfony\Component\Intl\Countries::getNames()

The country type defaults the choices option to the whole list of countries. The locale is used to translate the countries names.

If you want to override the built-in choices of the country type, you will also have to set the choice_loader option to null.

type: string, boolean or null default: false

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the ChoiceType:

type: boolean default: true

When using the preferred_choices option, those preferred choices are displayed twice by default: at the top of the list and in the full list below. Set this option to false, to only display preferred choices at the top of the list:

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: boolean default: false

If set to true, radio buttons or checkboxes will be rendered (depending on the multiple value). If false, a select element will be rendered.

type: boolean default: false

If true, the user will be able to select multiple options (as opposed to choosing just one option). Depending on the value of the expanded option, this will render either a select tag or checkboxes if true and a select tag or radio buttons if false. The returned value will be an array.

type: string or TranslatableMessage or boolean

This option determines whether or not a special "empty" option (e.g. "Choose an option") will appear at the top of a select widget. This option only applies if the multiple option is set to false.

Add an empty value with "Choose an option" as the text:

Guarantee that no "empty" value option is displayed:

If you leave the placeholder option unset, then a blank (with no text) option will automatically be added if and only if the required option is false:

type: array default: []

Use this to add additional HTML attributes to the placeholder choice:

type: array, callable, string or PropertyPath default: []

This option allows you to display certain choices at the top of your list with a visual separator between them and the complete list of options. If you have a form of languages, you can list the most popular on top, like Bork and Pirate:

This options can also be a callback function to give you more flexibility. This might be especially useful if your values are objects:

This will "prefer" the "now" and "tomorrow" choices only:

Finally, if your values are objects, you can also specify a property path string on the object that will return true or false.

The preferred choices are only meaningful when rendering a select element (i.e. expanded false). The preferred choices and normal choices are separated visually by a set of dotted lines (i.e. -------------------). This can be customized when rendering the field:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: boolean default: false

Trimming is disabled by default because the selected value or values must match the given choice values exactly (and they could contain whitespaces).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The actual default value of this option depends on other field options:

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Show your Symfony expertise

Put the code quality back at the heart of your project

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
// ...

$builder->add('language', ChoiceType::class, [
    'choices' => [
        'English' => 'en',
        'Spanish' => 'es',
        'Bork' => 'muppets',
        'Pirate' => 'arr',
    ],
    'preferred_choices' => ['muppets', 'arr'],
    'duplicate_preferred_choices' => false,
]);
```

Example 3 (javascript):
```javascript
public function configureOptions(OptionsResolver $resolver): void
{
    $resolver->setDefaults([
        'error_mapping' => [
            'matchingCityAndZipCode' => 'city',
        ],
    ]);
}
```

Example 4 (javascript):
```javascript
$resolver->setDefaults([
    'error_mapping' => [
        '.' => 'city',
    ],
]);
```

---

## TimezoneType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/timezone.html

**Contents:**
- TimezoneType Field
- Field Options
  - input
  - intl
- Overridden Options
  - choices
  - choice_translation_domain
  - invalid_message
- Inherited Options
  - duplicate_preferred_choices

The TimezoneType is a subset of the ChoiceType that allows the user to select from all possible timezones.

The "value" for each timezone is the full timezone name, such as America/Chicago or Europe/Istanbul.

Unlike the ChoiceType, you don't need to specify a choices option as the field type automatically uses a large list of timezones. You can specify the option manually, but then you should just use the ChoiceType directly.

The full list of options defined and inherited by this form type is available running this command in your app:

type: string default: string

The format of the input data - i.e. the format that the timezone is stored on your underlying object. Valid values are:

type: boolean default: false

If this option is set to true, the timezone selector will display the timezones from the ICU Project via the Intl component instead of the regular PHP timezones.

Although both sets of timezones are pretty similar, only the ones from the Intl component can be translated to any language. To do so, set the desired locale with the choice_translation_locale option.

The Timezone constraint can validate both timezone sets and adapts to the selected set automatically.

default: An array of timezones.

The Timezone type defaults the choices to all timezones returned by listIdentifiers(), broken down by continent.

If you want to override the built-in choices of the timezone type, you will also have to set the choice_loader option to null.

type: string, boolean or null default: false

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the ChoiceType:

type: boolean default: true

When using the preferred_choices option, those preferred choices are displayed twice by default: at the top of the list and in the full list below. Set this option to false, to only display preferred choices at the top of the list:

type: boolean default: false

If set to true, radio buttons or checkboxes will be rendered (depending on the multiple value). If false, a select element will be rendered.

type: boolean default: false

If true, the user will be able to select multiple options (as opposed to choosing just one option). Depending on the value of the expanded option, this will render either a select tag or checkboxes if true and a select tag or radio buttons if false. The returned value will be an array.

type: string or TranslatableMessage or boolean

This option determines whether or not a special "empty" option (e.g. "Choose an option") will appear at the top of a select widget. This option only applies if the multiple option is set to false.

Add an empty value with "Choose an option" as the text:

Guarantee that no "empty" value option is displayed:

If you leave the placeholder option unset, then a blank (with no text) option will automatically be added if and only if the required option is false:

type: array default: []

Use this to add additional HTML attributes to the placeholder choice:

type: array, callable, string or PropertyPath default: []

This option allows you to display certain choices at the top of your list with a visual separator between them and the complete list of options. If you have a form of languages, you can list the most popular on top, like Bork and Pirate:

This options can also be a callback function to give you more flexibility. This might be especially useful if your values are objects:

This will "prefer" the "now" and "tomorrow" choices only:

Finally, if your values are objects, you can also specify a property path string on the object that will return true or false.

The preferred choices are only meaningful when rendering a select element (i.e. expanded false). The preferred choices and normal choices are separated visually by a set of dotted lines (i.e. -------------------). This can be customized when rendering the field:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: boolean default: false

Trimming is disabled by default because the selected value or values must match the given choice values exactly (and they could contain whitespaces).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The actual default value of this option depends on other field options:

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Show your Symfony expertise

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
// ...

$builder->add('language', ChoiceType::class, [
    'choices' => [
        'English' => 'en',
        'Spanish' => 'es',
        'Bork' => 'muppets',
        'Pirate' => 'arr',
    ],
    'preferred_choices' => ['muppets', 'arr'],
    'duplicate_preferred_choices' => false,
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
// ...

$builder->add('states', ChoiceType::class, [
    'placeholder' => 'Choose an option',

    // or if you want to translate the text
    'placeholder' => new TranslatableMessage('form.placeholder.select_option', [], 'form'),
]);
```

Example 4 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
// ...

$builder->add('states', ChoiceType::class, [
    'placeholder' => false,
]);
```

---

## DateType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/date.html

**Contents:**
- DateType Field
- Basic Usage
  - Rendering a single HTML5 Text Box
- Field Options
  - days
  - placeholder
  - format
  - html5
  - input
  - input_format

A field that allows the user to modify date information via a variety of different HTML elements.

This field can be rendered in a variety of different ways via the widget option and can understand a number of different input formats via the input option.

The full list of options defined and inherited by this form type is available running this command in your app:

This field type is highly configurable. The most important options are input and widget.

Suppose that you have a publishedAt field whose underlying date is a DateTime object. The following configures the date type for that field as three different choice fields:

If your underlying date is not a DateTime object (e.g. it's a Unix timestamp or a DateTimeImmutable object), configure the input option:

For a better user experience, you may want to render a single text field and use some kind of "date picker" to help your user fill in the right format. To do that, use the single_text widget:

This will render as an input type="date" HTML5 field, which means that some - but not all - browsers will add nice date picker functionality to the field. If you want to be absolutely sure that every user has a consistent date picker, use an external JavaScript library.

For example, suppose you want to use the Bootstrap Datepicker library. First, make the following changes:

Then, add the following JavaScript code in your template to initialize the date picker:

This format key tells the date picker to use the date format that Symfony expects. This can be tricky: if the date picker is misconfigured, Symfony won't understand the format and will throw a validation error. You can also configure the format that Symfony should expect via the format option.

The string used by a JavaScript date picker to describe its format (e.g. yyyy-mm-dd) may not match the string that Symfony uses (e.g. yyyy-MM-dd). This is because different libraries use different formatting rules to describe the date format. Be aware of this - it can be tricky to make the formats truly match!

type: array default: 1 to 31

List of days available to the day field type. This option is only relevant when the widget option is set to choice:

If your widget option is set to choice, then this field will be represented as a series of select boxes. When the placeholder value is a string, it will be used as the blank value of all select boxes:

Alternatively, you can use an array that configures different placeholder values for the year, month and day fields:

type: integer or string default: IntlDateFormatter::MEDIUM (or yyyy-MM-dd if widget is single_text)

Option passed to the IntlDateFormatter class, used to transform user input into the proper format. This is critical when the widget option is set to single_text and will define how the user will input the data. By default, the format is determined based on the current user locale: meaning that the expected format will be different for different users. You can override it by passing the format as a string.

For more information on valid formats, see Date/Time Format Syntax:

If you want your field to be rendered as an HTML5 "date" field, you have to use a single_text widget with the yyyy-MM-dd format (the RFC 3339 format) which is the default value if you use the single_text widget.

type: boolean default: true

If this is set to true (the default), it'll use the HTML5 type (date, time or datetime-local) to render the field. When set to false, it'll use the text type.

This is useful when you want to use a custom JavaScript datepicker, which often requires a text type instead of an HTML5 type.

type: string default: datetime

The format of the input data - i.e. the format that the date is stored on your underlying object. Valid values are:

The value that comes back from the form will also be normalized back into this format.

If timestamp is used, DateType is limited to dates between Fri, 13 Dec 1901 20:45:54 UTC and Tue, 19 Jan 2038 03:14:07 UTC on 32bit systems. This is due to an integer overflow bug in 32bit systems known as the Year 2038 problem.

type: string default: Y-m-d

If the input option is set to string, this option specifies the format of the date. This must be a valid PHP date format.

type: string default: system default timezone

Timezone that the input data is stored in. This must be one of the PHP supported timezones.

type: array default: 1 to 12

List of months available to the month field type. This option is only relevant when the widget option is set to choice.

type: string default: system default timezone

Timezone for how the data should be shown to the user (and therefore also the data that the user submits). This must be one of the PHP supported timezones.

type: integer or \IntlCalendar default: null

The calendar to use for formatting and parsing the date. The value should be an integer from IntlDateFormatter calendar constants or an instance of the IntlCalendar to use. By default, the Gregorian calendar with the application default locale is used.

The calendar option was introduced in Symfony 7.2.

type: string default: single_text

The basic way in which this field should be rendered. Can be one of the following:

type: array default: five years before to five years after the current year

List of years available to the year field type. This option is only relevant when the widget option is set to choice.

The DateTime classes are treated as immutable objects.

type: string, boolean or null default: false

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

type: string default: null

The internal normalized representation of this type is an array, not a \DateTime object. Therefore, the data_class option is initialized to null to avoid the FormType object from initializing it to \DateTime.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: boolean default: false

This option determines if the form will inherit data from its parent form. This can be useful if you have a set of fields that are duplicated across multiple forms. See How to Reduce Code Duplication with "inherit_data".

When a field has the inherit_data option set, it uses the data of the parent form as is. This means that Data Transformers won't be applied to that field.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

Make sure your project is risk free

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\DateType;
// ...

$builder->add('publishedAt', DateType::class, [
    'widget' => 'choice',
]);
```

Example 3 (javascript):
```javascript
$builder->add('publishedAt', DateType::class, [
    'widget' => 'choice',
    'input'  => 'datetime_immutable'
]);
```

Example 4 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\DateType;
// ...

$builder->add('publishedAt', DateType::class, [
    // renders it as a single text box
    'widget' => 'single_text',
]);
```

---

## CurrencyType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/currency.html

**Contents:**
- CurrencyType Field
- Field Options
  - choice_translation_locale
- Overridden Options
  - choices
  - choice_translation_domain
  - invalid_message
- Inherited Options
  - duplicate_preferred_choices
  - error_bubbling

The CurrencyType is a subset of the ChoiceType that allows the user to select from a large list of 3-letter ISO 4217 currencies.

Unlike the ChoiceType, you don't need to specify a choices option as the field type automatically uses a large list of currencies. You can specify the option manually, but then you should just use the ChoiceType directly.

The full list of options defined and inherited by this form type is available running this command in your app:

type: string or null default: null

This option determines if the choice values should be translated into a different locale than the current one.

The values of the choice_translation_locale option can be null (reuse the current translation locale) or a string which represents the exact translation locale to use.

default: Symfony\Component\Intl\Currencies::getNames()

The choices option defaults to all currencies.

If you want to override the built-in choices of the currency type, you will also have to set the choice_loader option to null.

type: string, boolean or null default: false

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the ChoiceType:

type: boolean default: true

When using the preferred_choices option, those preferred choices are displayed twice by default: at the top of the list and in the full list below. Set this option to false, to only display preferred choices at the top of the list:

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: boolean default: false

If set to true, radio buttons or checkboxes will be rendered (depending on the multiple value). If false, a select element will be rendered.

type: boolean default: false

If true, the user will be able to select multiple options (as opposed to choosing just one option). Depending on the value of the expanded option, this will render either a select tag or checkboxes if true and a select tag or radio buttons if false. The returned value will be an array.

type: string or TranslatableMessage or boolean

This option determines whether or not a special "empty" option (e.g. "Choose an option") will appear at the top of a select widget. This option only applies if the multiple option is set to false.

Add an empty value with "Choose an option" as the text:

Guarantee that no "empty" value option is displayed:

If you leave the placeholder option unset, then a blank (with no text) option will automatically be added if and only if the required option is false:

type: array default: []

Use this to add additional HTML attributes to the placeholder choice:

type: array, callable, string or PropertyPath default: []

This option allows you to display certain choices at the top of your list with a visual separator between them and the complete list of options. If you have a form of languages, you can list the most popular on top, like Bork and Pirate:

This options can also be a callback function to give you more flexibility. This might be especially useful if your values are objects:

This will "prefer" the "now" and "tomorrow" choices only:

Finally, if your values are objects, you can also specify a property path string on the object that will return true or false.

The preferred choices are only meaningful when rendering a select element (i.e. expanded false). The preferred choices and normal choices are separated visually by a set of dotted lines (i.e. -------------------). This can be customized when rendering the field:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: boolean default: false

Trimming is disabled by default because the selected value or values must match the given choice values exactly (and they could contain whitespaces).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The actual default value of this option depends on other field options:

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
// ...

$builder->add('language', ChoiceType::class, [
    'choices' => [
        'English' => 'en',
        'Spanish' => 'es',
        'Bork' => 'muppets',
        'Pirate' => 'arr',
    ],
    'preferred_choices' => ['muppets', 'arr'],
    'duplicate_preferred_choices' => false,
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
// ...

$builder->add('states', ChoiceType::class, [
    'placeholder' => 'Choose an option',

    // or if you want to translate the text
    'placeholder' => new TranslatableMessage('form.placeholder.select_option', [], 'form'),
]);
```

Example 4 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
// ...

$builder->add('states', ChoiceType::class, [
    'placeholder' => false,
]);
```

---

## LocaleType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/locale.html

**Contents:**
- LocaleType Field
- Field Options
  - choice_translation_locale
- Overridden Options
  - choices
  - choice_translation_domain
  - invalid_message
- Inherited Options
  - duplicate_preferred_choices
  - error_bubbling

The LocaleType is a subset of the ChoiceType that allows the user to select from a large list of locales (language+country). As an added bonus, the locale names are displayed in the language of the user.

The "value" for each locale is either the two letter ISO 639-1 language code (e.g. fr), or the language code followed by an underscore (_), then the ISO 3166-1 alpha-2 country code (e.g. fr_FR for French/France).

The locale of your user is guessed using getDefault()

Unlike the ChoiceType, you don't need to specify a choices option as the field type automatically uses a large list of locales. You can specify these options manually, but then you should just use the ChoiceType directly.

The full list of options defined and inherited by this form type is available running this command in your app:

type: string or null default: null

This option determines if the choice values should be translated into a different locale than the current one.

The values of the choice_translation_locale option can be null (reuse the current translation locale) or a string which represents the exact translation locale to use.

default: Symfony\Component\Intl\Locales::getNames()

The choices option defaults to all locales. It uses the default locale to specify the language.

If you want to override the built-in choices of the locale type, you will also have to set the choice_loader option to null.

type: string, boolean or null default: false

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the ChoiceType:

type: boolean default: true

When using the preferred_choices option, those preferred choices are displayed twice by default: at the top of the list and in the full list below. Set this option to false, to only display preferred choices at the top of the list:

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: boolean default: false

If set to true, radio buttons or checkboxes will be rendered (depending on the multiple value). If false, a select element will be rendered.

type: boolean default: false

If true, the user will be able to select multiple options (as opposed to choosing just one option). Depending on the value of the expanded option, this will render either a select tag or checkboxes if true and a select tag or radio buttons if false. The returned value will be an array.

type: string or TranslatableMessage or boolean

This option determines whether or not a special "empty" option (e.g. "Choose an option") will appear at the top of a select widget. This option only applies if the multiple option is set to false.

Add an empty value with "Choose an option" as the text:

Guarantee that no "empty" value option is displayed:

If you leave the placeholder option unset, then a blank (with no text) option will automatically be added if and only if the required option is false:

type: array default: []

Use this to add additional HTML attributes to the placeholder choice:

type: array, callable, string or PropertyPath default: []

This option allows you to display certain choices at the top of your list with a visual separator between them and the complete list of options. If you have a form of languages, you can list the most popular on top, like Bork and Pirate:

This options can also be a callback function to give you more flexibility. This might be especially useful if your values are objects:

This will "prefer" the "now" and "tomorrow" choices only:

Finally, if your values are objects, you can also specify a property path string on the object that will return true or false.

The preferred choices are only meaningful when rendering a select element (i.e. expanded false). The preferred choices and normal choices are separated visually by a set of dotted lines (i.e. -------------------). This can be customized when rendering the field:

When defining a custom type, you should use the ChoiceList class helper:

See the "choice_loader" option documentation.

type: boolean default: false

Trimming is disabled by default because the selected value or values must match the given choice values exactly (and they could contain whitespaces).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The actual default value of this option depends on other field options:

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Online exam, become Symfony certified today

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
// ...

$builder->add('language', ChoiceType::class, [
    'choices' => [
        'English' => 'en',
        'Spanish' => 'es',
        'Bork' => 'muppets',
        'Pirate' => 'arr',
    ],
    'preferred_choices' => ['muppets', 'arr'],
    'duplicate_preferred_choices' => false,
]);
```

Example 3 (javascript):
```javascript
public function configureOptions(OptionsResolver $resolver): void
{
    $resolver->setDefaults([
        'error_mapping' => [
            'matchingCityAndZipCode' => 'city',
        ],
    ]);
}
```

Example 4 (javascript):
```javascript
$resolver->setDefaults([
    'error_mapping' => [
        '.' => 'city',
    ],
]);
```

---

## DateTimeType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/datetime.html

**Contents:**
- DateTimeType Field
- Field Options
  - date_format
  - date_label
  - date_widget
  - days
  - placeholder
  - format
  - hours
  - html5

This field type allows the user to modify data that represents a specific date and time (e.g. 1984-06-05 12:15:30).

Can be rendered as a text input or select tags. The underlying format of the data can be a DateTime object, a string, a timestamp or an array.

The full list of options defined and inherited by this form type is available running this command in your app:

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

type: integer or string default: IntlDateFormatter::MEDIUM

Defines the format option that will be passed down to the date field. See the DateType's format option for more details.

type: string | null default: The label is "guessed" from the field name

Sets the label that will be used when rendering the date widget. Setting it to false will suppress the label:

type: string default: single_text

The basic way in which this field should be rendered. Can be one of the following:

type: array default: 1 to 31

List of days available to the day field type. This option is only relevant when the widget option is set to choice:

If your widget option is set to choice, then this field will be represented as a series of select boxes. When the placeholder value is a string, it will be used as the blank value of all select boxes:

Alternatively, you can use an array that configures different placeholder values for the year, month, day, hour, minute and second fields:

type: string default: Symfony\Component\Form\Extension\Core\Type\DateTimeType::HTML5_FORMAT

If the widget option is set to single_text, this option specifies the format of the input, i.e. how Symfony will interpret the given input as a datetime string. It defaults to the datetime local format which is used by the HTML5 datetime-local field. Keeping the default value will cause the field to be rendered as an input field with type="datetime-local". For more information on valid formats, see Date/Time Format Syntax.

type: array default: 0 to 23

List of hours available to the hours field type. This option is only relevant when the widget option is set to choice.

type: boolean default: true

If this is set to true (the default), it'll use the HTML5 type (date, time or datetime-local) to render the field. When set to false, it'll use the text type.

This is useful when you want to use a custom JavaScript datepicker, which often requires a text type instead of an HTML5 type.

type: string default: datetime

The format of the input data - i.e. the format that the date is stored on your underlying object. Valid values are:

The value that comes back from the form will also be normalized back into this format.

If timestamp is used, DateType is limited to dates between Fri, 13 Dec 1901 20:45:54 UTC and Tue, 19 Jan 2038 03:14:07 UTC on 32bit systems. This is due to an integer overflow bug in 32bit systems known as the Year 2038 problem.

type: string default: Y-m-d H:i:s

If the input option is set to string, this option specifies the format of the date. This must be a valid PHP date format.

type: array default: 0 to 59

List of minutes available to the minutes field type. This option is only relevant when the widget option is set to choice.

type: string default: system default timezone

Timezone that the input data is stored in. This must be one of the PHP supported timezones.

type: array default: 1 to 12

List of months available to the month field type. This option is only relevant when the widget option is set to choice.

type: array default: 0 to 59

List of seconds available to the seconds field type. This option is only relevant when the widget option is set to choice.

type: string | null default: The label is "guessed" from the field name

Sets the label that will be used when rendering the time widget. Setting it to false will suppress the label:

type: string default: choice

Defines the widget option for the TimeType.

type: string default: system default timezone

Timezone for how the data should be shown to the user (and therefore also the data that the user submits). This must be one of the PHP supported timezones.

type: string default: null

Defines the widget option for both the DateType and TimeType. This can be overridden with the date_widget and time_widget options.

type: boolean default: true

Whether or not to include minutes in the input. This will result in an additional input to capture minutes.

type: boolean default: false

Whether or not to include seconds in the input. This will result in an additional input to capture seconds.

type: array default: five years before to five years after the current year

List of years available to the year field type. This option is only relevant when the widget option is set to choice.

The DateTime classes are treated as immutable objects.

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

type: string default: null

The internal normalized representation of this type is an array, not a \DateTime object. Therefore, the data_class option is initialized to null to avoid the FormType object from initializing it to \DateTime.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: boolean default: false

This option determines if the form will inherit data from its parent form. This can be useful if you have a set of fields that are duplicated across multiple forms. See How to Reduce Code Duplication with "inherit_data".

When a field has the inherit_data option set, it uses the data of the parent form as is. This means that Data Transformers won't be applied to that field.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

Make sure your project is risk free

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;

$builder->add('startDateTime', DateTimeType::class, [
    'date_label' => 'Starts On',
]);
```

Example 3 (javascript):
```javascript
'days' => range(1,31)
```

Example 4 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;

$builder->add('startDateTime', DateTimeType::class, [
    'placeholder' => 'Select a value',
]);
```

---

## DateIntervalType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/dateinterval.html

**Contents:**
- DateIntervalType Field
- Basic Usage
- Field Options
  - days
  - placeholder
  - hours
  - input
  - labels
  - minutes
  - months

This field allows the user to select an interval of time. For example, if you want to allow the user to choose how often they receive a status email, they could use this field to choose intervals like every "10 minutes" or "3 days".

The field can be rendered in a variety of different ways (see widget) and can be configured to give you a DateInterval object, an ISO 8601 duration string (e.g. P1DT12H) or an array (see input).

The full list of options defined and inherited by this form type is available running this command in your app:

This field type is highly configurable. The most important options are input and widget.

You can configure a lot of different options, including exactly which range options to show (e.g. don't show "months", but do show "days"):

type: array default: 0 to 31

List of days available to the days field type. This option is only relevant when the widget option is set to choice:

type: string or array

If your widget option is set to choice, then this field will be represented as a series of select boxes. The placeholder option can be used to add a "blank" entry to the top of each select box:

Alternatively, you can specify a string to be displayed for the "blank" value:

type: array default: 0 to 24

List of hours available to the hours field type. This option is only relevant when the widget option is set to choice:

type: string default: dateinterval

The format of the input data - i.e. the format that the interval is stored on your underlying object. Valid values are:

The value that comes back from the form will also be normalized back into this format.

type: array default: (see below)

The labels displayed for each of the elements of this type. The default values are null, so they display the "humanized version" of the child names (Invert, Years, etc.):

type: array default: 0 to 60

List of minutes available to the minutes field type. This option is only relevant when the widget option is set to choice:

type: array default: 0 to 12

List of months available to the months field type. This option is only relevant when the widget option is set to choice:

type: array default: 0 to 60

List of seconds available to the seconds field type. This option is only relevant when the widget option is set to choice:

type: array default: 0 to 52

List of weeks available to the weeks field type. This option is only relevant when the widget option is set to choice:

type: string default: choice

The basic way in which this field should be rendered. Can be one of the following:

type: Boolean default: true

Whether or not to include days in the input. This will result in an additional input to capture days.

This can not be used when with_weeks is enabled.

type: Boolean default: false

Whether or not to include hours in the input. This will result in an additional input to capture hours.

type: Boolean default: false

Whether or not to include invert in the input. This will result in an additional checkbox. This can not be used when the widget option is set to single_text.

type: Boolean default: false

Whether or not to include minutes in the input. This will result in an additional input to capture minutes.

type: Boolean default: true

Whether or not to include months in the input. This will result in an additional input to capture months.

type: Boolean default: false

Whether or not to include seconds in the input. This will result in an additional input to capture seconds.

type: Boolean default: false

Whether or not to include weeks in the input. This will result in an additional input to capture weeks.

This can not be used when with_days is enabled.

type: Boolean default: true

Whether or not to include years in the input. This will result in an additional input to capture years.

type: array default: 0 to 100

List of years available to the years field type. This option is only relevant when the widget option is set to choice:

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the form type:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: boolean default: false

This option determines if the form will inherit data from its parent form. This can be useful if you have a set of fields that are duplicated across multiple forms. See How to Reduce Code Duplication with "inherit_data".

When a field has the inherit_data option set, it uses the data of the parent form as is. This means that Data Transformers won't be applied to that field.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Check Code Performance in Dev, Test, Staging & Production

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('remindEvery', DateIntervalType::class, [
    'widget'      => 'integer', // render a text field for each part
    // 'input'    => 'string',  // if you want the field to return a ISO 8601 string back to you

    // customize which text boxes are shown
    'with_years'  => false,
    'with_months' => false,
    'with_days'   => true,
    'with_hours'  => true,
]);
```

Example 3 (javascript):
```javascript
// values displayed to users range from 0 to 30 (both inclusive)
'days' => range(1, 31),

// values displayed to users range from 1 to 31 (both inclusive)
'days' => array_combine(range(1, 31), range(1, 31)),
```

Example 4 (javascript):
```javascript
$builder->add('remindEvery', DateIntervalType::class, [
    'placeholder' => '',
]);
```

---

## BirthdayType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/birthday.html

**Contents:**
- BirthdayType Field
- Overridden Options
  - invalid_message
  - years
- Inherited Options
  - choice_translation_domain
  - days
  - placeholder
  - format
  - input

A DateType field that specializes in handling birth date data.

Can be rendered as a single text box, three text boxes (month, day and year), or three select boxes.

This type is essentially the same as the DateType type, but with a more appropriate default for the years option. The years option defaults to 120 years ago to the current year.

The full list of options defined and inherited by this form type is available running this command in your app:

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

type: array default: 120 years ago to the current year

List of years available to the year field type. This option is only relevant when the widget option is set to choice.

These options inherit from the DateType:

type: string, boolean or null default: false

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

type: array default: 1 to 31

List of days available to the day field type. This option is only relevant when the widget option is set to choice:

If your widget option is set to choice, then this field will be represented as a series of select boxes. When the placeholder value is a string, it will be used as the blank value of all select boxes:

Alternatively, you can use an array that configures different placeholder values for the year, month and day fields:

type: integer or string default: IntlDateFormatter::MEDIUM (or yyyy-MM-dd if widget is single_text)

Option passed to the IntlDateFormatter class, used to transform user input into the proper format. This is critical when the widget option is set to single_text and will define how the user will input the data. By default, the format is determined based on the current user locale: meaning that the expected format will be different for different users. You can override it by passing the format as a string.

For more information on valid formats, see Date/Time Format Syntax:

If you want your field to be rendered as an HTML5 "date" field, you have to use a single_text widget with the yyyy-MM-dd format (the RFC 3339 format) which is the default value if you use the single_text widget.

type: string default: datetime

The format of the input data - i.e. the format that the date is stored on your underlying object. Valid values are:

The value that comes back from the form will also be normalized back into this format.

If timestamp is used, DateType is limited to dates between Fri, 13 Dec 1901 20:45:54 UTC and Tue, 19 Jan 2038 03:14:07 UTC on 32bit systems. This is due to an integer overflow bug in 32bit systems known as the Year 2038 problem.

type: string default: Y-m-d

If the input option is set to string, this option specifies the format of the date. This must be a valid PHP date format.

type: string default: system default timezone

Timezone that the input data is stored in. This must be one of the PHP supported timezones.

type: array default: 1 to 12

List of months available to the month field type. This option is only relevant when the widget option is set to choice.

type: string default: system default timezone

Timezone for how the data should be shown to the user (and therefore also the data that the user submits). This must be one of the PHP supported timezones.

type: string default: single_text

The basic way in which this field should be rendered. Can be one of the following:

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: boolean default: false

This option determines if the form will inherit data from its parent form. This can be useful if you have a set of fields that are duplicated across multiple forms. See How to Reduce Code Duplication with "inherit_data".

When a field has the inherit_data option set, it uses the data of the parent form as is. This means that Data Transformers won't be applied to that field.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Check Code Performance in Dev, Test, Staging & Production

Online exam, become Sylius certified today

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
'days' => range(1,31)
```

Example 3 (javascript):
```javascript
$builder->add('birthdate', BirthdayType::class, [
    'placeholder' => 'Select a value',
]);
```

Example 4 (javascript):
```javascript
$builder->add('birthdate', BirthdayType::class, [
    'placeholder' => [
        'year' => 'Year', 'month' => 'Month', 'day' => 'Day',
    ],
]);
```

---

## TimeType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/time.html

**Contents:**
- TimeType Field
- Basic Usage
- Field Options
  - choice_translation_domain
  - placeholder
  - hours
  - html5
  - input
  - input_format
  - minutes

A field to capture time input.

This can be rendered as a text field, a series of text fields (e.g. hour, minute, second) or a series of select fields. The underlying data can be stored as a DateTime object, a string, a timestamp or an array.

The full list of options defined and inherited by this form type is available running this command in your app:

The most important options are input and widget.

Suppose that you have a startTime field whose underlying time data is a DateTime object. The following configures the TimeType for that field as two different choice fields:

The input option must be changed to match the type of the underlying date data. For example, if the startTime field's data were a unix timestamp, you'd need to set input to timestamp:

The field also supports an array and string as valid input option values.

type: string, boolean or null default: false

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

If your widget option is set to choice, then this field will be represented as a series of select boxes. When the placeholder value is a string, it will be used as the blank value of all select boxes:

Alternatively, you can use an array that configures different placeholder values for the hour, minute and second fields:

See the with_seconds option on how to enable seconds in the form type.

type: array default: 0 to 23

List of hours available to the hours field type. This option is only relevant when the widget option is set to choice.

type: boolean default: true

If this is set to true (the default), it'll use the HTML5 type (date, time or datetime-local) to render the field. When set to false, it'll use the text type.

This is useful when you want to use a custom JavaScript datepicker, which often requires a text type instead of an HTML5 type.

type: string default: datetime

The format of the input data - i.e. the format that the date is stored on your underlying object. Valid values are:

The value that comes back from the form will also be normalized back into this format.

type: string default: H:i:s

If the input option is set to string, this option specifies the format of the time. This must be a valid PHP time format.

type: array default: 0 to 59

List of minutes available to the minutes field type. This option is only relevant when the widget option is set to choice.

type: string default: system default timezone

Timezone that the input data is stored in. This must be one of the PHP supported timezones.

When using different values for model_timezone and view_timezone, a reference_date must be configured.

type: DateTimeInterface default: null

Configuring a reference date is required when the model_timezone and view_timezone are different. Timezone conversions will be calculated based on this date.

type: array default: 0 to 59

List of seconds available to the seconds field type. This option is only relevant when the widget option is set to choice.

type: string default: system default timezone

Timezone for how the data should be shown to the user (and therefore also the data that the user submits). This must be one of the PHP supported timezones.

When no reference_date is set the view_timezone defaults to the configured model_timezone.

When using different values for model_timezone and view_timezone, a reference_date must be configured.

type: string default: choice

The basic way in which this field should be rendered. Can be one of the following:

Combining the widget type single_text and the with_minutes option set to false can cause unexpected behavior in the client as the input type time might not support selecting an hour only.

type: boolean default: true

Whether or not to include minutes in the input. This will result in an additional input to capture minutes.

type: boolean default: false

Whether or not to include seconds in the input. This will result in an additional input to capture seconds.

The DateTime classes are treated as immutable objects.

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

type: string default: null

The internal normalized representation of this type is an array, not a \DateTime object. Therefore, the data_class option is initialized to null to avoid the FormType object from initializing it to \DateTime.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: boolean default: false

This option determines if the form will inherit data from its parent form. This can be useful if you have a set of fields that are duplicated across multiple forms. See How to Reduce Code Duplication with "inherit_data".

When a field has the inherit_data option set, it uses the data of the parent form as is. This means that Data Transformers won't be applied to that field.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Get your Symfony expertise recognized

Make sure your project is risk free

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\TimeType;
// ...

$builder->add('startTime', TimeType::class, [
    'input'  => 'datetime',
    'widget' => 'choice',
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\TimeType;
// ...

$builder->add('startTime', TimeType::class, [
    'input'  => 'timestamp',
    'widget' => 'choice',
]);
```

Example 4 (javascript):
```javascript
$builder->add('startTime', TimeType::class, [
    'placeholder' => 'Select a value',
]);
```

---

## CheckboxType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/checkbox.html

**Contents:**
- CheckboxType Field
- Example Usage
- Field Options
  - false_values
  - value
- Overridden Options
  - compound
  - empty_data
  - invalid_message
- Inherited Options

Creates a single input checkbox. This should always be used for a field that has a boolean value: if the box is checked, the field will be set to true, if the box is unchecked, the value will be set to false. Optionally you can specify an array of values that, if submitted, will be evaluated to "false" as well (this differs from what HTTP defines, but can be handy if you want to handle submitted values like "0" or "false").

The full list of options defined and inherited by this form type is available running this command in your app:

type: array default: [null]

An array of values to be interpreted as false.

type: mixed default: 1

The value that's actually used as the value for the checkbox or radio button. This does not affect the value that's set on your object.

To make a checkbox or radio button checked by default, use the data option.

type: boolean default: false

This option specifies if a form is compound. As it's not the case for checkbox, by default, the value is overridden with the false value.

type: string default: mixed

This option determines what value the field will return when the placeholder choice is selected. In the checkbox and the radio type, the value of empty_data is overridden by the value returned by the data transformer (see How to Use Data Transformers).

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Take the exam at home

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
// ...

$builder->add('public', CheckboxType::class, [
    'label'    => 'Show this entry publicly?',
    'required' => false,
]);
```

Example 3 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 4 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

---

## WeekType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/week.html

**Contents:**
- WeekType Field
- Field Options
  - placeholder
  - html5
  - input
  - widget
  - years
  - weeks
- Overridden Options
  - compound

This field type allows the user to modify data that represents a specific ISO 8601 week number (e.g. 1984-W05).

Can be rendered as a text input or select tags. The underlying format of the data can be a string or an array.

The full list of options defined and inherited by this form type is available running this command in your app:

This option determines if the choice values should be translated and in which translation domain.

The values of the choice_translation_domain option can be true (reuse the current translation domain), false (disable translation), null (uses the parent translation domain or the default domain) or a string which represents the exact translation domain to use.

If your widget option is set to choice, then this field will be represented as a series of select boxes. When the placeholder value is a string, it will be used as the blank value of all select boxes:

Alternatively, you can use an array that configures different placeholder values for the year and week fields:

type: boolean default: true

If this is set to true (the default), it'll use the HTML5 type (date, time or datetime-local) to render the field. When set to false, it'll use the text type.

This is useful when you want to use a custom JavaScript datepicker, which often requires a text type instead of an HTML5 type.

type: string default: array

The format of the input data - i.e. the format that the date is stored on your underlying object. Valid values are:

The value that comes back from the form will also be normalized back into this format.

type: string default: choice

The basic way in which this field should be rendered. Can be one of the following:

type: array default: ten years before to ten years after the current year

List of years available to the year field type. This option is only relevant when the widget option is set to choice.

type: array default: 1 to 53

List of weeks available to the week field type. This option is only relevant when the widget option is set to choice.

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

The actual default value of this option depends on other field options:

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: boolean default: false

This option determines if the form will inherit data from its parent form. This can be useful if you have a set of fields that are duplicated across multiple forms. See How to Reduce Code Duplication with "inherit_data".

When a field has the inherit_data option set, it uses the data of the parent form as is. This means that Data Transformers won't be applied to that field.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Symfony Code Performance Profiling

Put the code quality back at the heart of your project

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\WeekType;

$builder->add('startWeek', WeekType::class, [
    'placeholder' => 'Select a value',
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\WeekType;

$builder->add('startDateTime', WeekType::class, [
    'placeholder' => [
        'year' => 'Year',
        'week' => 'Week',
    ],
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## FileType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/file.html

**Contents:**
- FileType Field
- Basic Usage
- Field Options
  - multiple
- Overridden Options
  - compound
  - data_class
  - empty_data
- Overridden Options
  - invalid_message

The FileType represents a file input in your form.

The full list of options defined and inherited by this form type is available running this command in your app:

Say you have this form definition:

When the form is submitted, the attachment field will be an instance of UploadedFile. It can be used to move the attachment file to a permanent location:

The move() method takes a directory and a file name as its arguments. You might calculate the filename in one of the following ways:

Using the original name via getClientOriginalName() or getClientOriginalPath is not safe as it could have been manipulated by the end-user. Moreover, it can contain characters that are not allowed in file names. You should sanitize the value before using it directly.

Read How to Upload Files for an example of how to manage a file upload associated with a Doctrine entity.

type: Boolean default: false

When set to true, the user will be able to upload multiple files at the same time.

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

type: string default: File

This option sets the appropriate file-related data mapper to be used by the type.

type: mixed default: null

This option determines what value the field will return when the submitted value is empty.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Check Code Performance in Dev, Test, Staging & Production

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (unknown):
```unknown
use Symfony\Component\Form\Extension\Core\Type\FileType;
// ...

$builder->add('attachment', FileType::class);
```

Example 3 (unknown):
```unknown
use Symfony\Component\HttpFoundation\File\UploadedFile;

public function upload(): Response
{
    // ...

    if ($form->isSubmitted() && $form->isValid()) {
        $someNewFilename = ...

        $file = $form['attachment']->getData();
        $file->move($directory, $someNewFilename);

        // ...
    }

    // ...
}
```

Example 4 (unknown):
```unknown
// use the original file name
$file->move($directory, $file->getClientOriginalName());

// when "webkitdirectory" upload was used
// otherwise the value will be the same as getClientOriginalName
// $file->move($directory, $file->getClientOriginalPath());

// compute a random name and try to guess the extension (more secure)
$extension = $file->guessExtension();
if (!$extension) {
    // extension cannot be guessed
    $extension = 'bin';
}
$file->move($directory, rand(1, 99999).'.'.$extension);
```

---

## RadioType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/radio.html

**Contents:**
- RadioType Field
- Overridden Options
  - invalid_message
- Inherited Options
  - value
  - attr
  - data
  - disabled
  - empty_data
  - error_bubbling

Creates a single radio button. If the radio button is selected, the field will be set to the specified value. Radio buttons cannot be unchecked - the value only changes when another radio button with the same name gets checked.

The RadioType isn't usually used directly. More commonly it's used internally by other types such as ChoiceType. If you want to have a boolean field, use CheckboxType.

The full list of options defined and inherited by this form type is available running this command in your app:

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the CheckboxType:

type: mixed default: 1

The value that's actually used as the value for the checkbox or radio button. This does not affect the value that's set on your object.

To make a checkbox or radio button checked by default, use the data option.

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

type: string default: mixed

This option determines what value the field will return when the placeholder choice is selected. In the checkbox and the radio type, the value of empty_data is overridden by the value returned by the data transformer (see How to Use Data Transformers).

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Become certified from home

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
public function configureOptions(OptionsResolver $resolver): void
{
    $resolver->setDefaults([
        'error_mapping' => [
            'matchingCityAndZipCode' => 'city',
        ],
    ]);
}
```

---

## UuidType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/uuid.html

**Contents:**
- UuidType Field
- Overridden Options
  - compound
  - invalid_message
- Inherited Options
  - attr
  - data
  - disabled
  - empty_data
  - error_bubbling

Renders an input text field with the UUID string value and transforms it back to a proper Uuid object when submitting the form.

The full list of options defined and inherited by this form type is available running this command in your app:

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Online Sylius certification, take it now!

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## UlidType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/ulid.html

**Contents:**
- UlidType Field
- Overridden Options
  - compound
  - invalid_message
- Inherited Options
  - attr
  - data
  - disabled
  - empty_data
  - error_bubbling

Renders an input text field with the ULID string value and transforms it back to a proper Ulid object when submitting the form.

The full list of options defined and inherited by this form type is available running this command in your app:

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: boolean default: false

If you don't want a user to modify the value of a field, you can set the disabled option to true. Any submitted value will be ignored.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: false unless the form is compound

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Symfony Code Performance Profiling

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## CollectionType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/collection.html

**Contents:**
- CollectionType Field
- Basic Usage
- Field Options
  - allow_add
  - allow_delete
  - delete_empty
  - entry_options
  - prototype_options
  - entry_type
  - keep_as_list

This field type is used to render a "collection" of some field or form. In the easiest sense, it could be an array of TextType fields that populate an array emails values. In more complex examples, you can embed entire forms, which is useful when creating forms that expose one-to-many relationships (e.g. a product from where you can manage many related product photos).

When rendered, existing collection entries are indexed by the keys of the array that is passed as the collection type field data.

The full list of options defined and inherited by this form type is available running this command in your app:

If you are working with a collection of Doctrine entities, pay special attention to the allow_add, allow_delete and by_reference options. You can also see a complete example in the How to Embed a Collection of Forms article.

This type is used when you want to manage a collection of similar items in a form. For example, suppose you have an emails field that corresponds to an array of email addresses. In the form, you want to expose each email address as its own input text box:

The simplest way to render this is all at once:

A much more flexible method would look like this:

In both cases, no input fields would render unless your emails data array already contained some emails.

In this simple example, it's still impossible to add new addresses or remove existing addresses. Adding new addresses is possible by using the allow_add option (and optionally the prototype option) (see example below). Removing emails from the emails array is possible with the allow_delete option.

type: boolean default: false

If set to true, then if unrecognized items are submitted to the collection, they will be added as new items. The ending array will contain the existing items as well as the new item that was in the submitted data. See the above example for more details.

The prototype option can be used to help render a prototype item that can be used - with JavaScript - to create new form items dynamically on the client side. For more information, see the above example and How to Embed a Collection of Forms.

If you're embedding entire other forms to reflect a one-to-many database relationship, you may need to manually ensure that the foreign key of these new objects is set correctly. If you're using Doctrine, this won't happen automatically. See the above link for more details.

type: boolean default: false

If set to true, then if an existing item is not contained in the submitted data, it will be correctly absent from the final array of items. This means that you can implement a "delete" button via JavaScript which removes a form element from the DOM. When the user submits the form, its absence from the submitted data will mean that it's removed from the final array.

For more information, see How to Embed a Collection of Forms.

Be careful when using this option when you're embedding a collection of objects. In this case, if any embedded forms are removed, they will correctly be missing from the final array of objects. However, depending on your application logic, when one of those objects is removed, you may want to delete it or at least remove its foreign key reference to the main object. None of this is handled automatically. For more information, see How to Embed a Collection of Forms.

type: Boolean or callable default: false

If you want to explicitly remove entirely empty collection entries from your form you have to set this option to true. However, existing collection entries will only be deleted if you have the allow_delete option enabled. Otherwise the empty values will be kept.

The delete_empty option only removes items when the normalized value is null. If the nested entry_type is a compound form type, you must either set the required option to false or set the empty_data option to null. Both of these options can be set inside entry_options. Read about the form's empty_data option to learn why this is necessary.

A value is deleted from the collection only if the normalized value is null. However, you can also set the option value to a callable, which will be executed for each value in the submitted collection. If the callable returns true, the value is removed from the collection. For example:

Using a callable is particularly useful in case of compound form types, which may define complex conditions for considering them empty.

type: array default: []

This is the array that's passed to the form type specified in the entry_type option. For example, if you used the ChoiceType as your entry_type option (e.g. for a collection of drop-down menus), then you'd need to at least pass the choices option to the underlying type:

type: array default: []

This is the array that's passed to the form type specified in the entry_type option when creating its prototype. It allows to have different options depending on whether you are adding a new entry or editing an existing entry:

type: string default: Symfony\Component\Form\Extension\Core\Type\TextType

This is the field type for each item in this collection (e.g. TextType, ChoiceType, etc). For example, if you have an array of email addresses, you'd use the EmailType. If you want to embed a collection of some other form, pass the form type class as this option (e.g. MyFormType::class).

type: boolean default: false

When set to true, the keep_as_list option affects the reindexing of nested form names within a collection. This feature is particularly useful when working with collection types and removing items from the collection during form submission.

When this option is set to false, if you have a collection of 3 items and you remove the second item, the indexes will be 0 and 2 when validating the collection. However, by enabling the keep_as_list option and setting it to true, the indexes will be reindexed as 0 and 1. This ensures that the indexes remain consecutive and do not have gaps, providing a clearer and more predictable structure for your nested forms.

The keep_as_list option was introduced in Symfony 7.1.

type: boolean default: true

This option is useful when using the allow_add option. If true (and if allow_add is also true), a special "prototype" attribute will be available so that you can render a "template" example on your page of what a new element should look like. The name attribute given to this element is __name__. This allows you to add a "add another" button via JavaScript which reads the prototype, replaces __name__ with some unique name or number and render it inside your form. When submitted, it will be added to your underlying array due to the allow_add option.

The prototype field can be rendered via the prototype variable in the collection field:

Note that all you really need is the "widget", but depending on how you're rendering your form, having the entire "form row" may be easier for you.

If you're rendering the entire collection field at once, then the prototype form row is automatically available on the data-prototype attribute of the element (e.g. div or table) that surrounds your collection.

For details on how to actually use this option, see the above example as well as How to Embed a Collection of Forms.

type: mixed default: null

Allows you to define specific data for the prototype. Each new row added will initially contain the data set by this option. By default, the data configured for all entries with the entry_options option will be used:

type: string default: __name__

If you have several collections in your form, or worse, nested collections you may want to change the placeholder so that unrelated placeholders are not replaced with the same value.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType. Not all options are listed here - only the most applicable to this type:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: boolean default: true

In most cases, if you have an author field, then you expect setAuthor() to be called on the underlying object. In some cases, however, setAuthor() may not be called. Setting by_reference to false ensures that the setter is called in all cases.

To explain this further, here's a simple example:

If by_reference is true, the following takes place behind the scenes when you call submit() (or handleRequest()) on the form:

Notice that setAuthor() is not called. The author is modified by reference.

If you set by_reference to false, submitting looks like this:

So, all that by_reference=false really does is that it clones the object, which enforces the framework to call the setter on the parent object.

Similarly, if you're using the CollectionType field where your underlying collection data is an object (like with Doctrine's ArrayCollection), then by_reference must be set to false if you need the adder and remover (e.g. addAuthor() and removeAuthor()) to be called.

The default value is [] (empty array).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: boolean default: true

If true, any errors for this field will be passed to the parent field or form. For example, if set to true on a normal field, any errors for that field will be attached to the main form, not to the specific field.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be used when rendering the field. Setting to false will suppress the label:

The label can also be set in the template:

type: array default: []

Sets the HTML attributes for the <label> element, which will be used when rendering the label for the field. It's an associative array with HTML attribute as a key. This attributes can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: boolean default: true

If true, an HTML5 required attribute will be rendered. The corresponding label will also render with a required class.

This is superficial and independent of validation. At best, if you let Symfony guess your field type, then the value of this option will be guessed from your validation information.

The required option also affects how empty data for each field is handled. For more details, see the empty_data option.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Measure & Improve Symfony Code Performance

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
// ...

$builder->add('emails', CollectionType::class, [
    // each entry in the array will be an "email" field
    'entry_type' => EmailType::class,
    // these options are passed to each "email" type
    'entry_options' => [
        'attr' => ['class' => 'email-box'],
    ],
]);
```

Example 3 (unknown):
```unknown
{{ form_row(form.emails) }}
```

Example 4 (unknown):
```unknown
{{ form_label(form.emails) }}
{{ form_errors(form.emails) }}

<ul>
{% for emailField in form.emails %}
    <li>
        {{ form_errors(emailField) }}
        {{ form_widget(emailField) }}
    </li>
{% endfor %}
</ul>
```

---

## RepeatedType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/repeated.html

**Contents:**
- RepeatedType Field
- Example Usage
  - Rendering
  - Validation
- Field Options
  - first_name
  - first_options
  - options
  - second_name
  - second_options

This is a special field "group", that creates two identical fields whose values must match (or a validation error is thrown). The most common use is when you need the user to repeat their password or email to verify accuracy.

The full list of options defined and inherited by this form type is available running this command in your app:

Upon a successful form submit, the value entered into both of the "password" fields becomes the data of the password key. In other words, even though two fields are actually rendered, the end data from the form is just the single value (usually a string) that you need.

The most important option is type, which can be any field type and determines the actual type of the two underlying fields. The options option is passed to each of those individual fields, meaning - in this example - any option supported by the PasswordType can be passed in this array.

The repeated field type is actually two underlying fields, which you can render all at once, or individually. To render all at once, use something like:

To render each field individually, use something like this:

The names first and second are the default names for the two sub-fields. However, these names can be controlled via the first_name and second_name options. If you've set these options, then use those values instead of first and second when rendering.

One of the key features of the repeated field is internal validation (you don't need to do anything to set this up) that forces the two fields to have a matching value. If the two fields don't match, an error will be shown to the user.

The invalid_message is used to customize the error that will be displayed when the two fields do not match each other.

The mapped option is always true for both fields in order for the type to work properly.

type: string default: first

This is the actual field name to be used for the first field. This is mostly meaningless, however, as the actual data entered into both of the fields will be available under the key assigned to the RepeatedType field itself (e.g. password). However, if you don't specify a label, this field name is used to "guess" the label for you.

type: array default: []

Additional options (will be merged into options below) that should be passed only to the first field. This is especially useful for customizing the label:

type: array default: []

This options array will be passed to each of the two underlying fields. In other words, these are the options that customize the individual field types. For example, if the type option is set to password, this array might contain the options always_empty or required - both options that are supported by the PasswordType field.

type: string default: second

The same as first_name, but for the second field.

type: array default: []

Additional options (will be merged into options above) that should be passed only to the second field. This is especially useful for customizing the label (see first_options).

type: string default: Symfony\Component\Form\Extension\Core\Type\TextType

The two underlying fields will be of this field type. For example, passing PasswordType::class will render two password fields.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: string or TranslatableInterface default: null

Allows you to define a help message for the form field, which by default is rendered below the field:

type: array default: []

Sets the HTML attributes for the element used to display the help message of the form field. Its value is an associative array with HTML attribute names as keys. These attributes can also be set in the template:

type: boolean default: false

By default, the contents of the help option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the help contains HTML elements.

type: array default: []

When setting the invalid_message option, you may need to include some variables in the string. This can be done by adding placeholders to that option and including the variables in this option:

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
// ...

$builder->add('password', RepeatedType::class, [
    'type' => PasswordType::class,
    'invalid_message' => 'The password fields must match.',
    'options' => ['attr' => ['class' => 'password-field']],
    'required' => true,
    'first_options'  => ['label' => 'Password'],
    'second_options' => ['label' => 'Repeat Password'],
]);
```

Example 3 (unknown):
```unknown
{{ form_row(form.password) }}
```

Example 4 (unknown):
```unknown
{# .first and .second may vary in your use - see the note below #}
{{ form_row(form.password.first) }}
{{ form_row(form.password.second) }}
```

---

## SubmitType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/submit.html

**Contents:**
- SubmitType Field
- Options
  - validate
- Inherited Options
  - attr
  - disabled
  - label
  - label_format
  - translation_domain
  - label_translation_parameters

The full list of options defined and inherited by this form type is available running this command in your app:

The Submit button has an additional method isClicked() that lets you check whether this button was used to submit the form. This is especially useful when a form has multiple submit buttons:

type: boolean default: true

Set this option to false to disable the client-side validation of the form performed by the browser.

type: array default: []

If you want to add extra attributes to the HTML representation of the button, you can use attr option. It's an associative array with HTML attribute as a key. This can be useful when you need to set a custom class for the button:

type: boolean default: false

If you don't want a user to be able to click a button, you can set the disabled option to true. It will not be possible to submit the form with this button, not even when bypassing the browser and sending a request manually, for example with cURL.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be displayed on the button. The label can also be directly set inside the template:

type: string default: null

Configures the string used as the label of the field, in case the label option was not set. This is useful when using keyword translation messages.

If you're using keyword translation messages as labels, you often end up having multiple keyword messages for the same label (e.g. profile_address_street, invoice_address_street). This is because the label is built for each "path" to a field. To avoid duplicated keyword messages, you can configure the label format to a static value, like:

This option is inherited by the child types. With the code above, the label of the street field of both forms will use the form.address.street keyword message.

Two variables are available in the label format:

The default value (null) results in a "humanized" version of the field name.

The label_format option is evaluated in the form theme. Make sure to update your templates in case you customized form theming.

type: string default: messages

This is the translation domain that will be used for any labels or options that are rendered for this button.

type: array default: []

The content of the label option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The label_translation_parameters option of buttons is merged with the same option of its parents, so buttons can reuse and/or override any of the parent placeholders.

type: array default: []

The content of the title and placeholder values defined in the attr option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The attr_translation_parameters option of children fields is merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

type: array default: null

When your form contains multiple submit buttons, you can change the validation group based on the clicked button. Read the article about using validation groups in Symfony forms.

Symfony Code Performance Profiling

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (unknown):
```unknown
if ($form->get('save')->isClicked()) {
    // ...
}
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
// ...

$builder->add('save', SubmitType::class, [
    'attr' => ['class' => 'save'],
]);
```

Example 4 (unknown):
```unknown
{{ form_widget(form.save, { 'label': 'Click me' }) }}
```

---

## ResetType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/reset.html

**Contents:**
- ResetType Field
- Inherited Options
  - attr
  - disabled
  - label
  - translation_domain
  - label_translation_parameters
  - attr_translation_parameters
  - row_attr

A button that resets all fields to their original values.

The full list of options defined and inherited by this form type is available running this command in your app:

type: array default: []

If you want to add extra attributes to the HTML representation of the button, you can use attr option. It's an associative array with HTML attribute as a key. This can be useful when you need to set a custom class for the button:

type: boolean default: false

If you don't want a user to be able to click a button, you can set the disabled option to true. It will not be possible to submit the form with this button, not even when bypassing the browser and sending a request manually, for example with cURL.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be displayed on the button. The label can also be directly set inside the template:

type: string default: messages

This is the translation domain that will be used for any labels or options that are rendered for this button.

type: array default: []

The content of the label option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The label_translation_parameters option of buttons is merged with the same option of its parents, so buttons can reuse and/or override any of the parent placeholders.

type: array default: []

The content of the title and placeholder values defined in the attr option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The attr_translation_parameters option of children fields is merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Code consumes server resources. Blackfire tells you how

Save your teams and projects before they sink

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ResetType;
// ...

$builder->add('save', ResetType::class, [
    'attr' => ['class' => 'save'],
]);
```

Example 3 (unknown):
```unknown
{{ form_widget(form.save, { 'label': 'Click me' }) }}
```

Example 4 (javascript):
```javascript
<?= $view['form']->widget($form['save'], ['label' => 'Click me']) ?>
```

---

## ButtonType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/button.html

**Contents:**
- ButtonType Field
- Inherited Options
  - attr
  - disabled
  - label
  - label_html
  - translation_domain
  - label_translation_parameters
  - attr_translation_parameters
  - row_attr

A simple, non-responsive button.

The full list of options defined and inherited by this form type is available running this command in your app:

The following options are defined in the BaseType class. The BaseType class is the parent class for both the button type and the FormType, but it is not part of the form type tree (i.e. it cannot be used as a form type on its own).

type: array default: []

If you want to add extra attributes to the HTML representation of the button, you can use attr option. It's an associative array with HTML attribute as a key. This can be useful when you need to set a custom class for the button:

type: boolean default: false

If you don't want a user to be able to click a button, you can set the disabled option to true. It will not be possible to submit the form with this button, not even when bypassing the browser and sending a request manually, for example with cURL.

type: string or TranslatableMessage default: The label is "guessed" from the field name

Sets the label that will be displayed on the button. The label can also be directly set inside the template:

type: boolean default: false

By default, the contents of the label option are escaped before rendering them in the template. Set this option to true to not escape them, which is useful when the label contains HTML elements.

type: string default: messages

This is the translation domain that will be used for any labels or options that are rendered for this button.

type: array default: []

The content of the label option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The label_translation_parameters option of buttons is merged with the same option of its parents, so buttons can reuse and/or override any of the parent placeholders.

type: array default: []

The content of the title and placeholder values defined in the attr option is translated before displaying it, so it can contain translation placeholders. This option defines the values used to replace those placeholders.

Given this translation message:

You can specify the placeholder values as follows:

The attr_translation_parameters option of children fields is merged with the same option of their parents, so children can reuse and/or override any of the parent placeholders.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\ButtonType;
// ...

$builder->add('save', ButtonType::class, [
    'attr' => ['class' => 'save'],
]);
```

Example 3 (unknown):
```unknown
{{ form_widget(form.save, { 'label': 'Click me' }) }}
```

Example 4 (javascript):
```javascript
<?= $view['form']->widget($form['save'], ['label' => 'Click me']) ?>
```

---

## HiddenType Field

**URL:** https://symfony.com/doc/7.3/reference/forms/types/hidden.html

**Contents:**
- HiddenType Field
- Overridden Options
  - compound
  - error_bubbling
  - invalid_message
  - required
- Inherited Options
  - attr
  - data
  - empty_data

The hidden type represents a hidden input field.

The full list of options defined and inherited by this form type is available running this command in your app:

type: boolean default: false

This option specifies whether the type contains child types or not. This option is managed internally for built-in types, so there is no need to configure it explicitly.

Pass errors to the root form, otherwise they will not be visible.

type: string default: This value is not valid

This is the validation error message that's used if the data entered into this field doesn't make sense (i.e. fails validation).

This might happen, for example, if the user enters a nonsense string into a TimeType field that cannot be converted into a real time or if the user enters a string (e.g. apple) into a number field.

Normal (business logic) validation (such as when setting a minimum length for a field) should be set using validation messages with your validation rules (reference).

Hidden fields cannot have a required attribute.

These options inherit from the FormType:

type: array default: []

If you want to add extra attributes to an HTML field representation you can use the attr option. It's an associative array with HTML attributes as keys. This can be useful when you need to set a custom class for some widget:

Use the row_attr option if you want to add these attributes to the form type row element.

type: mixed default: Defaults to field of the underlying structure.

When you create a form, each field initially displays the value of the corresponding property of the form's domain data (e.g. if you bind an object to the form). If you want to override this initial value for the form or an individual field, you can set it in the data option:

The data option always overrides the value taken from the domain data (object) when rendering. This means the object value is also overridden when the form edits an already persisted object, causing it to lose its persisted value when the form is submitted.

The default value is '' (the empty string).

This option determines what value the field will return when the submitted value is empty (or missing). It does not set an initial value if none is provided when the form is rendered in a view.

This means it helps you handling form submission with blank fields. For example, if you want the name field to be explicitly set to John Doe when no value is selected, you can do it like this:

This will still render an empty text box, but upon submission the John Doe value will be set. Use the data option or the placeholder key of the attr option to show this initial value in the rendered form.

If a form is compound, you can set empty_data as an array, object or closure. This option can be set for your entire form class, see the How to Configure empty Data for a Form Class article for more details about these options.

Form data transformers will still be applied to the empty_data value. This means that an empty string will be cast to null. Use a custom data transformer if you explicitly want to return the empty string.

type: array default: []

This option allows you to modify the target of a validation error.

Imagine you have a custom method named matchingCityAndZipCode() that validates whether the city and zip code match. Unfortunately, there is no matchingCityAndZipCode field in your form, so all that Symfony can do is display the error on top of the form.

With customized error mapping, you can do better: map the error to the city field so that it displays above it:

Here are the rules for the left and the right side of the mapping:

By default, errors for any property that is not mapped will bubble up to the parent form. You can use the dot (.) on the left side to map errors of all unmapped properties to a particular field. For instance, to map all these errors to the city field, use:

type: boolean default: true

If you wish the field to be ignored when reading or writing to the object, you can set the mapped option to false.

type: PropertyPathInterface|string|null default: null

By default (when the value of this option is null) form fields read from and write to the properties with the same names in the form's domain object. The property_path option lets you define which property a field reads from and writes to. The value of this option can be any valid PropertyAccess syntax.

type: array default: []

An associative array of the HTML attributes added to the element which is used to render the form type row:

Use the attr option if you want to add these attributes to the form type widget element.

Show your Sylius expertise

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (unknown):
```unknown
# replace 'FooType' by the class name of your form type
$ php bin/console debug:form FooType
```

Example 2 (javascript):
```javascript
$builder->add('body', TextareaType::class, [
    'attr' => ['class' => 'tinymce'],
]);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
// ...

$builder->add('token', HiddenType::class, [
    'data' => 'abcdef',
]);
```

Example 4 (javascript):
```javascript
$builder->add('name', null, [
    'required'   => false,
    'empty_data' => 'John Doe',
]);
```

---

## Adapters For Interoperability between PSR-6 and PSR-16 Cache

**URL:** https://symfony.com/doc/7.3/components/cache/psr6_psr16_adapters.html

**Contents:**
- Adapters For Interoperability between PSR-6 and PSR-16 Cache
- Using a PSR-16 Cache Object as a PSR-6 Cache
- Using a PSR-6 Cache Object as a PSR-16 Cache

Sometimes, you may have a Cache object that implements the PSR-16 standard, but need to pass it to an object that expects a PSR-6 cache adapter. Or, you might have the opposite situation. The cache component contains two classes for bidirectional interoperability between PSR-6 and PSR-16 caches.

Suppose you want to work with a class that requires a PSR-6 Cache pool object. For example:

But, you already have a PSR-16 cache object, and you'd like to pass this to the class instead. No problem! The Cache component provides the Psr16Adapter class for exactly this use-case:

Suppose you want to work with a class that requires a PSR-16 Cache object. For example:

But, you already have a PSR-6 cache pool object, and you'd like to pass this to the class instead. No problem! The Cache component provides the Psr16Cache class for exactly this use-case:

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

Save your teams and projects before they sink

**Examples:**

Example 1 (unknown):
```unknown
use Psr\Cache\CacheItemPoolInterface;

// just a made-up class for the example
class GitHubApiClient
{
    // ...

    // this requires a PSR-6 cache object
    public function __construct(CacheItemPoolInterface $cachePool)
    {
        // ...
    }
}
```

Example 2 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\Psr16Adapter;

// $psr16Cache is the PSR-16 object that you want to use as a PSR-6 one

// a PSR-6 cache that uses your cache internally!
$psr6Cache = new Psr16Adapter($psr16Cache);

// now use this wherever you want
$githubApiClient = new GitHubApiClient($psr6Cache);
```

Example 3 (unknown):
```unknown
use Psr\SimpleCache\CacheInterface;

// just a made-up class for the example
class GitHubApiClient
{
    // ...

    // this requires a PSR-16 cache object
    public function __construct(CacheInterface $cache)
    {
        // ...
    }
}
```

Example 4 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Component\Cache\Psr16Cache;

// the PSR-6 cache object that you want to use
$psr6Cache = new FilesystemAdapter();

// a PSR-16 cache that uses your cache internally!
$psr16Cache = new Psr16Cache($psr6Cache);

// now use this wherever you want
$githubApiClient = new GitHubApiClient($psr16Cache);
```

---

## Cache Invalidation

**URL:** https://symfony.com/doc/7.3/components/cache/cache_invalidation.html

**Contents:**
- Cache Invalidation
- Using Cache Tags
  - Tag Aware Adapters
- Using Cache Expiration

Cache invalidation is the process of removing all cached items related to a change in the state of your model. The most basic kind of invalidation is direct item deletion. But when the state of a primary resource has spread across several cached items, keeping them in sync can be difficult.

The Symfony Cache component provides two mechanisms to help solve this problem:

To benefit from tags-based invalidation, you need to attach the proper tags to each cached item. Each tag is a plain string identifier that you can use at any time to trigger the removal of all items associated with this tag.

To attach tags to cached items, you need to use the tag() method that is implemented by cache items:

If $cache implements TagAwareCacheInterface, you can invalidate the cached items by calling invalidateTags():

Using tag invalidation is very useful when tracking cache keys becomes difficult.

To store tags, you need to wrap a cache adapter with the TagAwareAdapter class or implement TagAwareCacheInterface and its invalidateTags() method.

When using a Redis backend, consider using RedisTagAwareAdapter which is optimized for this purpose. When using filesystem, likewise consider to use FilesystemTagAwareAdapter.

The TagAwareAdapter class implements instantaneous invalidation (time complexity is O(N) where N is the number of invalidated tags). It needs one or two cache adapters: the first required one is used to store cached items; the second optional one is used to store tags and their invalidation version number (conceptually similar to their latest invalidation date). When only one adapter is used, items and tags are all stored in the same place. By using two adapters, you can e.g. store some big cached items on the filesystem or in the database and keep tags in a Redis database to sync all your fronts and have very fast invalidation checks:

TagAwareAdapter implements PruneableInterface, enabling manual pruning of expired cache entries by calling its prune() method (assuming the wrapped adapter itself implements PruneableInterface).

If your data is valid only for a limited period of time, you can specify their lifetime or their expiration date with the PSR-6 interface, as explained in the Cache Items article.

Code consumes server resources. Blackfire tells you how

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (unknown):
```unknown
$item = $cache->get('cache_key', function (ItemInterface $item): string {
    // [...]
    // add one or more tags
    $item->tag('tag_1');
    $item->tag(['tag_2', 'tag_3']);

    return $cachedValue;
});
```

Example 2 (unknown):
```unknown
// invalidate all items related to `tag_1` or `tag_3`
$cache->invalidateTags(['tag_1', 'tag_3']);

// if you know the cache key, you can also delete the item directly
$cache->delete('cache_key');
```

Example 3 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Component\Cache\Adapter\RedisAdapter;
use Symfony\Component\Cache\Adapter\TagAwareAdapter;

$cache = new TagAwareAdapter(
    // Adapter for cached items
    new FilesystemAdapter(),
    // Adapter for tags
    new RedisAdapter('redis://localhost')
);
```

---

## Chain Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/chain_adapter.html

**Contents:**
- Chain Cache Adapter

This adapter allows combining any number of the other available cache adapters. Cache items are fetched from the first adapter containing them and cache items are saved to all the given adapters. This exposes a simple and efficient method for creating a layered cache.

The ChainAdapter must be provided an array of adapters and optionally a default cache lifetime as its constructor arguments:

When an item is not found in the first adapter but is found in the next ones, this adapter ensures that the fetched item is saved to all the adapters where it was previously missing.

The following example shows how to create a chain adapter instance using the fastest and slowest storage engines, ApcuAdapter and FilesystemAdapter, respectfully:

When calling this adapter's prune() method, the call is delegated to all its compatible cache adapters. It is safe to mix both adapters that do and do not implement PruneableInterface, as incompatible adapters are silently ignored:

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

Put the code quality back at the heart of your project

**Examples:**

Example 1 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\ChainAdapter;

$cache = new ChainAdapter(
    // The ordered list of adapters used to fetch cached items
    array $adapters,

    // The default lifetime of items propagated from lower adapters to upper ones
    $defaultLifetime = 0
);
```

Example 2 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\ApcuAdapter;
use Symfony\Component\Cache\Adapter\ChainAdapter;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;

$cache = new ChainAdapter([
    new ApcuAdapter(),
    new FilesystemAdapter(),
]);
```

Example 3 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\ApcuAdapter;
use Symfony\Component\Cache\Adapter\ChainAdapter;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;

$cache = new ChainAdapter([
    new ApcuAdapter(),        // does NOT implement PruneableInterface
    new FilesystemAdapter(),  // DOES implement PruneableInterface
]);

// prune will proxy the call to FilesystemAdapter while silently skip ApcuAdapter
$cache->prune();
```

---

## Couchbase Bucket Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/couchbasebucket_adapter.html

**Contents:**
- Couchbase Bucket Cache Adapter
- Configure the Connection
- Configure the Options
  - Available Options

The CouchbaseBucketAdapter is deprecated since Symfony 7.1, use the CouchbaseCollectionAdapter instead.

This adapter stores the values in-memory using one (or more) Couchbase server instances. Unlike the APCu adapter, and similarly to the Memcached adapter, it is not limited to the current server's shared memory; you can store contents independent of your PHP environment. The ability to utilize a cluster of servers to provide redundancy and/or fail-over is also available.

Requirements: The Couchbase PHP extension as well as a Couchbase server must be installed, active, and running to use this adapter. Version 2.6 or less than 3.0 of the Couchbase PHP extension is required for this adapter.

This adapter expects a Couchbase Bucket instance to be passed as the first parameter. A namespace and default cache lifetime can optionally be passed as the second and third parameters:

The createConnection() helper method allows creating and configuring a Couchbase Bucket class instance using a Data Source Name (DSN) or an array of DSNs:

The createConnection() helper method also accepts an array of options as its second argument. The expected format is an associative array of key => value pairs representing option names and their respective values:

Reference the Couchbase Bucket extension's predefined constants documentation for additional information about the available options.

Online Sylius certification, take it now!

Be trained by SensioLabs experts (2 to 6 day sessions -- French or English).

**Examples:**

Example 1 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\CouchbaseBucketAdapter;

$cache = new CouchbaseBucketAdapter(
    // the client object that sets options and adds the server instance(s)
    $client,

    // the name of bucket
    $bucket,

    // a string prefixed to the keys of the items stored in this cache
    $namespace,

    // the default lifetime (in seconds) for cache items that do not define their
    // own lifetime, with a value 0 causing items to be stored indefinitely
    $defaultLifetime
);
```

Example 2 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\CouchbaseBucketAdapter;

// pass a single DSN string to register a single server with the client
$client = CouchbaseBucketAdapter::createConnection(
    'couchbase://localhost'
    // the DSN can include config options (pass them as a query string):
    // 'couchbase://localhost:11210?operationTimeout=10'
    // 'couchbase://localhost:11210?operationTimeout=10&configTimeout=20'
);

// pass an array of DSN strings to register multiple servers with the client
$client = CouchbaseBucketAdapter::createConnection([
    'couchbase://10.0.0.100',
    'couchbase://10.0.0.101',
    'couchbase://10.0.0.102',
    // etc...
]);

// a single DSN can define multiple servers using the following syntax:
// host[hostname-or-IP:port] (where port is optional). Sockets must include a trailing ':'
$client = CouchbaseBucketAdapter::createConnection(
    'couchbase:?host[localhost]&host[localhost:12345]'
);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Cache\Adapter\CouchbaseBucketAdapter;

$client = CouchbaseBucketAdapter::createConnection(
    // a DSN string or an array of DSN strings
    [],

    // associative array of configuration options
    [
        'username' => 'xxxxxx',
        'password' => 'yyyyyy',
        'configTimeout' => '100',
    ]
);
```

---

## PHP Array Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/php_array_cache_adapter.html

**Contents:**
- PHP Array Cache Adapter

This adapter is a high performance cache for static data (e.g. application configuration) that is optimized and preloaded into OPcache memory storage. It is suited for any data that is mostly read-only after warm-up:

This adapter requires turning on the opcache.enable php.ini setting.

Symfony Code Performance Profiling

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

**Examples:**

Example 1 (javascript):
```javascript
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Component\Cache\Adapter\PhpArrayAdapter;

// somehow, decide it's time to warm up the cache!
if ($needsWarmup) {
    // some static values
    $values = [
        'stats.products_count' => 4711,
        'stats.users_count' => 1356,
    ];

    $cache = new PhpArrayAdapter(
        // single file where values are cached
        __DIR__ . '/somefile.cache',
        // a backup adapter, if you set values after warm-up
        new FilesystemAdapter()
    );
    $cache->warmUp($values);
}

// ... then, use the cache!
$cacheItem = $cache->getItem('stats.users_count');
echo $cacheItem->get();
```

---

## PHP Files Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/php_files_adapter.html

**Contents:**
- PHP Files Cache Adapter

Similarly to Filesystem Adapter, this cache implementation writes cache entries out to disk, but unlike the Filesystem cache adapter, the PHP Files cache adapter writes and reads back these cache files as native PHP code. For example, caching the value ['my', 'cached', 'array'] will write out a cache file similar to the following:

This adapter requires turning on the opcache.enable php.ini setting. As cache items are included and parsed as native PHP code and due to the way OPcache handles file includes, this adapter has the potential to be much faster than other filesystem-based caches.

While it supports updates and because it is using OPcache as a backend, this adapter is better suited for append-mostly needs. Using it in other scenarios might lead to periodical reset of the OPcache memory, potentially leading to degraded performance.

The PhpFilesAdapter can optionally be provided a namespace, default cache lifetime, and cache directory path as constructor arguments:

This adapter implements PruneableInterface, allowing for manual pruning of expired cache entries by calling its prune() method.

Become certified from home

Be safe against critical risks to your projects and businesses

**Examples:**

Example 1 (javascript):
```javascript
<?php return [

    // the cache item expiration
    0 => 9223372036854775807,

    // the cache item contents
    1 => [
        0 => 'my',
        1 => 'cached',
        2 => 'array',
    ],

];
```

Example 2 (csharp):
```csharp
use Symfony\Component\Cache\Adapter\PhpFilesAdapter;

$cache = new PhpFilesAdapter(

    // a string used as the subdirectory of the root cache directory, where cache
    // items will be stored
    $namespace = '',

    // the default lifetime (in seconds) for cache items that do not define their
    // own lifetime, with a value 0 causing items to be stored indefinitely (i.e.
    // until the files are deleted)
    $defaultLifetime = 0,

    // the main cache directory (the application needs read-write permissions on it)
    // if none is specified, a directory is created inside the system temporary directory
    $directory = null
);
```

---

## Couchbase Collection Cache Adapter

**URL:** https://symfony.com/doc/7.3/components/cache/adapters/couchbasecollection_adapter.html

**Contents:**
- Couchbase Collection Cache Adapter
- Configure the Connection
- Configure the Options
  - Available Options

This adapter stores the values in-memory using one (or more) Couchbase server instances. Unlike the APCu adapter, and similarly to the Memcached adapter, it is not limited to the current server's shared memory; you can store contents independent of your PHP environment. The ability to utilize a cluster of servers to provide redundancy and/or fail-over is also available.

Requirements: The Couchbase PHP extension as well as a Couchbase server must be installed, active, and running to use this adapter. Version 3.0 or greater of the Couchbase PHP extension is required for this adapter.

This adapter expects a Couchbase Collection instance to be passed as the first parameter. A namespace and default cache lifetime can optionally be passed as the second and third parameters:

The createConnection() helper method allows creating and configuring a Couchbase Collection class instance using a Data Source Name (DSN) or an array of DSNs:

The createConnection() helper method also accepts an array of options as its second argument. The expected format is an associative array of key => value pairs representing option names and their respective values:

Reference the Couchbase Collection extension's predefined constants documentation for additional information about the available options.

Check Code Performance in Dev, Test, Staging & Production

No stress: we've got you covered with our 116 automated quality checks of your code

**Examples:**

Example 1 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\CouchbaseCollectionAdapter;

$cache = new CouchbaseCollectionAdapter(
    // the client object that sets options and adds the server instance(s)
    $client,

    // a string prefixed to the keys of the items stored in this cache
    $namespace,

    // the default lifetime (in seconds) for cache items that do not define their
    // own lifetime, with a value 0 causing items to be stored indefinitely
    $defaultLifetime
);
```

Example 2 (unknown):
```unknown
use Symfony\Component\Cache\Adapter\CouchbaseCollectionAdapter;

// pass a single DSN string to register a single server with the client
$client = CouchbaseCollectionAdapter::createConnection(
    'couchbase://localhost'
    // the DSN can include config options (pass them as a query string):
    // 'couchbase://localhost:11210?operationTimeout=10'
    // 'couchbase://localhost:11210?operationTimeout=10&configTimout=20'
);

// pass an array of DSN strings to register multiple servers with the client
$client = CouchbaseCollectionAdapter::createConnection([
    'couchbase://10.0.0.100',
    'couchbase://10.0.0.101',
    'couchbase://10.0.0.102',
    // etc...
]);

// a single DSN can define multiple servers using the following syntax:
// host[hostname-or-IP:port] (where port is optional). Sockets must include a trailing ':'
$client = CouchbaseCollectionAdapter::createConnection(
    'couchbase:?host[localhost]&host[localhost:12345]'
);
```

Example 3 (javascript):
```javascript
use Symfony\Component\Cache\Adapter\CouchbaseCollectionAdapter;

$client = CouchbaseCollectionAdapter::createConnection(
    // a DSN string or an array of DSN strings
    [],

    // associative array of configuration options
    [
        'username' => 'xxxxxx',
        'password' => 'yyyyyy',
        'configTimeout' => '100',
    ]
);
```

---

## Cache Items

**URL:** https://symfony.com/doc/7.3/components/cache/cache_items.html

**Contents:**
- Cache Items
- Cache Item Keys and Values
- Creating Cache Items
  - Cache Item Expiration
- Cache Item Hits and Misses

Cache items are the information units stored in the cache as a key/value pair. In the Cache component they are represented by the CacheItem class. They are used in both the Cache Contracts and the PSR-6 interfaces.

The key of a cache item is a plain string which acts as its identifier, so it must be unique for each cache pool. You can freely choose the keys, but they should only contain letters (A-Z, a-z), numbers (0-9) and the _ and . symbols. Other common symbols (such as { } ( ) / \ @ :) are reserved by the PSR-6 standard for future uses.

The value of a cache item can be any data represented by a type which is serializable by PHP, such as basic types (string, integer, float, boolean, null), arrays and objects.

The only way to create cache items is via cache pools. When using the Cache Contracts, they are passed as arguments to the recomputation callback:

When using PSR-6, they are created with the getItem($key) method of the cache pool:

Then, use the Psr\Cache\CacheItemInterface::set method to set the data stored in the cache item (this step is done automatically when using the Cache Contracts):

The key and the value of any given cache item can be obtained with the corresponding getter methods:

By default, cache items are stored permanently. In practice, this "permanent storage" can vary greatly depending on the type of cache being used, as explained in the Cache Pools and Supported Adapters article.

However, in some applications it's common to use cache items with a shorter lifespan. Consider for example an application which caches the latest news just for one minute. In those cases, use the expiresAfter() method to set the number of seconds to cache the item:

Cache items define another related method called expiresAt() to set the exact date and time when the item will expire:

Using a cache mechanism is important to improve the application performance, but it should not be required to make the application work. In fact, the PSR-6 document wisely states that caching errors should not result in application failures.

In practice with PSR-6, this means that the getItem() method always returns an object which implements the Psr\Cache\CacheItemInterface interface, even when the cache item doesn't exist. Therefore, you don't have to deal with null return values and you can safely store in the cache values such as false and null.

In order to decide if the returned object represents a value coming from the storage or not, caches use the concept of hits and misses:

Cache item objects define a boolean isHit() method which returns true for cache hits:

Peruse our complete Symfony & PHP solutions catalog for your web development needs.

Save your teams and projects before they sink

**Examples:**

Example 1 (unknown):
```unknown
// $cache pool object was created before
$productsCount = $cache->get('stats.products_count', function (ItemInterface $item): string {
    // [...]
});
```

Example 2 (unknown):
```unknown
// $cache pool object was created before
$productsCount = $cache->getItem('stats.products_count');
```

Example 3 (javascript):
```javascript
// storing a simple integer
$productsCount->set(4711);
$cache->save($productsCount);

// storing an array
$productsCount->set([
    'category1' => 4711,
    'category2' => 2387,
]);
$cache->save($productsCount);
```

Example 4 (unknown):
```unknown
$cacheItem = $cache->getItem('exchange_rate');
// ...
$key = $cacheItem->getKey();
$value = $cacheItem->get();
```

---
